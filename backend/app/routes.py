from flask import Blueprint, render_template, request, redirect, url_for, session, flash, jsonify, send_file, abort, render_template_string, current_app, Response
from flask_login import login_user, logout_user, login_required, current_user
from authlib.integrations.flask_client import OAuth
from . import db, oauth
from .models import User, Site, Page
import os
import json
import uuid
import re  # NEW: Import for subdomain regex matching
import requests  # NEW: For reverse proxy
from datetime import datetime, timedelta
import html  # NEW: For HTML cleaning
from urllib.parse import urljoin  # NEW: For URL handling
from werkzeug.utils import secure_filename  # NEW: For secure file uploads
import secrets  # NEW: For secure token generation

# Create blueprints
auth_bp = Blueprint('auth', __name__)
main_bp = Blueprint('main', __name__)
api_bp = Blueprint('api', __name__)

# NEW: Helper functions for HTML processing and storage
def clean_html_for_production(html_content):
    """Clean and optimize HTML for production"""
    try:
        # Basic cleaning - remove Silex editor artifacts
        cleaned = html_content
        
        # Remove Silex-specific attributes and classes
        silex_patterns = [
            r'data-silex-[^=]*="[^"]*"',
            r'contenteditable="[^"]*"',
            r'draggable="[^"]*"',
            r'class="[^"]*silex-[^"]*"',
            r'class="[^"]*ui-[^"]*"'
        ]
        
        for pattern in silex_patterns:
            cleaned = re.sub(pattern, '', cleaned, flags=re.IGNORECASE)
        
        # Clean up extra whitespace
        cleaned = re.sub(r'\s+', ' ', cleaned)
        cleaned = re.sub(r'>\s+<', '><', cleaned)
        
        # Ensure proper HTML structure
        if not cleaned.startswith('<!DOCTYPE'):
            cleaned = f'<!DOCTYPE html>\n{cleaned}'
            
        return cleaned
        
    except Exception as e:
        print(f"HTML cleaning error: {e}")
        return html_content  # Return original if cleaning fails

def save_html_to_storage(page, html_content):
    """Save HTML content to storage directory (backup)"""
    try:
        # Create storage directory structure
        storage_dir = os.path.join(current_app.root_path, '..', 'storage', 'sites', str(page.site_id))
        os.makedirs(storage_dir, exist_ok=True)
        
        # Save HTML file
        filename = f"{page.slug or 'page'}.html"
        file_path = os.path.join(storage_dir, filename)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(html_content)
            
        print(f"HTML saved to storage: {file_path}")
        return True
        
    except Exception as e:
        print(f"Storage save error: {e}")
        return False

