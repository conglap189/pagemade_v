#!/bin/bash
# ========================================
# Script: Build Custom GrapesJS
# Mô tả: Build GrapesJS từ source và copy vào backend
# Cách dùng: ./build-grapesjs.sh
# ========================================

set -e  # Exit on error

echo ""
echo "🎨 =========================================="
echo "   BUILD CUSTOM GRAPESJS"
echo "=========================================="
echo ""

# Step 1: Build GrapesJS
echo "� Step 1: Building GrapesJS from source..."
cd /home/helios/ver1.1/grapesjs
pnpm --filter grapesjs build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful!"
echo ""

# Step 2: Backup old files
echo "💾 Step 2: Backing up old files..."
cd /home/helios/ver1.1/backend/static/pagemaker
timestamp=$(date +%Y%m%d_%H%M%S)

if [ -f "pagemaker.min.js" ]; then
    cp pagemaker.min.js pagemaker.min.js.backup_${timestamp}
    echo "   ✓ Backed up: pagemaker.min.js.backup_${timestamp}"
fi

if [ -f "pagemaker.min.css" ]; then
    cp pagemaker.min.css pagemaker.min.css.backup_${timestamp}
    echo "   ✓ Backed up: pagemaker.min.css.backup_${timestamp}"
fi

echo ""

# Step 3: Copy new build
echo "📋 Step 3: Copying new build to backend..."
cp /home/helios/ver1.1/grapesjs/packages/core/dist/pagemaker.min.js pagemaker.min.js
cp /home/helios/ver1.1/grapesjs/packages/core/dist/css/pagemaker.min.css pagemaker.min.css

echo "   ✓ Copied: pagemaker.min.js"
echo "   ✓ Copied: pagemaker.min.css"
echo ""

# Step 4: Show results
echo "📊 Step 4: Build summary"
echo "=========================================="
ls -lh pagemaker.min.* | grep -v backup || ls -lh pagemaker.min.*
echo ""

echo "✅ DONE! Custom PageMaker ready to use!"
echo ""
echo "🔗 Next steps:"
echo "   1. Reload editor: http://localhost:5000/editor/16"
echo "   2. Test in browser console: window.pagemaker"
echo ""
