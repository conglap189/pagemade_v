#!/bin/bash

##############################################
# Upload Fresh Code to Production
# - Upload clean backend files
# - Preserve database & storage
# - Run redeploy script
##############################################

set -e

SERVER="root@36.50.55.21"
PROD_DIR="/var/www/pagemade/backend"
LOCAL_DIR="/home/helios/ver1.1/backend"

echo "========================================"
echo "  Upload Fresh Code to Production"
echo "========================================"
echo ""

# Files to upload (exclude database, storage, venv)
FILES=(
    "app/"
    "templates/"
    "static/"
    "cache.py"
    "config.py"
    "run.py"
    "wsgi.py"
    "requirements.txt"
    "clear_cache.sh"
    "clear_cache.py"
)

echo "[1/4] 📤 Uploading files..."
for file in "${FILES[@]}"; do
    echo "   Uploading: $file"
    scp -r "$LOCAL_DIR/$file" "$SERVER:$PROD_DIR/" || echo "   ⚠️  Failed: $file"
done
echo ""

echo "[2/4] 📝 Uploading redeploy script..."
scp "$LOCAL_DIR/redeploy_keep_database.sh" "$SERVER:$PROD_DIR/"
echo ""

echo "[3/4] 🔧 Setting permissions..."
ssh "$SERVER" "chmod +x $PROD_DIR/redeploy_keep_database.sh"
ssh "$SERVER" "chmod +x $PROD_DIR/clear_cache.sh"
echo ""

echo "[4/4] 🚀 Running redeploy on server..."
ssh "$SERVER" "cd $PROD_DIR && ./redeploy_keep_database.sh"
echo ""

echo "========================================"
echo "  ✅ Upload & Redeploy Complete!"
echo "========================================"
echo ""
echo "🌐 Test your site:"
echo "   Editor: https://pagemade.site/editor/12"
echo "   Dashboard: https://pagemade.site/dashboard"
echo ""
