#!/bin/bash
# Migration Cleanup Script
# Execute ONLY after Phase 3 is 100% complete!

set -e  # Exit on error

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_DIR="$SCRIPT_DIR/.."
BACKUP_DIR="$BACKEND_DIR/backup_$(date +%Y%m%d_%H%M%S)"

echo "🧹 MIGRATION CLEANUP SCRIPT"
echo "=============================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored messages
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "$BACKEND_DIR/run.py" ]; then
    print_error "Error: run.py not found. Please run this script from backend/scripts/"
    exit 1
fi

echo "Current directory: $BACKEND_DIR"
echo ""

# Confirmation prompt
print_warning "⚠️  CRITICAL WARNING ⚠️"
echo ""
echo "This script will PERMANENTLY remove old monolithic files:"
echo "  - app/models.py (381 lines)"
echo "  - app/routes.py (2763 lines)"
echo "  - config.py (if exists)"
echo ""
echo "Make sure you have:"
echo "  ✓ Completed Phase 1, 2, and 3"
echo "  ✓ All tests passing"
echo "  ✓ Committed changes to git"
echo "  ✓ Created a backup"
echo ""
read -p "Do you want to continue? (type 'YES' in capital letters): " confirm

if [ "$confirm" != "YES" ]; then
    print_warning "Cleanup cancelled by user"
    exit 0
fi

echo ""
echo "🔍 Step 1: Pre-Cleanup Verification"
echo "======================================"

# Check if new structure exists
echo "Checking new structure..."
required_dirs=(
    "app/config"
    "app/models"
    "app/services"
    "app/repositories"
    "app/utils"
)

for dir in "${required_dirs[@]}"; do
    if [ ! -d "$BACKEND_DIR/$dir" ]; then
        print_error "Required directory $dir missing!"
        echo "Migration not complete. Aborting cleanup."
        exit 1
    fi
done
print_success "New structure verified"

# Check if blueprints exist (Phase 2 requirement)
if [ ! -d "$BACKEND_DIR/app/blueprints" ]; then
    print_warning "Blueprints directory not found"
    read -p "Phase 2 might not be complete. Continue anyway? (y/n): " continue_anyway
    if [ "$continue_anyway" != "y" ]; then
        exit 0
    fi
fi

echo ""
echo "💾 Step 2: Creating Backup"
echo "======================================"

# Create backup directory
mkdir -p "$BACKUP_DIR"
print_success "Backup directory created: $BACKUP_DIR"

# Backup old files
if [ -f "$BACKEND_DIR/app/models.py" ]; then
    cp "$BACKEND_DIR/app/models.py" "$BACKUP_DIR/models.py.backup"
    print_success "Backed up models.py"
fi

if [ -f "$BACKEND_DIR/app/routes.py" ]; then
    cp "$BACKEND_DIR/app/routes.py" "$BACKUP_DIR/routes.py.backup"
    print_success "Backed up routes.py"
fi

if [ -f "$BACKEND_DIR/config.py" ]; then
    cp "$BACKEND_DIR/config.py" "$BACKUP_DIR/config.py.backup"
    print_success "Backed up config.py"
fi

# Backup entire app directory (compressed)
echo "Creating full backup archive..."
tar -czf "$BACKUP_DIR/app_full_backup.tar.gz" -C "$BACKEND_DIR" app/
print_success "Full backup created: app_full_backup.tar.gz"

echo ""
echo "🧪 Step 3: Testing Imports"
echo "======================================"

cd "$BACKEND_DIR"

# Test new imports work
python3 << 'EOF'
import sys
sys.path.insert(0, '.')

try:
    from app.models import User, Site, Page, Asset
    print("✅ Models import successful")
except ImportError as e:
    print(f"❌ Models import failed: {e}")
    sys.exit(1)

try:
    from app.services import AuthService, AssetService, SiteService, PageService
    print("✅ Services import successful")
except ImportError as e:
    print(f"❌ Services import failed: {e}")
    sys.exit(1)

try:
    from app.repositories import UserRepository, SiteRepository, PageRepository, AssetRepository
    print("✅ Repositories import successful")
