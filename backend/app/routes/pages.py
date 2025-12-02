"""Pages blueprint - Page editor and management."""
from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify, current_app, abort, session
from flask_login import login_required, current_user
from datetime import datetime
import json
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
from app.services import PageService, SiteService
from app.repositories import SiteRepository, PageRepository
from app.utils import Validators, Helpers
from app.middleware.jwt_auth import jwt_required  # Add JWT support

# Create blueprint - no prefix to match old routes
pages_bp = Blueprint('pages', __name__)


# ================================
# PUBLIC PAGE SERVING
# ================================

@pages_bp.route('/')
def index():
    """Homepage - redirect to frontend or serve subdomain."""
    # Check if this is a subdomain request
    from app.utils.helpers import get_subdomain
    subdomain = get_subdomain()
    
    if not subdomain:
        # Main site - Redirect to the frontend
        return redirect('http://localhost:3000')
    
    # Handle subdomain request (published site)
    site = SiteRepository.find_by_subdomain(subdomain)
    if not site or not site.is_published:
        abort(404)
    
    # Get homepage for this site
    homepage = site.get_homepage()
    if not homepage:
        abort(404)
    
    # Serve the published page
    return render_template('published_page.html', page=homepage)


@pages_bp.route('/preview/<string:token>')
def preview_page(token):
    """Display preview page using token."""
    # Get preview data from session
    previews = session.get('previews', {})
    
    if token not in previews:
        return "Preview không tồn tại hoặc đã hết hạn", 404
    
    preview_data = previews[token]
    
    # Check if preview is expired
    from datetime import datetime as dt
    expires_at = dt.fromisoformat(preview_data['expires_at'])
    if dt.utcnow() > expires_at:
        # Remove expired preview
        del previews[token]
        session['previews'] = previews
        session.modified = True
        return "Preview đã hết hạn", 410
    
    # Get page content
    try:
        content_data = {}
        if preview_data['content']:
            if isinstance(preview_data['content'], str) and preview_data['content'].strip().startswith('{'):
                content_data = json.loads(preview_data['content'])
            elif isinstance(preview_data['content'], dict):
                content_data = preview_data['content']
        
        # Extract HTML and CSS
        html_content = content_data.get('gjs-html', content_data.get('html', ''))
        css_content = content_data.get('gjs-css', content_data.get('css', ''))
        
        return render_template('preview.html', 
                             page_title=preview_data['title'],
                             html_content=html_content,
                             css_content=css_content,
                             expires_at=expires_at)
        
    except Exception as e:
        current_app.logger.error(f"Preview error: {str(e)}")
        return "Lỗi khi tải preview", 500


@pages_bp.route('/view/<subdomain>/<int:page_id>')
def view_page(subdomain, page_id):
    """View published page by subdomain and page ID."""
    site = SiteRepository.find_by_subdomain(subdomain)
    
    if not site:
        abort(404)
    
    page = PageRepository.find_by_id(page_id)
    
    if not page or page.site_id != site.id:
        abort(404)
    
    if not page.is_published:
        abort(404)
    
    return render_template('published_page.html', page=page, site=site)


@pages_bp.route('/<path:page_slug>')
def serve_page(page_slug):
    """Serve public page (catch-all route for subdomains)."""
    # Check if this is a subdomain request
    from app.utils.helpers import get_subdomain
    subdomain = get_subdomain()
    
    if not subdomain:
        # Main site - Handle normal routes or 404
        # Check if this is an existing main site route
        return redirect('http://localhost:3000/' + page_slug)
    
    # Subdomain - Serve specific page
    return serve_user_page(subdomain, page_slug)


