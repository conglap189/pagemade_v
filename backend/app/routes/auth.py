"""Authentication blueprint - Login, register, profile management, OAuth."""
from flask import Blueprint, render_template, request, redirect, url_for, session, flash, jsonify, current_app
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.utils import secure_filename
import os
import uuid
import re
import secrets
from PIL import Image
import mimetypes
from app.utils.url_helpers import url_for_external

from app.models import db, User
from app.services import AuthService
from app.utils import Validators, Helpers

# Create blueprint - no prefix to match old structure (auth routes like /login, /register, etc.)
auth_bp = Blueprint('auth', __name__)

# OAuth will be initialized in app/__init__.py
google = None  # Will be set by app factory


def init_oauth(oauth_instance):
    """Initialize OAuth instance for this blueprint."""
    global google
    google = oauth_instance.google


# ================================
# WEB ROUTES - Login/Register/Profile
# ================================

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    """Login page - email/password and Google OAuth."""
    if current_user.is_authenticated:
        return redirect(url_for_external('sites.dashboard'))
    
    if request.method == 'POST':
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')
        
        if not email or not password:
            flash('Vui lòng nhập email và mật khẩu!', 'error')
            return render_template('auth/login.html')
        
        # Authenticate using service
        success, user, error = AuthService.authenticate(email, password)
        
        if success and user:
            login_user(user, remember=True)
            flash(f'Chào mừng {user.name}!', 'success')
            
            next_page = request.args.get('next')
            return redirect(next_page) if next_page else redirect(url_for_external('sites.dashboard'))
        else:
            flash(error if error else 'Email hoặc mật khẩu không đúng!', 'error')
    
    return render_template('auth/login.html')


@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    """User registration with email/password."""
    if current_user.is_authenticated:
        return redirect(url_for_external('sites.dashboard'))
    
    if request.method == 'POST':
        name = request.form.get('name', '').strip()
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')
        confirm_password = request.form.get('confirm_password', '')
        
        # Validation
        if not all([name, email, password, confirm_password]):
            flash('Vui lòng điền đầy đủ thông tin!', 'error')
            return render_template('auth/register.html')
        
        # Validate email
        if not Validators.is_valid_email(email):
            flash('Email không hợp lệ!', 'error')
            return render_template('auth/register.html')
        
        # Validate password
        if password != confirm_password:
            flash('Mật khẩu xác nhận không khớp!', 'error')
            return render_template('auth/register.html')
        
        is_valid, error_msg = Validators.is_valid_password(password)
        if not is_valid:
            flash(error_msg if error_msg else 'Invalid password', 'error')
            return render_template('auth/register.html')
        
        # Register using service
        success, user, error = AuthService.register_user(
            username=email.split('@')[0],  # Use email prefix as username
            email=email,
            password=password,
            full_name=name
        )
        
        if success and user:
            login_user(user, remember=True)
            flash(f'Chào mừng {name}! Tài khoản đã được tạo thành công.', 'success')
            return redirect(url_for_external('sites.dashboard'))
        else:
            flash(error if error else 'Có lỗi xảy ra khi tạo tài khoản!', 'error')
    
    return render_template('auth/register.html')


@auth_bp.route('/google')
def google_login():
    """Initiate Google OAuth login."""
    if current_user.is_authenticated:
        return redirect(url_for_external('sites.dashboard'))
    
    if not google:
        flash('Google OAuth chưa được cấu hình!', 'error')
        return redirect(url_for('auth.login'))
    
    redirect_uri = url_for('auth.google_callback', _external=True)
    return google.authorize_redirect(redirect_uri)


