"""Configuration module for the application."""
from .base import Config
from .development import DevelopmentConfig
from .production import ProductionConfig

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}

__all__ = ['Config', 'DevelopmentConfig', 'ProductionConfig', 'config']