def serve_user_site(subdomain):
    """Serve homepage for user subdomain."""
    # Find published site with this subdomain
    site = SiteRepository.find_by_subdomain(subdomain)
    
    if not site or not site.is_published:
        return render_template('subdomain/site_not_found.html', subdomain=subdomain), 404
    
    # Get homepage
    homepage = site.get_homepage()
    if not homepage or not homepage.is_published:
        return render_template('subdomain/no_homepage.html', site=site), 404
    
    # Read HTML file from storage - try index.html first (PageMaker published)
    try:
        storage_base = os.path.join(current_app.root_path, 'storage', 'sites', str(site.id))
        index_path = os.path.join(storage_base, 'index.html')
        
        if os.path.exists(index_path):
            # Serve published PageMaker content
            with open(index_path, 'r', encoding='utf-8') as f:
                return f.read()
        elif homepage.content and os.path.exists(os.path.join(storage_base, homepage.content)):
            # Fallback to old content field (for backward compatibility)
            with open(os.path.join(storage_base, homepage.content), 'r', encoding='utf-8') as f:
                return f.read()
        else:
            # Fallback to generated HTML from database
            return homepage.generate_html()
    except Exception as e:
        current_app.logger.error(f"❌ Error serving homepage: {e}")
        # Fallback to generated HTML if file read fails
        return homepage.generate_html()


def serve_user_page(subdomain, page_slug):
    """Serve specific page in user subdomain."""
    # Find published site with this subdomain
    site = SiteRepository.find_by_subdomain(subdomain)
    
    if not site or not site.is_published:
        return render_template('subdomain/site_not_found.html', subdomain=subdomain), 404
    
    # Find page by slug
    page = PageRepository.find_by_site_and_slug(site.id, page_slug)
    
    if not page or not page.is_published:
        return render_template('subdomain/page_not_found.html', site=site, slug=page_slug), 404
    
    # Serve content - try published HTML file first (PageMaker)
    try:
        storage_base = os.path.join(current_app.root_path, 'storage', 'sites', str(site.id))
        page_file = f"{page.slug}.html"
        page_path = os.path.join(storage_base, page_file)
        
        if os.path.exists(page_path):
            # Serve published PageMaker content
            with open(page_path, 'r', encoding='utf-8') as f:
                return f.read()
        
        # Fallback: Try cache (for old pages)
        try:
            from cache import cache
            cached_content = cache.get_cached_page_content(page.id)
            if cached_content:
                cache.increment_page_views(page.id)
                
                complete_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{page.title}</title>
    <style>
{cached_content['css']}
    </style>
</head>
<body>
{cached_content['html']}
</body>
</html>"""
                return complete_html
        except ImportError:
            pass  # Cache not available
        
        # Fallback: Try database fields
        if page.html_content and page.css_content:
            try:
                from cache import cache
                cache.increment_page_views(page.id)
                cache.cache_page_content(
                    page_id=page.id,
                    html_content=page.html_content,
                    css_content=page.css_content,
                    ttl=3600
                )
            except ImportError:
                pass  # Cache not available
            
            # Create complete HTML document from database content
            complete_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{page.title}</title>
    <style>
{page.css_content}
    </style>
</head>
<body>
{page.html_content}
</body>
</html>"""
            return complete_html
        
        # Fallback to file-based storage for legacy content
        elif page.content:
            storage_path = os.path.join(current_app.root_path, '..', 'storage', 'sites', str(site.id), page.content)
            if os.path.exists(storage_path):
                with open(storage_path, 'r', encoding='utf-8') as f:
                    return f.read()
        
        # Final fallback to generated HTML
        try:
            from cache import cache
            cache.increment_page_views(page.id)
        except ImportError:
            pass  # Cache not available
        return page.generate_html()
        
    except Exception as e:
        current_app.logger.error(f"Error serving page {page.id}: {e}")
        # Fallback to generated HTML if any error occurs
        try:
            from cache import cache
            cache.increment_page_views(page.id)
        except ImportError:
            pass  # Cache not available
        return page.generate_html()


@pages_bp.route('/site/<int:site_id>/new-page', methods=['GET', 'POST'])
@login_required
def new_page(site_id):
    """Create new page form."""
    site = SiteRepository.find_by_id(site_id)
    
    if not site:
        abort(404)
    
    # Verify ownership
    if site.user_id != current_user.id:
        abort(403)
    
    if request.method == 'POST':
        title = request.form.get('title', '').strip()
        description = request.form.get('description', '').strip()
        template = request.form.get('template', 'default')
        
        # Validation
        is_valid, error_msg = Validators.is_valid_page_title(title)
        if not is_valid:
            return Helpers.error_response(error_msg, 400)
        
        # Create page using service
        success, page, error = PageService.create_page(
            user_id=current_user.id,
            site_id=site_id,
            title=title,
            description=description,
            template=template
        )
        
        if success and page:
            return Helpers.success_response(
                data={
                    'page_id': page.id,
                    'redirect': f'/editor/{page.id}'
                },
                message='Tạo trang thành công!',
                status=201
            )
        else:
            return Helpers.error_response(error, 500)
    
    return render_template('new_page.html', site=site)


