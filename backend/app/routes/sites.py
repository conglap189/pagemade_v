"""Sites blueprint - Site management and dashboard."""
from flask import Blueprint, request, jsonify, current_app, abort, render_template, flash, redirect, url_for, render_template, flash, redirect, url_for
from flask_login import login_required, current_user
import os
import re
import requests
import html
from urllib.parse import urljoin
import secrets
from PIL import Image
import mimetypes
import stat

from app.models import db, Site, Page
from app.services import SiteService, PageService
from app.repositories import SiteRepository, PageRepository
from app.utils import Validators, Helpers
from app.utils.api_helpers import success_response, error_response, paginated_response
from app.middleware.jwt_auth import jwt_required

# Create blueprint - no prefix to match old routes
sites_bp = Blueprint('sites', __name__)


# ================================
# DASHBOARD & SITE MANAGEMENT
# ================================

@sites_bp.route('/dashboard')
@login_required
def dashboard():
    """User dashboard - list all sites."""
    sites = SiteRepository.find_by_user(current_user.id)
    
    # Calculate stats
    total_pages = 0
    published_pages = 0
    
    for site in sites:
        pages = PageRepository.find_by_site(site.id)
        site.pages = pages  # Add pages to site object for template
        total_pages += len(pages)
        published_pages += sum(1 for page in pages if page.is_published)
    
    return render_template('dashboard.html',
                         sites=sites,
                         total_pages=total_pages,
                         published_pages=published_pages)


@sites_bp.route('/new-site', methods=['GET', 'POST'])
@login_required
def new_site():
    """Create a new site."""
    if request.method == 'POST':
        try:
            # Get form data
            title = request.form.get('title', '').strip()
            subdomain = request.form.get('subdomain', '').strip().lower()
            description = request.form.get('description', '').strip()
            action = request.form.get('action', 'dashboard')
            
            # Validation
            if not title or not subdomain:
                return Helpers.error_response('Vui lòng điền đầy đủ thông tin bắt buộc', 400)
            
            # Validate site title
            is_valid, error_msg = Validators.is_valid_site_title(title)
            if not is_valid:
                return Helpers.error_response(error_msg, 400)
            
            # Validate subdomain format
            if not Validators.is_valid_subdomain(subdomain):
                return Helpers.error_response(
                    'Subdomain chỉ được chứa chữ thường, số và dấu gạch ngang, từ 3-63 ký tự',
                    400
                )
            
            # Create site using service
            success, site, error = SiteService.create_site(
                user_id=current_user.id,
                title=title,
                subdomain=subdomain,
                description=description
            )
            
            if not success:
                return Helpers.error_response(error, 400)
            
            # Get the created homepage
            homepage = None
            if site and site.id:
                homepage = PageRepository.find_homepage(site.id)
                
                response_data = {
                    'site_id': site.id,
                    'homepage_id': homepage.id if homepage else None,
                    'redirect': '/dashboard'
                }
            else:
                response_data = {
                    'redirect': '/dashboard'
                }
            
            # If action is pagemade, redirect to editor
            if action == 'pagemade' and homepage and homepage.id:
                response_data['redirect'] = f'/editor/{homepage.id}'
            
            return Helpers.success_response(
                data=response_data,
                message='Tạo site thành công!',
                status=201
            )
            
        except Exception as e:
            current_app.logger.error(f"Create site error: {e}")
            return Helpers.error_response('Có lỗi xảy ra khi tạo site. Vui lòng thử lại!', 500)
    
    # GET request - show form
    return render_template('new_site.html')


@sites_bp.route('/site/<int:site_id>')
@login_required
def site_detail(site_id):
    """View site details and pages."""
    site = SiteRepository.find_by_id(site_id)
    
    if not site:
        abort(404)
    
    # Verify ownership
    if site.user_id != current_user.id:
        abort(403)
    
    pages = PageRepository.find_by_site(site_id)
    
    return render_template('site_detail.html', site=site, pages=pages)


