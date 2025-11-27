"""Test environment configuration."""
from .base import Config


class TestConfig(Config):
    """Test configuration."""
    TESTING = True
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    WTF_CSRF_ENABLED = False
    SECRET_KEY = 'test-secret-key'
    
    # Disable OAuth for testing
    GOOGLE_CLIENT_ID = None
    GOOGLE_CLIENT_SECRET = None
    
    # Disable Redis for testing
    REDIS_HOST = None
    REDIS_PORT = None
    REDIS_DB = None
    REDIS_URL = None