@pages_bp.route('/editor/<int:page_id>')
@login_required
def editor(page_id):
    """Page editor - redirect to frontend editor."""
    page = PageRepository.find_by_id(page_id)
    
    if not page:
        abort(404)
    
    # Verify ownership
    if page.user_id != current_user.id:
        abort(403)
    
    # Get site information
    site = SiteRepository.find_by_id(page.site_id)
    if not site:
        abort(404)
    
    # Generate JWT editor token for secure access (NOT session token)
    token = _generate_jwt_editor_token(page_id)
    
    # Redirect to frontend editor with token (query params format for Vite SPA)
    # Use query params instead of path params to avoid Vite routing issues
    # IMPORTANT: Must include /editor/ path to match Vite base config
    frontend_url = f"http://localhost:5001/editor/?id={page_id}&token={token}"
    return redirect(frontend_url)


@pages_bp.route('/page/<int:page_id>/save', methods=['POST'])
@login_required
def save_page(page_id):
    """Save page content from editor."""
    page = PageRepository.find_by_id(page_id)
    
    if not page:
        return Helpers.error_response('Page không tồn tại!', 404)
    
    # Verify ownership
    if page.user_id != current_user.id:
        return Helpers.error_response('Unauthorized', 403)
    
    try:
        data = Helpers.get_request_json()
        
        # Save content using service
        success, error = PageService.save_page_content(
            page_id=page_id,
            user_id=current_user.id,
            content_data=data
        )
        
        if success:
            return Helpers.success_response(message='Lưu trang thành công!')
        else:
            return Helpers.error_response(error, 500)
            
    except Exception as e:
        current_app.logger.error(f"Save page error: {e}")
        return Helpers.error_response('Có lỗi xảy ra khi lưu trang!', 500)


@pages_bp.route('/page/<int:page_id>/publish', methods=['POST'])
@login_required
def publish_page(page_id):
    """Publish page."""
    storage_path = current_app.config.get('STORAGE_PATH')
    
    success, error = PageService.publish_page(
        page_id=page_id,
        user_id=current_user.id,
        storage_path=storage_path
    )
    
    if success:
        return Helpers.success_response(message='Publish trang thành công!')
    else:
        return Helpers.error_response(error, 400)


@pages_bp.route('/page/<int:page_id>/unpublish', methods=['POST'])
@login_required
def unpublish_page(page_id):
    """Unpublish page."""
    success, error = PageService.unpublish_page(page_id, current_user.id)
    
    if success:
        return Helpers.success_response(message='Unpublish trang thành công!')
    else:
        return Helpers.error_response(error, 400)


@pages_bp.route('/page/<int:page_id>/delete', methods=['POST'])
@login_required
def delete_page(page_id):
    """Delete page."""
    success, error = PageService.delete_page(page_id, current_user.id)
    
    if success:
        page = PageRepository.find_by_id(page_id)
        return Helpers.success_response(
            data={'redirect': f'/site/{page.site_id}' if page else '/dashboard'},
            message='Xóa trang thành công!'
        )
    else:
        return Helpers.error_response(error, 400)


@pages_bp.route('/page/<int:page_id>/set-homepage', methods=['POST'])
@login_required
def set_homepage(page_id):
    """Set page as site homepage."""
    success, error = PageService.set_as_homepage(page_id, current_user.id)
    
    if success:
        return Helpers.success_response(message='Đã đặt làm trang chủ!')
    else:
        return Helpers.error_response(error, 400)


# ================================
# API ROUTES
# ================================

@pages_bp.route('/api/pages/<int:page_id>', methods=['GET'])
@login_required
def api_get_page(page_id):
    """Get page details."""
    page = PageRepository.find_by_id(page_id)
    
    if not page:
        return Helpers.error_response('Page không tồn tại!', 404)
    
    # Verify ownership
    if page.user_id != current_user.id:
        return Helpers.error_response('Unauthorized', 403)
    
    return Helpers.success_response(
        data={'page': page.to_dict()}
    )


