"""
Assets API blueprint - Asset management API endpoints
JSON-only responses for decoupled frontend
"""

from flask import Blueprint, request, jsonify, current_app, abort, send_file
from flask_login import login_required, current_user
import os
import uuid
import secrets
from werkzeug.utils import secure_filename
from PIL import Image
import mimetypes
import stat

from app.models import db, Asset, Site
from app.services import AssetService
from app.repositories import AssetRepository, SiteRepository
from app.utils import Validators, Helpers
from app.utils.api_helpers import success_response, error_response, paginated_response
from app.middleware.jwt_auth import jwt_required

# Create API blueprint with /api prefix
assets_api_bp = Blueprint('assets_api', __name__, url_prefix='/api')


# ================================
# ASSETS API ENDPOINTS
# ================================

@assets_api_bp.route('/assets', methods=['GET'])
@jwt_required
def get_assets():
    """Get all assets for current user across all sites."""
    try:
        # Get pagination parameters
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        site_id = request.args.get('site_id', type=int)
        file_type = request.args.get('file_type', '')
        
        assets = []
        
        if site_id:
            # Get assets for specific site
            site = SiteRepository.find_by_id(site_id)
            if not site:
                return error_response("Site not found", 404)
            
            # Check if user owns site
            if site.user_id != request.current_user.id:
                return error_response("Access denied", 403)
            
            assets = AssetRepository.find_by_site(site_id)
        else:
            # Get all assets for user
            sites = SiteRepository.find_by_user(request.current_user.id)
            for site in sites:
                site_assets = AssetRepository.find_by_site(site.id)
                for asset in site_assets:
                    asset.site_name = site.name
                    asset.site_subdomain = site.subdomain
                assets.extend(site_assets)
        
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
                'site_id': asset.site_id,
                'site_name': getattr(asset, 'site_name', 'Unknown'),
                'site_subdomain': getattr(asset, 'site_subdomain', 'unknown'),
                'created_at': asset.created_at.isoformat() if asset.created_at else None
            }
            assets_data.append(asset_data)
        
        # Sort by created_at desc
        assets_data.sort(key=lambda x: x['created_at'] or '', reverse=True)
        
        # Apply pagination
        total = len(assets_data)
        start = (page - 1) * per_page
        end = start + per_page
        paginated_assets = assets_data[start:end]
        
        return paginated_response(
            data=paginated_assets,
            page=page,
            per_page=per_page,
            total=total,
            message="Assets retrieved successfully"
        )
        
    except Exception as e:
        current_app.logger.error(f"Get assets error: {e}")
        return error_response("Failed to retrieve assets", 500)


@assets_api_bp.route('/assets/upload', methods=['POST'])
@jwt_required
def upload_asset():
    """Upload an asset."""
    try:
        # Check if file was uploaded
        if 'file' not in request.files:
            return error_response("No file provided", 400)
        
        file = request.files['file']
        site_id = request.form.get('site_id', type=int)
        
        if file.filename == '':
            return error_response("No file selected", 400)
        
        if not site_id:
            return error_response("Site ID is required", 400)
        
        # Check if site exists and user owns it
        site = SiteRepository.find_by_id(site_id)
        if not site:
            return error_response("Site not found", 404)
        
        if site.user_id != request.current_user.id:
            return error_response("Access denied", 403)
        
        # Validate file
        if not Validators.is_safe_filename(file.filename):
            return error_response("Invalid filename", 400)
        
        # Check file size (max 5MB)
        file.seek(0, os.SEEK_END)
        size = file.tell()
        file.seek(0)
        
        if size > 5 * 1024 * 1024:
            return error_response("File too large (max 5MB)", 400)
        
        # Get file info
        original_name = file.filename
        filename = secure_filename(original_name or '')
        unique_filename = f"{uuid.uuid4().hex}_{filename}"
        
        # Determine file type
        file_type = mimetypes.guess_type(original_name)[0] or 'application/octet-stream'
        
        # Process image files
        width = None
        height = None
        
        if file_type.startswith('image/'):
            try:
                with Image.open(file) as img:
                    width, height = img.size
                    # Convert to RGB if necessary
                    if img.mode in ('RGBA', 'LA', 'P'):
                        img = img.convert('RGB')
                        # Save to temporary file to get RGB data
                        temp_path = f"/tmp/{unique_filename}"
                        img.save(temp_path, 'JPEG', quality=85)
                        file.seek(0)
            except Exception as e:
                current_app.logger.error(f"Image processing error: {e}")
        
        # Upload asset
        success, asset, error = AssetService.upload_asset(
            file=file,
            user_id=request.current_user.id,
            site_id=site_id,
            static_folder='static'
        )
        
        if success and asset:
            return success_response(
                message="Asset uploaded successfully",
                data={'asset': asset}
            )
        else:
            return error_response(error or "Failed to upload asset", 400)
            
    except Exception as e:
        current_app.logger.error(f"Upload asset error: {e}")
        return error_response("Failed to upload asset", 500)