@auth_bp.route('/google/callback')
def google_callback():
    """Handle Google OAuth callback."""
    if not google:
        flash('Google OAuth chưa được cấu hình!', 'error')
        return redirect(url_for('auth.login'))
    
    try:
        token = google.authorize_access_token()
        user_info = token.get('userinfo')
        
        if not user_info or not user_info.get('email'):
            flash('Không thể lấy thông tin từ Google!', 'error')
            return redirect(url_for('auth.login'))
        
        email = user_info['email'].lower()
        name = user_info.get('name', email.split('@')[0])
        avatar_url = user_info.get('picture')
        google_id = user_info.get('sub')
        
        # Check if user exists
        user = AuthService.get_user_by_email(email)
        
        if user:
            # Update existing user with Google info
            if not user.google_id:
                user.google_id = google_id
            if not user.avatar and avatar_url:
                user.avatar = avatar_url
            user.last_login = db.func.now()
            db.session.commit()
        else:
            # Create new user
            user = User()
            user.name = name
            user.email = email
            user.avatar_url = avatar_url
            user.google_id = google_id
            db.session.add(user)
            db.session.commit()
        
        login_user(user, remember=True)
        flash(f'Chào mừng {user.name}!', 'success')
        return redirect(url_for_external('sites.dashboard'))
        
    except Exception as e:
        current_app.logger.error(f"Google OAuth error: {e}")
        flash('Đăng nhập Google thất bại!', 'error')
        return redirect(url_for('auth.login'))


@auth_bp.route('/logout')
@login_required
def logout():
    """User logout."""
    user_name = current_user.name
    
    # Revoke JWT token if exists
    token = request.cookies.get('auth_token')
    if token:
        from app.services.jwt_service import JWTService
        JWTService.revoke_token(token)
    
    # Logout from Flask-Login session
    logout_user()
    
    # Determine redirect URL based on environment
    is_production = 'pagemade.site' in request.host
    redirect_url = 'https://pagemade.site' if is_production else url_for('pages.index')
    
    # Create response with redirect
    response = redirect(redirect_url)
    
    # Clear JWT cookie (must match domain used when setting)
    cookie_domain = '.pagemade.site' if is_production else None
    response.delete_cookie('auth_token', domain=cookie_domain, path='/')
    
    # Clear Flask session cookies
    response.delete_cookie('session', path='/')
    response.delete_cookie('remember_token', path='/')
    
    flash(f'Tạm biệt {user_name}!', 'info')
    return response


@auth_bp.route('/profile', methods=['GET', 'POST'])
@login_required
def profile():
    """User profile management."""
    if request.method == 'POST':
        is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
        
        name = request.form.get('name', '').strip()
        
        if not name:
            message = 'Tên không được để trống!'
            if is_ajax:
                return jsonify({'success': False, 'message': message})
            flash(message, 'error')
            return render_template('auth/profile.html')
        
        # Handle avatar upload
        avatar_url = None
        if 'avatar' in request.files and request.files['avatar'].filename:
            file = request.files['avatar']
            
            # Validate file
            if not Validators.is_safe_filename(file.filename):
                message = 'Tên file không hợp lệ!'
                if is_ajax:
                    return jsonify({'success': False, 'message': message})
                flash(message, 'error')
                return render_template('auth/profile.html')
            
            # Check extension
            if not file.filename or not file.filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.webp')):
                message = 'Chỉ chấp nhận file ảnh (PNG, JPG, JPEG, GIF, WEBP)!'
                if is_ajax:
                    return jsonify({'success': False, 'message': message})
                flash(message, 'error')
                return render_template('auth/profile.html')
            
            # Check file size (max 5MB)
            file.seek(0, os.SEEK_END)
            size = file.tell()
            file.seek(0)
            
            if size > 5 * 1024 * 1024:
                message = 'Kích thước file không được vượt quá 5MB!'
                if is_ajax:
                    return jsonify({'success': False, 'message': message})
                flash(message, 'error')
                return render_template('auth/profile.html')
            
            try:
                # Save avatar
                static_folder = current_app.static_folder or ''
                upload_dir = os.path.join(static_folder, 'uploads', 'avatars')
                os.makedirs(upload_dir, exist_ok=True)
                
                filename = secure_filename(file.filename or '')
                unique_filename = f"{uuid.uuid4().hex}_{filename}"
                file_path = os.path.join(upload_dir, unique_filename)
                
                file.save(file_path)
                avatar_url = f'/static/uploads/avatars/{unique_filename}'
                
            except Exception as e:
                current_app.logger.error(f"Avatar upload error: {e}")
                message = 'Có lỗi xảy ra khi tải lên ảnh!'
                if is_ajax:
                    return jsonify({'success': False, 'message': message})
                flash(message, 'error')
                return render_template('auth/profile.html')
        
        # Update profile using service
        update_data = {'name': name}
        if avatar_url:
            update_data['avatar_url'] = avatar_url
        
        success, user, error = AuthService.update_profile(current_user.id, **update_data)
        
        if success:
            message = 'Cập nhật thông tin thành công!'
            if is_ajax:
                return jsonify({
                    'success': True,
                    'message': message,
                    'avatar_url': user.avatar_url if user else None
                })
            flash(message, 'success')
        else:
            if is_ajax:
                return jsonify({'success': False, 'message': error if error else 'Có lỗi xảy ra!'})
            flash(error if error else 'Có lỗi xảy ra!', 'error')
    
    return render_template('auth/profile.html')