@pages_bp.route('/api/pages/<int:page_id>/content', methods=['GET'])
@jwt_required
def api_get_page_content(page_id):
    """Get page content for editor with JWT authentication."""
    page = PageRepository.find_by_id(page_id)
    
    if not page:
        return Helpers.error_response('Page không tồn tại!', 404)
    
    # Verify ownership using JWT user (stored in request.current_user by jwt_required decorator)
    if page.user_id != request.current_user.id:
        return Helpers.error_response('Unauthorized', 403)
    
    content_data = {}
    
    # Parse content if it's JSON string
    if page.content:
        try:
            if isinstance(page.content, str):
                content_data = json.loads(page.content)
            else:
                content_data = page.content
        except:
            content_data = {'html': page.content or ''}
    
    # Add separate HTML/CSS fields
    content_data['html_content'] = page.html_content or ''
    content_data['css_content'] = page.css_content or ''
    
    return Helpers.success_response(data=content_data)


@pages_bp.route('/api/pages/<int:page_id>/pagemade/load', methods=['GET'])
@login_required
def pagemade_load(page_id):
    """Load PageMade content for editing (GrapesJS format)."""
    page = PageRepository.find_by_id(page_id)
    
    if not page:
        return Helpers.error_response('Page không tồn tại!', 404)
    
    # Verify ownership through site
    site = SiteRepository.find_by_id(page.site_id)
    if not site or site.user_id != current_user.id:
        return Helpers.error_response('Unauthorized', 403)
    
    # Parse content JSON if exists
    content_data = {}
    if page.content:
        try:
            # If content is JSON string, parse it
            if isinstance(page.content, str) and page.content.strip().startswith('{'):
                content_data = json.loads(page.content)
            # If it's already a dict, use it directly
            elif isinstance(page.content, dict):
                content_data = page.content
        except:
            # If not JSON, treat as HTML (old format)
            content_data = {
                'gjs-html': page.content if page.content else '',
                'gjs-css': '',
                'gjs-components': [],
                'gjs-styles': []
            }
    
    # Return GrapesJS format - support both old (html/css) and new (gjs-*) keys
    return jsonify({
        'gjs-html': content_data.get('gjs-html', content_data.get('html', '')),
        'gjs-css': content_data.get('gjs-css', content_data.get('css', '')),
        'gjs-components': content_data.get('gjs-components', content_data.get('components', [])),
        'gjs-styles': content_data.get('gjs-styles', content_data.get('styles', [])),
        'gjs-assets': content_data.get('gjs-assets', content_data.get('assets', [])),
    })


@pages_bp.route('/api/pages/<int:page_id>/pagemade/save', methods=['POST'])
@login_required
def pagemade_save(page_id):
    """Save PageMade content (GrapesJS format)."""
    page = PageRepository.find_by_id(page_id)
    
    if not page:
        return Helpers.error_response('Page không tồn tại!', 404)
    
    # Verify ownership through site
    site = SiteRepository.find_by_id(page.site_id)
    if not site or site.user_id != current_user.id:
        return Helpers.error_response('Unauthorized', 403)
    
    try:
        data = request.get_json()
        
        # Store complete GrapesJS storage format
        content_json = {
            'gjs-html': data.get('gjs-html', ''),
            'gjs-css': data.get('gjs-css', ''),
            'gjs-components': data.get('gjs-components', []),
            'gjs-styles': data.get('gjs-styles', []),
            'gjs-assets': data.get('gjs-assets', []),
        }
        
        # Use PageService to save
        success, error = PageService.update_content(
            page_id=page_id,
            content=json.dumps(content_json, ensure_ascii=False),
            user_id=current_user.id
        )
        
        if success:
            page = PageRepository.find_by_id(page_id)  # Refresh
            if page:
                return Helpers.success_response(
                    data={
                        'page_id': page.id,
                        'updated_at': page.updated_at.isoformat() if page.updated_at else None
                    },
                    message='Content saved successfully!'
                )
            else:
                return Helpers.error_response('Page not found after save', 404)
        else:
            return Helpers.error_response(error, 500)
        
    except Exception as e:
        return Helpers.error_response(f'Error saving content: {str(e)}', 500)


