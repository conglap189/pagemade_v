"""Page service for page management."""
import os
import json
from datetime import datetime
from flask import current_app
from app.models import db, Page, Site


class PageService:
    """Service for page operations."""
    
    @staticmethod
    def create_page(user_id, site_id, title, description=None, template='default'):
        """
        Create a new page.
        
        Args:
            user_id: User ID who owns the page
            site_id: Site ID where page belongs
            title: Page title
            description: Optional page description
            template: Template name (default: 'default')
            
        Returns:
            tuple: (success: bool, page: Page|None, error: str|None)
        """
        # Verify site ownership
        site = Site.query.get(site_id)
        if not site or site.user_id != user_id:
            return False, None, "Unauthorized or site not found"
        
        try:
            page = Page(
                user_id=user_id,
                site_id=site_id,
                title=title,
                description=description,
                template=template
            )
            
            # Generate slug from title
            page.slug = page.generate_slug()
            
            # Apply template content if template is specified and not blank/default
            if template and template not in ['blank', 'default', '']:
                try:
                    # Template files are in backend/static/templates/
                    # current_app.root_path = /backend/app, so we need '..' to go to /backend/static/
                    template_file = os.path.join(current_app.root_path, '..', 'static', 'templates', f'{template}.json')
                    current_app.logger.info(f"📦 [PageService] Looking for template: {template}")
                    current_app.logger.info(f"📦 [PageService] root_path: {current_app.root_path}")
                    current_app.logger.info(f"📦 [PageService] template_file: {template_file}")
                    current_app.logger.info(f"📦 [PageService] file exists: {os.path.exists(template_file)}")
                    
                    if os.path.exists(template_file):
                        with open(template_file, 'r', encoding='utf-8') as f:
                            template_data = json.load(f)
                            content = template_data.get('content', {})
                            page.html_content = content.get('html', '')
                            page.css_content = content.get('css', '')
                            current_app.logger.info(f"✅ Applied template '{template}' to new page")
                            current_app.logger.info(f"✅ html_content length: {len(page.html_content)}")
                            current_app.logger.info(f"✅ css_content length: {len(page.css_content)}")
                    else:
                        current_app.logger.error(f"❌ Template file NOT FOUND: {template_file}")
                except Exception as e:
                    current_app.logger.error(f"❌ Error applying template '{template}': {e}")
            
            db.session.add(page)
            db.session.commit()
            
            return True, page, None
            
        except Exception as e:
            db.session.rollback()
            return False, None, f"Lỗi tạo trang: {str(e)}"
    
    @staticmethod
    def get_pages_by_site(site_id, user_id):
        """Get all pages for a site."""
        return Page.query.filter_by(
            site_id=site_id,
            user_id=user_id
        ).order_by(Page.is_homepage.desc(), Page.created_at.desc()).all()
    
    @staticmethod
    def get_page_by_id(page_id):
        """Get page by ID."""
        return Page.query.get(page_id)
    
    @staticmethod
    def get_page_by_slug(site_id, slug):
        """Get page by site and slug."""
        return Page.query.filter_by(site_id=site_id, slug=slug).first()
    
    @staticmethod
    def update_page(page_id, user_id, **kwargs):
        """
        Update page information.
        
        Args:
            page_id: Page ID
            user_id: User ID for ownership verification
            **kwargs: Fields to update
            
        Returns:
            tuple: (success: bool, page: Page|None, error: str|None)
        """
        page = Page.query.get(page_id)
        
        if not page:
            return False, None, "Page not found"
        
        # Verify ownership
        if page.user_id != user_id:
            return False, None, "Unauthorized"
        
        try:
            # Update allowed fields
            allowed_fields = ['title', 'description', 'template', 'content', 
                            'html_content', 'css_content']
            
            for field, value in kwargs.items():
                if field in allowed_fields:
                    setattr(page, field, value)
            
            # Regenerate slug if title changed
            if 'title' in kwargs:
                page.slug = page.generate_slug()
            
            db.session.commit()
            return True, page, None
            
        except Exception as e:
            db.session.rollback()
            return False, None, f"Update failed: {str(e)}"
    
    @staticmethod
    def update_content(page_id, content, user_id):
        """
        Update page content (for PageMaker/GrapesJS).
        
        Args:
            page_id: Page ID
            content: JSON content string
            user_id: User ID for ownership verification
            
        Returns:
            tuple: (success: bool, error: str|None)
        """
        page = Page.query.get(page_id)
        
        if not page:
            return False, "Page not found"
        
        # Verify ownership
        if page.user_id != user_id:
            return False, "Unauthorized"
        
        try:
            page.content = content
            db.session.commit()
            return True, None
            
        except Exception as e:
            db.session.rollback()
            return False, f"Update failed: {str(e)}"
    
    @staticmethod
    def save_page_content(page_id, user_id, content_data):
        """
        Save page content from editor.
        
        Args:
            page_id: Page ID
            user_id: User ID for ownership verification
            content_data: Dict with 'html' and 'css' keys
            
        Returns:
            tuple: (success: bool, error: str|None)
        """
        page = Page.query.get(page_id)
        
        if not page:
            return False, "Page not found"
        
        # Verify ownership
        if page.user_id != user_id:
            return False, "Unauthorized"
        
        try:
            # Save HTML and CSS content separately
            page.html_content = content_data.get('html', '')
            page.css_content = content_data.get('css', '')
            page.content = content_data.get('gjs-html', '')  # GrapesJS format
            
            db.session.commit()
            return True, None
            
        except Exception as e:
            db.session.rollback()
            return False, f"Save failed: {str(e)}"
    
    @staticmethod
    def publish_page(page_id, user_id, storage_path=None):
        """
        Publish page (make it publicly accessible).
        
        Args:
            page_id: Page ID
            user_id: User ID for ownership verification
            storage_path: Optional path to save generated HTML
            
        Returns:
            tuple: (success: bool, error: str|None)
        """
        page = Page.query.get(page_id)
        
        if not page:
            return False, "Page not found"
        
        # Verify ownership
        if page.user_id != user_id:
            return False, "Unauthorized"
        
        try:
            # If using Silex/GrapesJS content
            if page.html_content or page.content:
                page.is_published = True
                page.published_at = datetime.utcnow()
                
                # Optionally generate static HTML file
                if storage_path and page.html_content:
                    success = page.publish(storage_path)
                    if not success:
                        return False, "Failed to generate HTML file"
            else:
                return False, "Page has no content to publish"
            
            db.session.commit()
            return True, None
            
        except Exception as e:
            db.session.rollback()
            return False, f"Publish failed: {str(e)}"
    
    @staticmethod
    def unpublish_page(page_id, user_id):
        """Unpublish page."""
        page = Page.query.get(page_id)
        
        if not page:
            return False, "Page not found"
        
        # Verify ownership
        if page.user_id != user_id:
            return False, "Unauthorized"
        
        try:
            page.is_published = False
            db.session.commit()
            return True, None
            
        except Exception as e:
            db.session.rollback()
            return False, f"Unpublish failed: {str(e)}"
    
    @staticmethod
    def delete_page(page_id, user_id):
        """
        Delete page.
        
        Args:
            page_id: Page ID
            user_id: User ID for ownership verification
            
        Returns:
            tuple: (success: bool, error: str|None)
        """
        page = Page.query.get(page_id)
        
        if not page:
            return False, "Page not found"
        
        # Verify ownership
        if page.user_id != user_id:
            return False, "Unauthorized"
        
        # Prevent deleting homepage
        if page.is_homepage:
            return False, "Cannot delete homepage"
        
        try:
            # Delete physical HTML file if exists
            if page.html_path and os.path.exists(page.html_path):
                os.remove(page.html_path)
            
            db.session.delete(page)
            db.session.commit()
            
            return True, None
            
        except Exception as e:
            db.session.rollback()
            return False, f"Delete failed: {str(e)}"
    
    @staticmethod
    def set_as_homepage(page_id, user_id):
        """
        Set page as site homepage.
        
        Args:
            page_id: Page ID
            user_id: User ID for ownership verification
            
        Returns:
            tuple: (success: bool, error: str|None)
        """
        page = Page.query.get(page_id)
        
        if not page:
            return False, "Page not found"
        
        # Verify ownership
        if page.user_id != user_id:
            return False, "Unauthorized"
        
        try:
            # Remove homepage flag from other pages in this site
            Page.query.filter_by(site_id=page.site_id).update({'is_homepage': False})
            
            # Set this page as homepage
            page.is_homepage = True
            page.slug = 'index'
            
            db.session.commit()
            return True, None
            
        except Exception as e:
            db.session.rollback()
            return False, f"Set homepage failed: {str(e)}"