except ImportError as e:
    print(f"❌ Repositories import failed: {e}")
    sys.exit(1)

try:
    from app.utils import FileHandler, Validators, Helpers
    print("✅ Utils import successful")
except ImportError as e:
    print(f"❌ Utils import failed: {e}")
    sys.exit(1)

print("\n✅ All imports successful!")
EOF

if [ $? -ne 0 ]; then
    print_error "Import tests failed. Aborting cleanup."
    exit 1
fi

echo ""
echo "🗑️  Step 4: Removing Old Files"
echo "======================================"

# Remove old models.py
if [ -f "$BACKEND_DIR/app/models.py" ]; then
    rm "$BACKEND_DIR/app/models.py"
    print_success "Removed app/models.py"
else
    print_warning "app/models.py not found (already removed?)"
fi

# Remove old routes.py
if [ -f "$BACKEND_DIR/app/routes.py" ]; then
    rm "$BACKEND_DIR/app/routes.py"
    print_success "Removed app/routes.py"
else
    print_warning "app/routes.py not found (already removed?)"
fi

# Remove old config.py
if [ -f "$BACKEND_DIR/config.py" ]; then
    rm "$BACKEND_DIR/config.py"
    print_success "Removed config.py"
else
    print_warning "config.py not found (skipping)"
fi

# Remove __pycache__ directories to avoid stale bytecode
echo ""
echo "Cleaning Python cache..."
find "$BACKEND_DIR/app" -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
find "$BACKEND_DIR/app" -type f -name "*.pyc" -delete 2>/dev/null || true
print_success "Python cache cleaned"

echo ""
echo "🔍 Step 5: Verification After Cleanup"
echo "======================================"

# Verify old files are gone
errors=0

if [ -f "$BACKEND_DIR/app/models.py" ]; then
    print_error "models.py still exists!"
    ((errors++))
fi

if [ -f "$BACKEND_DIR/app/routes.py" ]; then
    print_error "routes.py still exists!"
    ((errors++))
fi

if [ $errors -eq 0 ]; then
    print_success "Old files successfully removed"
else
    print_error "Cleanup incomplete. Some files still exist."
    exit 1
fi

# Test imports again after cleanup
echo ""
echo "Testing imports after cleanup..."
python3 << 'EOF'
import sys
sys.path.insert(0, '.')

try:
    from app.models import User, Site, Page, Asset
    from app.services import AuthService, AssetService, SiteService, PageService
    from app.utils import FileHandler, Validators, Helpers
    print("✅ All imports still working after cleanup!")
except ImportError as e:
    print(f"❌ Import error after cleanup: {e}")
    sys.exit(1)
EOF

if [ $? -ne 0 ]; then
    print_error "Imports broken after cleanup!"
    echo ""
    echo "🔄 ROLLBACK INSTRUCTIONS:"
    echo "  cd $BACKUP_DIR"
    echo "  cp models.py.backup ../app/models.py"
    echo "  cp routes.py.backup ../app/routes.py"
    exit 1
fi

echo ""
echo "✅ Step 6: Cleanup Complete!"
echo "======================================"
print_success "Migration cleanup successful!"
echo ""
echo "📊 Summary:"
echo "  ✓ Old files removed: models.py, routes.py"
echo "  ✓ Backup created at: $BACKUP_DIR"
echo "  ✓ New structure verified"
echo "  ✓ Imports working correctly"
echo ""
echo "📁 Your new structure:"
echo "  backend/app/"
echo "  ├── config/          ← New config system"
echo "  ├── models/          ← Modular models"
echo "  ├── services/        ← Business logic"
echo "  ├── repositories/    ← Data access"
echo "  ├── utils/           ← Helper functions"
echo "  └── blueprints/      ← Route modules (if Phase 2 done)"
echo ""
echo "🔄 If you need to rollback:"
echo "  Backup location: $BACKUP_DIR"
echo "  Or use: git checkout <previous-commit>"
echo ""
print_success "🎉 You're now running on the new professional architecture!"
