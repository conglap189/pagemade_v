import os
from dotenv import load_dotenv

load_dotenv()

def get_backend_dir():
    """Get the backend directory path regardless of where script is run from"""
    # Start from this file's location and go up one level to backend root
    current_dir = os.path.dirname(os.path.abspath(__file__))
    return current_dir

def resolve_database_uri():
    """Resolve database URI with proper path handling"""
    database_url = os.environ.get('DATABASE_URL')
    
    if database_url:
        # Handle SQLite relative paths
        if database_url.startswith('sqlite:///') and not database_url.startswith('sqlite:////'):
            relative_path = database_url.replace('sqlite:///', '')
            backend_dir = get_backend_dir()
            absolute_path = os.path.join(backend_dir, relative_path)
            return f'sqlite:///{absolute_path}'
        else:
            return database_url
    
    # Default fallback
    backend_dir = get_backend_dir()
    return f'sqlite:///{os.path.join(backend_dir, "instance", "app.db")}'

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'PageMadeSecret2025!'
    SQLALCHEMY_DATABASE_URI = resolve_database_uri()
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Google OAuth
    GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')
    GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET')
    
    # App settings
    APP_NAME = 'PageMade.site'
    WTF_CSRF_ENABLED = True
    CSRF_ENABLED = True
    
    # Domain
    DOMAIN = os.environ.get('DOMAIN', 'pagemade.site')
    
    # Redis Cache Configuration
    REDIS_HOST = os.environ.get('REDIS_HOST', 'localhost')
    REDIS_PORT = int(os.environ.get('REDIS_PORT', 6379))
    REDIS_DB = int(os.environ.get('REDIS_DB', 0))
    REDIS_URL = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')

class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}