@assets_api_bp.route('/assets/<int:asset_id>', methods=['GET'])
@jwt_required
def get_asset(asset_id):
    """Get a specific asset."""
    try:
        asset = AssetRepository.find_by_id(asset_id)
        
        if not asset:
            return error_response("Asset not found", 404)
        
        # Check if user owns asset's site
        site = SiteRepository.find_by_id(asset.site_id)
        if not site or site.user_id != request.current_user.id:
            return error_response("Access denied", 403)
        
        asset_data = {
            'id': asset.id,
            'filename': asset.filename,
            'original_name': asset.original_name,
            'file_type': asset.file_type,
            'file_size': asset.file_size,
            'url': asset.url,
            'width': asset.width,
            'height': asset.height,
            'site_id': asset.site_id,
            'site_name': site.name,
            'site_subdomain': site.subdomain,
            'created_at': asset.created_at.isoformat() if asset.created_at else None
        }
        
        return success_response(
            data=asset_data,
            message="Asset retrieved successfully"
        )
        
    except Exception as e:
        current_app.logger.error(f"Get asset error: {e}")
        return error_response("Failed to retrieve asset", 500)


@assets_api_bp.route('/assets/<int:asset_id>', methods=['DELETE'])
@jwt_required
def delete_asset(asset_id):
    """Delete an asset."""
    try:
        asset = AssetRepository.find_by_id(asset_id)
        
        if not asset:
            return error_response("Asset not found", 404)
        
        # Check if user owns asset's site
        site = SiteRepository.find_by_id(asset.site_id)
        if not site or site.user_id != request.current_user.id:
            return error_response("Access denied", 403)
        
        # Delete asset
        success, error = AssetService.delete_asset(asset_id, request.current_user.id, 'static')
        
        if success:
            return success_response(
                message="Asset deleted successfully"
            )
        else:
            return error_response(error or "Failed to delete asset", 400)
            
    except Exception as e:
        current_app.logger.error(f"Delete asset error: {e}")
        return error_response("Failed to delete asset", 500)


@assets_api_bp.route('/assets/<int:asset_id>/download', methods=['GET'])
@jwt_required
def download_asset(asset_id):
    """Download an asset file."""
    try:
        asset = AssetRepository.find_by_id(asset_id)
        
        if not asset:
            return error_response("Asset not found", 404)
        
        # Check if user owns asset's site
        site = SiteRepository.find_by_id(asset.site_id)
        if not site or site.user_id != request.current_user.id:
            return error_response("Access denied", 403)
        
        # Get file path
        file_path = asset.get_file_path()
        
        if not os.path.exists(file_path):
            return error_response("Asset file not found", 404)
        
        # Send file
        return send_file(
            file_path,
            as_attachment=True,
            download_name=asset.original_name,
            mimetype=asset.file_type
        )
        
    except Exception as e:
        current_app.logger.error(f"Download asset error: {e}")
        return error_response("Failed to download asset", 500)


# ================================
# SITE-SPECIFIC ASSET ENDPOINTS
# ================================

@assets_api_bp.route('/sites/<int:site_id>/assets', methods=['GET'])
@jwt_required
def get_site_assets(site_id):
    """Get all assets for a specific site."""
    try:
        site = SiteRepository.find_by_id(site_id)
        
        if not site:
            return error_response("Site not found", 404)
        
        # Check if user owns site
        if site.user_id != request.current_user.id:
            return error_response("Access denied", 403)
        
        # Get pagination parameters
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        file_type = request.args.get('file_type', '')
        
        # Get assets for this site
        assets = AssetRepository.find_by_site(site_id)
        
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
                'site_id': asset.site_id,
                'created_at': asset.created_at.isoformat() if asset.created_at else None
            }
            assets_data.append(asset_data)
        
        # Sort by created_at desc
        assets_data.sort(key=lambda x: x['created_at'] or '', reverse=True)
        
        # Apply pagination
        total = len(assets_data)
        start = (page - 1) * per_page
        end = start + per_page
        paginated_assets = assets_data[start:end]
        
        return paginated_response(
            data=paginated_assets,
            page=page,
            per_page=per_page,
            total=total,
            message="Site assets retrieved successfully"
        )
        
    except Exception as e:
        current_app.logger.error(f"Get site assets error: {e}")
        return error_response("Failed to retrieve site assets", 500)