def deploy_static_website(subdomain, html_content, css_content=''):
    """Deploy static HTML/CSS files to subdomain directory for Nginx serving"""
    try:
        print(f"🚀 Deploying static website for subdomain: {subdomain}")
        
        # 1. Create subdomain directory structure
        static_dir = os.path.join('/var/www/subdomains', subdomain)
        os.makedirs(static_dir, exist_ok=True)
        
        # 2. Write main index.html
        index_file = os.path.join(static_dir, 'index.html')
        with open(index_file, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        # 3. Write separate CSS file if provided
        if css_content and css_content.strip():
            css_file = os.path.join(static_dir, 'styles.css')
            with open(css_file, 'w', encoding='utf-8') as f:
                f.write(css_content)
        
        # 4. Set proper permissions for Nginx
        import stat
        os.chmod(static_dir, stat.S_IRWXU | stat.S_IRGRP | stat.S_IXGRP | stat.S_IROTH | stat.S_IXOTH)  # 755
        os.chmod(index_file, stat.S_IRUSR | stat.S_IWUSR | stat.S_IRGRP | stat.S_IROTH)  # 644
        
        if os.path.exists(os.path.join(static_dir, 'styles.css')):
            os.chmod(os.path.join(static_dir, 'styles.css'), stat.S_IRUSR | stat.S_IWUSR | stat.S_IRGRP | stat.S_IROTH)
        
        print(f"✅ Static files deployed successfully to: {static_dir}")
        
        return {
            'success': True,
            'info': {
                'static_dir': static_dir,
                'files_created': ['index.html'] + (['styles.css'] if css_content else []),
                'url': f"https://{subdomain}.pagemade.site"
            }
        }
        
    except Exception as e:
        print(f"❌ Static deployment error: {e}")
        return {
            'success': False,
            'error': str(e)
        }

# NEW: Helper functions for subdomain handling
def get_subdomain():
    """Extract subdomain from request"""
    host = request.headers.get('Host', '')
    
    # Skip main domain
    if host == 'pagemade.site' or host == 'www.pagemade.site':
        return None
    
    # Extract subdomain from test.pagemade.site
    match = re.match(r'^([^.]+)\.pagemade\.site$', host)
    return match.group(1) if match else None

def serve_user_site(subdomain):
    """Serve homepage for user subdomain"""
    # Find published site with this subdomain
    site = Site.query.filter_by(subdomain=subdomain, is_published=True).first()
    
    if not site:
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
        print(f"❌ Error serving homepage: {e}")
        # Fallback to generated HTML if file read fails
        return homepage.generate_html()

def serve_user_page(subdomain, page_slug):
    """Serve specific page in user subdomain"""
    # Find published site with this subdomain
    site = Site.query.filter_by(subdomain=subdomain, is_published=True).first()
    
    if not site:
        return render_template('subdomain/site_not_found.html', subdomain=subdomain), 404
    
    # Find page by slug
    page = Page.query.filter_by(site_id=site.id, slug=page_slug, is_published=True).first()
    
    if not page:
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
        
        # Fallback: Try database fields
        if page.html_content and page.css_content:
            cache.increment_page_views(page.id)
            cache.cache_page_content(
                page_id=page.id,
                html_content=page.html_content,
                css_content=page.css_content,
                ttl=3600
            )
            
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
        cache.increment_page_views(page.id)
        return page.generate_html()
        
    except Exception as e:
        current_app.logger.error(f"Error serving page {page.id}: {e}")
        # Fallback to generated HTML if any error occurs
        cache.increment_page_views(page.id)
        return page.generate_html()

# Configure Google OAuth
google = oauth.register(
    name='google',
    client_id=os.getenv('GOOGLE_CLIENT_ID'),
    client_secret=os.getenv('GOOGLE_CLIENT_SECRET'),
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={
        'scope': 'openid email profile'
    }
)

# ================================
# AUTHENTICATION ROUTES
# ================================

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    """Login page - both email/password and Google OAuth"""
    if current_user.is_authenticated:
        return redirect(url_for('main.dashboard'))
    
    if request.method == 'POST':
        # Handle email/password login
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')
        
        if not email or not password:
            flash('Vui lòng nhập email và mật khẩu!', 'error')
            return render_template('auth/login.html')
        
        # Find user by email
        user = User.query.filter_by(email=email).first()
        
        if user and user.check_password(password):
            # Successful login
            user.update_last_login()
            db.session.commit()
            login_user(user, remember=True)
            
            flash(f'Chào mừng {user.name}!', 'success')
            
            # Redirect to next page or dashboard
            next_page = request.args.get('next')
            return redirect(next_page) if next_page else redirect(url_for('main.dashboard'))
        else:
            flash('Email hoặc mật khẩu không đúng!', 'error')
    
    return render_template('auth/login.html')

@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    """User registration with email/password"""
    if current_user.is_authenticated:
        return redirect(url_for('main.dashboard'))
    
    if request.method == 'POST':
        # Get form data
        name = request.form.get('name', '').strip()
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')
        confirm_password = request.form.get('confirm_password', '')
        
        # Validation
        if not all([name, email, password, confirm_password]):
            flash('Vui lòng điền đầy đủ thông tin!', 'error')
            return render_template('auth/register.html')
        
        if password != confirm_password:
            flash('Mật khẩu xác nhận không khớp!', 'error')
            return render_template('auth/register.html')
        
        if len(password) < 6:
            flash('Mật khẩu phải có ít nhất 6 ký tự!', 'error')
            return render_template('auth/register.html')
        
        # Check if email already exists
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            flash('Email này đã được đăng ký!', 'error')
            return render_template('auth/register.html')
        
        # Create new user
        try:
            new_user = User(
                name=name,
                email=email,
                role='user'  # Default role
            )
            new_user.set_password(password)
            new_user.update_last_login()
            
            db.session.add(new_user)
            db.session.commit()
            
            # Auto login after registration
            login_user(new_user, remember=True)
            flash(f'Chào mừng {name}! Tài khoản đã được tạo thành công.', 'success')
            
            return redirect(url_for('main.dashboard'))
            
        except Exception as e:
            db.session.rollback()
            flash('Có lỗi xảy ra khi tạo tài khoản. Vui lòng thử lại!', 'error')
            current_app.logger.error(f"Registration error: {e}")
    
    return render_template('auth/register.html')

@auth_bp.route('/google')
def google_login():
    """Initiate Google OAuth login"""
    if current_user.is_authenticated:
        return redirect(url_for('main.dashboard'))
    
    redirect_uri = url_for('auth.google_callback', _external=True)
    return google.authorize_redirect(redirect_uri)

@auth_bp.route('/google/callback')
def google_callback():
    """Handle Google OAuth callback"""
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
        user = User.query.filter_by(email=email).first()
        
        if user:
            # Update existing user with Google info
            if not user.google_id:
                user.set_google_id(google_id)
            if not user.avatar_url and avatar_url:
                user.avatar_url = avatar_url
        else:
            # Create new user from Google OAuth
            user = User(
                email=email,
                name=name,
                avatar_url=avatar_url,
                role='user'
            )
            user.set_google_id(google_id)
            db.session.add(user)
        
        # Update last login and commit
        user.update_last_login()
        db.session.commit()
        
        # Login user
        login_user(user, remember=True)
        flash(f'Chào mừng {user.name}!', 'success')
        
        return redirect(url_for('main.dashboard'))
        
    except Exception as e:
        current_app.logger.error(f"Google OAuth error: {e}")
        flash('Đăng nhập Google thất bại!', 'error')
        return redirect(url_for('auth.login'))

@auth_bp.route('/logout')
@login_required
def logout():
    """User logout"""
    user_name = current_user.name
    logout_user()
    flash(f'Tạm biệt {user_name}!', 'info')
    return redirect(url_for('main.index'))

@auth_bp.route('/profile', methods=['GET', 'POST'])
@login_required
def profile():
    """User profile management"""
    if request.method == 'POST':
        # Check if this is an AJAX request
        is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
        
        # Update profile
        name = request.form.get('name', '').strip()
        
        if not name:
            if is_ajax:
                return jsonify({'success': False, 'message': 'Tên không được để trống!'})
            flash('Tên không được để trống!', 'error')
            return render_template('auth/profile.html')
        
        try:
            current_user.name = name
            
            # Handle avatar upload
            if 'avatar' in request.files and request.files['avatar'].filename:
                file = request.files['avatar']
                
                # Check file extension
                allowed_extensions = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
                if not file.filename or not file.filename.lower().endswith(tuple(f'.{ext}' for ext in allowed_extensions)):
                    if is_ajax:
                        return jsonify({'success': False, 'message': 'Chỉ chấp nhận file ảnh (PNG, JPG, JPEG, GIF, WEBP)!'})
                    flash('Chỉ chấp nhận file ảnh (PNG, JPG, JPEG, GIF, WEBP)!', 'error')
                    return render_template('auth/profile.html')
                
                # Check file size (max 5MB)
                if len(file.read()) > 5 * 1024 * 1024:
                    if is_ajax:
                        return jsonify({'success': False, 'message': 'Kích thước file không được vượt quá 5MB!'})
                    flash('Kích thước file không được vượt quá 5MB!', 'error')
                    return render_template('auth/profile.html')
                
                # Reset file pointer after reading
                file.seek(0)
                
                # Create uploads directory if it doesn't exist
                upload_dir = os.path.join(os.path.dirname(current_app.root_path), 'static', 'uploads', 'avatars')
                os.makedirs(upload_dir, exist_ok=True)
                
                # Generate unique filename
                filename = secure_filename(file.filename or "")
                unique_filename = f"{uuid.uuid4().hex}_{filename}"
                file_path = os.path.join(upload_dir, unique_filename)
                
                # Save file
                file.save(file_path)
                
                # Update user avatar URL
                avatar_url = url_for('static', filename=f'uploads/avatars/{unique_filename}')
                current_user.avatar_url = avatar_url
            
            db.session.commit()
            
            if is_ajax:
                return jsonify({
                    'success': True, 
                    'message': 'Cập nhật thông tin thành công!',
                    'avatar_url': current_user.avatar_url
                })
            
            flash('Cập nhật thông tin thành công!', 'success')
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Profile update error: {e}")
            
            if is_ajax:
                return jsonify({'success': False, 'message': 'Có lỗi xảy ra!'})
            
            flash('Có lỗi xảy ra!', 'error')
    
    return render_template('auth/profile.html')

@auth_bp.route('/upload-avatar', methods=['POST'])
@login_required
def upload_avatar():
    """Upload user avatar"""
    if 'avatar' not in request.files:
        return jsonify({'success': False, 'message': 'Vui lòng chọn file ảnh!'})
    
    file = request.files['avatar']
    if file.filename == '':
        return jsonify({'success': False, 'message': 'Vui lòng chọn file ảnh!'})
    
    # Check file extension
    allowed_extensions = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
    if not file.filename or not file.filename.lower().endswith(tuple(f'.{ext}' for ext in allowed_extensions)):
        return jsonify({'success': False, 'message': 'Chỉ chấp nhận file ảnh (PNG, JPG, JPEG, GIF, WEBP)!'})
    
    # Check file size (max 5MB)
    if len(file.read()) > 5 * 1024 * 1024:
        return jsonify({'success': False, 'message': 'Kích thước file không được vượt quá 5MB!'})
    
    # Reset file pointer after reading
    file.seek(0)
    
    try:
        # Create uploads directory if it doesn't exist
        upload_dir = os.path.join(os.path.dirname(current_app.root_path), 'static', 'uploads', 'avatars')
        os.makedirs(upload_dir, exist_ok=True)
        
        # Generate unique filename
        filename = secure_filename(file.filename or "")
        unique_filename = f"{uuid.uuid4().hex}_{filename}"
        file_path = os.path.join(upload_dir, unique_filename)
        
        # Save file
        file.save(file_path)
        
        # Update user avatar URL
        avatar_url = url_for('static', filename=f'uploads/avatars/{unique_filename}')
        current_user.avatar_url = avatar_url
        db.session.commit()
        
        return jsonify({
            'success': True, 
            'message': 'Cập nhật ảnh đại diện thành công!',
            'avatar_url': avatar_url
        })
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Avatar upload error: {e}")
        return jsonify({'success': False, 'message': 'Có lỗi xảy ra khi tải lên ảnh!'})

@auth_bp.route('/remove-avatar', methods=['POST'])
@login_required
def remove_avatar():
    """Remove user avatar (only for non-Google accounts)"""
    # Check if this is an AJAX request
    is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
    
    if current_user.google_id:
        if is_ajax:
            return jsonify({'success': False, 'message': 'Tài khoản Google không thể xóa ảnh đại diện!'})
        flash('Tài khoản Google không thể xóa ảnh đại diện!', 'error')
        return redirect(url_for('auth.profile'))
    
    try:
        # Remove file if it's a local upload
        if current_user.avatar_url:
            # Extract filename from URL
            filename = current_user.avatar_url.split('/')[-1]
            # Check if it's our uploaded file (pattern: uuid_hex_filename)
            if '_' in filename and len(filename.split('_')[0]) == 32:  # UUID hex is 32 characters
                file_path = os.path.join(os.path.dirname(current_app.root_path), 'static', 'uploads', 'avatars', filename)
                if os.path.exists(file_path):
                    os.remove(file_path)
        
        # Clear avatar URL
        current_user.avatar_url = None
        db.session.commit()
        
        if is_ajax:
            return jsonify({'success': True, 'message': 'Xóa ảnh đại diện thành công!'})
        
        flash('Xóa ảnh đại diện thành công!', 'success')
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Avatar removal error: {e}")
        
        if is_ajax:
            return jsonify({'success': False, 'message': 'Có lỗi xảy ra khi xóa ảnh!'})
        
        flash('Có lỗi xảy ra khi xóa ảnh!', 'error')
    
    return redirect(url_for('auth.profile'))

@auth_bp.route('/change-password', methods=['GET', 'POST'])
@login_required
def change_password():
    """Change user password (only for email/password accounts)"""
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
        
        if not current_user.check_password(current_password):
            flash('Mật khẩu hiện tại không đúng!', 'error')
            return render_template('auth/change_password.html')
        
        if new_password != confirm_password:
            flash('Mật khẩu mới không khớp!', 'error')
            return render_template('auth/change_password.html')
        
        if len(new_password) < 6:
            flash('Mật khẩu phải có ít nhất 6 ký tự!', 'error')
            return render_template('auth/change_password.html')
        
        # Update password
        try:
            current_user.set_password(new_password)
            db.session.commit()
            flash('Đổi mật khẩu thành công!', 'success')
            return redirect(url_for('auth.profile'))
        except Exception as e:
            db.session.rollback()
            flash('Có lỗi xảy ra!', 'error')
            current_app.logger.error(f"Password change error: {e}")
    
    return render_template('auth/change_password.html')

# ================================
# ADMIN ROUTES  
# ================================

@auth_bp.route('/admin/users')
@login_required
def admin_users():
    """Admin: Manage all users"""
    if not current_user.is_admin():
        flash('Bạn không có quyền truy cập!', 'error')
        return redirect(url_for('main.dashboard'))
    
    users = User.query.order_by(User.created_at.desc()).all()
    return render_template('auth/admin_users.html', users=users)

@auth_bp.route('/admin/make-admin/<int:user_id>')
@login_required
def make_admin(user_id):
    """Admin: Promote user to admin"""
    if not current_user.is_admin():
        flash('Bạn không có quyền thực hiện!', 'error')
        return redirect(url_for('main.dashboard'))
    
    user = User.query.get_or_404(user_id)
    user.make_admin()
    db.session.commit()
    
    flash(f'{user.name} đã được nâng cấp thành Admin!', 'success')
    return redirect(url_for('auth.admin_users'))

# ================================
# DEVELOPMENT/TESTING ROUTES
# ================================

@auth_bp.route('/create-test-account')
def create_test_account():
    """Create a test admin account for development"""
    # Use the admin created by migration
    test_user = User.query.filter_by(email='admin@pagemade.site').first()
    
    if test_user:
        login_user(test_user)
        flash('Đã đăng nhập với tài khoản Admin!', 'success')
        return redirect(url_for('main.dashboard'))
    
    flash('Không tìm thấy tài khoản admin!', 'error')
    return redirect(url_for('auth.login'))


# ================================
# API ROUTES FOR NEXT.JS FRONTEND
# ================================

@auth_bp.route('/api/login', methods=['POST'])
def api_login():
    """JSON API endpoint for Next.js login"""
    try:
        print("🔐 API Login request received")
        data = request.get_json()
        print(f"📦 Request data: {data}")
        
        if not data:
            print("❌ No data provided")
            return jsonify({'success': False, 'message': 'No data provided'}), 400
        
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        print(f"📧 Email: {email}")
        print(f"🔑 Password length: {len(password) if password else 0}")
        
        if not email or not password:
            print("❌ Missing email or password")
            return jsonify({'success': False, 'message': 'Email và password là bắt buộc'}), 400
        
        # Find user by email
        user = User.query.filter_by(email=email).first()
        print(f"👤 User found: {user is not None}")
        
        if not user:
            print("❌ User not found")
            return jsonify({'success': False, 'message': 'Email hoặc password không đúng'}), 401
            
        if not user.check_password(password):
            print("❌ Password check failed")
            return jsonify({'success': False, 'message': 'Email hoặc password không đúng'}), 401
        
        print("✅ Password check passed")
        # Successful login
        user.update_last_login()
        db.session.commit()
        login_user(user, remember=True)
        print(f"✅ User logged in: {user.email}")
        
        return jsonify({
            'success': True,
            'message': 'Đăng nhập thành công',
            'user': {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'avatar_url': user.avatar_url
            },
            'redirect': '/dashboard'
        }), 200
        
    except Exception as e:
        print(f"💥 API Login error: {e}")
        current_app.logger.error(f"API Login error: {e}")
        return jsonify({'success': False, 'message': 'Lỗi server, vui lòng thử lại'}), 500


@auth_bp.route('/api/signup', methods=['POST'])
def api_signup():
    """JSON API endpoint for Next.js signup"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'success': False, 'message': 'No data provided'}), 400
        
        name = data.get('name', '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        # Validation
        if not all([name, email, password]):
            return jsonify({'success': False, 'message': 'Vui lòng điền đầy đủ thông tin'}), 400
        
        if len(password) < 6:
            return jsonify({'success': False, 'message': 'Mật khẩu phải có ít nhất 6 ký tự'}), 400
        
        # Check if email already exists
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return jsonify({'success': False, 'message': 'Email này đã được đăng ký'}), 409
        
        # Create new user
        new_user = User(
            name=name,
            email=email,
            role='user'
        )
        new_user.set_password(password)
        new_user.update_last_login()
        
        db.session.add(new_user)
        db.session.commit()
        
        # Auto login after registration
        login_user(new_user, remember=True)
        
        return jsonify({
            'success': True,
            'message': 'Tài khoản đã được tạo thành công',
            'user': {
                'id': new_user.id,
                'name': new_user.name,
                'email': new_user.email,
                'avatar_url': new_user.avatar_url
            },
            'redirect': '/dashboard'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"API Signup error: {e}")
        return jsonify({'success': False, 'message': 'Có lỗi xảy ra, vui lòng thử lại'}), 500


@auth_bp.route('/api/me', methods=['GET'])
@login_required
def api_me():
    """Get current logged in user info"""
    return jsonify({
        'success': True,
        'user': {
            'id': current_user.id,
            'name': current_user.name,
            'email': current_user.email,
            'avatar_url': current_user.avatar_url,
            'role': current_user.role
        }
    }), 200


# Main routes
@main_bp.route('/')
def index():
    # NEW: Check if this is a subdomain request
    subdomain = get_subdomain()
    
    if not subdomain:
        # Main site - Redirect to the frontend
        return redirect('http://localhost:3000')
    
    # Subdomain - Show user site
    return serve_user_site(subdomain)

# NEW: Route to handle pages in subdomains (test.pagemade.site/about)
@main_bp.route('/<path:page_slug>')
def serve_page(page_slug):
    subdomain = get_subdomain()
    
    if not subdomain:
        # Main site - Handle normal routes or 404
        # Check if this is an existing main site route
        return redirect('http://localhost:3000/' + page_slug)
    
    # Subdomain - Serve specific page
    return serve_user_page(subdomain, page_slug)

@main_bp.route('/dashboard')
@login_required
def dashboard():
    sites = Site.query.filter_by(user_id=current_user.id).all()
    
    # Calculate stats
    total_pages = 0
    published_pages = 0
    
    for site in sites:
        pages = Page.query.filter_by(site_id=site.id).all()
        site.pages = pages  # Add pages to site object
        total_pages += len(pages)
        published_pages += sum(1 for page in pages if page.is_published)
    
    return render_template('dashboard.html', 
                         sites=sites, 
                         total_pages=total_pages,
                         published_pages=published_pages)

@main_bp.route('/new-site', methods=['GET', 'POST'])
@login_required
def new_site():
    if request.method == 'POST':
        try:
            # Get form data
            title = request.form.get('title', '').strip()
            subdomain = request.form.get('subdomain', '').strip().lower()
            description = request.form.get('description', '').strip()
            action = request.form.get('action', 'dashboard')
            
            # Validation
            if not title or not subdomain:
                return jsonify({
                    'success': False,
                    'message': 'Vui lòng điền đầy đủ thông tin bắt buộc'
                }), 400
            
            # Subdomain format validation
            import re
            if not re.match(r'^[a-z0-9-]+$', subdomain):
                return jsonify({
                    'success': False,
                    'message': 'Subdomain chỉ được chứa chữ thường, số và dấu gạch ngang'
                }), 400
            
            # Check if subdomain is available
            existing_site = Site.query.filter_by(subdomain=subdomain).first()
            if existing_site:
                return jsonify({
                    'success': False,
                    'message': 'Subdomain đã được sử dụng'
                }), 400
            
            # Create site
            site = Site(
                title=title,
                subdomain=subdomain,
                description=description,
                user_id=current_user.id
            )
            
            db.session.add(site)
            db.session.commit()
            
            # Always create a default homepage for new site
            default_page = Page(
                title=f'{site.title} - Homepage',
                slug='home',
                description='Homepage',
                site_id=site.id,
                user_id=current_user.id,
                is_homepage=True
            )
            db.session.add(default_page)
            db.session.commit()
            
            response_data = {
                'success': True,
                'message': 'Tạo site thành công!',
                'site_id': site.id,
                'homepage_id': default_page.id,
                'redirect': '/dashboard'
            }
            
            # If action is pagemaker, redirect to editor
            if action == 'pagemaker':
                response_data['redirect'] = f'/editor/{default_page.id}'
            
            return jsonify(response_data), 201
            
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Create site error: {e}")
            return jsonify({
                'success': False,
                'message': 'Có lỗi xảy ra khi tạo site. Vui lòng thử lại!'
            }), 500
    
    # GET request - show form
    return render_template('new_site.html')

@main_bp.route('/site/<int:site_id>')
@login_required
def site_detail(site_id):
    site = Site.query.get_or_404(site_id)
    
    if site.user_id != current_user.id:
        abort(403)
    
    pages = Page.query.filter_by(site_id=site_id).all()
    return render_template('site_detail.html', site=site, pages=pages)

@main_bp.route('/site/<int:site_id>/new-page')
@login_required
def new_page(site_id):
    site = Site.query.get_or_404(site_id)
    
    if site.user_id != current_user.id:
        abort(403)
    
    return render_template('new_page.html', site=site)

@main_bp.route('/editor/<int:page_id>')
@login_required
def editor(page_id):
    page = Page.query.get_or_404(page_id)
    
    if page.site.user_id != current_user.id:
        abort(403)
    
    # ✅ UPDATED: Use PageMaker editor v2 (Tempi-like UI)
    return render_template('editor_pagemaker_v2.html', page=page)

@main_bp.route('/editor/<int:page_id>/simple')
@login_required
def editor_simple(page_id):
    page = Page.query.get_or_404(page_id)
    
    if page.site.user_id != current_user.id:
        abort(403)
    
    # Simple test version without complex UI
    return render_template('editor_pagemaker_simple.html', page=page)

@main_bp.route('/preview/<string:token>')
def preview_page(token):
    """Display preview page using token"""
    # Get preview data from session
    previews = session.get('previews', {})
    
    if token not in previews:
        return "Preview không tồn tại hoặc đã hết hạn", 404
    
    preview_data = previews[token]
    
    # Check if preview is expired
    expires_at = datetime.fromisoformat(preview_data['expires_at'])
    if datetime.utcnow() > expires_at:
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

@main_bp.route('/view/<subdomain>/<int:page_id>')
def view_page(subdomain, page_id):
    site = Site.query.filter_by(subdomain=subdomain).first_or_404()
    page = Page.query.filter_by(id=page_id, site_id=site.id).first_or_404()
    
    if not page.is_published:
        abort(404)
    
    return render_template('published_page.html', page=page, site=site)

# Admin routes
@main_bp.route('/admin/reset-demo')
@login_required
def reset_demo():
    """Reset demo data for testing"""
    if current_user.email != 'admin@autolandingpage.com':
        abort(403)
    
    # Delete all data for current user
    sites = Site.query.filter_by(user_id=current_user.id).all()
    for site in sites:
        db.session.delete(site)
    
    db.session.commit()
    flash('Demo data đã được reset!', 'success')
    return redirect(url_for('main.dashboard'))

# API routes
@api_bp.route('/sites', methods=['POST'])
@login_required
def create_site():
    data = request.get_json()
    
    # Check if subdomain is available
    existing_site = Site.query.filter_by(subdomain=data['subdomain']).first()
    if existing_site:
        return jsonify({'error': 'Subdomain đã được sử dụng'}), 400
    
    site = Site(
        title=data['title'],
        subdomain=data['subdomain'],
        description=data.get('description', ''),
        user_id=current_user.id
    )
    
    db.session.add(site)
    db.session.commit()
    
    # Always create a default homepage for new site
    default_page = Page(
        title=f'{site.title} - Homepage',
        slug='home',
        description='Homepage',
        site_id=site.id,
        user_id=current_user.id,
        is_homepage=True
    )
    db.session.add(default_page)
    db.session.commit()
    
    # Enhanced response for redirect to PageMaker
    response_data = site.to_dict()
    response_data['homepage_id'] = default_page.id
    response_data['redirect_to_pagemaker'] = data.get('redirect_to_pagemaker', False)
    
    # If redirecting to PageMaker, provide editor URL
    if response_data['redirect_to_pagemaker']:
        response_data['pagemaker_url'] = url_for('main.editor', page_id=default_page.id, _external=True)
    
    return jsonify(response_data), 201

@api_bp.route('/pages', methods=['POST'])
@login_required
def create_page():
    data = request.get_json()
    
    if not data or 'site_id' not in data:
        return jsonify({'error': 'Missing site_id'}), 400
    
    site = Site.query.get_or_404(data['site_id'])
    
    if site.user_id != current_user.id:
        abort(403)

    # NEW: Create page with auto-generated slug
    page = Page(
        title=data['title'],
        description=data.get('description', ''),
        template=data.get('template', 'default'),
        site_id=site.id,
        user_id=current_user.id  # ✅ FIX: Add user_id
    )
    
    # NEW: Generate slug from title
    page.slug = page.generate_slug()
    
    # NEW: If this is the first page, make it homepage
    if not site.get_homepage():
        page.is_homepage = True
    
    db.session.add(page)
    db.session.commit()
    
    return jsonify(page.to_dict()), 201

@api_bp.route('/pages/<int:page_id>', methods=['PUT'])
@login_required
def update_page(page_id):
    page = Page.query.get_or_404(page_id)
    
    if page.site.user_id != current_user.id:
        abort(403)
    
    data = request.get_json()
    
    if 'title' in data:
        page.title = data['title']
        # NEW: Regenerate slug when title changes
        page.slug = page.generate_slug()
    if 'description' in data:
        page.description = data['description']
    if 'content' in data:
        page.content = data['content']
    if 'template' in data:
        page.template = data['template']
    # NEW: Allow updating slug directly
    if 'slug' in data:
        page.slug = data['slug']
    
    page.updated_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify(page.to_dict())

@api_bp.route('/pages/<int:page_id>/publish', methods=['POST'])
@login_required
def publish_page(page_id):
    """Publish PageMaker page to subdomain"""
    page = Page.query.get_or_404(page_id)
    
    if page.site.user_id != current_user.id:
        abort(403)
    
    try:
        # Get page content from PageMaker
        if not page.content:
            return jsonify({
                'success': False,
                'message': 'Không có nội dung để xuất bản. Vui lòng lưu trang trước.'
            }), 400
        
        # Parse PageMaker content
        try:
            content_data = json.loads(page.content)
            html_content = content_data.get('gjs-html', '')
            css_content = content_data.get('gjs-css', '')
        except json.JSONDecodeError:
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
        subdomain = page.site.subdomain
        
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
    <title>{page.title} - {page.site.title}</title>
    
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- Custom Styles -->
    <style>
        {css_content}
    </style>
</head>
<body>
    {html_content}
</body>
</html>"""
        
        # Deploy to storage folder (where subdomain routes read from)
        import os
        storage_base = os.path.join(current_app.root_path, 'storage', 'sites', str(page.site.id))
        
        try:
            os.makedirs(storage_base, exist_ok=True)
            file_path = os.path.join(storage_base, filename)
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(complete_html)
            
            print(f"✅ Published: {file_path}")
            
        except Exception as deploy_error:
            return jsonify({
                'success': False,
                'message': f'Lỗi khi ghi file: {str(deploy_error)}'
            }), 500
        
        # Mark page as published
        page.is_published = True
        page.published_at = datetime.utcnow()
        
        # Auto-publish site if not already
        if not page.site.is_published:
            page.site.is_published = True
        
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
        print(f"❌ Publish error: {e}")
        print(f"Traceback:\n{error_trace}")
        
        return jsonify({
            'success': False,
            'message': f'Lỗi khi xuất bản: {str(e)}',
            'error': str(e),
            'trace': error_trace if current_app.debug else None
        }), 500

# ===== PageMaker (GrapesJS) API Endpoints =====

@api_bp.route('/pages/<int:page_id>/pagemaker/load', methods=['GET'])
@login_required
def pagemaker_load(page_id):
    """Load PageMaker content for editing"""
    page = Page.query.get_or_404(page_id)
    
    if page.site.user_id != current_user.id:
        abort(403)
    
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
        except json.JSONDecodeError:
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

@api_bp.route('/pages/<int:page_id>/pagemaker/save', methods=['POST'])
@login_required
def pagemaker_save(page_id):
    """Save PageMaker content"""
    page = Page.query.get_or_404(page_id)
    
    if page.site.user_id != current_user.id:
        abort(403)
    
    try:
        data = request.get_json()
        
        # Store complete GrapesJS storage format
        # Keep same keys as Load API returns: gjs-html, gjs-css, etc.
        content_json = {
            'gjs-html': data.get('gjs-html', ''),
            'gjs-css': data.get('gjs-css', ''),
            'gjs-components': data.get('gjs-components', []),
            'gjs-styles': data.get('gjs-styles', []),
            'gjs-assets': data.get('gjs-assets', []),
        }
        
        # Save as JSON string
        page.content = json.dumps(content_json, ensure_ascii=False)
        page.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Content saved successfully!',
            'page_id': page.id,
            'updated_at': page.updated_at.isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error saving content: {str(e)}'
        }), 500

