#!/bin/bash

# PageMade - Stop All Services Script
# Stops Backend (5000), Editor (5001), and Website (3000)

echo "🛑 Stopping PageMade Services..."
echo "================================"

# Function to stop service by port
stop_service() {
    local port=$1
    local name=$2
    
    echo "🔄 Stopping $name (Port $port)..."
    
    # Kill by port
    pkill -f ":$port" 2>/dev/null
    
    # Kill by process name
    case $name in
        "Backend")
            pkill -f "python.*run.py" 2>/dev/null
            ;;
        "Editor")
            pkill -f webpack 2>/dev/null
            pkill -f "npm.*dev" 2>/dev/null
            ;;
        "Website")
            pkill -f "next.*dev" 2>/dev/null
            pkill -f "npm.*dev" 2>/dev/null
            ;;
    esac
    
    # Wait a moment and check if stopped
    sleep 2
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "⚠️  $name still running on port $port"
    else
        echo "✅ $name stopped successfully"
    fi
}

# Stop all services
stop_service 5000 "Backend API"
stop_service 5001 "PageMade Editor"
stop_service 3000 "Main Website"

# Clean up PID files
rm -f /tmp/backend.pid /tmp/editor.pid /tmp/website.pid

echo ""
echo "🧹 Cleaning up processes..."
# Additional cleanup for any remaining processes
pkill -f "python.*run.py" 2>/dev/null
pkill -f webpack 2>/dev/null
pkill -f "next.*dev" 2>/dev/null

echo ""
echo "✅ All services stopped!"
echo "================================"
echo "📊 Port Status:"
echo "   Port 5000: $(lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null 2>&1 && echo "🔴 In Use" || echo "✅ Available")"
echo "   Port 5001: $(lsof -Pi :5001 -sTCP:LISTEN -t >/dev/null 2>&1 && echo "🔴 In Use" || echo "✅ Available")"
echo "   Port 3000: $(lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 && echo "🔴 In Use" || echo "✅ Available")"
echo ""
echo "🔄 To restart: ./start-all-services.sh"