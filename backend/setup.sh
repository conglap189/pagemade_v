#!/bin/bash

# AutoLandingPage Quick Start Script

echo "🚀 AutoLandingPage Setup"
echo "========================"

# Check if virtual environment exists
if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv .venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source .venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Initialize database
echo "Initializing database..."
python -c "from app import app, db; app.app_context().push(); db.create_all(); print('Database initialized!')"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  Please set up your .env file with Google OAuth credentials"
    echo "   See README.md for instructions"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the development server:"
echo "  python run.py"
echo ""
echo "The application will be available at:"
echo "  http://localhost:8080"
echo ""
echo "📖 See README.md for Google OAuth setup instructions"