@api_bp.route('/pages/<int:page_id>/upload-asset', methods=['POST'])
@login_required
def upload_asset(page_id):
    """Upload asset (image, video, etc.) for PageMaker"""
    page = Page.query.get_or_404(page_id)
    
    if page.site.user_id != current_user.id:
        abort(403)
    
    try:
        # Check if files were uploaded
        if 'files' not in request.files:
            return jsonify({'success': False, 'message': 'No files uploaded'}), 400
        
        files = request.files.getlist('files')
        uploaded_assets = []
        
        # Create upload directory if it doesn't exist
        upload_dir = os.path.join(os.path.dirname(current_app.root_path), 'static', 'uploads', 'assets')
        os.makedirs(upload_dir, exist_ok=True)
        
        for file in files:
            if file and file.filename:
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

@api_bp.route('/pages/<int:page_id>/preview', methods=['POST'])
@login_required
def generate_preview(page_id):
    """Generate preview token for page"""
    page = Page.query.get_or_404(page_id)
    
    if page.site.user_id != current_user.id:
        abort(403)
    
    try:
        # Generate secure preview token
        preview_token = secrets.token_urlsafe(32)
        
        # Store preview data in session (temporary storage)
        # In production, you might want to use Redis or database
        preview_data = {
            'page_id': page_id,
            'user_id': current_user.id,
            'title': page.title,
            'content': page.content,
            'created_at': datetime.utcnow().isoformat(),
            'expires_at': (datetime.utcnow() + timedelta(minutes=30)).isoformat()
        }
        
        # Store in session (for demo - in production use Redis)
        if 'previews' not in session:
            session['previews'] = {}
        session['previews'][preview_token] = preview_data
        session.modified = True
        
        # Generate preview URL
        preview_url = url_for('main.preview_page', token=preview_token, _external=True)
        
        return jsonify({
            'success': True,
            'preview_token': preview_token,
            'preview_url': preview_url,
            'expires_in': 1800  # 30 minutes
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error generating preview: {str(e)}'
        }), 500

