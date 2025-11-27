"""CORS middleware for handling cross-origin requests."""

from flask import request, make_response
from functools import wraps
import logging

logger = logging.getLogger(__name__)


class CORSMiddleware:
    """
    CORS (Cross-Origin Resource Sharing) middleware.
    Handles preflight requests and adds CORS headers to responses.
    """
    
    def __init__(self, app=None, config=None):
        self.app = app
        self.config = config or {}
        
        # Default configuration
        self.allowed_origins = self.config.get('CORS_ALLOWED_ORIGINS', [
            'http://localhost:3000',  # Next.js dev
            'http://localhost:5000',  # Flask dev
            'http://127.0.0.1:3000',
            'http://127.0.0.1:5000'
        ])
        
        self.allowed_methods = self.config.get('CORS_ALLOWED_METHODS', [
            'GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'
        ])
        
        self.allowed_headers = self.config.get('CORS_ALLOWED_HEADERS', [
            'Content-Type',
            'Authorization',
            'X-Requested-With',
            'X-CSRF-Token'
        ])
        
        self.expose_headers = self.config.get('CORS_EXPOSE_HEADERS', [
            'X-Request-ID',
            'X-Total-Count',
            'X-Page-Count'
        ])
        
        self.max_age = self.config.get('CORS_MAX_AGE', 3600)  # 1 hour
        self.supports_credentials = self.config.get('CORS_SUPPORTS_CREDENTIALS', True)
        
        if app:
            self.init_app(app)
    
    def init_app(self, app):
        """Initialize CORS middleware with Flask app."""
        # Load config from app
        if app.config.get('CORS_ALLOWED_ORIGINS'):
            self.allowed_origins = app.config['CORS_ALLOWED_ORIGINS']
        
        # Register handlers
        app.before_request(self.handle_preflight)
        app.after_request(self.add_cors_headers)
        
        logger.info(f"✅ CORS middleware initialized")
        logger.info(f"Allowed origins: {self.allowed_origins}")
    
    def _get_origin(self):
        """Get the origin from the request headers."""
        return request.headers.get('Origin')
    
    def _is_origin_allowed(self, origin):
        """
        Check if the origin is allowed.
        
        Args:
            origin: Origin URL from request header
            
        Returns:
            bool: True if origin is allowed
        """
        if not origin:
            return False
        
        # Allow all origins if configured
        if '*' in self.allowed_origins:
            return True
        
        # Check exact match
        if origin in self.allowed_origins:
            return True
        
        # Check wildcard patterns (e.g., *.example.com)
        for allowed in self.allowed_origins:
            if allowed.startswith('*.'):
                domain = allowed[2:]
                if origin.endswith(domain):
                    return True
        
        return False
    
    def handle_preflight(self):
        """
        Handle CORS preflight requests (OPTIONS).
        
        Returns:
            Response for OPTIONS requests, None otherwise
        """
        if request.method == 'OPTIONS':
            origin = self._get_origin()
            
            if not self._is_origin_allowed(origin):
                logger.warning(f"CORS: Blocked preflight from {origin}")
                return make_response('', 403)
            
            response = make_response('', 204)
            
            # Add CORS headers
            response.headers['Access-Control-Allow-Origin'] = origin
            response.headers['Access-Control-Allow-Methods'] = ', '.join(self.allowed_methods)
            response.headers['Access-Control-Allow-Headers'] = ', '.join(self.allowed_headers)
            response.headers['Access-Control-Max-Age'] = str(self.max_age)
            
            if self.supports_credentials:
                response.headers['Access-Control-Allow-Credentials'] = 'true'
            
            logger.debug(f"CORS: Preflight from {origin} - OK")
            return response
        
        return None
    
    def add_cors_headers(self, response):
        """
        Add CORS headers to response.
        
        Args:
            response: Flask response object
            
        Returns:
            Modified response with CORS headers
        """
        origin = self._get_origin()
        
        # Skip if no origin or not allowed
        if not origin or not self._is_origin_allowed(origin):
            if origin:
                logger.debug(f"CORS: Origin {origin} not allowed")
            return response
        
        # Add CORS headers
        response.headers['Access-Control-Allow-Origin'] = origin
        
        if self.supports_credentials:
            response.headers['Access-Control-Allow-Credentials'] = 'true'
        
        if self.expose_headers:
            response.headers['Access-Control-Expose-Headers'] = ', '.join(self.expose_headers)
        
        # Vary header for caching
        vary = response.headers.get('Vary', '')
        if 'Origin' not in vary:
            response.headers['Vary'] = f"{vary}, Origin".strip(', ')
        
        return response


def cors_enabled(origins=None, methods=None, headers=None):
    """
    Decorator to enable CORS for specific routes.
    
    Args:
        origins: List of allowed origins (optional)
        methods: List of allowed methods (optional)
        headers: List of allowed headers (optional)
        
    Returns:
        Decorated function with CORS headers
        
    Example:
        @app.route('/api/public')
        @cors_enabled(origins=['https://example.com'])
        def public_api():
            return jsonify({'data': 'public'})
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Handle preflight
            if request.method == 'OPTIONS':
                response = make_response('', 204)
                
                origin = request.headers.get('Origin')
                allowed_origins = origins or ['*']
                
                if origin in allowed_origins or '*' in allowed_origins:
                    response.headers['Access-Control-Allow-Origin'] = origin or '*'
                    response.headers['Access-Control-Allow-Methods'] = ', '.join(
                        methods or ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
                    )
                    response.headers['Access-Control-Allow-Headers'] = ', '.join(
                        headers or ['Content-Type', 'Authorization']
                    )
                    response.headers['Access-Control-Max-Age'] = '3600'
                
                return response
            
            # Execute route
            response = make_response(f(*args, **kwargs))
            
            # Add CORS headers to response
            origin = request.headers.get('Origin')
            allowed_origins = origins or ['*']
            
            if origin in allowed_origins or '*' in allowed_origins:
                response.headers['Access-Control-Allow-Origin'] = origin or '*'
                
                if methods:
                    response.headers['Access-Control-Allow-Methods'] = ', '.join(methods)
            
            return response
        
        return decorated_function
    return decorator


def configure_cors(app):
    """
    Configure CORS for the Flask application.
    
    Args:
        app: Flask application instance
        
    Example:
        from app.middlewares.cors_middleware import configure_cors
        
        app = Flask(__name__)
        configure_cors(app)
    """
    # Get CORS configuration from app config
    cors_config = {
        'CORS_ALLOWED_ORIGINS': app.config.get('CORS_ALLOWED_ORIGINS', [
            'http://localhost:3000',
            'http://localhost:5000',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:5000'
        ]),
        'CORS_ALLOWED_METHODS': app.config.get('CORS_ALLOWED_METHODS', [
            'GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'
        ]),
        'CORS_ALLOWED_HEADERS': app.config.get('CORS_ALLOWED_HEADERS', [
            'Content-Type',
            'Authorization',
            'X-Requested-With',
            'X-CSRF-Token'
        ]),
        'CORS_EXPOSE_HEADERS': app.config.get('CORS_EXPOSE_HEADERS', [
            'X-Request-ID',
            'X-Total-Count',
            'X-Page-Count'
        ]),
        'CORS_MAX_AGE': app.config.get('CORS_MAX_AGE', 3600),
        'CORS_SUPPORTS_CREDENTIALS': app.config.get('CORS_SUPPORTS_CREDENTIALS', True)
    }
    
    # Initialize middleware
    cors_middleware = CORSMiddleware(app, cors_config)
    
    logger.info("✅ CORS configured successfully")
    
    return cors_middleware
