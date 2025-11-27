"""
Sites API blueprint - Site management API endpoints
JSON-only responses for decoupled frontend
"""

from flask import Blueprint, request, jsonify, current_app, abort
from flask_login import login_required, current_user
import os
import re
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
from app.middleware.jwt_bypass import jwt_api_auth

# Create API blueprint with /api prefix
sites_api_bp = Blueprint('sites_api', __name__, url_prefix='/api')


# ================================
# SITES API ENDPOINTS
# ================================

@sites_api_bp.route('/sites', methods=['GET'])
@jwt_api_auth
def get_sites():
    """Get all sites for current user."""
    try:
        # Get pagination parameters
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        # Get sites for current user
        sites = SiteRepository.find_by_user(request.current_user.id)
        
        # Calculate stats for each site
        sites_data = []
        for site in sites:
            pages = PageRepository.find_by_site(site.id)
            
            site_data = {
                'id': site.id,
                'name': site.name,
                'subdomain': site.subdomain,
                'description': site.description,
                'is_published': site.is_published,
                'created_at': site.created_at.isoformat() if site.created_at else None,
                'updated_at': site.updated_at.isoformat() if site.updated_at else None,
                'stats': {
                    'total_pages': len(pages),
                    'published_pages': sum(1 for page in pages if page.is_published)
                }
            }
            sites_data.append(site_data)
        
        # Apply pagination
        total = len(sites_data)
        start = (page - 1) * per_page
        end = start + per_page
        paginated_sites = sites_data[start:end]
        
        return paginated_response(
            data=paginated_sites,
            page=page,
            per_page=per_page,
            total=total,
            message="Sites retrieved successfully"
        )
        
    except Exception as e:
        current_app.logger.error(f"Get sites error: {e}")
        return error_response("Failed to retrieve sites", 500)


@sites_api_bp.route('/sites', methods=['POST'])
@jwt_api_auth
def create_site():
    """Create a new site."""
    try:
        data = request.get_json()
        
        if not data:
            return error_response("No data provided", 400)
        
        name = data.get('name', '').strip()
        subdomain = data.get('subdomain', '').strip()
        description = data.get('description', '').strip()
        
        # Validation
        if not name:
            return error_response("Site name is required", 400)
        
        if not subdomain:
            # Generate subdomain from name
            subdomain = re.sub(r'[^a-zA-Z0-9]', '', name.lower())
            subdomain = subdomain[:20]  # Limit length
        
        # Validate subdomain
        if not Validators.is_valid_subdomain(subdomain):
            return error_response("Invalid subdomain format", 400)
        
        # Check if subdomain already exists
        existing_site = SiteRepository.find_by_subdomain(subdomain)
        if existing_site:
            return error_response("Subdomain already exists", 400)
        
        # Create site
        success, site, error = SiteService.create_site(
            user_id=request.current_user.id,
            title=name,
            subdomain=subdomain,
            description=description
        )
        
        if success and site:
            site_data = {
                'id': site.id,
                'name': site.name,
                'subdomain': site.subdomain,
                'description': site.description,
                'is_published': site.is_published,
                'created_at': site.created_at.isoformat() if site.created_at else None,
                'updated_at': site.updated_at.isoformat() if site.updated_at else None,
                'stats': {
                    'total_pages': 0,
                    'published_pages': 0
                }
            }
            
            return success_response(
                data=site_data,
                message="Site created successfully",
                status=201
            )
        else:
            return error_response(error or "Failed to create site", 400)
            
    except Exception as e:
        current_app.logger.error(f"Create site error: {e}")
        return error_response("Failed to create site", 500)