# NEW: API route to publish/unpublish entire site
@api_bp.route('/sites/<int:site_id>/publish', methods=['POST'])
@login_required
def publish_site(site_id):
    site = Site.query.get_or_404(site_id)
    
    if site.user_id != current_user.id:
        abort(403)
    
    data = request.get_json() or {}
    site.is_published = data.get('is_published', True)
    
    db.session.commit()
    
    action = 'published' if site.is_published else 'unpublished'
    subdomain_url = f"https://{site.subdomain}.pagemade.site" if site.is_published else None
    
    return jsonify({
        'success': True,
        'message': f'Site {action} successfully!',
        'is_published': site.is_published,
        'url': subdomain_url
    })

# NEW: API route to set page as homepage
@api_bp.route('/pages/<int:page_id>/set-homepage', methods=['POST'])
@login_required
def set_homepage(page_id):
    page = Page.query.get_or_404(page_id)
    
    if page.site.user_id != current_user.id:
        abort(403)
    
    # Remove homepage status from other pages in same site
    Page.query.filter_by(site_id=page.site_id, is_homepage=True).update({'is_homepage': False})
    
    # Set this page as homepage
    page.is_homepage = True
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Homepage set successfully!',
        'homepage_url': page.get_url() if page.is_published else None
    })

@api_bp.route('/sites/<int:site_id>', methods=['DELETE'])
@login_required
def delete_site(site_id):
    site = Site.query.get_or_404(site_id)
    
    if site.user_id != current_user.id:
        abort(403)
    
    db.session.delete(site)
    db.session.commit()
    
    return jsonify({'message': 'Site deleted successfully'})

