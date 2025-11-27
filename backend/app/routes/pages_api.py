"""
Pages API blueprint - Page management API endpoints
JSON-only responses for decoupled frontend
"""

from flask import Blueprint, request, jsonify, current_app, abort
from flask_login import login_required, current_user
import json
import os
import re
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
from app.utils.api_helpers import success_response, error_response, paginated_response
from app.middleware.jwt_auth import jwt_required

# Create API blueprint with /api prefix
pages_api_bp = Blueprint('pages_api', __name__, url_prefix='/api')


# ================================
# PAGES API ENDPOINTS
# ================================

@pages_api_bp.route('/pages', methods=['GET'])
@jwt_required
def get_pages():
    """Get all pages for current user across all sites."""
    try:
        # Get pagination parameters
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        site_id = request.args.get('site_id', type=int)
        
        pages = []
        
        if site_id:
            # Get pages for specific site
            site = SiteRepository.find_by_id(site_id)
            if not site:
                return error_response("Site not found", 404)
            
            # Check if user owns site
            if site.user_id != request.current_user.id:
                return error_response("Access denied", 403)
            
            pages = PageRepository.find_by_site(site_id)
        else:
            # Get all pages for user
            sites = SiteRepository.find_by_user(request.current_user.id)
            for site in sites:
                site_pages = PageRepository.find_by_site(site.id)
                for page in site_pages:
                    page.site_name = site.name
                    page.site_subdomain = site.subdomain
                pages.extend(site_pages)
        
        pages_data = []
        for page in pages:
            page_data = {
                'id': page.id,
                'title': page.title,
                'slug': page.slug,
                'description': page.description,
                'template': page.template,
                'is_published': page.is_published,
                'is_homepage': page.is_homepage,
                'site_id': page.site_id,
                'site_name': getattr(page, 'site_name', 'Unknown'),
                'site_subdomain': getattr(page, 'site_subdomain', 'unknown'),
                'created_at': page.created_at.isoformat() if page.created_at else None,
                'updated_at': page.updated_at.isoformat() if page.updated_at else None
            }
            pages_data.append(page_data)
        
        # Sort by updated_at desc
        pages_data.sort(key=lambda x: x['updated_at'] or '', reverse=True)
        
        # Apply pagination
        total = len(pages_data)
        start = (page - 1) * per_page
        end = start + per_page
        paginated_pages = pages_data[start:end]
        
        return paginated_response(
            data=paginated_pages,
            page=page,
            per_page=per_page,
            total=total,
            message="Pages retrieved successfully"
        )
        
    except Exception as e:
        current_app.logger.error(f"Get pages error: {e}")
        return error_response("Failed to retrieve pages", 500)


@pages_api_bp.route('/pages', methods=['POST'])
@jwt_required
def create_page():
    """Create a new page."""
    try:
        data = request.get_json()
        
        if not data:
            return error_response("No data provided", 400)
        
        title = data.get('title', '').strip()
        description = data.get('description', '').strip()
        template = data.get('template', 'default')
        site_id = data.get('site_id')
        html_content = data.get('html_content', '')
        css_content = data.get('css_content', '')
        
        # Validation
        if not title:
            return error_response("Page title is required", 400)
        
        if not site_id:
            return error_response("Site ID is required", 400)
        
        # Check if site exists and user owns it
        site = SiteRepository.find_by_id(site_id)
        if not site:
            return error_response("Site not found", 404)
        
        if site.user_id != request.current_user.id:
            return error_response("Access denied", 403)
        
        # Create page
        success, page, error = PageService.create_page(
            user_id=request.current_user.id,
            site_id=site_id,
            title=title,
            description=description,
            template=template
        )
        
        if success and page:
            page_data = {
                'id': page.id,
                'title': page.title,
                'slug': page.slug,
                'description': page.description,
                'template': page.template,
                'is_published': page.is_published,
                'is_homepage': page.is_homepage,
                'site_id': page.site_id,
                'html_content': page.html_content,
                'css_content': page.css_content,
                'created_at': page.created_at.isoformat() if page.created_at else None,
                'updated_at': page.updated_at.isoformat() if page.updated_at else None
            }
            
            return success_response(
                data=page_data,
                message="Page created successfully",
                status=201
            )
        else:
            return error_response(error or "Failed to create page", 400)
            
    except Exception as e:
        current_app.logger.error(f"Create page error: {e}")
        return error_response("Failed to create page", 500)