@sites_api_bp.route('/sites/<int:site_id>', methods=['GET'])
@jwt_api_auth
def get_site(site_id):
    """Get a specific site."""
    try:
        site = SiteRepository.find_by_id(site_id)
        
        if not site:
            return error_response("Site not found", 404)
        
        # Check if user owns the site
        if site.user_id != request.current_user.id:
            return error_response("Access denied", 403)
        
        # Get pages for this site
        pages = PageRepository.find_by_site(site.id)
        
        site_data = {
            'id': site.id,
            'name': site.name,
            'subdomain': site.subdomain,
            'description': site.description,
            'is_published': site.is_published,
            'created_at': site.created_at.isoformat() if site.created_at else None,
            'updated_at': site.updated_at.isoformat() if site.updated_at else None,
            'pages': [
                {
                    'id': page.id,
                    'title': page.title,
                    'slug': page.slug,
                    'is_published': page.is_published,
                    'is_homepage': page.is_homepage,
                    'created_at': page.created_at.isoformat() if page.created_at else None,
                    'updated_at': page.updated_at.isoformat() if page.updated_at else None
                }
                for page in pages
            ],
            'stats': {
                'total_pages': len(pages),
                'published_pages': sum(1 for page in pages if page.is_published)
            }
        }
        
        return success_response(
            data=site_data,
            message="Site retrieved successfully"
        )
        
    except Exception as e:
        current_app.logger.error(f"Get site error: {e}")
        return error_response("Failed to retrieve site", 500)


@sites_api_bp.route('/sites/<int:site_id>', methods=['PUT'])
@jwt_api_auth
def update_site(site_id):
    """Update a site."""
    try:
        site = SiteRepository.find_by_id(site_id)
        
        if not site:
            return error_response("Site not found", 404)
        
        # Check if user owns the site
        if site.user_id != request.current_user.id:
            return error_response("Access denied", 403)
        
        data = request.get_json()
        
        if not data:
            return error_response("No data provided", 400)
        
        name = data.get('name', '').strip()
        subdomain = data.get('subdomain', '').strip()
        description = data.get('description', '').strip()
        is_published = data.get('is_published')
        
        # Validation
        if not name:
            return error_response("Site name is required", 400)
        
        if not subdomain:
            # Generate subdomain from name
            subdomain = re.sub(r'[^a-zA-Z0-9]', '', name.lower())
            subdomain = subdomain[:20]
        
        # Validate subdomain
        if not Validators.is_valid_subdomain(subdomain):
            return error_response("Invalid subdomain format", 400)
        
        # Check if subdomain already exists (excluding current site)
        existing_site = SiteRepository.find_by_subdomain(subdomain)
        if existing_site and existing_site.id != site.id:
            return error_response("Subdomain already exists", 400)
        
        # Update site
        success, updated_site, error = SiteService.update_site(
            site_id=site_id,
            user_id=request.current_user.id,
            name=name,
            subdomain=subdomain,
            description=description,
            is_published=is_published
        )
        
        if success and updated_site:
            site_data = {
                'id': updated_site.id,
                'name': updated_site.name,
                'subdomain': updated_site.subdomain,
                'description': updated_site.description,
                'is_published': updated_site.is_published,
                'updated_at': updated_site.updated_at.isoformat() if updated_site.updated_at else None
            }
            
            return success_response(
                data=site_data,
                message="Site updated successfully"
            )
        else:
            return error_response(error or "Failed to update site", 400)
            
    except Exception as e:
        current_app.logger.error(f"Update site error: {e}")
        return error_response("Failed to update site", 500)


@sites_api_bp.route('/sites/<int:site_id>', methods=['DELETE'])
@jwt_api_auth
def delete_site(site_id):
    """Delete a site."""
    try:
        site = SiteRepository.find_by_id(site_id)
        
        if not site:
            return error_response("Site not found", 404)
        
        # Check if user owns the site
        if site.user_id != request.current_user.id:
            return error_response("Access denied", 403)
        
        # Delete site (this should also delete associated pages)
        success, error = SiteService.delete_site(site_id, request.current_user.id)
        
        if success:
            return success_response(
                message="Site deleted successfully"
            )
        else:
            return error_response(error or "Failed to delete site", 400)
            
    except Exception as e:
        current_app.logger.error(f"Delete site error: {e}")
        return error_response("Failed to delete site", 500)


