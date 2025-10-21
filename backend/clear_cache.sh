#!/bin/bash
# ============================================
# Clear Cache Script for PageMade Production
# ============================================
# Usage: ./clear_cache.sh [option]
# Options:
#   all       - Clear all cache (Redis + Browser)
#   redis     - Clear Redis cache only
#   restart   - Restart services (Flask + Redis)
#   auto      - Schedule auto-clear every night at 9 PM
# ============================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_PATH="/var/www/pagemade/backend"
VENV_PATH="/var/www/pagemade/backend/venv"
REDIS_CLI="redis-cli"
FLASK_PORT="5000"

echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}  PageMade Cache Clear Script${NC}"
echo -e "${GREEN}======================================${NC}"

# Function: Clear Redis Cache
clear_redis_cache() {
    echo -e "${YELLOW}[1/3] Clearing Redis cache...${NC}"
    
    # Check if Redis is running
    if ! systemctl is-active --quiet redis-server; then
        echo -e "${RED}❌ Redis is not running. Starting Redis...${NC}"
        systemctl start redis-server
        sleep 2
    fi
    
    # Clear specific PageMade cache keys
    echo "Clearing PageMade cache keys..."
    $REDIS_CLI --scan --pattern "page_content:*" | xargs -r $REDIS_CLI DEL
    $REDIS_CLI --scan --pattern "site_pages:*" | xargs -r $REDIS_CLI DEL
    
    # Alternative: Clear entire Redis database (use carefully!)
    # $REDIS_CLI FLUSHDB
    
    echo -e "${GREEN}✅ Redis cache cleared${NC}"
}

# Function: Clear Browser Cache Headers (Update version query string)
update_static_version() {
    echo -e "${YELLOW}[2/3] Updating static file versions...${NC}"
    
    # Update version timestamp in base.html to bust browser cache
    TIMESTAMP=$(date +%s)
    
    if [ -f "$PROJECT_PATH/templates/base.html" ]; then
        # Update CSS version
        sed -i "s/style\.css?v=[0-9]*/style.css?v=$TIMESTAMP/" "$PROJECT_PATH/templates/base.html"
        
        # Update JS version if exists
        sed -i "s/main\.js?v=[0-9]*/main.js?v=$TIMESTAMP/" "$PROJECT_PATH/templates/base.html"
        
        echo -e "${GREEN}✅ Static version updated to: $TIMESTAMP${NC}"
    else
        echo -e "${YELLOW}⚠️  base.html not found, skipping...${NC}"
    fi
}

# Function: Restart Flask Application
restart_flask() {
    echo -e "${YELLOW}[3/3] Restarting Flask application...${NC}"
    
    # Check if using systemd service
    if systemctl is-active --quiet pagemade; then
        systemctl restart pagemade
        echo -e "${GREEN}✅ Flask service restarted${NC}"
    
    # Check if using gunicorn directly
    elif pgrep -f "gunicorn.*pagemade" > /dev/null; then
        pkill -HUP -f "gunicorn.*pagemade"
        echo -e "${GREEN}✅ Gunicorn workers reloaded${NC}"
    
    # Fallback: Kill and restart manually
    else
        echo -e "${YELLOW}⚠️  No service found, attempting manual restart...${NC}"
        pkill -f "python.*run.py" || true
        sleep 2
        cd "$PROJECT_PATH"
        source "$VENV_PATH/bin/activate"
        nohup python run.py > /dev/null 2>&1 &
        echo -e "${GREEN}✅ Flask restarted manually${NC}"
    fi
}

# Function: Full cache clear
full_cache_clear() {
    echo -e "${GREEN}Starting full cache clear...${NC}"
    clear_redis_cache
    update_static_version
    restart_flask
    echo -e "${GREEN}======================================${NC}"
    echo -e "${GREEN}✅ Cache cleared successfully!${NC}"
    echo -e "${GREEN}======================================${NC}"
}

# Function: Setup automatic cache clear via cron
setup_auto_clear() {
    echo -e "${YELLOW}Setting up automatic cache clear...${NC}"
    
    # Create cron job for 9 PM daily
    CRON_JOB="0 21 * * * /var/www/pagemade/backend/clear_cache.sh redis >> /var/log/pagemade_cache_clear.log 2>&1"
    
    # Check if cron job already exists
    if crontab -l 2>/dev/null | grep -q "clear_cache.sh"; then
        echo -e "${YELLOW}⚠️  Cron job already exists${NC}"
    else
        # Add cron job
        (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
        echo -e "${GREEN}✅ Automatic cache clear scheduled at 9 PM daily${NC}"
    fi
    
    # Show current cron jobs
    echo -e "${YELLOW}Current cron jobs:${NC}"
    crontab -l | grep clear_cache || echo "No cache clear jobs found"
}

# Function: Show cache stats
show_cache_stats() {
    echo -e "${YELLOW}Cache Statistics:${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Redis info
    if systemctl is-active --quiet redis-server; then
        echo "📊 Redis Status: ${GREEN}Running${NC}"
        $REDIS_CLI INFO | grep -E "used_memory_human|connected_clients"
        
        # Count cache keys
        PAGE_CONTENT=$(redis-cli --scan --pattern "page_content:*" | wc -l)
        SITE_PAGES=$(redis-cli --scan --pattern "site_pages:*" | wc -l)
        
        echo "📦 Cached Pages: $PAGE_CONTENT"
        echo "🌐 Cached Sites: $SITE_PAGES"
    else
        echo "📊 Redis Status: ${RED}Stopped${NC}"
    fi
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# Main execution
case "${1:-help}" in
    all)
        full_cache_clear
        ;;
    redis)
        clear_redis_cache
        restart_flask
        ;;
    restart)
        restart_flask
        ;;
    auto)
        setup_auto_clear
        ;;
    stats)
        show_cache_stats
        ;;
    help|*)
        echo "Usage: $0 [option]"
        echo ""
        echo "Options:"
        echo "  all       - Clear all cache (Redis + Browser)"
        echo "  redis     - Clear Redis cache only"
        echo "  restart   - Restart Flask application"
        echo "  auto      - Setup automatic cache clear at 9 PM daily"
        echo "  stats     - Show cache statistics"
        echo "  help      - Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0 all           # Full cache clear"
        echo "  $0 redis         # Quick Redis clear"
        echo "  $0 auto          # Setup daily auto-clear"
        exit 0
        ;;
esac

exit 0