@api_bp.route('/sites/<int:site_id>/delete', methods=['POST'])
@login_required
def delete_site_form(site_id):
    """Handle site deletion from HTML forms"""
    site = Site.query.get_or_404(site_id)
    
    if site.user_id != current_user.id:
        abort(403)
    
    db.session.delete(site)
    db.session.commit()
    
    flash('Site deleted successfully!', 'success')
    return redirect(url_for('main.dashboard'))

# NEW: API to publish entire website from Silex
@api_bp.route('/publish-site', methods=['POST'])
@login_required  
def publish_entire_site():
    """Publish entire website from Silex editor"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['siteId', 'pages']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        site_id = data['siteId']
        pages_data = data['pages']  # List of pages with content
        
        # Verify site ownership
        site = Site.query.get_or_404(site_id)
        if site.user_id != current_user.id:
            return jsonify({
                'success': False,
                'error': 'Unauthorized access to site'
            }), 403
        
        # Import cache for performance
        from cache import cache
        
        published_pages = []
        
        # Process each page
        for page_data in pages_data:
            page_id = page_data.get('pageId')
            html_content = page_data.get('html', '')
            css_content = page_data.get('css', '')
            
            if not page_id:
                continue  # Skip pages without ID
                
            # Get or create page
            page = Page.query.get(page_id)
            if not page:
                # Create new page if doesn't exist
                page = Page(
                    title=page_data.get('title', 'Untitled Page'),
                    site_id=site_id,
                    user_id=current_user.id,
                    slug=page_data.get('slug', f'page-{page_id}')
                )
                db.session.add(page)
            
            # Update page content
            page.html_content = html_content
            page.css_content = css_content
            page.is_published = True
            
            # Save to file system as well
            storage_dir = os.path.join('storage', 'sites', str(site_id))
            os.makedirs(storage_dir, exist_ok=True)
            
            # Create complete HTML file
            complete_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{page.title}</title>
    <style>
{css_content}
    </style>
</head>
<body>
{html_content}
</body>
</html>"""
            
            # Save to file
            html_filename = f"{page.id}.html"
            html_filepath = os.path.join(storage_dir, html_filename)
            
            with open(html_filepath, 'w', encoding='utf-8') as f:
                f.write(complete_html)
            
            # Cache the content for fast serving
            cache.cache_page_content(page.id, {
                'html': html_content,
                'css': css_content,
                'title': page.title
            })
            
            published_pages.append({
                'id': page.id,
                'title': page.title,
                'slug': page.slug,
                'url': page.get_url()
            })
        
        # Publish the entire site
        site.is_published = True
        db.session.commit()
        
        # Build subdomain URL
        subdomain_url = f"https://{site.subdomain}.pagemade.site"
        
        return jsonify({
            'success': True,
            'message': f'Website published successfully!',
            'site': {
                'id': site.id,
                'title': site.title,
                'subdomain': site.subdomain,
                'url': subdomain_url,
                'is_published': True
            },
            'pages': published_pages,
            'redirect_url': subdomain_url
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Failed to publish site: {str(e)}'
        }), 500

