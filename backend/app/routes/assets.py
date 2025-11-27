"""Assets blueprint - File upload and asset management."""
from flask import Blueprint, request, jsonify, current_app, send_file, abort, send_from_directory
from flask_login import login_required, current_user
from werkzeug.utils import secure_filename
import os
import re
import requests
import html
from urllib.parse import urljoin
import secrets
from PIL import Image
import mimetypes
import stat

from app.models import db, Asset
from app.services import AssetService
from app.repositories import AssetRepository, SiteRepository
from app.utils import FileHandler, Helpers

# Create blueprint
assets_bp = Blueprint('assets', __name__, url_prefix='/api/assets')


# ================================
# ASSET UPLOAD & MANAGEMENT
# ================================

@assets_bp.route('/upload', methods=['POST'])
@login_required
def upload_asset():
    """Upload asset file."""
    # Get site_id
    site_id = request.form.get('site_id')
    
    if not site_id:
        return Helpers.error_response('site_id là bắt buộc', 400)
    
    try:
        site_id = int(site_id)
    except ValueError:
        return Helpers.error_response('site_id không hợp lệ', 400)
    
    # Verify site ownership
    site = SiteRepository.find_by_id(site_id)
    if not site or site.user_id != current_user.id:
        return Helpers.error_response('Unauthorized', 403)
    
    # Check if file exists in request
    if 'file' not in request.files:
        return Helpers.error_response('Không có file được tải lên', 400)
    
    file = request.files['file']
    
    if not file or file.filename == '':
        return Helpers.error_response('Không có file được chọn', 400)
    
    # Upload using service
    static_folder = current_app.static_folder
    success, asset_dict, error = AssetService.upload_asset(
        file=file,
        user_id=current_user.id,
        site_id=site_id,
        static_folder=static_folder
    )
    
    if success:
        return Helpers.success_response(
            data={'asset': asset_dict},
            message='Upload thành công!',
            status=201
        )
    else:
        return Helpers.error_response(error, 400)


@assets_bp.route('/<int:site_id>', methods=['GET'])
@login_required
def list_assets(site_id):
    """Get all assets for a site."""
    # Verify site ownership
    site = SiteRepository.find_by_id(site_id)
    if not site or site.user_id != current_user.id:
        return Helpers.error_response('Unauthorized', 403)
    
    # Get assets using repository (with double filtering)
    assets = AssetRepository.find_by_site_and_user(site_id, current_user.id)
    
    return Helpers.success_response(
        data={
            'assets': [asset.to_dict() for asset in assets]
        }
    )


@assets_bp.route('/<int:asset_id>', methods=['DELETE'])
@login_required
def delete_asset(asset_id):
    """Delete an asset."""
    asset = AssetRepository.find_by_id(asset_id)
    
    if not asset:
        return Helpers.error_response('Asset không tồn tại!', 404)
    
    # Verify ownership
    if asset.user_id != current_user.id:
        return Helpers.error_response('Unauthorized', 403)
    
    # Delete using service
    static_folder = current_app.static_folder
    success, error = AssetService.delete_asset(
        asset_id=asset_id,
        user_id=current_user.id,
        static_folder=static_folder
    )
    
    if success:
        return Helpers.success_response(message='Xóa asset thành công!')
    else:
        return Helpers.error_response(error, 500)


@assets_bp.route('/<int:asset_id>/info', methods=['GET'])
@login_required
def get_asset_info(asset_id):
    """Get asset details."""
    asset = AssetRepository.find_by_id(asset_id)
    
    if not asset:
        return Helpers.error_response('Asset không tồn tại!', 404)
    
    # Verify ownership
    if asset.user_id != current_user.id:
        return Helpers.error_response('Unauthorized', 403)
    
    return Helpers.success_response(
        data={'asset': asset.to_dict()}
    )


@assets_bp.route('/site/<int:site_id>/storage', methods=['GET'])
@login_required
def get_site_storage(site_id):
    """Get total storage used by a site."""
    # Verify site ownership
    site = SiteRepository.find_by_id(site_id)
    if not site or site.user_id != current_user.id:
        return Helpers.error_response('Unauthorized', 403)
    
    # Calculate storage
    total_size = AssetRepository.get_total_size_by_site(site_id)
    total_size_formatted = FileHandler.get_file_size_formatted(total_size)
    
    return Helpers.success_response(
        data={
            'total_size_bytes': total_size,
            'total_size_formatted': total_size_formatted,
            'asset_count': AssetRepository.count_by_site(site_id)
        }
    )


# ================================
# FILE SERVING ROUTES
# ================================

@assets_bp.route('/uploads/<int:site_id>/<filename>')
def serve_uploaded_file(site_id, filename):
    """Serve uploaded files."""
    try:
        static_folder = getattr(current_app, 'static_folder', '') or ''
        upload_dir = os.path.join(static_folder, 'uploads', str(site_id))
        return send_from_directory(upload_dir, filename)
    except FileNotFoundError:
        abort(404)


# ================================
# UTILITY ROUTES
# ================================

@assets_bp.route('/cleanup-orphaned', methods=['POST'])
@login_required
def cleanup_orphaned():
    """Find and list orphaned files (admin only)."""
    if not current_user.is_admin():
        return Helpers.error_response('Admin access required', 403)
    
    static_folder = current_app.static_folder
    orphaned_files = AssetService.cleanup_orphaned_files(static_folder)
    
    return Helpers.success_response(
        data={
            'orphaned_files': orphaned_files,
            'count': len(orphaned_files)
        },
        message=f'Found {len(orphaned_files)} orphaned files'
    )
