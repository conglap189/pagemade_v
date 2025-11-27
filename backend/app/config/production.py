"""Production environment configuration."""
from .base import Config

class ProductionConfig(Config):
    """Production configuration."""
    DEBUG = False
    TESTING = False
    SQLALCHEMY_ECHO = False
    
    # Production-specific settings can be added here
    # e.g., different database, stricter security, etc.