@pages_bp.route('/api/pages/<int:page_id>/upload-asset', methods=['POST'])
@login_required
def upload_asset(page_id):
    """Upload asset (image, video, etc.) for PageMaker."""
    page = PageRepository.find_by_id(page_id)
    
    if not page:
        return Helpers.error_response('Page không tồn tại!', 404)
    
    # Verify ownership through site
    site = SiteRepository.find_by_id(page.site_id)
    if not site or site.user_id != current_user.id:
        return Helpers.error_response('Unauthorized', 403)
    
    try:
        # Check if files were uploaded
        if 'files' not in request.files:
            return jsonify({'success': False, 'message': 'No files uploaded'}), 400
        
        files = request.files.getlist('files')
        uploaded_assets = []
        
        # Create upload directory if it doesn't exist
        import os
        upload_dir = os.path.join(os.path.dirname(current_app.root_path), 'static', 'uploads', 'assets')
        os.makedirs(upload_dir, exist_ok=True)
        
        for file in files:
            if file and file.filename:
                from werkzeug.utils import secure_filename
                import uuid
                
                # Secure filename and add unique prefix
                filename = secure_filename(file.filename)
                unique_filename = f"{uuid.uuid4().hex}_{filename}"
                file_path = os.path.join(upload_dir, unique_filename)
                
                # Save file
                file.save(file_path)
                
                # Generate URL
                asset_url = url_for('static', filename=f'uploads/assets/{unique_filename}', _external=True)
                
                uploaded_assets.append({
                    'src': asset_url,
                    'name': filename,
                    'type': 'image' if file.content_type and file.content_type.startswith('image/') else 'file'
                })
        
        return jsonify({
            'data': uploaded_assets
        })
        
    except Exception as e:
        current_app.logger.error(f"Asset upload error: {e}")
        return jsonify({
            'success': False,
            'message': f'Error uploading assets: {str(e)}'
        }), 500


@pages_bp.route('/api/pages/<int:page_id>/preview', methods=['POST'])
@login_required
def generate_preview(page_id):
    """Generate preview token for page."""
    page = PageRepository.find_by_id(page_id)
    
    if not page:
        return Helpers.error_response('Page không tồn tại!', 404)
    
    # Verify ownership through site
    site = SiteRepository.find_by_id(page.site_id)
    if not site or site.user_id != current_user.id:
        return Helpers.error_response('Unauthorized', 403)
    
    try:
        import secrets
        from datetime import timedelta
        
        # Generate secure preview token
        preview_token = secrets.token_urlsafe(32)
        
        # Store preview data in session (temporary storage)
        preview_data = {
            'page_id': page_id,
            'user_id': current_user.id,
            'title': page.title,
            'content': page.content,
            'created_at': datetime.utcnow().isoformat(),
            'expires_at': (datetime.utcnow() + timedelta(minutes=30)).isoformat()
        }
        
        # Store in session
        if 'previews' not in session:
            session['previews'] = {}
        session['previews'][preview_token] = preview_data
        session.modified = True
        
        # Generate preview URL
        preview_url = url_for('pages.preview_page', token=preview_token, _external=True)
        
        return Helpers.success_response(
            data={
                'preview_token': preview_token,
                'preview_url': preview_url,
                'expires_in': 1800  # 30 minutes
            }
        )
        
    except Exception as e:
        return Helpers.error_response(f'Error generating preview: {str(e)}', 500)


@pages_bp.route('/api/pages/<int:page_id>/set-homepage', methods=['POST'])
@login_required
def api_set_homepage(page_id):
    """Set page as homepage (API endpoint)."""
    page = PageRepository.find_by_id(page_id)
    
    if not page:
        return Helpers.error_response('Page không tồn tại!', 404)
    
    # Verify ownership through site
    site = SiteRepository.find_by_id(page.site_id)
    if not site or site.user_id != current_user.id:
        return Helpers.error_response('Unauthorized', 403)
    
    success, error = PageService.set_as_homepage(page_id, current_user.id)
    
    if success:
        page = PageRepository.find_by_id(page_id)  # Refresh
        homepage_url = page.get_url() if page and page.is_published else None
        
        return Helpers.success_response(
            data={'homepage_url': homepage_url},
            message='Homepage set successfully!'
        )
    else:
        return Helpers.error_response(error, 500)