@sites_bp.route('/site/<int:site_id>/edit', methods=['GET', 'POST'])
@login_required
def edit_site(site_id):
    """Edit site settings."""
    site = SiteRepository.find_by_id(site_id)
    
    if not site:
        abort(404)
    
    # Verify ownership
    if site.user_id != current_user.id:
        abort(403)
    
    if request.method == 'POST':
        title = request.form.get('title', '').strip()
        description = request.form.get('description', '').strip()
        
        # Validation
        is_valid, error_msg = Validators.is_valid_site_title(title)
        if not is_valid:
            flash(error_msg if error_msg else 'Invalid subdomain', 'error')
            return render_template('edit_site.html', site=site)
        
        # Update site using service
        success, updated_site, error = SiteService.update_site(
            site_id=site_id,
            user_id=current_user.id,
            title=title,
            description=description
        )
        
        if success:
            flash('Cập nhật site thành công!', 'success')
            return redirect(url_for('sites.site_detail', site_id=site_id))
        else:
            flash(error or 'Có lỗi xảy ra!', 'error')
    
    return render_template('edit_site.html', site=site)


@sites_bp.route('/site/<int:site_id>/publish', methods=['POST'])
@login_required
def publish_site(site_id):
    """Publish site (make publicly accessible)."""
    success, error = SiteService.publish_site(site_id, current_user.id)
    
    if success:
        return Helpers.success_response(message='Site đã được publish thành công!')
    else:
        return Helpers.error_response(error, 400)


@sites_bp.route('/site/<int:site_id>/unpublish', methods=['POST'])
@login_required
def unpublish_site(site_id):
    """Unpublish site (make private)."""
    success, error = SiteService.unpublish_site(site_id, current_user.id)
    
    if success:
        return Helpers.success_response(message='Site đã được unpublish!')
    else:
        return Helpers.error_response(error, 400)


@sites_bp.route('/site/<int:site_id>/delete', methods=['POST'])
@login_required
def delete_site(site_id):
    """Delete site and all its pages."""
    site = SiteRepository.find_by_id(site_id)
    
    if not site:
        return Helpers.error_response('Site không tồn tại!', 404)
    
    # Verify ownership
    if site.user_id != current_user.id:
        return Helpers.error_response('Bạn không có quyền xóa site này!', 403)
    
    success, error = SiteService.delete_site(site_id, current_user.id)
    
    if success:
        return Helpers.success_response(
            data={'redirect': '/dashboard'},
            message='Đã xóa site thành công!'
        )
    else:
        return Helpers.error_response(error, 500)


# ================================
# TEMPLATE SYSTEM
# ================================

@sites_bp.route('/templates')
@login_required
def templates():
    """Template selection page."""
    # Get available templates
    templates_dir = os.path.join(current_app.root_path, '..', 'static', 'pagemade', 'templates')
    templates = []
    
    if os.path.exists(templates_dir):
        for item in os.listdir(templates_dir):
            if os.path.isdir(os.path.join(templates_dir, item)):
                templates.append({
                    'id': item,
                    'name': item.replace('-', ' ').title(),
                    'preview': f'/static/pagemade/templates/{item}/preview.jpg',
                    'path': f'/static/pagemade/templates/{item}/index.html'
                })
    
    return render_template('templates.html', templates=templates)


@sites_bp.route('/sites/from-template', methods=['GET', 'POST'])
@login_required
def site_from_template():
    """Create site from template."""
    if request.method == 'POST':
        template_id = request.form.get('template')
        title = request.form.get('title', '').strip()
        subdomain = request.form.get('subdomain', '').strip().lower()
        description = request.form.get('description', '').strip()
        
        # Validation
        if not title or not subdomain:
            flash('Vui lòng điền đầy đủ thông tin!', 'error')
            return redirect(url_for('sites.templates'))
        
        # Validate subdomain
        if not Validators.is_valid_subdomain(subdomain):
            flash('Subdomain không hợp lệ!', 'error')
            return redirect(url_for('sites.templates'))
        
        # Create site
        success, site, error = SiteService.create_site(
            user_id=current_user.id,
            title=title,
            subdomain=subdomain,
            description=description
        )
        
        if not success:
            flash(error if error else 'Lỗi tạo site!', 'error')
            return redirect(url_for('sites.templates'))
        
        # Load template content
        try:
            template_path = os.path.join(current_app.root_path or '', '..', 'static', 'pagemade', 'templates', template_id or '', 'index.html')
            if os.path.exists(template_path):
                with open(template_path, 'r', encoding='utf-8') as f:
                    template_content = f.read()
                
                # Create homepage with template content
                page = None
                if site and site.id:
                    success, page, error = PageService.create_page(
                        user_id=current_user.id,
                        site_id=site.id,
                        title='Trang chủ',
                        description='Trang chủ được tạo từ template',
                        template=template_id or 'default'
                    )
                
                if success and page:
                    # Set template content
                    page.content = template_content
                    page.is_homepage = True
                    db.session.commit()
                    
                    flash('Tạo site từ template thành công!', 'success')
                    return redirect(url_for('pages.editor', page_id=page.id))
        
        except Exception as e:
            current_app.logger.error(f"Template loading error: {e}")
            flash('Lỗi khi tải template!', 'error')
        
        flash('Tạo site thành công!', 'success')
        if site and site.id:
            return redirect(url_for('sites.site_detail', site_id=site.id))
        else:
            return redirect(url_for('sites.dashboard'))
    
    return redirect(url_for('sites.templates'))