# ================================
# PAGES API ENDPOINTS (under sites)
# ================================

@sites_api_bp.route('/sites/<int:site_id>/pages', methods=['GET'])
@jwt_api_auth
def get_site_pages(site_id):
    """Get all pages for a site."""
    try:
        site = SiteRepository.find_by_id(site_id)
        
        if not site:
            return error_response("Site not found", 404)
        
        # Check if user owns the site
        if site.user_id != request.current_user.id:
            return error_response("Access denied", 403)
        
        # Get pagination parameters
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        # Get pages for this site
        pages = PageRepository.find_by_site(site.id)
        
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
                'created_at': page.created_at.isoformat() if page.created_at else None,
                'updated_at': page.updated_at.isoformat() if page.updated_at else None
            }
            pages_data.append(page_data)
        
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
        current_app.logger.error(f"Get site pages error: {e}")
        return error_response("Failed to retrieve pages", 500)


@sites_api_bp.route('/sites/<int:site_id>/publish', methods=['POST'])
@jwt_api_auth
def publish_site(site_id):
    """Publish a site (make it live)."""
    try:
        site = SiteRepository.find_by_id(site_id)
        
        if not site:
            return error_response("Site not found", 404)
        
        # Check if user owns the site
        if site.user_id != request.current_user.id:
            return error_response("Access denied", 403)
        
        # Publish site
        success, error = SiteService.publish_site(site_id, request.current_user.id)
        
        if success:
            return success_response(
                message="Site published successfully"
            )
        else:
            return error_response(error or "Failed to publish site", 400)
            
    except Exception as e:
        current_app.logger.error(f"Publish site error: {e}")
        return error_response("Failed to publish site", 500)


@sites_api_bp.route('/sites/<int:site_id>/unpublish', methods=['POST'])
@jwt_api_auth
def unpublish_site(site_id):
    """Unpublish a site (take it offline)."""
    try:
        site = SiteRepository.find_by_id(site_id)
        
        if not site:
            return error_response("Site not found", 404)
        
        # Check if user owns the site
        if site.user_id != request.current_user.id:
            return error_response("Access denied", 403)
        
        # Unpublish site
        success, error = SiteService.unpublish_site(site_id, request.current_user.id)
        
        if success:
            return success_response(
                message="Site unpublished successfully"
            )
        else:
            return error_response(error or "Failed to unpublish site", 400)
            
    except Exception as e:
        current_app.logger.error(f"Unpublish site error: {e}")
        return error_response("Failed to unpublish site", 500)


@sites_api_bp.route('/editor/verify-token/<token>', methods=['GET'])
@jwt_api_auth
def verify_editor_token_jwt(token):
    """Verify editor token and return page data using JWT authentication."""
    try:
        # For now, we'll use a simple approach where the token is the page ID
        # In a real implementation, you might want to use a more secure token system
        
        # Try to parse token as page ID
        try:
            page_id = int(token)
        except ValueError:
            return error_response("Invalid token format", 400)
        
        # Get page and verify ownership
        page = PageRepository.find_by_id(page_id)
        
        if not page:
            return error_response("Page not found", 404)
        
        # Verify ownership through site
        site = SiteRepository.find_by_id(page.site_id)
        
        if not site:
            return error_response("Site not found", 404)
        
        if site.user_id != request.current_user.id:
            return error_response("Access denied", 403)
        
        # Return page data
        return success_response(
            data={
                "page_id": page.id,
                "page_title": page.title,
                "page_content": page.content,
                "page_css": page.css_content,
                "site_id": site.id,
                "site_title": site.title,
                "site_subdomain": site.subdomain
            },
            message="Token verified successfully"
        )
        
    except Exception as e:
        current_app.logger.error(f"Token verification error: {e}")
        return error_response("Token verification failed", 500)