@pages_bp.route('/api/pages/<int:page_id>/publish', methods=['POST'])
@login_required
def api_publish_page(page_id):
    """Publish PageMaker page to subdomain (API endpoint for AJAX)."""
    page = PageRepository.find_by_id(page_id)
    
    if not page:
        return jsonify({'success': False, 'message': 'Page không tồn tại!'}), 404
    
    # Verify ownership through site
    site = SiteRepository.find_by_id(page.site_id)
    if not site or site.user_id != current_user.id:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 403
    
    try:
        # Get page content from PageMaker
        if not page.content:
            return jsonify({
                'success': False,
                'message': 'Không có nội dung để xuất bản. Vui lòng lưu trang trước.'
            }), 400
        
        # Parse PageMaker content
        try:
            content_data = json.loads(page.content) if isinstance(page.content, str) else page.content
            html_content = content_data.get('gjs-html', '')
            css_content = content_data.get('gjs-css', '')
        except:
            return jsonify({
                'success': False,
                'message': 'Lỗi định dạng nội dung. Vui lòng lưu lại trang.'
            }), 400
        
        if not html_content:
            return jsonify({
                'success': False,
                'message': 'Trang trống. Vui lòng thêm nội dung trước khi xuất bản.'
            }), 400
        
        # Get site subdomain
        subdomain = site.subdomain
        
        # Determine filename: index.html for homepage, {slug}.html for other pages
        if page.is_homepage:
            filename = 'index.html'
            page_url = f"https://{subdomain}.pagemade.site"
        else:
            # Generate slug if not exists
            if not page.slug:
                page.slug = page.generate_slug()
            filename = f"{page.slug}.html"
            page_url = f"https://{subdomain}.pagemade.site/{page.slug}"
        
        # Build complete HTML with Tailwind CDN
        complete_html = f"""<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{page.title} - {site.title}</title>
    
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com?3.4.0"></script>
    
    <!-- Custom Styles -->
    <style>
        {css_content}
    </style>
</head>
<body>
    {html_content}
</body>
</html>"""
        
        # Deploy to storage folder
        import os
        storage_base = os.path.join(current_app.root_path, 'storage', 'sites', str(site.id))
        
        try:
            os.makedirs(storage_base, exist_ok=True)
            file_path = os.path.join(storage_base, filename)
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(complete_html)
            
            current_app.logger.info(f"✅ Published: {file_path}")
            
        except Exception as deploy_error:
            return jsonify({
                'success': False,
                'message': f'Lỗi khi ghi file: {str(deploy_error)}'
        }), 500
        
        # Mark page as published
        page.is_published = True
        page.published_at = datetime.utcnow()
        
        # Auto-publish site if not already
        if not site.is_published:
            site.is_published = True
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Xuất bản thành công!',
            'url': page_url,
            'subdomain': subdomain,
            'filename': filename,
            'site_published': True
        })
        
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        current_app.logger.error(f"❌ Publish error: {e}\n{error_trace}")
        
        return jsonify({
            'success': False,
            'message': f'Lỗi khi xuất bản: {str(e)}',
            'error': str(e),
            'trace': error_trace if current_app.debug else None
        }), 500


# ================================
# FRONTEND TEMPLATE DATA API
# ================================

