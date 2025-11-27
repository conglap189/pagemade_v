#!/bin/bash
# PageMade Development Server Starter
# Portable script that works from any directory

set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Change to backend directory
cd "$SCRIPT_DIR"

# Check if virtual environment exists
if [ -d "venv" ]; then
    echo "🔧 Using virtual environment..."
    . venv/bin/activate
else
    echo "❌ Virtual environment not found. Creating one..."
    python3 -m venv venv
    . venv/bin/activate
    
    echo "📦 Installing dependencies..."
    pip install Flask==2.3.3 Flask-SQLAlchemy==3.0.5 Flask-Login==0.6.3 Flask-Migrate==4.0.5 flask-cors==6.0.1 python-dotenv==1.0.0 Authlib==1.2.1 requests==2.31.0 redis==5.0.0
fi

# Activate virtual environment
echo "🔄 Activating virtual environment..."
source venv/bin/activate

# Check if instance directory exists
if [ ! -d "instance" ]; then
    echo "📁 Creating instance directory..."
    mkdir -p instance
fi

# Start development server
echo "🚀 Starting PageMade Development Server..."
echo "📍 Backend Directory: $SCRIPT_DIR"
echo "🌐 URL: http://localhost:5000"
echo "⏹️  Press Ctrl+C to stop"
echo "=" * 60

python run.py --local