"""Blueprints package for route modules."""

from .auth import auth_bp
from .sites import sites_bp
from .pages import pages_bp
from .assets import assets_bp
from .admin import admin_bp

__all__ = [
    'auth_bp',
    'sites_bp',
    'pages_bp',
    'assets_bp',
    'admin_bp'
]
