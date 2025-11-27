"""Database models module."""
from flask_sqlalchemy import SQLAlchemy

# Initialize db here to avoid circular imports
db = SQLAlchemy()

# Import all models for easy access
from .user import User
from .site import Site  
from .page import Page
from .asset import Asset

__all__ = ['db', 'User', 'Site', 'Page', 'Asset']
