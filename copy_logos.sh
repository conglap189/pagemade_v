#!/bin/bash

# Script to copy logo files to branding folder
# Usage: ./copy_logos.sh <source_folder>

DEST="/home/helios/ver1.1/backend/static/images/branding"

echo "🎨 Copying logo files to branding folder..."
echo "📁 Destination: $DEST"
echo ""

# Check if source folder provided
if [ -z "$1" ]; then
    echo "❌ Please provide source folder path"
    echo "Usage: ./copy_logos.sh /path/to/logo/files"
    exit 1
fi

SOURCE="$1"

# Copy files
echo "📋 Copying from: $SOURCE"
echo ""

# Logo SVG
if [ -f "$SOURCE/logo.svg" ]; then
    cp "$SOURCE/logo.svg" "$DEST/"
    echo "✅ Copied logo.svg"
elif [ -f "$SOURCE"/*.svg ]; then
    cp "$SOURCE"/*.svg "$DEST/logo.svg"
    echo "✅ Copied *.svg -> logo.svg"
fi

# Logo PNG (background removed)
if [ -f "$SOURCE/logo_remove_background.png" ]; then
    cp "$SOURCE/logo_remove_background.png" "$DEST/logo.png"
    echo "✅ Copied logo_remove_background.png -> logo.png"
elif [ -f "$SOURCE/logo.png" ]; then
    cp "$SOURCE/logo.png" "$DEST/"
    echo "✅ Copied logo.png"
fi

# Favicon files
if [ -f "$SOURCE/favicon.ico" ]; then
    cp "$SOURCE/favicon.ico" "$DEST/"
    echo "✅ Copied favicon.ico"
fi

if [ -f "$SOURCE/favicon-16x16.png" ]; then
    cp "$SOURCE/favicon-16x16.png" "$DEST/"
    echo "✅ Copied favicon-16x16.png"
fi

if [ -f "$SOURCE/favicon-32x32.png" ]; then
    cp "$SOURCE/favicon-32x32.png" "$DEST/"
    echo "✅ Copied favicon-32x32.png"
fi

# Apple touch icon
if [ -f "$SOURCE/apple-touch-icon.png" ]; then
    cp "$SOURCE/apple-touch-icon.png" "$DEST/"
    echo "✅ Copied apple-touch-icon.png"
fi

# Android icons
if [ -f "$SOURCE/android-chrome-192x192.png" ]; then
    cp "$SOURCE/android-chrome-192x192.png" "$DEST/"
    echo "✅ Copied android-chrome-192x192.png"
fi

if [ -f "$SOURCE/android-chrome-512x512.png" ]; then
    cp "$SOURCE/android-chrome-512x512.png" "$DEST/"
    echo "✅ Copied android-chrome-512x512.png"
fi

echo ""
echo "✅ Done! Files copied to: $DEST"
echo ""
echo "📋 Listing files:"
ls -lh "$DEST"
