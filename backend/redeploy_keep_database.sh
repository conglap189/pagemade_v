#!/bin/bash

##############################################
# PageMade Production Redeploy Script
# - Reset code về clean state
# - GIỮ NGUYÊN database (backup trước khi reset)
# - Clear cache & restart services
##############################################

set -e  # Exit on error

echo "========================================"
echo "  PageMade Production Redeploy"
echo "========================================"
echo ""

# Configuration
PROD_DIR="/var/www/pagemade"
BACKUP_DIR="/var/www/pagemade_backup_$(date +%Y%m%d_%H%M%S)"
DB_PATH="$PROD_DIR/backend/instance/app.db"
STORAGE_PATH="$PROD_DIR/backend/storage"

echo "📋 Configuration:"
echo "   Production dir: $PROD_DIR"
echo "   Backup dir: $BACKUP_DIR"
echo ""

# Step 1: Backup database & storage
echo "[1/7] 💾 Backing up database & storage..."
if [ -f "$DB_PATH" ]; then
    mkdir -p "$BACKUP_DIR/instance"
    cp "$DB_PATH" "$BACKUP_DIR/instance/"
    echo "   ✅ Database backed up: $BACKUP_DIR/instance/app.db"
else
    echo "   ⚠️  No database found at $DB_PATH"
fi

if [ -d "$STORAGE_PATH" ]; then
    cp -r "$STORAGE_PATH" "$BACKUP_DIR/"
    echo "   ✅ Storage backed up: $BACKUP_DIR/storage/"
else
    echo "   ⚠️  No storage directory found"
fi
echo ""

# Step 2: Stop services
echo "[2/7] 🛑 Stopping Flask service..."
sudo systemctl stop pagemade 2>/dev/null || echo "   ⚠️  Service not running"
echo ""

# Step 3: Clean old code (keep database)
echo "[3/7] 🧹 Cleaning old code..."
cd "$PROD_DIR/backend"
find . -type f -name "*.pyc" -delete
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
rm -rf logs/*.log 2>/dev/null || true
echo "   ✅ Cache cleaned"
echo ""

# Step 4: Pull fresh code from git (or re-upload)
echo "[4/7] 📥 Updating code..."
echo "   ℹ️  Skipping git pull (manual upload required)"
echo "   → Upload fresh files via SCP before running this"
echo ""

# Step 5: Restore database
echo "[5/7] 📦 Restoring database..."
if [ -f "$BACKUP_DIR/instance/app.db" ]; then
    mkdir -p "$PROD_DIR/backend/instance"
    cp "$BACKUP_DIR/instance/app.db" "$DB_PATH"
    echo "   ✅ Database restored"
else
    echo "   ⚠️  No backup database found"
fi
echo ""

# Step 6: Clear Redis cache
echo "[6/7] 🗑️  Clearing Redis cache..."
redis-cli FLUSHDB 2>/dev/null || echo "   ⚠️  Redis not available"
echo "   ✅ Cache cleared"
echo ""

# Step 7: Restart services
echo "[7/7] 🚀 Restarting services..."
sudo systemctl daemon-reload
sudo systemctl restart redis-server
sudo systemctl start pagemade
sudo systemctl status pagemade --no-pager | head -10
echo ""

echo "========================================"
echo "  ✅ Redeploy completed!"
echo "========================================"
echo ""
echo "📌 Next steps:"
echo "   1. Check logs: sudo journalctl -u pagemade -n 50"
echo "   2. Test editor: https://pagemade.site/editor/12"
echo "   3. Backup saved at: $BACKUP_DIR"
echo ""
