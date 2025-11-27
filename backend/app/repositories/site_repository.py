"""Site repository for database operations."""
from app.models import db, Site


class SiteRepository:
    """Repository for Site data access."""
    
    @staticmethod
    def create(site_data):
        """Create new site."""
        site = Site(**site_data)
        db.session.add(site)
        db.session.commit()
        return site
    
    @staticmethod
    def find_by_id(site_id):
        """Find site by ID."""
        return Site.query.get(site_id)
    
    @staticmethod
    def find_by_subdomain(subdomain):
        """Find site by subdomain."""
        return Site.query.filter_by(subdomain=subdomain).first()
    
    @staticmethod
    def find_by_custom_domain(custom_domain):
        """Find site by custom domain."""
        return Site.query.filter_by(custom_domain=custom_domain).first()
    
    @staticmethod
    def count():
        """Count all sites."""
        return Site.query.count()
    
    @staticmethod
    def count_published():
        """Count published sites."""
        return Site.query.filter_by(is_published=True).count()
    
    @staticmethod
    def get_recent(limit=10):
        """Get recent sites."""
        return Site.query.order_by(Site.created_at.desc()).limit(limit).all()
    
    @staticmethod
    def find_by_user(user_id):
        """Find all sites by user ID."""
        return Site.query.filter_by(user_id=user_id).order_by(
            Site.created_at.desc()
        ).all()
    
    @staticmethod
    def find_published():
        """Find all published sites."""
        return Site.query.filter_by(is_published=True).all()
    
    @staticmethod
    def get_all():
        """Get all sites."""
        return Site.query.all()
    
    @staticmethod
    def get_paginated(page=1, per_page=20):
        """Get paginated sites."""
        return Site.query.order_by(Site.created_at.desc()).paginate(
            page=page, per_page=per_page
        )
    
    @staticmethod
    def update(site, **kwargs):
        """Update site fields."""
        for key, value in kwargs.items():
            if hasattr(site, key):
                setattr(site, key, value)
        db.session.commit()
        return site
    
    @staticmethod
    def delete(site):
        """Delete site."""
        db.session.delete(site)
        db.session.commit()
    
    @staticmethod
    def count():
        """Count total sites."""
        return Site.query.count()
    
    @staticmethod
    def count_by_user(user_id):
        """Count sites by user."""
        return Site.query.filter_by(user_id=user_id).count()
    
    @staticmethod
    def search(query):
        """Search sites by title or subdomain."""
        search_pattern = f"%{query}%"
        return Site.query.filter(
            (Site.title.ilike(search_pattern)) |
            (Site.subdomain.ilike(search_pattern))
        ).all()
