"""
Simple Cache Manager for PageMade
Fallback cache implementation when Redis is not available
"""

import json
import os
from datetime import datetime, timedelta
from flask import current_app
import logging

class SimpleCacheManager:
    """Simple cache manager that works without Redis"""
    
    def __init__(self, app=None):
        self.cache_data = {}
        if app:
            self.init_app(app)
    
    def init_app(self, app):
        """Initialize cache with Flask app"""
        app.logger.info("✅ Simple cache initialized (Redis not available)")
    
    def is_available(self):
        """Check if cache is available"""
        return True
    
    def cache_page_content(self, page_id, html_content, css_content, ttl=3600):
        """Cache published page content"""
        try:
            cache_key = f"page_content:{page_id}"
            cache_data = {
                'html': html_content,
                'css': css_content,
                'cached_at': datetime.utcnow().isoformat(),
                'page_id': page_id,
                'expires_at': (datetime.utcnow() + timedelta(seconds=ttl)).isoformat()
            }
            
            self.cache_data[cache_key] = cache_data
            current_app.logger.info(f"✅ Cached page {page_id} content (memory)")
            return True
            
        except Exception as e:
            current_app.logger.error(f"❌ Failed to cache page {page_id}: {e}")
            return False
    
    def get_cached_page_content(self, page_id):
        """Get cached page content"""
        try:
            cache_key = f"page_content:{page_id}"
            cached_data = self.cache_data.get(cache_key)
            
            if cached_data:
                # Check if expired
                expires_at = datetime.fromisoformat(cached_data['expires_at'])
                if datetime.utcnow() < expires_at:
                    current_app.logger.info(f"✅ Cache HIT for page {page_id}")
                    return cached_data
                else:
                    # Remove expired entry
                    del self.cache_data[cache_key]
                    current_app.logger.info(f"❌ Cache EXPIRED for page {page_id}")
            
            current_app.logger.info(f"❌ Cache MISS for page {page_id}")
            return None
            
        except Exception as e:
            current_app.logger.error(f"❌ Failed to get cached page {page_id}: {e}")
            return None
    
    def invalidate_page_cache(self, page_id):
        """Invalidate page cache when content is updated"""
        try:
            cache_key = f"page_content:{page_id}"
            if cache_key in self.cache_data:
                del self.cache_data[cache_key]
                current_app.logger.info(f"✅ Invalidated cache for page {page_id}")
                return True
            return False
            
        except Exception as e:
            current_app.logger.error(f"❌ Failed to invalidate page {page_id}: {e}")
            return False
    
    def cache_site_pages(self, site_id, pages_data, ttl=1800):
        """Cache site's published pages list"""
        try:
            cache_key = f"site_pages:{site_id}"
            cache_data = {
                'pages': pages_data,
                'cached_at': datetime.utcnow().isoformat(),
                'site_id': site_id,
                'expires_at': (datetime.utcnow() + timedelta(seconds=ttl)).isoformat()
            }
            
            self.cache_data[cache_key] = cache_data
            current_app.logger.info(f"✅ Cached site {site_id} pages (memory)")
            return True
            
        except Exception as e:
            current_app.logger.error(f"❌ Failed to cache site {site_id} pages: {e}")
            return False
    
    def get_cached_site_pages(self, site_id):
        """Get cached site pages"""
        try:
            cache_key = f"site_pages:{site_id}"
            cached_data = self.cache_data.get(cache_key)
            
            if cached_data:
                # Check if expired
                expires_at = datetime.fromisoformat(cached_data['expires_at'])
                if datetime.utcnow() < expires_at:
                    current_app.logger.info(f"✅ Cache HIT for site {site_id} pages")
                    return cached_data['pages']
                else:
                    # Remove expired entry
                    del self.cache_data[cache_key]
                    current_app.logger.info(f"❌ Cache EXPIRED for site {site_id} pages")
            
            return None
            
        except Exception as e:
            current_app.logger.error(f"❌ Failed to get cached site {site_id} pages: {e}")
            return None
    
    def invalidate_site_cache(self, site_id):
        """Invalidate all caches related to a site"""
        try:
            keys_to_delete = [k for k in self.cache_data.keys() if f":{site_id}" in k]
            for key in keys_to_delete:
                del self.cache_data[key]
            
            if keys_to_delete:
                current_app.logger.info(f"✅ Invalidated {len(keys_to_delete)} cache keys for site {site_id}")
                return len(keys_to_delete) > 0
            
            return True
            
        except Exception as e:
            current_app.logger.error(f"❌ Failed to invalidate site {site_id} cache: {e}")
            return False
    
    def increment_page_views(self, page_id):
        """Increment page view counter"""
        try:
            # Daily counter
            today = datetime.utcnow().strftime('%Y-%m-%d')
            daily_key = f"page_views:{page_id}:{today}"
            
            # Total counter
            total_key = f"page_views_total:{page_id}"
            
            self.cache_data[daily_key] = self.cache_data.get(daily_key, 0) + 1
            self.cache_data[total_key] = self.cache_data.get(total_key, 0) + 1
            
            return True
            
        except Exception as e:
            current_app.logger.error(f"❌ Failed to increment views for page {page_id}: {e}")
            return False
    
    def get_page_views(self, page_id, days=7):
        """Get page view statistics"""
        try:
            stats = {'daily': {}, 'total': 0}
            
            # Get total views
            total_key = f"page_views_total:{page_id}"
            stats['total'] = self.cache_data.get(total_key, 0)
            
            # Get daily views for last N days
            for i in range(days):
                date = (datetime.utcnow() - timedelta(days=i)).strftime('%Y-%m-%d')
                daily_key = f"page_views:{page_id}:{date}"
                stats['daily'][date] = self.cache_data.get(daily_key, 0)
            
            return stats
            
        except Exception as e:
            current_app.logger.error(f"❌ Failed to get page {page_id} views: {e}")
            return {'daily': {}, 'total': 0}
    
    def clear_all_cache(self):
        """Clear all PageMade cache"""
        try:
            keys_to_delete = [k for k in self.cache_data.keys() if any(prefix in k for prefix in ['page_content:', 'site_pages:', 'page_views:'])]
            for key in keys_to_delete:
                del self.cache_data[key]
            
            current_app.logger.info(f"✅ Cleared {len(keys_to_delete)} cache keys")
            return len(keys_to_delete) > 0
            
        except Exception as e:
            current_app.logger.error(f"❌ Failed to clear cache: {e}")
            return False
    
    def get_cache_stats(self):
        """Get cache statistics"""
        try:
            cache_keys = [k for k in self.cache_data.keys() if any(prefix in k for prefix in ['page_content:', 'site_pages:', 'page_views:'])]
            
            stats = {
                'available': True,
                'cache_type': 'memory',
                'total_keys': len(cache_keys),
                'page_content_keys': len([k for k in cache_keys if k.startswith('page_content:')]),
                'site_pages_keys': len([k for k in cache_keys if k.startswith('site_pages:')]),
                'page_views_keys': len([k for k in cache_keys if k.startswith('page_views:')]),
            }
            
            return stats
            
        except Exception as e:
            current_app.logger.error(f"❌ Failed to get cache stats: {e}")
            return {'available': False, 'error': str(e)}

# Global cache instance - use simple cache for now
cache = SimpleCacheManager()