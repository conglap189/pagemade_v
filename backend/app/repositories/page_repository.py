"""Page repository for database operations."""
from app.models import db, Page


class PageRepository:
    """Repository for Page data access."""
    
    @staticmethod
    def create(page_data):
        """Create new page."""
        page = Page(**page_data)
        db.session.add(page)
        db.session.commit()
        return page
    
    @staticmethod
    def find_by_id(page_id):
        """Find page by ID."""
        return Page.query.get(page_id)
    
    @staticmethod
    def find_by_slug(site_id, slug):
        """Find page by site and slug."""
        return Page.query.filter_by(site_id=site_id, slug=slug).first()
    
    @staticmethod
    def find_by_site_and_slug(site_id, slug):
        """Find page by site and slug (alias for find_by_slug)."""
        return PageRepository.find_by_slug(site_id, slug)
    
    @staticmethod
    def find_by_site(site_id):
        """Find all pages by site ID."""
        return Page.query.filter_by(site_id=site_id).order_by(
            Page.is_homepage.desc(),
            Page.created_at.desc()
        ).all()
    
    @staticmethod
    def find_by_user(user_id):
        """Find all pages by user ID."""
        return Page.query.filter_by(user_id=user_id).order_by(
            Page.created_at.desc()
        ).all()
    
    @staticmethod
    def find_homepage(site_id):
        """Find homepage for a site."""
        return Page.query.filter_by(site_id=site_id, is_homepage=True).first()
    
    @staticmethod
    def find_published_by_id(page_id):
        """Find published page by ID."""
        return Page.query.filter_by(id=page_id, is_published=True).first()
    
    @staticmethod
    def find_published_by_site_and_slug(site_id, slug):
        """Find published page by site and slug."""
        return Page.query.filter_by(site_id=site_id, slug=slug, is_published=True).first()
    
    @staticmethod
    def find_published_by_user(user_id):
        """Find all published pages by user ID."""
        return Page.query.filter_by(user_id=user_id, is_published=True).order_by(
            Page.created_at.desc()
        ).all()
    
    @staticmethod
    def find_published_by_site(site_id):
        """Find all published pages for a site."""
        return Page.query.filter_by(
            site_id=site_id,
            is_published=True
        ).order_by(Page.is_homepage.desc(), Page.created_at.desc()).all()
    
    @staticmethod
    def find_unpublished_by_site(site_id):
        """Find all unpublished pages for a site."""
        return Page.query.filter_by(
            site_id=site_id,
            is_published=False
        ).order_by(Page.created_at.desc()).all()
    
    @staticmethod
    def get_all():
        """Get all pages."""
        return Page.query.all()
    
    @staticmethod
    def get_paginated(page=1, per_page=20):
        """Get paginated pages."""
        return Page.query.order_by(Page.created_at.desc()).paginate(
            page=page, per_page=per_page
        )
    
    @staticmethod
    def update(page, **kwargs):
        """Update page fields."""
        for key, value in kwargs.items():
            if hasattr(page, key):
                setattr(page, key, value)
        db.session.commit()
        return page
    
    @staticmethod
    def delete(page):
        """Delete page."""
        db.session.delete(page)
        db.session.commit()
    
    @staticmethod
    def count():
        """Count total pages."""
        return Page.query.count()
    
    @staticmethod
    def count_by_site(site_id):
        """Count pages by site."""
        return Page.query.filter_by(site_id=site_id).count()
    
    @staticmethod
    def count_published():
        """Count published pages."""
        return Page.query.filter_by(is_published=True).count()
    
    @staticmethod
    def search(query):
        """Search pages by title or slug."""
        search_pattern = f"%{query}%"
        return Page.query.filter(
            (Page.title.ilike(search_pattern)) |
            (Page.slug.ilike(search_pattern))
        ).all()
