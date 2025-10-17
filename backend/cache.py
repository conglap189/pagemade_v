"""
Redis Cache Manager for PageMade
Handles caching for published content and performance optimization
"""

import redis
import json
import os
from datetime import datetime, timedelta
from flask import current_app
import logging

class CacheManager:
    """Redis cache manager for PageMade content"""
    
    def __init__(self, app=None):
        self.redis_client = None
        if app:
            self.init_app(app)
    
    def init_app(self, app):
        """Initialize Redis connection with Flask app"""
        try:
            redis_url = app.config.get('REDIS_URL', 'redis://localhost:6379/0')
            redis_host = app.config.get('REDIS_HOST', 'localhost')
            redis_port = app.config.get('REDIS_PORT', 6379)
            redis_db = app.config.get('REDIS_DB', 0)
            
            self.redis_client = redis.Redis(
                host=redis_host,
                port=redis_port,
                db=redis_db,
                decode_responses=True,
                socket_timeout=5,
                health_check_interval=30
            )
            
            # Test connection
            self.redis_client.ping()
            app.logger.info("✅ Redis cache connected successfully")
            
        except Exception as e:
            app.logger.error(f"❌ Redis connection failed: {e}")
            self.redis_client = None
    
    def is_available(self):
        """Check if Redis is available"""
        if not self.redis_client:
            return False
        try:
            self.redis_client.ping()
            return True
        except:
            return False
    
    # =====================================
    # CONTENT CACHING
    # =====================================
    
    def cache_page_content(self, page_id, html_content, css_content, ttl=3600):
        """Cache published page content"""
        if not self.is_available():
            return False
        
        try:
            cache_key = f"page_content:{page_id}"
            cache_data = {
                'html': html_content,
                'css': css_content,
                'cached_at': datetime.utcnow().isoformat(),
                'page_id': page_id
            }
            
            self.redis_client.setex(
                cache_key, 
                ttl, 
                json.dumps(cache_data)
            )
            
            current_app.logger.info(f"✅ Cached page {page_id} content")
            return True
            
        except Exception as e:
            current_app.logger.error(f"❌ Failed to cache page {page_id}: {e}")
            return False
    
    def get_cached_page_content(self, page_id):
        """Get cached page content"""
        if not self.is_available():
            return None
        
        try:
            cache_key = f"page_content:{page_id}"
            cached_data = self.redis_client.get(cache_key)
            
            if cached_data:
                content = json.loads(cached_data)
                current_app.logger.info(f"✅ Cache HIT for page {page_id}")
                return content
            
            current_app.logger.info(f"❌ Cache MISS for page {page_id}")
            return None
            
        except Exception as e:
            current_app.logger.error(f"❌ Failed to get cached page {page_id}: {e}")
            return None
    
    def invalidate_page_cache(self, page_id):
        """Invalidate page cache when content is updated"""
        if not self.is_available():
            return False
        
        try:
            cache_key = f"page_content:{page_id}"
            result = self.redis_client.delete(cache_key)
            
            if result:
                current_app.logger.info(f"✅ Invalidated cache for page {page_id}")
            
            return result > 0
            
        except Exception as e:
            current_app.logger.error(f"❌ Failed to invalidate page {page_id}: {e}")
            return False
    
    # =====================================
    # SITE CACHING
    # =====================================
    
    def cache_site_pages(self, site_id, pages_data, ttl=1800):
        """Cache site's published pages list"""
        if not self.is_available():
            return False
        
        try:
            cache_key = f"site_pages:{site_id}"
            cache_data = {
                'pages': pages_data,
                'cached_at': datetime.utcnow().isoformat(),
                'site_id': site_id
            }
            
            self.redis_client.setex(
                cache_key,
                ttl,
                json.dumps(cache_data)
            )
            
            current_app.logger.info(f"✅ Cached site {site_id} pages")
            return True
            
        except Exception as e:
            current_app.logger.error(f"❌ Failed to cache site {site_id} pages: {e}")
            return False
    
    def get_cached_site_pages(self, site_id):
        """Get cached site pages"""
        if not self.is_available():
            return None
        
        try:
            cache_key = f"site_pages:{site_id}"
            cached_data = self.redis_client.get(cache_key)
            
            if cached_data:
                data = json.loads(cached_data)
                current_app.logger.info(f"✅ Cache HIT for site {site_id} pages")
                return data['pages']
            
            return None
            
        except Exception as e:
            current_app.logger.error(f"❌ Failed to get cached site {site_id} pages: {e}")
            return None
    
    def invalidate_site_cache(self, site_id):
        """Invalidate all caches related to a site"""
        if not self.is_available():
            return False
        
        try:
            # Get all cache keys for this site
            pattern = f"*:{site_id}*"
            keys = self.redis_client.keys(pattern)
            
            if keys:
                deleted = self.redis_client.delete(*keys)
                current_app.logger.info(f"✅ Invalidated {deleted} cache keys for site {site_id}")
                return deleted > 0
            
            return True
            
        except Exception as e:
            current_app.logger.error(f"❌ Failed to invalidate site {site_id} cache: {e}")
            return False
    
    # =====================================
    # PERFORMANCE METRICS
    # =====================================
    
    def increment_page_views(self, page_id):
        """Increment page view counter"""
        if not self.is_available():
            return False
        
        try:
            # Daily counter
            today = datetime.utcnow().strftime('%Y-%m-%d')
            daily_key = f"page_views:{page_id}:{today}"
            
            # Total counter
            total_key = f"page_views_total:{page_id}"
            
            pipeline = self.redis_client.pipeline()
            pipeline.incr(daily_key)
            pipeline.expire(daily_key, 86400 * 7)  # Keep for 7 days
            pipeline.incr(total_key)
            pipeline.execute()
            
            return True
            
        except Exception as e:
            current_app.logger.error(f"❌ Failed to increment views for page {page_id}: {e}")
            return False
    
    def get_page_views(self, page_id, days=7):
        """Get page view statistics"""
        if not self.is_available():
            return {'daily': {}, 'total': 0}
        
        try:
            stats = {'daily': {}, 'total': 0}
            
            # Get total views
            total_key = f"page_views_total:{page_id}"
            total_views = self.redis_client.get(total_key)
            stats['total'] = int(total_views) if total_views else 0
            
            # Get daily views for last N days
            for i in range(days):
                date = (datetime.utcnow() - timedelta(days=i)).strftime('%Y-%m-%d')
                daily_key = f"page_views:{page_id}:{date}"
                views = self.redis_client.get(daily_key)
                stats['daily'][date] = int(views) if views else 0
            
            return stats
            
        except Exception as e:
            current_app.logger.error(f"❌ Failed to get page {page_id} views: {e}")
            return {'daily': {}, 'total': 0}
    
    # =====================================
    # CACHE MANAGEMENT
    # =====================================
    
    def clear_all_cache(self):
        """Clear all PageMade cache (use carefully!)"""
        if not self.is_available():
            return False
        
        try:
            # Get all PageMade cache keys
            patterns = ['page_content:*', 'site_pages:*', 'page_views:*']
            keys_to_delete = []
            
            for pattern in patterns:
                keys_to_delete.extend(self.redis_client.keys(pattern))
            
            if keys_to_delete:
                deleted = self.redis_client.delete(*keys_to_delete)
                current_app.logger.info(f"✅ Cleared {deleted} cache keys")
                return deleted > 0
            
            return True
            
        except Exception as e:
            current_app.logger.error(f"❌ Failed to clear cache: {e}")
            return False
    
    def get_cache_stats(self):
        """Get cache statistics"""
        if not self.is_available():
            return {'available': False}
        
        try:
            info = self.redis_client.info()
            stats = {
                'available': True,
                'used_memory': info.get('used_memory_human', 'N/A'),
                'connected_clients': info.get('connected_clients', 0),
                'total_commands_processed': info.get('total_commands_processed', 0),
                'keyspace_hits': info.get('keyspace_hits', 0),
                'keyspace_misses': info.get('keyspace_misses', 0),
                'uptime_in_seconds': info.get('uptime_in_seconds', 0)
            }
            
            # Calculate hit rate
            hits = stats['keyspace_hits']
            misses = stats['keyspace_misses']
            if hits + misses > 0:
                stats['hit_rate'] = round((hits / (hits + misses)) * 100, 2)
            else:
                stats['hit_rate'] = 0
            
            return stats
            
        except Exception as e:
            current_app.logger.error(f"❌ Failed to get cache stats: {e}")
            return {'available': False, 'error': str(e)}

# Global cache instance
cache = CacheManager()