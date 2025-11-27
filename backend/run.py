#!/usr/bin/env python3
"""
PageMade Application Runner
Supports both development and production modes

Usage:
    python run.py              # Production mode (default)
    python run.py --local      # Development mode
    python run.py --dev        # Development mode (alias)
"""

import os
import sys
from dotenv import load_dotenv
from app import create_app


def main():
    """Run the Flask application with appropriate configuration"""
    
    # Ensure we're running from the backend directory
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(backend_dir)
    
    # Check for development mode
    is_dev = '--local' in sys.argv or '--dev' in sys.argv
    
    if is_dev:
        # Development mode
        env_file = 'config/.env.local'
        config_name = 'development'
        
        # Load local environment
        if os.path.exists(env_file):
            load_dotenv(env_file)
        
        print("🚀 Starting PageMade Local Development Server...")
        print("=" * 60)
        print(f"📍 Working Dir: {os.getcwd()}")
        print("📍 URL:      http://localhost:5000")
        print("🐛 Debug:    ON")
        print("💾 Database: SQLite (local)")
        print("📝 Logs:     logs/flask.log")
        print("⏹️  Press Ctrl+C to stop")
        print("=" * 60)
    else:
        # Production mode
        env_file = 'config/.env.production'
        config_name = 'production'
        
        # Load production environment
        if os.path.exists(env_file):
            load_dotenv(env_file)
        
        print("🚀 Starting PageMade Production Server...")
        print("=" * 60)
        print("📍 Server:   Production")
        print("🐛 Debug:    OFF")
        print("💾 Database: Production DB")
        print("=" * 60)
    
    # Create app with appropriate config
    app = create_app(config_name)
    
    # Run server
    app.run(
        host='0.0.0.0',
        port=int(os.environ.get('PORT', 5000)),
        debug=is_dev
    )


if __name__ == "__main__":
    main()