@pages_api_bp.route('/pages/<int:page_id>', methods=['GET'])
@jwt_required
def get_page(page_id):
    """Get a specific page."""
    try:
        page = PageRepository.find_by_id(page_id)
        
        if not page:
            return error_response("Page not found", 404)
        
        # Check if user owns the page's site
        site = SiteRepository.find_by_id(page.site_id)
        if not site or site.user_id != request.current_user.id:
            return error_response("Access denied", 403)
        
        page_data = {
            'id': page.id,
            'title': page.title,
            'slug': page.slug,
            'description': page.description,
            'template': page.template,
            'is_published': page.is_published,
            'is_homepage': page.is_homepage,
            'site_id': page.site_id,
            'site_name': site.name,
            'site_subdomain': site.subdomain,
            'html_content': page.html_content,
            'css_content': page.css_content,
            'created_at': page.created_at.isoformat() if page.created_at else None,
            'updated_at': page.updated_at.isoformat() if page.updated_at else None
        }
        
        return success_response(
            data=page_data,
            message="Page retrieved successfully"
        )
        
    except Exception as e:
        current_app.logger.error(f"Get page error: {e}")
        return error_response("Failed to retrieve page", 500)


@pages_api_bp.route('/pages/<int:page_id>', methods=['PUT'])
@jwt_required
def update_page(page_id):
    """Update a page."""
    try:
        page = PageRepository.find_by_id(page_id)
        
        if not page:
            return error_response("Page not found", 404)
        
        # Check if user owns the page's site
        site = SiteRepository.find_by_id(page.site_id)
        if not site or site.user_id != request.current_user.id:
            return error_response("Access denied", 403)
        
        data = request.get_json()
        
        if not data:
            return error_response("No data provided", 400)
        
        title = data.get('title', '').strip()
        description = data.get('description', '').strip()
        template = data.get('template', 'default')
        html_content = data.get('html_content')
        css_content = data.get('css_content')
        is_published = data.get('is_published')
        is_homepage = data.get('is_homepage')
        meta_title = data.get('meta_title', '').strip()
        meta_description = data.get('meta_description', '').strip()
        
        # Validation
        if not title:
            return error_response("Page title is required", 400)
        
        # Update page
        success, updated_page, error = PageService.update_page(
            page_id=page_id,
            user_id=request.current_user.id,
            title=title,
            description=description,
            template=template,
            html_content=html_content,
            css_content=css_content,
            is_published=is_published,
            meta_title=meta_title,
            meta_description=meta_description
        )
        
        if success and updated_page:
            page_data = {
                'id': updated_page.id,
                'title': updated_page.title,
                'slug': updated_page.slug,
                'description': updated_page.description,
                'template': updated_page.template,
                'is_published': updated_page.is_published,
                'is_homepage': updated_page.is_homepage,
                'site_id': updated_page.site_id,
                'html_content': updated_page.html_content,
                'css_content': updated_page.css_content,
                'updated_at': updated_page.updated_at.isoformat() if updated_page.updated_at else None
            }
            
            return success_response(
                data=page_data,
                message="Page updated successfully"
            )
        else:
            return error_response(error or "Failed to update page", 400)
            
    except Exception as e:
        current_app.logger.error(f"Update page error: {e}")
        return error_response("Failed to update page", 500)


@pages_api_bp.route('/pages/<int:page_id>', methods=['DELETE'])
@jwt_required
def delete_page(page_id):
    """Delete a page."""
    try:
        page = PageRepository.find_by_id(page_id)
        
        if not page:
            return error_response("Page not found", 404)
        
        # Check if user owns the page's site
        site = SiteRepository.find_by_id(page.site_id)
        if not site or site.user_id != request.current_user.id:
            return error_response("Access denied", 403)
        
        # Delete page
        success, error = PageService.delete_page(page_id, request.current_user.id)
        
        if success:
            return success_response(
                message="Page deleted successfully"
            )
        else:
            return error_response(error or "Failed to delete page", 400)
            
    except Exception as e:
        current_app.logger.error(f"Delete page error: {e}")
        return error_response("Failed to delete page", 500)


# ================================
# PAGE EDITOR API ENDPOINTS
# ================================

