"""Logging middleware for request/response tracking."""

from flask import request, g
import logging
import time
import json
from datetime import datetime

# Configure logger
logger = logging.getLogger(__name__)


class RequestLoggingMiddleware:
    """
    Middleware for comprehensive request/response logging.
    Tracks request details, timing, and errors.
    """
    
    def __init__(self, app=None):
        self.app = app
        if app:
            self.init_app(app)
    
    def init_app(self, app):
        """Initialize middleware with Flask app."""
        app.before_request(self.log_request)
        app.after_request(self.log_response)
        app.teardown_request(self.teardown_request)
    
    def log_request(self):
        """Log incoming request details."""
        # Start timing
        g.start_time = time.time()
        
        # Prepare request data
        request_data = {
            'timestamp': datetime.utcnow().isoformat(),
            'method': request.method,
            'path': request.path,
            'query_params': dict(request.args),
            'remote_addr': request.remote_addr,
            'user_agent': request.headers.get('User-Agent', 'Unknown'),
        }
        
        # Add user info if authenticated
        from flask_login import current_user
        if current_user.is_authenticated:
            request_data['user_id'] = current_user.id
            request_data['user_email'] = current_user.email
        
        # Log request body for POST/PUT (excluding sensitive data)
        if request.method in ['POST', 'PUT', 'PATCH']:
            if request.is_json:
                try:
                    body = request.get_json()
                    # Remove sensitive fields
                    sanitized_body = self._sanitize_data(body)
                    request_data['body'] = sanitized_body
                except:
                    request_data['body'] = '<non-json data>'
            elif request.form:
                sanitized_form = self._sanitize_data(dict(request.form))
                request_data['body'] = sanitized_form
        
        # Store in g for later use
        g.request_data = request_data
        
        # Log request
        logger.info(
            f"→ {request.method} {request.path} "
            f"from {request.remote_addr}"
        )
        
        # Detailed debug logging
        logger.debug(f"Request details: {json.dumps(request_data, indent=2)}")
    
    def log_response(self, response):
        """Log outgoing response details."""
        # Calculate request duration
        duration = None
        if hasattr(g, 'start_time'):
            duration = time.time() - g.start_time
        
        # Prepare response data
        response_data = {
            'status_code': response.status_code,
            'duration_ms': round(duration * 1000, 2) if duration else None,
            'content_type': response.content_type,
            'content_length': response.content_length,
        }
        
        # Log response
        log_level = logging.INFO
        if response.status_code >= 500:
            log_level = logging.ERROR
        elif response.status_code >= 400:
            log_level = logging.WARNING
        
        logger.log(
            log_level,
            f"← {request.method} {request.path} "
            f"- {response.status_code} "
            f"({response_data['duration_ms']}ms)"
        )
        
        # Debug logging for response body (API only)
        if request.path.startswith('/api/') and response.status_code >= 400:
            try:
                if response.is_json:
                    body = response.get_json()
                    logger.debug(f"Response body: {json.dumps(body, indent=2)}")
            except:
                pass
        
        return response
    
    def teardown_request(self, exception=None):
        """Log any exceptions that occurred during request."""
        if exception:
            logger.error(
                f"Request failed: {request.method} {request.path}",
                exc_info=exception
            )
    
    def _sanitize_data(self, data):
        """
        Remove sensitive information from logged data.
        
        Args:
            data: Dictionary to sanitize
            
        Returns:
            Dictionary with sensitive fields masked
        """
        if not isinstance(data, dict):
            return data
        
        sensitive_fields = [
            'password', 'password_hash', 'token', 'secret',
            'api_key', 'private_key', 'access_token', 'refresh_token'
        ]
        
        sanitized = {}
        for key, value in data.items():
            if any(field in key.lower() for field in sensitive_fields):
                sanitized[key] = '***REDACTED***'
            elif isinstance(value, dict):
                sanitized[key] = self._sanitize_data(value)
            else:
                sanitized[key] = value
        
        return sanitized


class PerformanceMonitor:
    """
    Monitor application performance and slow queries.
    """
    
    SLOW_REQUEST_THRESHOLD = 1.0  # seconds
    
    @staticmethod
    def log_slow_request(duration, method, path):
        """Log slow requests for optimization."""
        if duration > PerformanceMonitor.SLOW_REQUEST_THRESHOLD:
            logger.warning(
                f"⚠️  SLOW REQUEST: {method} {path} "
                f"took {duration:.2f}s "
                f"(threshold: {PerformanceMonitor.SLOW_REQUEST_THRESHOLD}s)"
            )
    
    @staticmethod
    def monitor_database_queries():
        """Monitor and log database query performance."""
        # TODO: Implement SQLAlchemy query logging
        # This would track N+1 queries and slow queries
        pass


def setup_logging(app):
    """
    Configure application logging.
    
    Args:
        app: Flask application instance
    """
    import os
    
    # Create logs directory if it doesn't exist
    log_dir = os.path.join(app.root_path, '..', 'logs')
    os.makedirs(log_dir, exist_ok=True)
    
    # Configure logging format
    log_format = logging.Formatter(
        '[%(asctime)s] %(levelname)s in %(module)s: %(message)s'
    )
    
    # File handler for all logs
    all_logs_file = os.path.join(log_dir, 'app.log')
    file_handler = logging.FileHandler(all_logs_file)
    file_handler.setLevel(logging.INFO)
    file_handler.setFormatter(log_format)
    
    # File handler for errors only
    error_logs_file = os.path.join(log_dir, 'errors.log')
    error_handler = logging.FileHandler(error_logs_file)
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(log_format)
    
    # Console handler (for development)
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.DEBUG if app.debug else logging.INFO)
    console_handler.setFormatter(log_format)
    
    # Add handlers to app logger
    app.logger.addHandler(file_handler)
    app.logger.addHandler(error_handler)
    app.logger.addHandler(console_handler)
    
    # Set log level
    app.logger.setLevel(logging.DEBUG if app.debug else logging.INFO)
    
    app.logger.info(f"✅ Logging configured - Logs dir: {log_dir}")
    
    return app.logger
