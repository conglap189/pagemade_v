"""Site service for website management."""
from app.models import db, Site, Page


class SiteService:
    """Service for site operations."""
    
    @staticmethod
    def create_site(user_id, title, subdomain, description=None):
        """
        Create a new site.
        
        Args:
            user_id: User ID who owns the site
            title: Site title
            subdomain: Unique subdomain
            description: Optional site description
            
        Returns:
            tuple: (success: bool, site: Site|None, error: str|None)
        """
        # Check if subdomain already exists
        existing = Site.query.filter_by(subdomain=subdomain).first()
        if existing:
            return False, None, "Subdomain đã được sử dụng"
        
        try:
            site = Site(
                user_id=user_id,
                title=title,
                subdomain=subdomain,
                description=description
            )
            
            db.session.add(site)
            db.session.commit()
            
            # Create default homepage
            homepage = Page(
                site_id=site.id,
                user_id=user_id,
                title="Trang chủ",
                slug="index",
                is_homepage=True,
                description=f"Trang chủ của {title}"
            )
            
            db.session.add(homepage)
            db.session.commit()
            
            return True, site, None
            
        except Exception as e:
            db.session.rollback()
            import traceback
            error_details = f"Lỗi tạo website: {str(e)}\n{traceback.format_exc()}"
            print(error_details)  # Debug output
            return False, None, f"Lỗi tạo website: {str(e)}"
    
    @staticmethod
    def get_sites_by_user(user_id):
        """Get all sites owned by a user."""
        return Site.query.filter_by(user_id=user_id).order_by(Site.created_at.desc()).all()
    
    @staticmethod
    def get_site_by_id(site_id):
        """Get site by ID."""
        return Site.query.get(site_id)
    
    @staticmethod
    def get_site_by_subdomain(subdomain):
        """Get site by subdomain."""
        return Site.query.filter_by(subdomain=subdomain).first()
    
    @staticmethod
    def update_site(site_id, user_id, **kwargs):
        """
        Update site information.
        
        Args:
            site_id: Site ID
            user_id: User ID for ownership verification
            **kwargs: Fields to update
            
        Returns:
            tuple: (success: bool, site: Site|None, error: str|None)
        """
        site = Site.query.get(site_id)
        
        if not site:
            return False, None, "Site not found"
        
        # Verify ownership
        if site.user_id != user_id:
            return False, None, "Unauthorized"
        
        try:
            # Update allowed fields
            allowed_fields = ['title', 'description', 'custom_domain', 'is_published']
            for field, value in kwargs.items():
                if field in allowed_fields:
                    setattr(site, field, value)
            
            db.session.commit()
            return True, site, None
            
        except Exception as e:
            db.session.rollback()
            return False, None, f"Update failed: {str(e)}"
    
    @staticmethod
    def delete_site(site_id, user_id):
        """
        Delete site and all associated data.
        
        Args:
            site_id: Site ID
            user_id: User ID for ownership verification
            
        Returns:
            tuple: (success: bool, error: str|None)
        """
        site = Site.query.get(site_id)
        
        if not site:
            return False, "Site not found"
        
        # Verify ownership
        if site.user_id != user_id:
            return False, "Unauthorized"
        
        try:
            # Delete all pages (cascade will handle this automatically if set up)
            Page.query.filter_by(site_id=site_id).delete()
            
            # Delete site
            db.session.delete(site)
            db.session.commit()
            
            return True, None
            
        except Exception as e:
            db.session.rollback()
            return False, f"Delete failed: {str(e)}"
    
    @staticmethod
    def publish_site(site_id, user_id):
        """
        Publish site (make it publicly accessible).
        
        Args:
            site_id: Site ID
            user_id: User ID for ownership verification
            
        Returns:
            tuple: (success: bool, error: str|None)
        """
        site = Site.query.get(site_id)
        
        if not site:
            return False, "Site not found"
        
        # Verify ownership
        if site.user_id != user_id:
            return False, "Unauthorized"
        
        # Check if site has at least one published page
        published_pages = Page.query.filter_by(
            site_id=site_id,
            is_published=True
        ).count()
        
        if published_pages == 0:
            return False, "Site must have at least one published page"
        
        try:
            site.is_published = True
            db.session.commit()
            return True, None
            
        except Exception as e:
            db.session.rollback()
            return False, f"Publish failed: {str(e)}"
    
    @staticmethod
    def unpublish_site(site_id, user_id):
        """Unpublish site (make it inaccessible)."""
        site = Site.query.get(site_id)
        
        if not site:
            return False, "Site not found"
        
        # Verify ownership
        if site.user_id != user_id:
            return False, "Unauthorized"
        
        try:
            site.is_published = False
            db.session.commit()
            return True, None
            
        except Exception as e:
            db.session.rollback()
            return False, f"Unpublish failed: {str(e)}"
