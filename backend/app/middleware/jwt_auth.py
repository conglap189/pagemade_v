"""
JWT Authentication Middleware
Handles JWT token validation for API endpoints
"""

from functools import wraps
from flask import request, jsonify, current_app
from app.services.jwt_service import JWTService


def jwt_required(f):
    """
    Decorator to require JWT authentication for API endpoints
    
    Usage:
        @api_bp.route('/protected')
        @jwt_required
        def protected_endpoint():
            return jsonify({'message': 'Access granted'})
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Get token from Authorization header
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return jsonify({'error': 'Missing authorization header'}), 401
        
        # Extract token from "Bearer <token>" format
        try:
            token = auth_header.split(' ')[1]
        except IndexError:
            return jsonify({'error': 'Invalid authorization header format'}), 401
        
        # Check if token is revoked
        if JWTService.is_token_revoked(token):
            return jsonify({'error': 'Token has been revoked'}), 401
        
        # Verify token
        payload = JWTService.verify_token(token, 'access')
        if not payload:
            return jsonify({'error': 'Invalid or expired token'}), 401
        
        # Get user from token
        user = JWTService.get_user_from_token(token)
        if not user:
            return jsonify({'error': 'User not found'}), 401
        
        # Add user to request context
        request.current_user = user
        request.jwt_payload = payload
        
        return f(*args, **kwargs)
    
    return decorated_function


def optional_jwt(f):
    """
    Decorator for optional JWT authentication
    Allows access without token but processes token if provided
    
    Usage:
        @api_bp.route('/optional-protected')
        @optional_jwt
        def optional_endpoint():
            if hasattr(request, 'current_user'):
                return jsonify({'message': 'Authenticated', 'user': request.current_user.email})
            else:
                return jsonify({'message': 'Anonymous access'})
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Try to get token from Authorization header
        auth_header = request.headers.get('Authorization')
        
        if auth_header:
            try:
                token = auth_header.split(' ')[1]
                
                # Check if token is revoked
                if not JWTService.is_token_revoked(token):
                    # Verify token
                    payload = JWTService.verify_token(token, 'access')
                    if payload:
                        # Get user from token
                        user = JWTService.get_user_from_token(token)
                        if user:
                            # Add user to request context
                            request.current_user = user
                            request.jwt_payload = payload
            except (IndexError, Exception):
                # Ignore errors for optional auth
                pass
        
        return f(*args, **kwargs)
    
    return decorated_function


def role_required(required_role: str):
    """
    Decorator factory to require specific user role
    
    Usage:
        @api_bp.route('/admin-only')
        @jwt_required
        @role_required('admin')
        def admin_endpoint():
            return jsonify({'message': 'Admin access granted'})
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Check if user is authenticated
            if not hasattr(request, 'current_user'):
                return jsonify({'error': 'Authentication required'}), 401
            
            # Check user role
            if request.current_user.role != required_role:
                return jsonify({'error': f'{required_role} role required'}), 403
            
            return f(*args, **kwargs)
        
        return decorated_function
    
    return decorator


def admin_required(f):
    """
    Decorator to require admin role
    
    Usage:
        @api_bp.route('/admin-only')
        @jwt_required
        @admin_required
        def admin_endpoint():
            return jsonify({'message': 'Admin access granted'})
    """
    return role_required('admin')(f)