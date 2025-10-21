#!/usr/bin/env python3
"""
PageMade Cache Management CLI
Alternative Python script for cache management
Usage: python clear_cache.py [command]
"""

import sys
import os
import subprocess
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from cache import cache

def clear_redis_cache():
    """Clear Redis cache using Python"""
    print("🗑️  Clearing Redis cache...")
    
    app = create_app()
    
    with app.app_context():
        if cache.is_available():
            result = cache.clear_all_cache()
            if result:
                print("✅ Redis cache cleared successfully!")
                return True
            else:
                print("⚠️  No cache keys found")
                return True
        else:
            print("❌ Redis not available")
            return False

def show_cache_stats():
    """Show cache statistics"""
    print("📊 Cache Statistics")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    
    app = create_app()
    
    with app.app_context():
        stats = cache.get_cache_stats()
        
        if stats.get('available'):
            print(f"Status: ✅ Available")
            print(f"Memory Used: {stats.get('used_memory', 'N/A')}")
            print(f"Connected Clients: {stats.get('connected_clients', 0)}")
            print(f"Hit Rate: {stats.get('hit_rate', 0)}%")
            print(f"Total Commands: {stats.get('total_commands_processed', 0)}")
        else:
            print(f"Status: ❌ Unavailable")
            print(f"Error: {stats.get('error', 'Unknown')}")
    
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

def invalidate_site_cache(site_id):
    """Invalidate cache for specific site"""
    print(f"🗑️  Invalidating cache for site {site_id}...")
    
    app = create_app()
    
    with app.app_context():
        result = cache.invalidate_site_cache(site_id)
        if result:
            print(f"✅ Cache cleared for site {site_id}")
        else:
            print(f"⚠️  Failed to clear cache for site {site_id}")

def invalidate_page_cache(page_id):
    """Invalidate cache for specific page"""
    print(f"🗑️  Invalidating cache for page {page_id}...")
    
    app = create_app()
    
    with app.app_context():
        result = cache.invalidate_page_cache(page_id)
        if result:
            print(f"✅ Cache cleared for page {page_id}")
        else:
            print(f"⚠️  Failed to clear cache for page {page_id}")

def restart_gunicorn():
    """Restart Gunicorn workers"""
    print("🔄 Restarting Gunicorn...")
    
    try:
        # Try systemd service first
        result = subprocess.run(['systemctl', 'restart', 'pagemade'], 
                              capture_output=True, text=True)
        if result.returncode == 0:
            print("✅ Gunicorn restarted via systemd")
            return True
    except:
        pass
    
    try:
        # Try HUP signal for graceful reload
        result = subprocess.run(['pkill', '-HUP', '-f', 'gunicorn.*pagemade'],
                              capture_output=True, text=True)
        if result.returncode == 0:
            print("✅ Gunicorn workers reloaded")
            return True
    except:
        pass
    
    print("❌ Failed to restart Gunicorn")
    return False

def main():
    """Main CLI entry point"""
    if len(sys.argv) < 2:
        print("PageMade Cache Management")
        print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print("Usage: python clear_cache.py [command]")
        print("")
        print("Commands:")
        print("  clear              - Clear all cache")
        print("  stats              - Show cache statistics")
        print("  site <id>          - Clear cache for specific site")
        print("  page <id>          - Clear cache for specific page")
        print("  restart            - Restart Gunicorn workers")
        print("")
        print("Examples:")
        print("  python clear_cache.py clear")
        print("  python clear_cache.py site 5")
        print("  python clear_cache.py stats")
        return
    
    command = sys.argv[1].lower()
    
    if command == 'clear':
        clear_redis_cache()
        restart_gunicorn()
    
    elif command == 'stats':
        show_cache_stats()
    
    elif command == 'site':
        if len(sys.argv) < 3:
            print("❌ Please provide site ID")
            print("Usage: python clear_cache.py site <id>")
            return
        site_id = int(sys.argv[2])
        invalidate_site_cache(site_id)
    
    elif command == 'page':
        if len(sys.argv) < 3:
            print("❌ Please provide page ID")
            print("Usage: python clear_cache.py page <id>")
            return
        page_id = int(sys.argv[2])
        invalidate_page_cache(page_id)
    
    elif command == 'restart':
        restart_gunicorn()
    
    else:
        print(f"❌ Unknown command: {command}")
        print("Run without arguments to see available commands")

if __name__ == '__main__':
    main()