@auth_bp.route('/change-password', methods=['GET', 'POST'])
@login_required
def change_password():
    """Change user password (only for email/password accounts)."""
    if not current_user.password_hash:
        flash('Tài khoản Google không thể đổi mật khẩu!', 'error')
        return redirect(url_for('auth.profile'))
    
    if request.method == 'POST':
        current_password = request.form.get('current_password', '')
        new_password = request.form.get('new_password', '')
        confirm_password = request.form.get('confirm_password', '')
        
        # Validation
        if not all([current_password, new_password, confirm_password]):
            flash('Vui lòng điền đầy đủ thông tin!', 'error')
            return render_template('auth/change_password.html')
        
        if new_password != confirm_password:
            flash('Mật khẩu mới không khớp!', 'error')
            return render_template('auth/change_password.html')
        
        is_valid, error_msg = Validators.is_valid_password(new_password)
        if not is_valid:
            flash(error_msg if error_msg else 'Invalid password', 'error')
            return render_template('auth/change_password.html')
        
        # Change password using service
        success, error = AuthService.change_password(
            current_user.id,
            current_password,
            new_password
        )
        
        if success:
            flash('Đổi mật khẩu thành công!', 'success')
            return redirect(url_for('auth.profile'))
        else:
            flash(error if error else 'Có lỗi xảy ra!', 'error')
    
    return render_template('auth/change_password.html')


# ================================
# JWT API ROUTES - For decoupled frontend
# ================================

@auth_bp.route('/api/auth/login', methods=['POST'])
def api_jwt_login():
    """JWT API endpoint for login - returns access and refresh tokens."""
    try:
        data = Helpers.get_request_json()
        
        if not data:
            return Helpers.error_response('No data provided', 400)
        
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        if not email or not password:
            return Helpers.error_response('Email và password là bắt buộc', 400)
        
        # Authenticate user
        success, user, error = AuthService.authenticate(email, password)
        
        if success and user:
            # Generate JWT tokens
            from app.services.jwt_service import JWTService
            tokens = JWTService.generate_tokens(user)
            
            # Create response data
            response_data = {
                'user': {
                    'id': user.id,
                    'name': user.name,
                    'email': user.email,
                    'avatar_url': user.avatar_url,
                    'role': user.role
                }
            }
            
            # Set HttpOnly cookie with access token for shared cookie approach
            from datetime import datetime, timedelta, timezone
            cookie_expires = datetime.now(timezone.utc) + timedelta(hours=24)  # 24 hours
            
            # Create response with cookie that can be shared across subdomains
            # Detect if we're on production
            is_production = 'pagemade.site' in request.host
            cookie_domain = '.pagemade.site' if is_production else 'localhost'
            is_secure = request.is_secure or request.headers.get('X-Forwarded-Proto') == 'https'
            
            return Helpers.success_response_with_cookie(
                data=response_data,
                message='Đăng nhập thành công',
                cookie_name='auth_token',
                cookie_value=tokens['access_token'],
                cookie_expires=cookie_expires,
                secure=is_secure,  # Use HTTPS in production
                httponly=True,
                samesite='Lax',
                domain=cookie_domain,  # Share cookie across subdomains
                path='/'
            )
        else:
            return Helpers.error_response(error or 'Email hoặc password không đúng', 401)
        
    except Exception as e:
        current_app.logger.error(f"JWT Login error: {e}")
        return Helpers.error_response('Lỗi server, vui lòng thử lại', 500)