@pages_api_bp.route('/pages/<int:page_id>/editor-data', methods=['GET'])
@jwt_required
def get_page_editor_data(page_id):
    """Get page data specifically for the editor."""
    try:
        page = PageRepository.find_by_id(page_id)
        
        if not page:
            return error_response("Page not found", 404)
        
        # Check if user owns the page's site
        site = SiteRepository.find_by_id(page.site_id)
        if not site or site.user_id != request.current_user.id:
            return error_response("Access denied", 403)
        
        # Get site assets for the editor
        from app.repositories import AssetRepository
        assets = AssetRepository.find_by_site(site.id)
        
        assets_data = []
        for asset in assets:
            asset_data = {
                'id': asset.id,
                'filename': asset.filename,
                'original_name': asset.original_name,
                'file_type': asset.file_type,
                'file_size': asset.file_size,
                'url': asset.url,
                'width': asset.width,
                'height': asset.height,
                'created_at': asset.created_at.isoformat() if asset.created_at else None
            }
            assets_data.append(asset_data)
        
        editor_data = {
            'page': {
                'id': page.id,
                'title': page.title,
                'slug': page.slug,
                'description': page.description,
                'template': page.template,
                'html_content': page.html_content or '',
                'css_content': page.css_content or ''
            },
            'site': {
                'id': site.id,
                'name': site.name,
                'subdomain': site.subdomain,
                'description': site.description
            },
            'assets': assets_data
        }
        
        return success_response(
            data=editor_data,
            message="Editor data retrieved successfully"
        )
        
    except Exception as e:
        current_app.logger.error(f"Get editor data error: {e}")
        return error_response("Failed to retrieve editor data", 500)


@pages_api_bp.route('/pages/<int:page_id>/save', methods=['POST'])
@jwt_required
def save_page_content(page_id):
    """Save page content from editor (auto-save)."""
    try:
        page = PageRepository.find_by_id(page_id)
        
        if not page:
            return error_response("Page not found", 404)
        
        # Check if user owns the page's site
        site = SiteRepository.find_by_id(page.site_id)
        if not site or site.user_id != request.current_user.id:
            return error_response("Access denied", 403)
        
        data = request.get_json()
        
        if not data:
            return error_response("No data provided", 400)
        
        html_content = data.get('html_content', '')
        css_content = data.get('css_content', '')
        
        # Update page content
        success, updated_page, error = PageService.update_page(
            page_id=page_id,
            user_id=request.current_user.id,
            html_content=html_content,
            css_content=css_content
        )
        
        if success:
            return success_response(
                data={
                    'updated_at': updated_page.updated_at.isoformat() if updated_page.updated_at else None
                },
                message="Page saved successfully"
            )
        else:
            return error_response(error or "Failed to save page", 400)
            
    except Exception as e:
        current_app.logger.error(f"Save page error: {e}")
        return error_response("Failed to save page", 500)


@pages_api_bp.route('/pages/<int:page_id>/publish', methods=['POST'])
@jwt_required
def publish_page(page_id):
    """Publish a page."""
    try:
        page = PageRepository.find_by_id(page_id)
        
        if not page:
            return error_response("Page not found", 404)
        
        # Check if user owns the page's site
        site = SiteRepository.find_by_id(page.site_id)
        if not site or site.user_id != request.current_user.id:
            return error_response("Access denied", 403)
        
        # Publish page
        success, error = PageService.publish_page(page_id, request.current_user.id)
        
        if success:
            return success_response(
                message="Page published successfully"
            )
        else:
            return error_response(error or "Failed to publish page", 400)
            
    except Exception as e:
        current_app.logger.error(f"Publish page error: {e}")
        return error_response("Failed to publish page", 500)


@pages_api_bp.route('/pages/<int:page_id>/unpublish', methods=['POST'])
@jwt_required
def unpublish_page(page_id):
    """Unpublish a page."""
    try:
        page = PageRepository.find_by_id(page_id)
        
        if not page:
            return error_response("Page not found", 404)
        
        # Check if user owns the page's site
        site = SiteRepository.find_by_id(page.site_id)
        if not site or site.user_id != request.current_user.id:
            return error_response("Access denied", 403)
        
        # Unpublish page
        success, error = PageService.unpublish_page(page_id, request.current_user.id)
        
        if success:
            return success_response(
                message="Page unpublished successfully"
            )
        else:
            return error_response(error or "Failed to unpublish page", 400)
            
    except Exception as e:
        current_app.logger.error(f"Unpublish page error: {e}")
        return error_response("Failed to unpublish page", 500)