#!/bin/bash
# ============================================
# Setup Redis for PageMade Production
# ============================================

set -e

echo "🚀 Installing Redis..."

# Update package list
apt-get update

# Install Redis
apt-get install -y redis-server

# Configure Redis
echo "⚙️  Configuring Redis..."

# Backup original config
cp /etc/redis/redis.conf /etc/redis/redis.conf.backup

# Set Redis to supervised by systemd
sed -i 's/^supervised no/supervised systemd/' /etc/redis/redis.conf

# Set maxmemory policy (evict old keys when memory full)
sed -i 's/# maxmemory <bytes>/maxmemory 256mb/' /etc/redis/redis.conf
sed -i 's/# maxmemory-policy noeviction/maxmemory-policy allkeys-lru/' /etc/redis/redis.conf

# Restart Redis
systemctl restart redis
systemctl enable redis

# Test Redis
if redis-cli ping | grep -q PONG; then
    echo "✅ Redis installed and running successfully!"
    
    # Show status
    systemctl status redis --no-pager | head -10
    
    # Show Redis info
    redis-cli INFO | grep -E "redis_version|used_memory_human|connected_clients"
else
    echo "❌ Redis installation failed"
    exit 1
fi

echo ""
echo "✅ Redis setup complete!"
echo "You can now use cache features in PageMade"
