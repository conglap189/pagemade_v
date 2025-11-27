"""
JWT Authentication Middleware for API routes
Bypasses Flask-Login for API endpoints and handles JWT authentication
"""

from functools import wraps
from flask import request, jsonify, g, current_app
from app.services.jwt_service import JWTService


def jwt_api_auth(f):
    """
    Decorator for API endpoints that bypasses Flask-Login and handles JWT authentication.
    This decorator should be used instead of @jwt_required for API endpoints
    that need to bypass Flask-Login's session-based authentication.
    
    Usage:
        @sites_api_bp.route('/sites', methods=['GET'])
        @jwt_api_auth
        def get_sites():
            # User is available as g.current_user
            return jsonify({'message': 'Access granted'})
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Try to get token from cookie first (Shared Cookie approach)
        token = request.cookies.get('auth_token')
        
        # Fallback to Authorization header for backward compatibility
        if not token:
            auth_header = request.headers.get('Authorization')
            if auth_header:
                try:
                    token = auth_header.split(' ')[1]
                except IndexError:
                    pass
        
        if not token:
            return jsonify({
                'success': False,
                'error': 'Missing authentication token',
                'message': 'Please provide a JWT token in cookie or Authorization header'
            }), 401
        
        # Check if token is revoked
        if JWTService.is_token_revoked(token):
            return jsonify({
                'success': False,
                'error': 'Token has been revoked',
                'message': 'Please login again to get a new token'
            }), 401
        
        # Verify token
        payload = JWTService.verify_token(token, 'access')
        if not payload:
            return jsonify({
                'success': False,
                'error': 'Invalid or expired token',
                'message': 'Please login again to get a new token'
            }), 401
        
        # Get user from token
        user = JWTService.get_user_from_token(token)
        if not user:
            return jsonify({
                'success': False,
                'error': 'User not found',
                'message': 'The user associated with this token no longer exists'
            }), 401
        
        # Add user to request context (both g and request for compatibility)
        g.current_user = user
        request.current_user = user
        g.jwt_payload = payload
        request.jwt_payload = payload
        
        # Bypass Flask-Login by setting user in session temporarily
        # This prevents Flask-Login from triggering unauthorized handler
        from flask import session
        session['_user_id'] = user.id
        
        return f(*args, **kwargs)
    
    return decorated_function


def setup_jwt_bypass(app):
    """
    Set up JWT authentication bypass for API routes.
    This function should be called during app initialization.
    """
    @app.before_request
    def handle_jwt_auth():
        # Only process API routes
        if not request.path.startswith('/api/'):
            return None
        
        # Skip authentication for login and refresh endpoints
        if request.path in ['/api/auth/login', '/api/auth/refresh']:
            return None
        
        # Try to get token from cookie first (Shared Cookie approach)
        token = request.cookies.get('auth_token')
        
        # Fallback to Authorization header for backward compatibility
        if not token:
            auth_header = request.headers.get('Authorization')
            if auth_header and auth_header.startswith('Bearer '):
                try:
                    token = auth_header.split(' ')[1]
                except IndexError:
                    token = None
        
        if not token:
            return None  # Let the endpoint handle authentication
        
        try:
            # Verify token
            payload = JWTService.verify_token(token, 'access')
            if payload:
                user = JWTService.get_user_from_token(token)
                if user:
                    # Set user in Flask-Login context to bypass unauthorized handler
                    from flask_login import login_user
                    login_user(user)
                    
                    # Add user to request context
                    g.current_user = user
                    request.current_user = user
                    g.jwt_payload = payload
                    request.jwt_payload = payload
        except Exception as e:
            current_app.logger.error(f"JWT bypass error: {e}")
            pass  # Let the endpoint handle authentication
        
        return None