@api_bp.route('/pages/<int:page_id>', methods=['DELETE'])
@login_required
def delete_page(page_id):
    page = Page.query.get_or_404(page_id)
    
    if page.site.user_id != current_user.id:
        abort(403)
    
    db.session.delete(page)
    db.session.commit()
    
    return jsonify({'message': 'Page deleted successfully'})

# ================================
# TEMPLATE SYSTEM ROUTES  
# ================================

@api_bp.route('/templates', methods=['GET'])
def get_templates():
    """Get all available templates"""
    try:
        templates_dir = os.path.join(os.path.dirname(__file__), '..', 'templates', 'silex')
        templates = []
        
        if os.path.exists(templates_dir):
            for template_folder in os.listdir(templates_dir):
                template_path = os.path.join(templates_dir, template_folder)
                if os.path.isdir(template_path):
                    template_json_path = os.path.join(template_path, 'template.json')
                    if os.path.exists(template_json_path):
                        with open(template_json_path, 'r', encoding='utf-8') as f:
                            template_data = json.load(f)
                            templates.append(template_data)
        
        return jsonify({
            'success': True,
            'templates': templates
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Failed to load templates: {str(e)}'
        }), 500

@api_bp.route('/templates/<template_id>', methods=['GET'])
def get_template(template_id):
    """Get specific template details"""
    try:
        templates_dir = os.path.join(os.path.dirname(__file__), '..', 'templates', 'silex')
        
        # Find template by ID
        for template_folder in os.listdir(templates_dir):
            template_path = os.path.join(templates_dir, template_folder)
            if os.path.isdir(template_path):
                template_json_path = os.path.join(template_path, 'template.json')
                if os.path.exists(template_json_path):
                    with open(template_json_path, 'r', encoding='utf-8') as f:
                        template_data = json.load(f)
                        if template_data['id'] == template_id:
                            # Load template HTML files
                            template_data['files'] = {}
                            for page in template_data['pages']:
                                html_path = os.path.join(template_path, page['file'])
                                if os.path.exists(html_path):
                                    with open(html_path, 'r', encoding='utf-8') as html_file:
                                        template_data['files'][page['file']] = html_file.read()
                            
                            return jsonify({
                                'success': True,
                                'template': template_data
                            })
        
        return jsonify({
            'success': False,
            'error': 'Template not found'
        }), 404
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Failed to load template: {str(e)}'
        }), 500

@api_bp.route('/sites/from-template', methods=['POST'])
@login_required
def create_site_from_template():
    """Create site from template with customizations"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['title', 'subdomain', 'template_id']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Check if subdomain is available
        existing_site = Site.query.filter_by(subdomain=data['subdomain']).first()
        if existing_site:
            return jsonify({
                'success': False,
                'error': 'Subdomain đã được sử dụng'
            }), 400
        
        # Load template
        template_id = data['template_id']
        templates_dir = os.path.join(os.path.dirname(__file__), '..', 'templates', 'silex')
        template_data = None
        
        for template_folder in os.listdir(templates_dir):
            template_path = os.path.join(templates_dir, template_folder)
            if os.path.isdir(template_path):
                template_json_path = os.path.join(template_path, 'template.json')
                if os.path.exists(template_json_path):
                    with open(template_json_path, 'r', encoding='utf-8') as f:
                        temp_data = json.load(f)
                        if temp_data['id'] == template_id:
                            template_data = temp_data
                            template_base_path = template_path
                            break
        
        if not template_data:
            return jsonify({
                'success': False,
                'error': 'Template not found'
            }), 404
        
        # Create site
        site = Site(
            title=data['title'],
            subdomain=data['subdomain'],
            description=data.get('description', f"Website created from {template_data['name']} template"),
            user_id=current_user.id,
            template_id=template_id
        )
        
        db.session.add(site)
        db.session.commit()
        
        # Get customizations
        customizations = data.get('customizations', {})
        selected_color_scheme = data.get('color_scheme', template_data['color_schemes'][0])
        
        # Process template pages
        created_pages = []
        for page_config in template_data['pages']:
            # Load template HTML
            html_path = os.path.join(template_base_path, page_config['file'])
            with open(html_path, 'r', encoding='utf-8') as f:
                html_content = f.read()
            
            # Apply customizations
            for field in page_config.get('customizable_fields', []):
                field_id = field['id']
                if field_id in customizations:
                    custom_value = customizations[field_id]
                else:
                    custom_value = field['default']
                
                # Replace placeholder in HTML
                html_content = html_content.replace(f"{{{{{field_id}}}}}", custom_value)
            
            # Apply color scheme
            for color_key, color_value in selected_color_scheme.items():
                if color_key.startswith('color_') or color_key in ['primary', 'secondary', 'accent', 'background', 'text']:
                    placeholder = f"{{{{color_{color_key}}}}}" if not color_key.startswith('color_') else f"{{{{{color_key}}}}}"
                    html_content = html_content.replace(placeholder, color_value)
            
            # Extract CSS from style tags (simplified)
            css_content = ""
            if '<style>' in html_content:
                start = html_content.find('<style>') + 7
                end = html_content.find('</style>')
                if end > start:
                    css_content = html_content[start:end]
            
            # Create page
            page = Page(
                title=page_config['name'],
                site_id=site.id,
                user_id=current_user.id,
                is_homepage=page_config.get('is_homepage', False),
                html_content=html_content,
                css_content=css_content,
                template_page=page_config['file']
            )
            page.slug = page.generate_slug()
            
            db.session.add(page)
            created_pages.append({
                'name': page.title,
                'slug': page.slug,
                'is_homepage': page.is_homepage
            })
        
        db.session.commit()
        
        # Prepare response
        response_data = site.to_dict()
        response_data['template'] = {
            'id': template_data['id'],
            'name': template_data['name']
        }
        response_data['pages'] = created_pages
        response_data['silex_url'] = url_for('main.edit_site_in_silex', site_id=site.id, _external=True)
        
        return jsonify({
            'success': True,
            'message': f'Site created successfully from {template_data["name"]} template!',
            'site': response_data
        }), 201
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Failed to create site from template: {str(e)}'
        }), 500

# ================================
# SILEX INTEGRATION ROUTES
# ================================

@main_bp.route('/silex/<path:path>')
def silex_proxy(path):
    """Reverse proxy to Silex server"""
    try:
        silex_url = f"http://localhost:6805/{path}"
        
        # Forward query parameters
        if request.query_string:
            silex_url += f"?{request.query_string.decode()}"
        
        # Forward request to Silex
        resp = requests.get(silex_url, 
                          headers={k: v for k, v in request.headers if k.lower() != 'host'},
                          stream=True)
        
        # Create response
        def generate():
            for chunk in resp.iter_content(chunk_size=8192):
                yield chunk
        
        return Response(generate(), 
                       status=resp.status_code,
                       headers=dict(resp.headers))
        
    except requests.exceptions.RequestException as e:
        current_app.logger.error(f"Silex proxy error: {e}")
        return jsonify({'error': 'Silex server not available'}), 503

@api_bp.route('/silex/load', methods=['GET'])
def silex_load():
    """Load page content for Silex editor"""
    try:
        page_id = request.args.get('pageId')
        auth_token = request.args.get('authToken')
        
        if not page_id or not auth_token:
            return jsonify({'error': 'Missing pageId or authToken'}), 400
        
        # Validate auth token
        token_key = f'silex_token_{auth_token}'
        
        if token_key not in session:
            return jsonify({'error': 'Invalid or expired auth token'}), 401
        
        token_data = session[token_key]
        
        # Check token expiry
        import time
        if time.time() - token_data['created_at'] > 1800:
            del session[token_key]
            return jsonify({'error': 'Auth token expired'}), 401
        
        # Get page content
        page = Page.query.get_or_404(page_id)
        
        # Verify user owns this page
        if page.site.user_id != token_data['user_id']:
            return jsonify({'error': 'User not authorized for this page'}), 403
        
        # Return existing content or empty template
        html_content = page.html_content or '''<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>''' + page.title + '''</title>
</head>
<body>
    <h1>Welcome to ''' + page.title + '''</h1>
    <p>Start designing your page...</p>
</body>
</html>'''
        
        css_content = page.css_content or 'body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }'
        
        return jsonify({
            'html': html_content,
            'css': css_content,
            'pageTitle': page.title,
            'siteName': page.site.title
        })
        
    except Exception as e:
        current_app.logger.error(f"Silex load error: {e}")
        return jsonify({'error': str(e)}), 500

@api_bp.route('/silex/publish', methods=['POST'])
def silex_publish():
    """Handle publish callback from Silex"""
    try:
        data = request.get_json()
        page_id = data.get('pageId')
        html_content = data.get('html')
        css_content = data.get('css', '')  # CSS content from Silex
        auth_token = data.get('authToken')
        
        # Debug logging
        
        if not page_id or not html_content or not auth_token:
            return jsonify({'error': 'Missing pageId, html, or authToken'}), 400
        
        # Validate auth token
        token_key = f'silex_token_{auth_token}'
        
        if token_key not in session:
            return jsonify({'error': 'Invalid or expired auth token'}), 401
        
        token_data = session[token_key]
        
        # Check token expiry (30 minutes)
        import time
        if time.time() - token_data['created_at'] > 1800:
            del session[token_key]
            return jsonify({'error': 'Auth token expired'}), 401
        
        # Validate page and user
        if token_data['page_id'] != page_id:
            return jsonify({'error': 'Token page mismatch'}), 401
        
        page = Page.query.get_or_404(page_id)
        user = User.query.get_or_404(token_data['user_id'])
        
        if page.site.user_id != user.id:
            return jsonify({'error': 'User not authorized for this page'}), 403
        
        # Simple CSS/HTML processing without BeautifulSoup
        import re
        
        # Extract CSS from <style> tags using regex
        style_pattern = r'<style[^>]*>(.*?)</style>'
        style_matches = re.findall(style_pattern, html_content, re.DOTALL)
        additional_css = '\n'.join(style_matches)
        
        # Remove <style> tags from HTML
        clean_html = re.sub(style_pattern, '', html_content, flags=re.DOTALL)
        
        # Combine CSS
        combined_css = css_content + '\n' + additional_css
        
        # Update database with new content fields
        from datetime import datetime
        page.html_content = clean_html
        page.css_content = combined_css.strip()
        page.published_at = datetime.utcnow()
        page.is_published = True
        
        # Cache the published content for faster serving
        from cache import cache
        cache.cache_page_content(
            page_id=page.id,
            html_content=clean_html,
            css_content=combined_css.strip(),
            ttl=3600  # 1 hour cache
        )
        
        # Save HTML to storage (for backward compatibility)
        storage_base = os.path.join(current_app.root_path, '..', 'storage', 'sites', str(page.site.id))
        os.makedirs(storage_base, exist_ok=True)
        
        html_filename = f"{page.id}.html"
        html_path = os.path.join(storage_base, html_filename)
        
        # Create complete HTML document with CSS
        complete_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{page.title}</title>
    <style>
{combined_css}
    </style>
</head>
<body>
{clean_html}
</body>
</html>"""
        
        with open(html_path, 'w', encoding='utf-8') as f:
            f.write(complete_html)
        
        # Update legacy content field
        page.content = html_filename
        
        if not page.site.is_published:
            page.site.is_published = True
        
        db.session.commit()
        
        # Invalidate site cache when new content is published
        cache.invalidate_site_cache(page.site.id)
        
        # NEW: Auto-deploy to subdomain when publishing from Silex
        subdomain_result = None
        if page.site.subdomain:
            subdomain_result = deploy_static_website(
                subdomain=page.site.subdomain,
                html_content=complete_html,
                css_content=combined_css.strip()
            )
            
            if subdomain_result.get('success'):
                print(f"✅ Auto-deployed to subdomain: {page.site.subdomain}.pagemade.site")
            else:
                print(f"❌ Subdomain deployment failed: {subdomain_result.get('error')}")
        
        response_data = {
            'success': True,
            'message': 'Page published successfully!',
            'url': page.get_url()
        }
        
        # Include subdomain deployment info if available
        if subdomain_result and subdomain_result.get('success'):
            response_data['subdomain'] = {
                'url': f"https://{page.site.subdomain}.pagemade.site",
                'deployed': True
            }
        
        return jsonify(response_data)
        
    except Exception as e:
        current_app.logger.error(f"Silex publish error: {e}")
        return jsonify({'error': str(e)}), 500

