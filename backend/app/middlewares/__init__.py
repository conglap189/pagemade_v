"""Middlewares package for request/response processing."""

from flask import request, g
import logging

# Initialize logger
logger = logging.getLogger(__name__)

# Import middleware classes
from .auth_middleware import (
    AuthMiddleware,
    require_api_auth,
    admin_required,
    rate_limit,
    validate_ownership
)
from .logging_middleware import (
    RequestLoggingMiddleware,
    setup_logging
)
from .error_middleware import (
    ErrorHandlingMiddleware,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    ResourceNotFoundError,
    register_custom_error_handlers
)
from .cors_middleware import (
    CORSMiddleware,
    cors_enabled,
    configure_cors
)

__all__ = [
    # Middleware classes
    'AuthMiddleware',
    'RequestLoggingMiddleware',
    'ErrorHandlingMiddleware',
    'CORSMiddleware',
    
    # Auth decorators
    'require_api_auth',
    'admin_required',
    'rate_limit',
    'validate_ownership',
    
    # Logging utilities
    'setup_logging',
    
    # Error classes
    'ValidationError',
    'AuthenticationError',
    'AuthorizationError',
    'ResourceNotFoundError',
    'register_custom_error_handlers',
    
    # CORS utilities
    'cors_enabled',
    'configure_cors'
]