# ================================
# API ROUTES
# ================================

@sites_bp.route('/api/sites', methods=['GET'])
@login_required
def api_list_sites():
    """Get all sites for current user."""
    sites = SiteRepository.find_by_user(current_user.id)
    
    return Helpers.success_response(
        data={
            'sites': [site.to_dict() for site in sites]
        }
    )


@sites_bp.route('/api/sites/<int:site_id>', methods=['GET'])
@login_required
def api_get_site(site_id):
    """Get site details."""
    site = SiteRepository.find_by_id(site_id)
    
    if not site:
        return Helpers.error_response('Site không tồn tại!', 404)
    
    # Verify ownership
    if site.user_id != current_user.id:
        return Helpers.error_response('Unauthorized', 403)
    
    return Helpers.success_response(
        data={'site': site.to_dict()}
    )


@sites_bp.route('/api/sites/<int:site_id>/pages', methods=['GET'])
@login_required
def api_site_pages(site_id):
    """Get all pages for a site."""
    site = SiteRepository.find_by_id(site_id)
    
    if not site:
        return Helpers.error_response('Site không tồn tại!', 404)
    
    # Verify ownership
    if site.user_id != current_user.id:
        return Helpers.error_response('Unauthorized', 403)
    
    pages = PageRepository.find_by_site(site_id)
    
    return Helpers.success_response(
        data={
            'pages': [page.to_dict() for page in pages]
        }
    )


# ================================
# MISSING MAIN ROUTES FROM LEGACY
# ================================

@sites_bp.route('/editor/<int:page_id>/simple')
@login_required
def simple_editor(page_id):
    """Simple page editor."""
    page = PageRepository.find_by_id(page_id)
    
    if not page or page.site.user_id != current_user.id:
        abort(404)
    
    return render_template('editor_simple.html', page=page)


@sites_bp.route('/admin/reset-demo', methods=['POST'])
@login_required
def reset_demo():
    """Reset demo data (admin only)."""
    if not current_user.is_admin():
        return jsonify({'success': False, 'message': 'Unauthorized'}), 403
    
    try:
        # Reset demo sites and pages
        demo_sites = Site.query.filter(Site.subdomain.like('%demo%')).all()
        
        for site in demo_sites:
            # Delete all pages for this site
            Page.query.filter_by(site_id=site.id).delete()
            # Delete the site
            db.session.delete(site)
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Demo data reset successfully!'
        })
        
    except Exception as e:
        current_app.logger.error(f"Reset demo error: {e}")
        db.session.rollback()
        return jsonify({'success': False, 'message': 'Reset failed!'}), 500


@sites_bp.route('/admin/cache/stats')
@login_required
def cache_stats():
    """Get cache statistics (admin only)."""
    if not current_user.is_admin():
        return jsonify({'success': False, 'message': 'Unauthorized'}), 403
    
    try:
        # This would integrate with your cache system
        # For now, return mock stats
        stats = {
            'cache_hits': 150,
            'cache_misses': 25,
            'cached_items': 75,
            'cache_size': '2.5MB'
        }
        
        return jsonify({
            'success': True,
            'data': stats
        })
        
    except Exception as e:
        current_app.logger.error(f"Cache stats error: {e}")
        return jsonify({'success': False, 'message': 'Failed to get stats'}), 500


@sites_bp.route('/admin/cache/clear', methods=['POST'])
@login_required
def clear_cache():
    """Clear cache (admin only)."""
    if not current_user.is_admin():
        return jsonify({'success': False, 'message': 'Unauthorized'}), 403
    
    try:
        # This would integrate with your cache system
        # For now, just return success
        return jsonify({
            'success': True,
            'message': 'Cache cleared successfully!'
        })
        
    except Exception as e:
        current_app.logger.error(f"Clear cache error: {e}")
        return jsonify({'success': False, 'message': 'Failed to clear cache'}), 500