@auth_bp.route('/api/auth/refresh', methods=['POST'])
def api_jwt_refresh():
    """Refresh access token using refresh token."""
    try:
        data = Helpers.get_request_json()
        
        if not data or not data.get('refresh_token'):
            return Helpers.error_response('Refresh token là bắt buộc', 400)
        
        refresh_token = data.get('refresh_token')
        
        # Generate new access token
        from app.services.jwt_service import JWTService
        result = JWTService.refresh_access_token(refresh_token)
        
        if result:
            return Helpers.success_response(
                data=result,
                message='Access token đã được làm mới'
            )
        else:
            return Helpers.error_response('Refresh token không hợp lệ hoặc đã hết hạn', 401)
        
    except Exception as e:
        current_app.logger.error(f"JWT Refresh error: {e}")
        return Helpers.error_response('Lỗi server, vui lòng thử lại', 500)


@auth_bp.route('/api/auth/logout', methods=['POST'])
def api_jwt_logout():
    """Logout user - revoke tokens and clear cookie."""
    try:
        # Get token from cookie for revocation
        token = request.cookies.get('auth_token')
        if token:
            from app.services.jwt_service import JWTService
            JWTService.revoke_token(token)
        
        # Also try to revoke tokens from request body (backward compatibility)
        data = Helpers.get_request_json()
        if data:
            if data.get('access_token'):
                from app.services.jwt_service import JWTService
                JWTService.revoke_token(data.get('access_token'))
            
            if data.get('refresh_token'):
                from app.services.jwt_service import JWTService
                JWTService.revoke_token(data.get('refresh_token'))
        
        # Clear the cookie with same path as login
        from datetime import datetime, timedelta, timezone
        response = Helpers.success_response(message='Đăng xuất thành công')
        response[0].set_cookie(
            key='auth_token',
            value='',
            expires=datetime.now(timezone.utc) - timedelta(days=1),  # Expire immediately
            secure=False,
            httponly=True,
            samesite='Lax',
            domain='localhost',
            path='/'  # Important: Match the path used in login
        )
        
        return response
        
    except Exception as e:
        current_app.logger.error(f"JWT Logout error: {e}")
        return Helpers.error_response('Lỗi server, vui lòng thử lại', 500)