@pages_bp.route('/api/editor/template-data/<int:page_id>', methods=['GET'])
@login_required
def get_editor_template_data(page_id):
    """Get template data for PageMade Editor frontend."""
    page = PageRepository.find_by_id(page_id)
    
    if not page:
        return Helpers.error_response('Page không tồn tại!', 404)
    
    # Verify ownership through site
    site = SiteRepository.find_by_id(page.site_id)
    if not site or site.user_id != current_user.id:
        return Helpers.error_response('Unauthorized', 403)
    
    # Return template data as JSON
    return Helpers.success_response(
        data={
            'page': {
                'id': page.id,
                'title': page.title,
                'slug': page.slug,
                'content': page.content,
                'css_content': page.css_content,
                'html_content': page.html_content,
                'is_published': page.is_published,
                'is_homepage': page.is_homepage,
                'created_at': page.created_at.isoformat() if page.created_at else None,
                'updated_at': page.updated_at.isoformat() if page.updated_at else None
            },
            'site': {
                'id': site.id,
                'subdomain': site.subdomain,
                'title': site.title,
                'description': site.description,
                'is_published': site.is_published
            },
            'user': {
                'id': current_user.id,
                'name': current_user.name,
                'email': current_user.email
            },
            'endpoints': {
                'load': url_for('pages.pagemade_load', page_id=page.id),
                'save': url_for('pages.save_page', page_id=page.id),
                'publish': url_for('pages.publish_page', page_id=page.id),
                'preview': url_for('pages.generate_preview', page_id=page.id),
                'assets_upload': url_for('assets.upload_asset')
            }
        }
    )


@pages_bp.route('/editor/<int:page_id>/frontend')
@login_required
def editor_frontend(page_id):
    """Serve PageMade Editor from frontend."""
    page = PageRepository.find_by_id(page_id)
    
    if not page:
        abort(404)
    
    # Verify ownership through site
    site = SiteRepository.find_by_id(page.site_id)
    if not site or site.user_id != current_user.id:
        abort(403)
    
    # Redirect to frontend editor with page data
    frontend_url = f"http://localhost:3000/editor/{page_id}?token={generate_editor_token(page_id)}"
    return redirect(frontend_url)


def _generate_jwt_editor_token(page_id):
    """
    Generate JWT token for frontend editor access.
    Private function to avoid conflict with template context processor.
    """
    from app.services.jwt_service import JWTService
    from datetime import datetime, timedelta, timezone
    import jwt
    
    # Get current user
    user = current_user
    
    # Create access token payload with page_id
    now = datetime.now(timezone.utc)
    payload = {
        'user_id': user.id,
        'email': user.email,
        'role': user.role,
        'page_id': page_id,  # Include page_id in token
        'iat': now,
        'exp': now + timedelta(hours=24),  # 24 hours expiry for editor session
        'type': 'access'
    }
    
    # Generate JWT token
    token = jwt.encode(
        payload,
        current_app.config['JWT_SECRET_KEY'],
        algorithm=current_app.config['JWT_ALGORITHM']
    )
    
    return token


# Keep old function name for backward compatibility with templates
def generate_editor_token(page_id):
    """Backward compatibility wrapper - generates JWT token."""
    return _generate_jwt_editor_token(page_id)


@pages_bp.route('/api/editor/verify-token/<token>', methods=['GET'])
def verify_editor_token(token):
    """Verify editor token and return page data."""
    import time
    from app.services.jwt_service import JWTService
    
    try:
        # Verify JWT token
        user = JWTService.get_user_from_token(token)
        if not user:
            return Helpers.error_response('Token không hợp lệ hoặc đã hết hạn!', 401)
        
        # Extract page_id from token payload
        payload = JWTService.decode_token(token)
        page_id = payload.get('page_id')
        
        if not page_id:
            return Helpers.error_response('Token không hợp lệ!', 401)
    
        # Get page and verify ownership
        page = PageRepository.find_by_id(page_id)
        
        if not page:
            return Helpers.error_response('Page không tồn tại!', 404)
        
        # Verify ownership through site
        site = SiteRepository.find_by_id(page.site_id)
        if not site or site.user_id != user.id:
            return Helpers.error_response('Unauthorized!', 403)
        
        # Return success with page data
        return Helpers.success_response(
            data={
                'page_id': page.id,
                'page_title': page.title,
                'site_id': site.id,
                'site_subdomain': site.subdomain,
                'site_title': site.title,
                'user_id': user.id,
                'user_name': user.name,
                'user_email': user.email,
                'token_expires_at': payload.get('exp', 0)
            },
            message='Token verified successfully!'
        )
        
    except Exception as e:
        current_app.logger.error(f"Token verification error: {e}")
        return Helpers.error_response('Token verification failed!', 401)

