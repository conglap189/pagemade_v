from app.utils.url_helpers import url_for_external
"""Admin blueprint - User management and admin panel."""
from flask import Blueprint, render_template, redirect, url_for, flash, jsonify, current_app
from flask_login import login_required, current_user
from functools import wraps
import re
import requests
import html
from urllib.parse import urljoin
import secrets
from PIL import Image
import mimetypes
import stat

from app.models import db, User
from app.repositories import UserRepository, SiteRepository, AssetRepository
from app.utils import Helpers

# Create blueprint
admin_bp = Blueprint('admin', __name__, url_prefix='/admin')


def admin_required(f):
    """Decorator to require admin role."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated:
            flash('Vui lòng đăng nhập!', 'error')
            return redirect(url_for('auth.login'))
        
        if not current_user.is_admin():
            flash('Bạn không có quyền truy cập!', 'error')
            return redirect(url_for_external('sites.dashboard'))
        
        return f(*args, **kwargs)
    return decorated_function


# ================================
# ADMIN PANEL ROUTES
# ================================

@admin_bp.route('/')
@admin_required
def index():
    """Admin dashboard."""
    # Get statistics
    total_users = UserRepository.count()
    total_sites = SiteRepository.count()
    published_sites = SiteRepository.count_published()
    total_assets = AssetRepository.count()
    
    # Get recent data
    recent_users = UserRepository.get_recent(limit=5)
    recent_sites = SiteRepository.get_recent(limit=5)
    
    return render_template('admin/index.html', 
                         total_users=total_users,
                         total_sites=total_sites,
                         published_sites=published_sites,
                         total_assets=total_assets,
                         recent_users=recent_users,
                         recent_sites=recent_sites)


@admin_bp.route('/users')
@admin_required
def users():
    """Manage all users."""
    users = UserRepository.get_all()
    return render_template('admin/users.html', users=users)


@admin_bp.route('/make-admin/<int:user_id>', methods=['POST'])
@admin_required
def make_admin(user_id):
    """Promote user to admin."""
    user = UserRepository.find_by_id(user_id)
    
    if not user:
        flash('Người dùng không tồn tại!', 'error')
        return redirect(url_for('admin.users'))
    
    try:
        user.role = 'admin'
        db.session.commit()
        
        flash(f'{user.full_name or user.username} đã được nâng cấp thành Admin!', 'success')
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Make admin error: {e}")
        flash('Có lỗi xảy ra!', 'error')
    
    return redirect(url_for('admin.users'))


@admin_bp.route('/remove-admin/<int:user_id>', methods=['POST'])
@admin_required
def remove_admin(user_id):
    """Demote admin to regular user."""
    # Prevent self-demotion
    if user_id == current_user.id:
        flash('Bạn không thể tự hạ cấp tài khoản của mình!', 'error')
        return redirect(url_for('admin.users'))
    
    user = UserRepository.find_by_id(user_id)
    
    if not user:
        flash('Người dùng không tồn tại!', 'error')
        return redirect(url_for('admin.users'))
    
    try:
        user.role = 'user'
        db.session.commit()
        
        flash(f'{user.full_name or user.username} đã được hạ xuống User thường!', 'info')
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Remove admin error: {e}")
        flash('Có lỗi xảy ra!', 'error')
    
    return redirect(url_for('admin.users'))


@admin_bp.route('/delete-user/<int:user_id>', methods=['POST'])
@admin_required
def delete_user(user_id):
    """Delete a user account."""
    # Prevent self-deletion
    if user_id == current_user.id:
        flash('Bạn không thể xóa tài khoản của chính mình!', 'error')
        return redirect(url_for('admin.users'))
    
    user = UserRepository.find_by_id(user_id)
    
    if not user:
        flash('Người dùng không tồn tại!', 'error')
        return redirect(url_for('admin.users'))
    
    try:
        UserRepository.delete(user)
        flash(f'Đã xóa tài khoản {user.full_name or user.username}!', 'success')
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Delete user error: {e}")
        flash('Có lỗi xảy ra khi xóa tài khoản!', 'error')
    
    return redirect(url_for('admin.users'))


# ================================
# API ROUTES
# ================================

@admin_bp.route('/api/users', methods=['GET'])
@admin_required
def api_users():
    """Get all users as JSON."""
    users = UserRepository.get_all()
    
    return Helpers.success_response(
        data={
            'users': [user.to_dict() for user in users]
        }
    )


@admin_bp.route('/api/stats', methods=['GET'])
@admin_required
def api_stats():
    """Get admin statistics."""
    from app.repositories import SiteRepository, PageRepository, AssetRepository
    
    stats = {
        'total_users': UserRepository.count(),
        'total_sites': SiteRepository.count(),
        'total_pages': PageRepository.count(),
        'total_assets': AssetRepository.count()
    }
    
    return Helpers.success_response(data=stats)


@admin_bp.route('/cache/stats')
@admin_required
def cache_stats():
    """Cache statistics dashboard (admin only)."""
    from cache import cache
    stats = cache.get_cache_stats()
    
    return render_template('admin/cache_stats.html', stats=stats)


@admin_bp.route('/cache/clear', methods=['POST'])
@admin_required
def clear_cache():
    """Clear all cache (admin only)."""
    from cache import cache
    success = cache.clear_all_cache()
    
    if success:
        flash('Cache cleared successfully!', 'success')
        return Helpers.success_response(message='Cache cleared successfully!')
    else:
        return Helpers.error_response('Failed to clear cache', 500)