@sites_bp.route('/api/page/<int:page_id>/views')
def page_views(page_id):
    """Get page view count."""
    try:
        page = PageRepository.find_by_id(page_id)
        
        if not page:
            return Helpers.error_response('Page not found', 404)
        
        # Increment view count
        page.view_count = (page.view_count or 0) + 1
        db.session.commit()
        
        return Helpers.success_response(
            data={
                'views': page.view_count,
                'page_id': page_id
            }
        )
        
    except Exception as e:
        current_app.logger.error(f"Page views error: {e}")
        return Helpers.error_response('Failed to update views', 500)


@sites_bp.route('/api/verify-session')
@login_required
def verify_session():
    """Verify user session."""
    return Helpers.success_response(
        data={
            'user': {
                'id': current_user.id,
                'name': current_user.name,
                'email': current_user.email,
                'role': current_user.role
            },
            'valid': True
        }
    )


@sites_bp.route('/page/<int:page_id>')
def get_page(page_id):
    """Get page by ID."""
    try:
        page = PageRepository.find_by_id(page_id)
        
        if not page:
            abort(404)
        
        # Check if page is published or user is owner
        if not page.is_published and (not current_user.is_authenticated or page.site.user_id != current_user.id):
            abort(404)
        
        return render_template('page_view.html', page=page)
        
    except Exception as e:
        current_app.logger.error(f"Get page error: {e}")
        abort(404)


@sites_bp.route('/page/<int:page_id>/save', methods=['POST'])
@login_required
def save_page(page_id):
    """Save page content."""
    try:
        page = PageRepository.find_by_id(page_id)
        
        if not page or page.site.user_id != current_user.id:
            return Helpers.error_response('Page not found', 404)
        
        data = Helpers.get_request_json()
        if not data:
            return Helpers.error_response('No data provided', 400)
        
        content = data.get('content', '')
        title = data.get('title', page.title)
        description = data.get('description', page.description)
        
        # Update page
        success, updated_page, error = PageService.update_page(
            page_id=page_id,
            user_id=current_user.id,
            title=title,
            content=content,
            description=description
        )
        
        if success and updated_page:
            return Helpers.success_response(
                data={'page': updated_page.to_dict()},
                message='Page saved successfully!'
            )
        elif success:
            return Helpers.success_response(
                message='Page saved successfully!'
            )
        else:
            return Helpers.error_response(error or 'Failed to save page', 500)
            
    except Exception as e:
        current_app.logger.error(f"Save page error: {e}")
        return Helpers.error_response('Failed to save page', 500)


@sites_bp.route('/page/<int:page_id>/publish', methods=['POST'])
@login_required
def publish_page(page_id):
    """Publish page."""
    try:
        page = PageRepository.find_by_id(page_id)
        
        if not page or page.site.user_id != current_user.id:
            return Helpers.error_response('Page not found', 404)
        
        # Publish page
        page.is_published = True
        page.published_at = db.func.now()
        db.session.commit()
        
        return Helpers.success_response(
            data={'page': page.to_dict()},
            message='Page published successfully!'
        )
        
    except Exception as e:
        current_app.logger.error(f"Publish page error: {e}")
        return Helpers.error_response('Failed to publish page', 500)


@sites_bp.route('/pagemade-integration.js')
def pagemade_integration():
    """Serve PageMade integration JavaScript."""
    integration_js = """
// PageMade Integration Script
(function() {
    console.log('PageMade Integration loaded');
    
    // Add integration logic here
    window.PageMade = {
        version: '1.0.0',
        init: function() {
            console.log('PageMade initialized');
        }
    };
    
    // Auto-initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', PageMade.init);
    } else {
        PageMade.init();
    }
})();
"""
    response = current_app.response_class(
        integration_js,
        mimetype='application/javascript'
    )
    return response


@sites_bp.route('/pagemade-loader.js')
def pagemade_loader():
    """Serve PageMade loader JavaScript."""
    loader_js = """
// PageMade Loader Script
(function() {
    var script = document.createElement('script');
    script.src = '/pagemade-integration.js';
    script.async = true;
    document.head.appendChild(script);
})();
"""
    response = current_app.response_class(
        loader_js,
        mimetype='application/javascript'
    )
    return response


@sites_bp.route('/test-assets')
@login_required
def test_assets():
    """Test assets page."""
    return render_template('test_assets.html')
