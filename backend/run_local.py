#!/usr/bin/env python3
"""
Local development server for PageMade
Run with: python run_local.py
"""

import os
from dotenv import load_dotenv

# Load local environment
load_dotenv('.env.local')

from app import create_app

# Create Flask app with development config
app = create_app('development')

if __name__ == '__main__':
    print("🚀 Starting PageMade Local Development Server...")
    print("📍 URL: http://localhost:5000")
    print("🐛 Debug mode: ON")
    print("💾 Database: SQLite (local)")
    print("⏹️  Press Ctrl+C to stop")
    print("-" * 50)
    
    # Run with debug mode
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True,
        use_reloader=True,
        threaded=True
    )