#!/bin/bash
# Upload deployment package to VPS

echo "📤 Uploading PageMade to VPS..."
echo ""
echo "VPS: 36.50.55.21"
echo "Password: Conglap1892001@"
echo ""
echo "Running SCP command..."
echo ""

scp -P 22 /tmp/pagemade-deploy.tar.gz root@36.50.55.21:/tmp/

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Upload successful!"
    echo ""
    echo "Next steps:"
    echo "1. SSH to VPS: ssh -p 22 root@36.50.55.21"
    echo "2. Password: Conglap1892001@"
    echo "3. Follow instructions in DEPLOYMENT_GUIDE_PRODUCTION.md"
else
    echo ""
    echo "❌ Upload failed. Please try manually."
fi
