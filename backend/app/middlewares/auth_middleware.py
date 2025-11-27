"""Authentication middleware for request validation."""

from flask import request, jsonify, g, session
from flask_login import current_user
from functools import wraps
import logging

logger = logging.getLogger(__name__)


def require_api_auth(f):
    """
    Decorator for API endpoints that require authentication.
    Validates JWT token or session authentication.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Check if user is authenticated via Flask-Login
        if current_user.is_authenticated:
            g.user = current_user
            return f(*args, **kwargs)
        
        # Check for API token in headers
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            # TODO: Implement JWT token validation
            # For now, rely on Flask-Login session
            logger.warning("JWT token provided but not yet implemented")
        
        # Not authenticated
        if request.path.startswith('/api/'):
            return jsonify({
                'success': False,
                'error': 'Authentication required',
                'message': 'Please login to access this endpoint'
            }), 401
        
        # For non-API routes, Flask-Login will handle redirect
        return f(*args, **kwargs)
    
    return decorated_function


def admin_required(f):
    """
    Decorator for admin-only endpoints.
    Must be used after @login_required.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated:
            if request.path.startswith('/api/'):
                return jsonify({
                    'success': False,
                    'error': 'Authentication required',
                    'message': 'Please login first'
                }), 401
            return jsonify({'error': 'Authentication required'}), 401
        
        if not current_user.is_admin:
            if request.path.startswith('/api/'):
                return jsonify({
                    'success': False,
                    'error': 'Admin access required',
                    'message': 'You do not have permission to access this resource'
                }), 403
            return jsonify({'error': 'Admin access required'}), 403
        
        g.admin_user = current_user
        return f(*args, **kwargs)
    
    return decorated_function


def rate_limit(max_requests=100, window_seconds=60):
    """
    Simple rate limiting decorator.
    
    Args:
        max_requests: Maximum requests allowed in window
        window_seconds: Time window in seconds
        
    Note: This is a basic implementation. For production,
          consider using Flask-Limiter or Redis-based solution.
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # TODO: Implement actual rate limiting with Redis
            # For now, just pass through
            return f(*args, **kwargs)
        
        return decorated_function
    return decorator


def check_user_ownership(resource_user_id):
    """
    Helper function to check if current user owns a resource.
    
    Args:
        resource_user_id: User ID of the resource owner
        
    Returns:
        bool: True if user owns resource or is admin
    """
    if not current_user.is_authenticated:
        return False
    
    # Admin can access everything
    if current_user.is_admin:
        return True
    
    # Check ownership
    return current_user.id == resource_user_id


def validate_ownership(get_resource_user_id):
    """
    Decorator to validate resource ownership before allowing access.
    
    Args:
        get_resource_user_id: Function that takes request args and returns user_id
        
    Example:
        @validate_ownership(lambda: Site.query.get(site_id).user_id)
        def edit_site(site_id):
            ...
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            try:
                resource_user_id = get_resource_user_id(*args, **kwargs)
                
                if not check_user_ownership(resource_user_id):
                    if request.path.startswith('/api/'):
                        return jsonify({
                            'success': False,
                            'error': 'Access denied',
                            'message': 'You do not own this resource'
                        }), 403
                    return jsonify({'error': 'Access denied'}), 403
                
                return f(*args, **kwargs)
                
            except Exception as e:
                logger.error(f"Ownership validation error: {e}")
                return jsonify({
                    'success': False,
                    'error': 'Validation error',
                    'message': str(e)
                }), 500
        
        return decorated_function
    return decorator


class AuthMiddleware:
    """
    Flask middleware for global authentication handling.
    """
    
    def __init__(self, app=None):
        self.app = app
        if app:
            self.init_app(app)
    
    def init_app(self, app):
        """Initialize middleware with Flask app."""
        app.before_request(self.before_request)
        app.after_request(self.after_request)
    
    def before_request(self):
        """Process request before routing."""
        # Store request start time for logging
        g.request_start_time = request.headers.get('X-Request-Start')
        
        # Log API requests
        if request.path.startswith('/api/'):
            logger.info(f"API Request: {request.method} {request.path}")
            
            # Store user info in g for easy access
            if current_user.is_authenticated:
                g.user_id = current_user.id
                g.user_email = current_user.email
                g.is_admin = current_user.is_admin
        
        # Add request ID for tracking (if not present)
        if not hasattr(g, 'request_id'):
            import uuid
            g.request_id = str(uuid.uuid4())
    
    def after_request(self, response):
        """Process response before sending."""
        # Add security headers
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'SAMEORIGIN'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        
        # Add request ID to response headers
        if hasattr(g, 'request_id'):
            response.headers['X-Request-ID'] = g.request_id
        
        # Log API responses
        if request.path.startswith('/api/'):
            logger.info(
                f"API Response: {request.method} {request.path} "
                f"- Status: {response.status_code}"
            )
        
        return response
