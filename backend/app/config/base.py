"""Base configuration settings."""
import os
from datetime import timedelta

# Environment variables are loaded by run.py

class Config:
    """Base configuration class."""
    
    # Security
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'PageMadeSecret2025!'
    WTF_CSRF_ENABLED = True
    CSRF_ENABLED = True
    
    # Database - Use absolute path to existing database
    # Go up two levels from app/config/ to backend root
    BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
    DB_PATH = os.path.join(BASE_DIR, 'instance', 'app.db')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or f'sqlite:///{DB_PATH}'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = False
    
    # Google OAuth
    GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')
    GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET')
    
    # Application
    APP_NAME = 'PageMade.site'
    DOMAIN = os.environ.get('DOMAIN', 'pagemade.site')
    
    # Redis Cache
    REDIS_HOST = os.environ.get('REDIS_HOST', 'localhost')
    REDIS_PORT = int(os.environ.get('REDIS_PORT', 6379))
    REDIS_DB = int(os.environ.get('REDIS_DB', 0))
    REDIS_URL = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')
    
    # File Upload
    MAX_CONTENT_LENGTH = 5 * 1024 * 1024  # 5MB
    UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), '..', 'static', 'uploads')
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
    
    # JWT Configuration
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or SECRET_KEY
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=15)  # 15 minutes
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=7)     # 7 days
    JWT_ALGORITHM = 'HS256'