#!/bin/bash

# PageMade - Start All Services Script
# Starts Backend (5000), Editor (5001), and Website (3000)

echo "🚀 Starting PageMade Services..."
echo "================================"

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "⚠️  Port $1 is already in use"
        return 1
    else
        echo "✅ Port $1 is available"
        return 0
    fi
}

# Check ports
echo "🔍 Checking port availability..."
check_port 5000  # Backend
check_port 5001  # Editor  
check_port 3000  # Website

echo ""
echo "🔧 Starting services..."

# Start Backend (Port 5000)
echo "1️⃣ Starting Backend API (Port 5000)..."
cd /home/helios/ver1.1/backend
if [ ! -d ".venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv .venv
fi

source .venv/bin/activate
nohup python run.py > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
echo "✅ Backend started (PID: $BACKEND_PID)"

# Start Editor (Port 5001)
echo "2️⃣ Starting PageMade Editor (Port 5001)..."
cd /home/helios/ver1.1/frontend
nohup npm run dev > /tmp/editor.log 2>&1 &
EDITOR_PID=$!
echo "✅ Editor started (PID: $EDITOR_PID)"

# Start Website (Port 3000)
echo "3️⃣ Starting Main Website (Port 3000)..."
cd /home/helios/ver1.1/website
nohup npm run dev > /tmp/website.log 2>&1 &
WEBSITE_PID=$!
echo "✅ Website started (PID: $WEBSITE_PID)"

# Save PIDs for later use
echo $BACKEND_PID > /tmp/backend.pid
echo $EDITOR_PID > /tmp/editor.pid
echo $WEBSITE_PID > /tmp/website.pid

echo ""
echo "🎉 All services started successfully!"
echo "================================"
echo "📊 Service Status:"
echo "   🔧 Backend API:    http://localhost:5000 (PID: $BACKEND_PID)"
echo "   ✏️  PageMade Ed.:   http://localhost:5001 (PID: $EDITOR_PID)"
echo "   🌐 Main Website:   http://localhost:3000 (PID: $WEBSITE_PID)"
echo ""
echo "🔐 Login Credentials:"
echo "   Email:    admin@pagemade.site"
echo "   Password: admin123"
echo ""
echo "📋 Quick Access:"
echo "   Admin:    http://localhost:5000/login"
echo "   Editor:   http://localhost:5001/editor/5"
echo "   Website:  http://localhost:3000"
echo ""
echo "🛑 To stop all services: ./stop-all-services.sh"
echo "📝 Logs: tail -f /tmp/backend.log /tmp/editor.log /tmp/website.log"