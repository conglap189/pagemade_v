#!/bin/bash
# PageMade Production Deployment Script
# VPS: 36.50.55.21

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}PageMade Production Deployment${NC}"
echo -e "${GREEN}================================${NC}"
echo ""

# VPS Info
VPS_IP="36.50.55.21"
VPS_USER="root"
VPS_PORT="22"
DEPLOY_PATH="/var/www/pagemade"
PROJECT_NAME="pagemade"

echo -e "${YELLOW}📦 Step 1: Create deployment package${NC}"
cd /home/helios/ver1.1

# Create tarball excluding unnecessary files
tar -czf /tmp/pagemade-deploy.tar.gz \
    --exclude='*.pyc' \
    --exclude='__pycache__' \
    --exclude='.git' \
    --exclude='grapesjs/node_modules' \
    --exclude='grapesjs/packages/*/node_modules' \
    --exclude='backend/.venv' \
    --exclude='*.backup*' \
    --exclude='*.log' \
    --exclude='backend/instance/*.db' \
    backend/ \
    docs/ \
    README.md \
    LOGO_FAVICON_IMPLEMENTATION.md

echo -e "${GREEN}✅ Package created: /tmp/pagemade-deploy.tar.gz${NC}"
ls -lh /tmp/pagemade-deploy.tar.gz

echo ""
echo -e "${YELLOW}📤 Step 2: Upload to VPS${NC}"
echo "Run this command manually:"
echo ""
echo -e "${GREEN}scp -P 22 /tmp/pagemade-deploy.tar.gz root@36.50.55.21:/tmp/${NC}"
echo ""
echo "Password: Conglap1892001@"
echo ""

echo -e "${YELLOW}🔧 Step 3: SSH to VPS and run deployment${NC}"
echo "After upload completes, SSH to VPS:"
echo ""
echo -e "${GREEN}ssh -p 22 root@36.50.55.21${NC}"
echo ""
echo "Password: Conglap1892001@"
echo ""
echo "Then run these commands on VPS:"
echo ""
echo -e "${GREEN}# 1. Create directory${NC}"
echo "mkdir -p /var/www/pagemade"
echo ""
echo -e "${GREEN}# 2. Extract package${NC}"
echo "cd /var/www/pagemade"
echo "tar -xzf /tmp/pagemade-deploy.tar.gz"
echo ""
echo -e "${GREEN}# 3. Install Python dependencies${NC}"
echo "cd /var/www/pagemade/backend"
echo "python3 -m venv venv"
echo "source venv/bin/activate"
echo "pip install -r requirements.txt"
echo ""
echo -e "${GREEN}# 4. Setup database${NC}"
echo "python3 -c 'from app import db, create_app; app = create_app(); app.app_context().push(); db.create_all(); print(\"Database created!\")'"
echo ""
echo -e "${GREEN}# 5. Test run${NC}"
echo "python3 run.py"
echo ""
echo -e "${YELLOW}Press Enter when you've completed the above steps...${NC}"
read

echo ""
echo -e "${GREEN}✅ Deployment package ready!${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Upload package to VPS"
echo "2. SSH to VPS"
echo "3. Extract and setup"
echo "4. Configure Nginx"
echo "5. Setup systemd service"
echo ""
echo -e "${YELLOW}📝 Need detailed VPS setup guide? Let me know!${NC}"