@api_bp.route('/silex/publish-simple', methods=['POST'])
def silex_publish_simple():
    """Simple publish endpoint with API key authentication"""
    try:
        data = request.get_json()
        page_id = data.get('pageId')
        html_content = data.get('html')
        css_content = data.get('css', '')
        api_key = data.get('apiKey')
        
        # Simple API key validation
        if api_key != 'pagemade-2025':
            return jsonify({'error': 'Invalid API key'}), 401
        
        if not page_id or not html_content:
            return jsonify({'error': 'Missing pageId or html'}), 400
        
        # For simple API, find or create a default page/site
        try:
            page = Page.query.get(page_id)
            if not page:
                # Create a default site and page for testing
                from .models import Site
                site = Site.query.first()
                if not site:
                    site = Site(title="Test Site", subdomain="test", user_id=1)
                    db.session.add(site)
                    db.session.commit()
                
                page = Page(title="Test Page", site_id=site.id, slug="test")
                db.session.add(page)
                db.session.commit()
        except Exception as e:
            return jsonify({'error': f'Page setup error: {str(e)}'}), 500
        
        # Simple CSS/HTML processing without BeautifulSoup
        import re
        
        # Extract CSS from <style> tags using regex
        style_pattern = r'<style[^>]*>(.*?)</style>'
        style_matches = re.findall(style_pattern, html_content, re.DOTALL)
        additional_css = '\n'.join(style_matches)
        
        # Remove <style> tags from HTML
        clean_html = re.sub(style_pattern, '', html_content, flags=re.DOTALL)
        
        # Combine CSS
        combined_css = css_content + '\n' + additional_css
        
        # Update database with new content fields
        from datetime import datetime
        page.html_content = clean_html
        page.css_content = combined_css.strip()
        page.published_at = datetime.utcnow()
        page.is_published = True
        
        # Cache the published content for faster serving
        from cache import cache
        cache.cache_page_content(
            page_id=page.id,
            html_content=clean_html,
            css_content=combined_css.strip(),
            ttl=3600  # 1 hour cache
        )
        
        # Save HTML to storage (for backward compatibility)
        storage_base = os.path.join(current_app.root_path, '..', 'storage', 'sites', str(page.site.id))
        os.makedirs(storage_base, exist_ok=True)
        
        html_filename = f"{page.id}.html"
        html_path = os.path.join(storage_base, html_filename)
        
        # Create complete HTML document with CSS
        complete_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{page.title}</title>
    <style>
{combined_css}
    </style>
