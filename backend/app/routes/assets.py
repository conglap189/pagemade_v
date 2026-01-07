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
    print('='*80)
    print('🔼 [BACKEND] /api/assets/upload endpoint called')
    print(f'🔼 [BACKEND] User: {current_user.id} ({current_user.email})')
    print(f'🔼 [BACKEND] Request method: {request.method}')
    print(f'🔼 [BACKEND] Request headers: {dict(request.headers)}')
    print(f'🔼 [BACKEND] Request form data: {dict(request.form)}')
    print(f'🔼 [BACKEND] Request files: {list(request.files.keys())}')
    
    # Get site_id
    site_id = request.form.get('site_id')
    print(f'🔼 [BACKEND] Site ID from form: {site_id}')
    
    if not site_id:
        print('❌ [BACKEND] Error: site_id is required')
        return Helpers.error_response('site_id là bắt buộc', 400)
    
    try:
        site_id = int(site_id)
        print(f'🔼 [BACKEND] Site ID (int): {site_id}')
    except ValueError:
        print('❌ [BACKEND] Error: site_id invalid format')
        return Helpers.error_response('site_id không hợp lệ', 400)
    
    # Verify site ownership
    site = SiteRepository.find_by_id(site_id)
    print(f'🔼 [BACKEND] Site found: {site.title if site else "None"}')
    print(f'🔼 [BACKEND] Site owner: {site.user_id if site else "N/A"}')
    print(f'🔼 [BACKEND] Current user: {current_user.id}')
    
    if not site or site.user_id != current_user.id:
        print('❌ [BACKEND] Error: Unauthorized - user does not own this site')
        return Helpers.error_response('Unauthorized', 403)
    
    # Check if file exists in request
    if 'file' not in request.files:
        print('❌ [BACKEND] Error: No file in request')
        return Helpers.error_response('Không có file được tải lên', 400)
    
    file = request.files['file']
    print(f'🔼 [BACKEND] File object: {file}')
    print(f'🔼 [BACKEND] Filename: {file.filename}')
    print(f'🔼 [BACKEND] Content type: {file.content_type}')
    
    if not file or file.filename == '':
        print('❌ [BACKEND] Error: Empty filename')
        return Helpers.error_response('Không có file được chọn', 400)
    
    # Upload using service
    static_folder = current_app.static_folder
    print(f'🔼 [BACKEND] Static folder: {static_folder}')
    print(f'🔼 [BACKEND] Calling AssetService.upload_asset()...')
    
    # Get base URL from request
    base_url = request.host_url.rstrip('/')  # e.g. https://app.pagemade.site
    print(f'🔼 [BACKEND] Base URL: {base_url}')
    
    success, asset_dict, error = AssetService.upload_asset(
        file=file,
        user_id=current_user.id,
        site_id=site_id,
        static_folder=static_folder,
        base_url=base_url
    )
    
    print(f'🔼 [BACKEND] Upload result: success={success}')
    
    if success:
        print(f'✅ [BACKEND] Upload successful!')
        print(f'✅ [BACKEND] Asset: {asset_dict}')
        print('='*80)
        return Helpers.success_response(
            data={'asset': asset_dict},
            message='Upload thành công!',
            status=201
        )
    else:
        print(f'❌ [BACKEND] Upload failed: {error}')
        print('='*80)
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
    print('='*80)
    print(f'🗑️ [BACKEND DELETE] Endpoint called: /api/assets/{asset_id}')
    print(f'🗑️ [BACKEND DELETE] User: {current_user.id} ({current_user.email})')
    print(f'🗑️ [BACKEND DELETE] Method: {request.method}')
    
    asset = AssetRepository.find_by_id(asset_id)
    
    if not asset:
        print(f'❌ [BACKEND DELETE] Asset not found: {asset_id}')
        print('='*80)
        return Helpers.error_response('Asset không tồn tại!', 404)
    
    print(f'🗑️ [BACKEND DELETE] Asset found:')
    print(f'   - ID: {asset.id}')
    print(f'   - Filename: {asset.filename}')
    print(f'   - URL: {asset.url}')
    print(f'   - User ID: {asset.user_id}')
    print(f'   - Site ID: {asset.site_id}')
    
    # Verify ownership
    if asset.user_id != current_user.id:
        print(f'❌ [BACKEND DELETE] Unauthorized: asset.user_id={asset.user_id}, current_user.id={current_user.id}')
        print('='*80)
        return Helpers.error_response('Unauthorized', 403)
    
    print(f'🗑️ [BACKEND DELETE] Ownership verified. Calling AssetService.delete_asset()...')
    
    # Delete using service
    static_folder = current_app.static_folder
    print(f'🗑️ [BACKEND DELETE] Static folder: {static_folder}')
    
    success, error = AssetService.delete_asset(
        asset_id=asset_id,
        user_id=current_user.id,
        static_folder=static_folder
    )
    
    print(f'🗑️ [BACKEND DELETE] Service returned: success={success}, error={error}')
    
    if success:
        print(f'✅ [BACKEND DELETE] Asset deleted successfully!')
        print('='*80)
        return Helpers.success_response(message='Ảnh đã được xóa thành công!')
    else:
        print(f'❌ [BACKEND DELETE] Delete failed: {error}')
        print('='*80)
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
