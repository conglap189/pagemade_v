import jwt
import secrets
from datetime import datetime, timedelta
from functools import wraps
from flask import current_app, request, jsonify, g
from flask_login import current_user
from app.models.site import Site
from app.models.page import Page

class EditorTokenManager:
    """Quản lý token cho truy cập editor"""
    
    @staticmethod
    def generate_editor_token(user_id, site_id, page_id=None):
        """Tạo token cho editor access"""
        payload = {
            'user_id': user_id,
            'site_id': site_id,
            'page_id': page_id,
            'type': 'editor_access',
            'exp': datetime.utcnow() + timedelta(hours=24), # Token hết hạn sau 24h
            'iat': datetime.utcnow()
        }
        
        # Sử dụng secret key từ app config
        secret_key = current_app.config.get('SECRET_KEY', 'default-secret-key')
        token = jwt.encode(payload, secret_key, algorithm='HS256')
        
        return token
    
    @staticmethod
    def verify_editor_token(token):
        """Verify và decode editor token"""
        try:
            secret_key = current_app.config.get('SECRET_KEY', 'default-secret-key')
            payload = jwt.decode(token, secret_key, algorithms=['HS256'])
            
            # Kiểm tra token type
            if payload.get('type') != 'editor_access':
                return None
                
            return payload
            
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None

def require_editor_token(f):
    """Decorator để yêu cầu editor token"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = None
        
        # Lấy token từ header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]  # Bearer <token>
            except IndexError:
                return jsonify({'error': 'Invalid token format'}), 401
        
        # Hoặc từ query parameter
        elif 'token' in request.args:
            token = request.args.get('token')
        
        if not token:
            return jsonify({'error': 'Token is required'}), 401
        
        # Verify token
        payload = EditorTokenManager.verify_editor_token(token)
        if not payload:
            return jsonify({'error': 'Invalid or expired token'}), 401
        
        # Lưu thông tin vào g context
        g.editor_token = payload
        g.user_id = payload['user_id']
        g.site_id = payload['site_id']
        g.page_id = payload.get('page_id')
        
        return f(*args, **kwargs)
    
    return decorated_function

def check_site_permission(user_id, site_id):
    """Kiểm tra user có quyền truy cập site không"""
    site = Site.query.filter_by(id=site_id, user_id=user_id).first()
    return site is not None

def check_page_permission(user_id, page_id):
    """Kiểm tra user có quyền truy cập page không"""
    page = Page.query.filter_by(id=page_id).join(Site).filter(Site.user_id == user_id).first()
    return page is not None