</head>
<body>
{clean_html}
</body>
</html>"""
        
        with open(html_path, 'w', encoding='utf-8') as f:
            f.write(complete_html)
        
        # Update legacy content field
        page.content = html_filename
        
        if not page.site.is_published:
            page.site.is_published = True
        
        db.session.commit()
        
        # Invalidate site cache when new content is published
        cache.invalidate_site_cache(page.site.id)
        
        return jsonify({
            'success': True,
            'message': 'Page published successfully!',
            'pageId': page.id,
            'url': page.get_url()
        })
        
    except Exception as e:
        current_app.logger.error(f"Silex publish simple error: {e}")
        return jsonify({'error': str(e)}), 500

@main_bp.route('/api/silex/load', methods=['GET'])
def silex_load():
    """Load existing page content for Silex editor"""
    try:
        page_id = request.args.get('pageId', type=int)
        auth_token = request.args.get('authToken')
        
        if not page_id or not auth_token:
            return jsonify({'error': 'Missing pageId or authToken'}), 400
        
        # Validate auth token
        token_key = f'silex_token_{auth_token}'
        if token_key not in session:
            return jsonify({'error': 'Invalid or expired auth token'}), 401
        
        token_data = session[token_key]
        
        # Check token expiry (30 minutes)
        import time
        if time.time() - token_data['created_at'] > 1800:
            del session[token_key]
            return jsonify({'error': 'Auth token expired'}), 401
        
        # Validate page and user
        if token_data['page_id'] != page_id:
            return jsonify({'error': 'Token page mismatch'}), 401
        
        page = Page.query.get_or_404(page_id)
        user = User.query.get_or_404(token_data['user_id'])
        
        if page.site.user_id != user.id:
            return jsonify({'error': 'User not authorized for this page'}), 403
        
        # Load existing content - prioritize new database fields
        html_content = ""
        css_content = ""
        
        # Try to load from new database fields first
        if page.html_content and page.css_content:
            html_content = page.html_content
            css_content = page.css_content
        
        # Fallback to file-based storage for legacy content
        elif page.content:
            storage_base = os.path.join(current_app.root_path, '..', 'storage', 'sites', str(page.site.id))
            html_path = os.path.join(storage_base, page.content)
            
            if os.path.exists(html_path):
                with open(html_path, 'r', encoding='utf-8') as f:
                    full_html = f.read()
                
                # Simple HTML/CSS parsing without BeautifulSoup
                import re
                
                # Extract CSS from style tags
                style_pattern = r'<style[^>]*>(.*?)</style>'
                style_matches = re.findall(style_pattern, full_html, re.DOTALL)
                css_content += '\n'.join(style_matches)
                
                # Extract body content
                body_match = re.search(r'<body[^>]*>(.*?)</body>', full_html, re.DOTALL)
                if body_match:
                    html_content = body_match.group(1)
        
        return jsonify({
            'success': True,
            'pageId': page_id,
            'pageTitle': page.title,
            'html': html_content,
            'css': css_content
        })
        
    except Exception as e:
        current_app.logger.error(f"Silex load error: {e}")
        return jsonify({'error': str(e)}), 500

# ================================
# CACHE MANAGEMENT ROUTES
# ================================

@main_bp.route('/admin/cache/stats')
@login_required
def cache_stats():
    """Cache statistics dashboard (admin only)"""
    if not current_user.is_admin:
        flash('Access denied. Admin privileges required.', 'error')
        return redirect(url_for('main.dashboard'))
    
    from cache import cache
    stats = cache.get_cache_stats()
    
    return render_template('admin/cache_stats.html', stats=stats)

@main_bp.route('/admin/cache/clear', methods=['POST'])
@login_required
def clear_cache():
    """Clear all cache (admin only)"""
    if not current_user.is_admin:
        return jsonify({'error': 'Access denied'}), 403
    
    from cache import cache
    success = cache.clear_all_cache()
    
    if success:
        flash('Cache cleared successfully!', 'success')
        return jsonify({'success': True, 'message': 'Cache cleared'})
    else:
        flash('Failed to clear cache', 'error')
        return jsonify({'error': 'Failed to clear cache'}), 500

@main_bp.route('/api/page/<int:page_id>/views')
@login_required
def get_page_views(page_id):
    """Get page view statistics"""
    page = Page.query.get_or_404(page_id)
    
    # Check if user owns this page
    if page.site.user_id != current_user.id and not current_user.is_admin:
        return jsonify({'error': 'Access denied'}), 403
    
    from cache import cache
    views = cache.get_page_views(page_id)
    
    return jsonify({
        'page_id': page_id,
        'page_title': page.title,
        'views': views
    })

# =============================================================================
# NEW: SILEX INTEGRATION APIs (Added Oct 7, 2025)
# =============================================================================

@api_bp.route('/verify-session')
def verify_session():
    """Verify user session for Silex authentication"""
    if current_user.is_authenticated:
        return jsonify({
            'authenticated': True,
            'user_id': current_user.id,
            'username': current_user.username or 'Unknown'
        })
    return jsonify({'authenticated': False}), 401

@api_bp.route('/page/<int:page_id>')
@login_required
def get_page_data(page_id):
    """Load page data for Silex editor"""
    # Find page and verify ownership
    page = Page.query.filter_by(id=page_id, user_id=current_user.id).first()
    if not page:
        return jsonify({'error': 'Page not found or access denied'}), 404
        
    return jsonify({
        'id': page.id,
        'title': page.title,
        'silex_data': json.loads(page.silex_data) if page.silex_data else {},
        'css_data': page.css_data or '',
        'html_content': page.content or '',
        'subdomain': page.site.subdomain if page.site else None,
        'last_edited': page.updated_at.isoformat() if page.updated_at else None,
        'site_id': page.site_id
    })

@api_bp.route('/page/<int:page_id>/save', methods=['POST'])
@login_required
def save_page_data(page_id):
    """Save page content from Silex editor (auto-save)"""
    # Verify page ownership
    page = Page.query.filter_by(id=page_id, user_id=current_user.id).first()
    if not page:
        return jsonify({'error': 'Page not found or access denied'}), 404
    
    try:
        data = request.get_json()
        
        # Save Silex data (design structure)
        if 'silex_data' in data:
            page.silex_data = json.dumps(data['silex_data'])
        
        # Save CSS styles
        if 'css_data' in data:
            page.css_data = data['css_data']
            
        # Update timestamp
        page.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Page saved successfully',
            'last_saved': page.updated_at.isoformat()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Save failed: {str(e)}'}), 500

@api_bp.route('/page/<int:page_id>/publish', methods=['POST'])
@login_required 
def publish_page_content(page_id):
    """Publish page HTML/CSS content for subdomain access"""
    # Verify page ownership
    page = Page.query.filter_by(id=page_id, user_id=current_user.id).first()
    if not page:
        return jsonify({'error': 'Page not found or access denied'}), 404
    
    try:
        data = request.get_json()
        
        # Extract final HTML and CSS from Silex
        final_html = data.get('html_content', '')
        final_css = data.get('css_content', '')
        
        if not final_html:
            return jsonify({'error': 'No HTML content to publish'}), 400
        
        # Validate HTML content
        if len(final_html) < 100:  # Too small, probably invalid
            return jsonify({'error': 'HTML content too small. Please design something first.'}), 400
            
        # Clean and optimize HTML
        cleaned_html = clean_html_for_production(final_html)
        
        # Save final HTML/CSS to database
        page.content = cleaned_html     # Clean HTML for subdomain
        page.css_data = final_css       # Final CSS (already included in HTML)
        page.is_published = True        # Mark as published
        page.updated_at = datetime.utcnow()
        
        # Also mark site as published
        if page.site:
            page.site.is_published = True
            
        db.session.commit()
        
        # 🚀 NEW: Deploy static files to subdomain directory
        deployment_result = deploy_static_website(page.site.subdomain, cleaned_html, final_css)
        
        if not deployment_result['success']:
            return jsonify({
                'error': f'Database saved but deployment failed: {deployment_result["error"]}'
            }), 500
        
        # Generate subdomain URL
        subdomain_url = f"https://{page.site.subdomain}.pagemade.site" if page.site else None
        
        return jsonify({
            'success': True,
            'message': 'Page published successfully!',
            'url': subdomain_url,
            'page_title': page.title,
            'published_at': page.updated_at.isoformat(),
            'deployment_info': deployment_result.get('info', {})
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Publish failed: {str(e)}'}), 500

# =============================================================================
# NEW: SILEX STATIC FILES SERVING
# =============================================================================

@main_bp.route('/pagemade-integration.js')
def serve_pagemade_integration():
    """Serve PageMade integration JavaScript file"""
    try:
        js_path = os.path.join(current_app.root_path, '..', 'core', 'Silex', 'pagemade-integration.js')
        if os.path.exists(js_path):
            with open(js_path, 'r', encoding='utf-8') as f:
                js_content = f.read()
            
            response = Response(js_content, mimetype='application/javascript')
            response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
            response.headers['Pragma'] = 'no-cache'
            response.headers['Expires'] = '0'
            return response
        else:
            abort(404)
    except Exception as e:
        print(f"Error serving pagemade-integration.js: {e}")
        abort(500)

@main_bp.route('/pagemade-loader.js')
def serve_pagemade_loader():
    """Serve PageMade loader JavaScript file"""
    try:
        js_path = os.path.join(current_app.root_path, '..', 'core', 'Silex', 'pagemade-loader.js')
        if os.path.exists(js_path):
            with open(js_path, 'r', encoding='utf-8') as f:
                js_content = f.read()
            
            response = Response(js_content, mimetype='application/javascript')
            response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
            response.headers['Pragma'] = 'no-cache'
            response.headers['Expires'] = '0'
            return response
        else:
            abort(404)
    except Exception as e:
        print(f"Error serving pagemade-loader.js: {e}")
        abort(500)