@auth_bp.route('/api/auth/signup', methods=['POST'])
def api_jwt_signup():
    """JWT API endpoint for signup - returns access and refresh tokens."""
    try:
        data = Helpers.get_request_json()
        
        if not data:
            return Helpers.error_response('No data provided', 400)
        
        name = data.get('name', '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        if not all([name, email, password]):
            return Helpers.error_response('Name, email và password là bắt buộc', 400)
        
        # Validate email
        if not Validators.is_valid_email(email):
            return Helpers.error_response('Email không hợp lệ', 400)
        
        # Validate password
        is_valid, error_msg = Validators.is_valid_password(password)
        if not is_valid:
            return Helpers.error_response(error_msg or 'Invalid password', 400)
        
        # Register user
        success, user, error = AuthService.register_user(
            username=email.split('@')[0],  # Use email prefix as username
            email=email,
            password=password,
            full_name=name
        )
        
        if success and user:
            # Generate JWT tokens
            from app.services.jwt_service import JWTService
            tokens = JWTService.generate_tokens(user)
            
            # Create response data
            response_data = {
                'user': {
                    'id': user.id,
                    'name': user.name,
                    'email': user.email,
                    'avatar_url': user.avatar_url,
                    'role': user.role
                }
            }
            
            # Set HttpOnly cookie with access token
            from datetime import datetime, timedelta, timezone
            cookie_expires = datetime.now(timezone.utc) + timedelta(hours=24)  # 24 hours
            
            return Helpers.success_response_with_cookie(
                data=response_data,
                message='Đăng ký thành công',
                cookie_name='auth_token',
                cookie_value=tokens['access_token'],
                cookie_expires=cookie_expires,
                secure=False,  # localhost
                httponly=True,
                samesite='Lax',  # Changed from 'None' to 'Lax' for localhost
                domain='localhost',
                path='/'  # Important: Set path to root for cross-port sharing
            )
        else:
            return Helpers.error_response(error or 'Có lỗi xảy ra khi tạo tài khoản', 400)
        
    except Exception as e:
        current_app.logger.error(f"JWT Signup error: {e}")
        return Helpers.error_response('Lỗi server, vui lòng thử lại', 500)


@auth_bp.route('/api/auth/me', methods=['GET'])
def api_jwt_me():
    """Get current user info from JWT token (shared cookie approach)."""
    try:
        from app.services.jwt_service import JWTService
        
        # Try to get token from Authorization header first (backward compatibility)
        auth_header = request.headers.get('Authorization')
        token = None
        
        if auth_header:
            try:
                token = auth_header.split(' ')[1]
            except IndexError:
                pass
        
        # If no token in header, try to get from cookie (shared cookie approach)
        if not token:
            token = request.cookies.get('auth_token')
        
        if not token:
            return Helpers.error_response('No authentication token found', 401)
        
        # Get user from token
        user = JWTService.get_user_from_token(token)
        if not user:
            return Helpers.error_response('Invalid or expired token', 401)
        
        return Helpers.success_response(
            data={
                'user': {
                    'id': user.id,
                    'name': user.name,
                    'email': user.email,
                    'avatar_url': user.avatar_url,
                    'role': user.role
                }
            }
        )
        
    except Exception as e:
        current_app.logger.error(f"JWT Me error: {e}")
        return Helpers.error_response('Lỗi server, vui lòng thử lại', 500)


# ================================
# LEGACY API ROUTES - JSON responses for Next.js/AJAX
# ================================

@auth_bp.route('/api/login', methods=['POST'])
def api_login():
    """JSON API endpoint for login."""
    try:
        data = Helpers.get_request_json()
        
        if not data:
            return Helpers.error_response('No data provided', 400)
        
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        if not email or not password:
            return Helpers.error_response('Email và password là bắt buộc', 400)
        
        # Authenticate
        success, user, error = AuthService.authenticate(email, password)
        
        if success and user:
            login_user(user, remember=True)
            
            return Helpers.success_response(
                data={
                    'user': {
                        'id': user.id,
                        'name': user.name,
                        'email': user.email,
                        'avatar_url': user.avatar_url
                    },
                    'redirect': '/dashboard'
                },
                message='Đăng nhập thành công'
            )
        else:
            return Helpers.error_response(error or 'Email hoặc password không đúng', 401)
        
    except Exception as e:
        current_app.logger.error(f"API Login error: {e}")
        return Helpers.error_response('Lỗi server, vui lòng thử lại', 500)


@auth_bp.route('/api/signup', methods=['POST'])
def api_signup():
    """JSON API endpoint for signup."""
    try:
        data = Helpers.get_request_json()
        
        if not data:
            return Helpers.error_response('No data provided', 400)
        
        name = data.get('name', '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        # Validation
        if not all([name, email, password]):
            return Helpers.error_response('Vui lòng điền đầy đủ thông tin', 400)
        
        if not Validators.is_valid_email(email):
            return Helpers.error_response('Email không hợp lệ', 400)
        
        is_valid, error_msg = Validators.is_valid_password(password)
        if not is_valid:
            return Helpers.error_response(error_msg, 400)
        
        # Register user
        success, user, error = AuthService.register_user(
            name=name,
            email=email,
            password=password
        )
        
        if success and user:
            login_user(user, remember=True)
            
            return Helpers.success_response(
                data={
                    'user': {
                        'id': user.id,
                        'name': user.name,
                        'email': user.email,
                        'avatar_url': user.avatar_url
                    },
                    'redirect': '/dashboard'
                },
                message='Tài khoản đã được tạo thành công',
                status=201
            )
        else:
            return Helpers.error_response(error or 'Có lỗi xảy ra', 400)
        
    except Exception as e:
        current_app.logger.error(f"API Signup error: {e}")
        return Helpers.error_response('Có lỗi xảy ra, vui lòng thử lại', 500)


@auth_bp.route('/api/me', methods=['GET'])
@login_required
def api_me():
    """Get current logged in user info."""
    return Helpers.success_response(
        data={
            'user': {
                'id': current_user.id,
                'name': current_user.name,
                'email': current_user.email,
                'avatar_url': current_user.avatar_url,
                'role': current_user.role
            }
        }
    )


@auth_bp.route('/api/auth/verify', methods=['GET'])
def api_jwt_verify():
    """Verify JWT token and return user info."""
    try:
        from app.services.jwt_service import JWTService
        from app.middleware.jwt_bypass import jwt_api_auth
        
        # Get token from Authorization header
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return Helpers.error_response('Missing authorization header', 401)
        
        try:
            token = auth_header.split(' ')[1]
        except IndexError:
            return Helpers.error_response('Invalid authorization header format', 401)
        
        # Verify token first
        payload = JWTService.verify_token(token, 'access')
        if not payload:
            return Helpers.error_response('Invalid or expired token', 401)
        
        # Get user from token
        user = JWTService.get_user_from_token(token)
        if not user:
            return Helpers.error_response('Invalid or expired token', 401)
        
        return Helpers.success_response(
            data={
                'user': {
                    'id': user.id,
                    'name': user.name,
                    'email': user.email,
                    'avatar_url': user.avatar_url,
                    'role': user.role
                },
                'authenticated': True
            },
            message='Token verified successfully'
        )
        
    except Exception as e:
        current_app.logger.error(f"JWT Verify error: {e}")
        return Helpers.error_response('Token verification failed', 500)


@auth_bp.route('/api/upload-avatar', methods=['POST'])
@login_required
def api_upload_avatar():
    """API endpoint for avatar upload."""
    try:
        if 'avatar' not in request.files:
            return Helpers.error_response('No file provided', 400)
        
        file = request.files['avatar']
        
        if file.filename == '':
            return Helpers.error_response('No file selected', 400)
        
        # Validate file
        if not Validators.is_safe_filename(file.filename):
            return Helpers.error_response('Invalid filename', 400)
        
        # Check extension
        if not file.filename or not file.filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.webp')):
            return Helpers.error_response('Only image files allowed', 400)
        
        # Check file size (max 5MB)
        file.seek(0, os.SEEK_END)
        size = file.tell()
        file.seek(0)
        
        if size > 5 * 1024 * 1024:
            return Helpers.error_response('File too large (max 5MB)', 400)
        
        # Save avatar
        static_folder = getattr(current_app, 'static_folder', '') or ''
        upload_dir = os.path.join(static_folder, 'uploads', 'avatars')
        os.makedirs(upload_dir, exist_ok=True)
        
        filename = secure_filename(file.filename or '')
        unique_filename = f"{uuid.uuid4().hex}_{filename}"
        file_path = os.path.join(upload_dir, unique_filename)
        
        file.save(file_path)
        avatar_url = f'/static/uploads/avatars/{unique_filename}'
        
        # Update user avatar
        current_user.avatar_url = avatar_url
        db.session.commit()
        
        return Helpers.success_response(
            data={'avatar_url': avatar_url},
            message='Avatar uploaded successfully'
        )
        
    except Exception as e:
        current_app.logger.error(f"Avatar upload error: {e}")
        return Helpers.error_response('Upload failed', 500)


@auth_bp.route('/remove-avatar', methods=['POST'])
@login_required
def remove_avatar():
    """Remove user avatar."""
    is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
    
    try:
        # Remove avatar URL from user
        current_user.avatar_url = None
        db.session.commit()
        
        message = 'Avatar đã được xóa thành công!'
        if is_ajax:
            return jsonify({'success': True, 'message': message})
        flash(message, 'success')
        return redirect(url_for('auth.profile'))
        
    except Exception as e:
        current_app.logger.error(f"Avatar removal error: {e}")
        message = 'Có lỗi xảy ra khi xóa avatar!'
        if is_ajax:
            return jsonify({'success': False, 'message': message})
        flash(message, 'error')
        return redirect(url_for('auth.profile'))


@auth_bp.route('/admin/users')
@login_required
def admin_users():
    """Admin user management page."""
    if not current_user.is_admin():
        flash('Bạn không có quyền truy cập trang này!', 'error')
        return redirect(url_for_external('sites.dashboard'))
    
    users = User.query.order_by(User.created_at.desc()).all()
    return render_template('admin/users.html', users=users)


@auth_bp.route('/admin/make-admin/<int:user_id>', methods=['POST'])
@login_required
def make_admin(user_id):
    """Make a user admin."""
    if not current_user.is_admin():
        return jsonify({'success': False, 'message': 'Unauthorized'}), 403
    
    try:
        user = User.query.get_or_404(user_id)
        user.make_admin()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'{user.name} đã được làm admin!'
        })
        
    except Exception as e:
        current_app.logger.error(f"Make admin error: {e}")
        return jsonify({'success': False, 'message': 'Có lỗi xảy ra!'}), 500


