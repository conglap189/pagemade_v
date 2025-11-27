"""Error handling middleware for global exception management."""

from flask import jsonify, render_template, request
from werkzeug.exceptions import HTTPException
import logging
import traceback

logger = logging.getLogger(__name__)


class ErrorHandlingMiddleware:
    """
    Global error handler for all exceptions.
    Provides consistent error responses across the application.
    """
    
    def __init__(self, app=None):
        self.app = app
        if app:
            self.init_app(app)
    
    def init_app(self, app):
        """Initialize error handlers with Flask app."""
        # Register error handlers
        app.register_error_handler(400, self.handle_bad_request)
        app.register_error_handler(401, self.handle_unauthorized)
        app.register_error_handler(403, self.handle_forbidden)
        app.register_error_handler(404, self.handle_not_found)
        app.register_error_handler(405, self.handle_method_not_allowed)
        app.register_error_handler(500, self.handle_internal_error)
        
        # Generic handlers
        app.register_error_handler(HTTPException, self.handle_http_exception)
        app.register_error_handler(Exception, self.handle_exception)
    
    def _is_api_request(self):
        """Check if current request is an API request."""
        return (
            request.path.startswith('/api/') or
            request.path.startswith('/auth/api/') or
            request.headers.get('Accept') == 'application/json' or
            request.is_json
        )
    
    def _format_error_response(self, error_code, message, details=None):
        """
        Format error response based on request type.
        
        Args:
            error_code: HTTP status code
            message: Error message
            details: Optional additional details
            
        Returns:
            Response object (JSON or HTML)
        """
        if self._is_api_request():
            response_data = {
                'success': False,
                'error': message,
                'status_code': error_code
            }
            
            if details:
                response_data['details'] = details
            
            # Add stack trace in debug mode
            if self.app and self.app.debug and details:
                response_data['traceback'] = details
            
            return jsonify(response_data), error_code
        
        # HTML response for web requests
        try:
            return render_template(
                f'errors/{error_code}.html',
                error_message=message
            ), error_code
        except:
            # Fallback if template doesn't exist
            return render_template(
                'errors/generic.html',
                error_code=error_code,
                error_message=message
            ), error_code
    
    def handle_bad_request(self, error):
        """Handle 400 Bad Request errors."""
        logger.warning(f"Bad Request: {request.path} - {error}")
        return self._format_error_response(
            400,
            'Bad Request - Invalid input data',
            str(error) if self.app and self.app.debug else None
        )
    
    def handle_unauthorized(self, error):
        """Handle 401 Unauthorized errors."""
        logger.warning(f"Unauthorized access: {request.path}")
        return self._format_error_response(
            401,
            'Authentication required - Please login first'
        )
    
    def handle_forbidden(self, error):
        """Handle 403 Forbidden errors."""
        logger.warning(f"Forbidden access: {request.path}")
        return self._format_error_response(
            403,
            'Access denied - You do not have permission to access this resource'
        )
    
    def handle_not_found(self, error):
        """Handle 404 Not Found errors."""
        logger.info(f"Not found: {request.path}")
        return self._format_error_response(
            404,
            'Resource not found - The requested page does not exist'
        )
    
    def handle_method_not_allowed(self, error):
        """Handle 405 Method Not Allowed errors."""
        logger.warning(
            f"Method not allowed: {request.method} {request.path}"
        )
        return self._format_error_response(
            405,
            f'Method {request.method} not allowed for this endpoint'
        )
    
    def handle_internal_error(self, error):
        """Handle 500 Internal Server errors."""
        logger.error(
            f"Internal server error: {request.path}",
            exc_info=error
        )
        
        # Get detailed error info in debug mode
        details = None
        if self.app and self.app.debug:
            details = traceback.format_exc()
        
        return self._format_error_response(
            500,
            'Internal server error - Something went wrong',
            details
        )
    
    def handle_http_exception(self, error):
        """Handle all HTTP exceptions."""
        logger.warning(f"HTTP Exception: {error.code} - {request.path}")
        
        return self._format_error_response(
            error.code,
            error.description or f'HTTP Error {error.code}'
        )
    
    def handle_exception(self, error):
        """Handle all uncaught exceptions."""
        logger.error(
            f"Unhandled exception: {request.path}",
            exc_info=error
        )
        
        # Get detailed error info in debug mode
        details = None
        if self.app and self.app.debug:
            details = traceback.format_exc()
        
        return self._format_error_response(
            500,
            'An unexpected error occurred',
            details
        )


class ValidationError(Exception):
    """Custom exception for validation errors."""
    
    def __init__(self, message, field=None, status_code=400):
        super().__init__(message)
        self.message = message
        self.field = field
        self.status_code = status_code


class AuthenticationError(Exception):
    """Custom exception for authentication errors."""
    
    def __init__(self, message, status_code=401):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


class AuthorizationError(Exception):
    """Custom exception for authorization errors."""
    
    def __init__(self, message, status_code=403):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


class ResourceNotFoundError(Exception):
    """Custom exception for resource not found errors."""
    
    def __init__(self, resource_type, resource_id, status_code=404):
        message = f"{resource_type} with ID {resource_id} not found"
        super().__init__(message)
        self.message = message
        self.resource_type = resource_type
        self.resource_id = resource_id
        self.status_code = status_code


def register_custom_error_handlers(app):
    """
    Register handlers for custom exceptions.
    
    Args:
        app: Flask application instance
    """
    
    @app.errorhandler(ValidationError)
    def handle_validation_error(error):
        """Handle validation errors."""
        logger.warning(f"Validation error: {error.message}")
        
        response_data = {
            'success': False,
            'error': 'Validation error',
            'message': error.message
        }
        
        if error.field:
            response_data['field'] = error.field
        
        return jsonify(response_data), error.status_code
    
    @app.errorhandler(AuthenticationError)
    def handle_authentication_error(error):
        """Handle authentication errors."""
        logger.warning(f"Authentication error: {error.message}")
        
        return jsonify({
            'success': False,
            'error': 'Authentication failed',
            'message': error.message
        }), error.status_code
    
    @app.errorhandler(AuthorizationError)
    def handle_authorization_error(error):
        """Handle authorization errors."""
        logger.warning(f"Authorization error: {error.message}")
        
        return jsonify({
            'success': False,
            'error': 'Access denied',
            'message': error.message
        }), error.status_code
    
    @app.errorhandler(ResourceNotFoundError)
    def handle_resource_not_found(error):
        """Handle resource not found errors."""
        logger.info(f"Resource not found: {error.message}")
        
        return jsonify({
            'success': False,
            'error': 'Resource not found',
            'message': error.message,
            'resource_type': error.resource_type,
            'resource_id': error.resource_id
        }), error.status_code
    
    app.logger.info("✅ Custom error handlers registered")
