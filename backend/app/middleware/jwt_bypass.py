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
        
        # Add user to request context
        g.current_user = user
        g.jwt_payload = payload
        
        # Bypass Flask-Login by setting user in session temporarily
        # This prevents Flask-Login from triggering unauthorized handler
        from flask import session
        session['_user_id'] = user.id
        
        return f(*args, **kwargs)
    
    return decorated_function


def setup_jwt_bypass(app):
    """
    Set up JWT authentication bypass for both API routes and web routes.
    This function should be called during app initialization.
    
    Key feature: Auto-login users from JWT cookie when accessing web routes
    (e.g., /dashboard) after logging in via frontend (localhost:3000).
    """
    
    # Web routes that need JWT-to-session authentication
    # These routes use @login_required but should accept JWT cookie auth
    PROTECTED_WEB_ROUTES = [
        '/dashboard',
        '/new-site',
        '/site/',
        '/editor/',
        '/page/',
        '/profile',
        '/change-password',
        '/admin/',
        '/assets/',
    ]
    
    @app.before_request
    def handle_jwt_auth():
        from flask_login import current_user
        
        # Skip if user already authenticated via session
        if current_user.is_authenticated:
            return None
        
        # Check if this is a protected route (API or web)
        is_api_route = request.path.startswith('/api/')
        is_protected_web_route = any(
            request.path.startswith(route) for route in PROTECTED_WEB_ROUTES
        )
        
        # Only process API routes or protected web routes
        if not is_api_route and not is_protected_web_route:
            return None
        
        # Skip authentication for login and public endpoints
        skip_paths = ['/api/auth/login', '/api/auth/refresh', '/api/auth/signup', '/login', '/register']
        if request.path in skip_paths:
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
            return None  # Let the endpoint/decorator handle authentication
        
        try:
            # Verify token
            payload = JWTService.verify_token(token, 'access')
            if payload:
                # Check if token is revoked
                if JWTService.is_token_revoked(token):
                    current_app.logger.warning("JWT token is revoked")
                    return None
                
                user = JWTService.get_user_from_token(token)
                if user:
                    # Set user in Flask-Login context
                    # This is the KEY: login_user() creates the session
                    # so @login_required will pass on web routes
                    from flask_login import login_user
                    login_user(user, remember=True)
                    
                    # Add user to request context for API compatibility
                    g.current_user = user
                    g.jwt_payload = payload
                    
                    current_app.logger.debug(f"JWT auto-login: {user.email} for {request.path}")
        except Exception as e:
            current_app.logger.error(f"JWT bypass error: {e}")
            pass  # Let the endpoint handle authentication
        
        return None