# ================================
# DEVELOPMENT/TESTING ROUTES
# ================================

@auth_bp.route('/create-test-account')
def create_test_account():
    """Create/login test admin account for development."""
    test_user = AuthService.get_user_by_email('admin@pagemade.site')
    
    if test_user:
        login_user(test_user)
        flash('Đã đăng nhập với tài khoản Admin!', 'success')
        return redirect(url_for_external('sites.dashboard'))
    
    flash('Không tìm thấy tài khoản admin!', 'error')
    return redirect(url_for('auth.login'))


@auth_bp.route('/debug/config', methods=['GET'])
def debug_config():
    """Debug endpoint to check running config."""
    try:
        from flask import current_app
        from app.models import db, User
        
        # Get config info
        config_info = {
            'database_uri': current_app.config.get('SQLALCHEMY_DATABASE_URI'),
            'environment': current_app.config.get('ENV', 'unknown'),
            'debug': current_app.config.get('DEBUG', False),
            'flask_env': current_app.config.get('FLASK_ENV', 'not set')
        }
        
        # Test database connection
        try:
            with db.engine.connect() as conn:
                result = conn.execute(db.text("SELECT COUNT(*) FROM user"))
                row = result.fetchone()
                user_count = row[0] if row else 0
            config_info['db_connection'] = 'OK'
            config_info['user_count'] = user_count
        except Exception as e:
            config_info['db_connection'] = f'ERROR: {str(e)}'
            config_info['user_count'] = 'N/A'
        
        # Test specific user
        try:
            user = User.query.filter_by(email="test@admintest.com").first()
            if user:
                config_info['test_user_found'] = True
                config_info['test_user_id'] = user.id
                config_info['test_user_email'] = user.email
            else:
                config_info['test_user_found'] = False
                config_info['test_user_id'] = None
                config_info['test_user_email'] = None
        except Exception as e:
            config_info['test_user_found'] = f'ERROR: {str(e)}'
            config_info['test_user_id'] = None
            config_info['test_user_email'] = None
        
        return jsonify(config_info)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500



