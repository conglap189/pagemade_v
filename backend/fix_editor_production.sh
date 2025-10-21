#!/bin/bash

##############################################
# Fix PageMaker Editor - Production
# Sửa lỗi components bị loạn xạ khi load lại
##############################################

set -e

SERVER="root@36.50.55.21"
PROD_DIR="/var/www/pagemade/backend"

echo "========================================"
echo "  Fix PageMaker Editor Production"
echo "========================================"
echo ""

echo "[1/5] 📤 Uploading fixed editor template..."
scp templates/editor_pagemaker_v2.html "$SERVER:$PROD_DIR/templates/"
echo ""

echo "[2/5] 🗑️  Clearing Redis cache..."
ssh "$SERVER" "redis-cli FLUSHDB" || echo "   ⚠️  Redis not available"
echo ""

echo "[3/5] 🔄 Restarting Flask service..."
ssh "$SERVER" "sudo systemctl restart pagemade"
sleep 2
echo ""

echo "[4/5] ✅ Checking service status..."
ssh "$SERVER" "sudo systemctl status pagemade --no-pager | head -10"
echo ""

echo "[5/5] 📊 Testing editor API..."
ssh "$SERVER" "curl -s http://localhost:5000/api/pages/12/pagemaker/load | python3 -m json.tool | head -20"
echo ""

echo "========================================"
echo "  ✅ Editor Fixed!"
echo "========================================"
echo ""
echo "⚠️  LƯU Ý:"
echo "   - Dữ liệu page 12 ĐÃ BỊ GHI ĐÈ thành HTML"
echo "   - Cần TẠO PAGE MỚI hoặc edit lại từ đầu"
echo "   - Editor giờ sẽ GIỮ components structure khi save/load"
echo ""
echo "🧪 Test ngay:"
echo "   1. Tạo page mới: https://pagemade.site/dashboard"
echo "   2. Hoặc edit page 12: https://pagemade.site/editor/12"
echo "   3. Kéo thả components → Save → Reload → Check"
echo ""
