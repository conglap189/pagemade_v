from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
import os
import json

# Import db from __init__ to avoid circular imports
from . import db

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    avatar_url = db.Column(db.String(200))
    
    # Authentication fields
    password_hash = db.Column(db.String(255))  # For email/password auth
    google_id = db.Column(db.String(100), unique=True)  # For Google OAuth
    
    # Role management
    role = db.Column(db.String(20), default='user')  # 'user' or 'admin'
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    
    # Relationships
    sites = db.relationship('Site', backref='owner', lazy=True, cascade='all, delete-orphan')
    pages = db.relationship('Page', backref='author', lazy=True, cascade='all, delete-orphan')
    assets = db.relationship('Asset', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<User {self.email}>'
    
    # Password methods
    def set_password(self, password):
        """Set password hash for email/password authentication"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Check password for email/password authentication"""
        if not self.password_hash:
            return False
        return check_password_hash(self.password_hash, password)
    
    # Google OAuth methods
    def set_google_id(self, google_id):
        """Set Google ID for OAuth authentication"""
        self.google_id = google_id
    
    # Role methods
    def is_admin(self):
        """Check if user is admin"""
        return self.role == 'admin'
    
    def make_admin(self):
        """Promote user to admin"""
        self.role = 'admin'
    
    # Utility methods
    def update_last_login(self):
        """Update last login timestamp"""
        self.last_login = datetime.utcnow()
    
    def to_dict(self):
        """Convert user to dictionary (safe for JSON)"""
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'avatar_url': self.avatar_url,
            'role': self.role,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'sites_count': len(self.sites)
        }

class Site(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    subdomain = db.Column(db.String(50), unique=True, nullable=False)
    description = db.Column(db.Text)
    # NEW: Field để mark site đã published để hiển thị trên subdomain
    is_published = db.Column(db.Boolean, default=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    pages = db.relationship('Page', backref='site', lazy=True, cascade='all, delete-orphan')
    assets = db.relationship('Asset', backref='site', lazy=True, cascade='all, delete-orphan')
    
    # NEW: Helper method để get homepage của site
    def get_homepage(self):
        """Get main/homepage for this site"""
        return Page.query.filter_by(site_id=self.id, is_homepage=True, is_published=True).first()
    
    # NEW: Helper method để get all published pages
    def get_published_pages(self):
        """Get all published pages for this site"""
        return Page.query.filter_by(site_id=self.id, is_published=True).all()
    
    def __repr__(self):
        return f'<Site {self.title}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'subdomain': self.subdomain,
            'description': self.description,
            # NEW: Include published status và homepage info
            'is_published': self.is_published,
            'homepage_url': f"https://{self.subdomain}.pagemade.site" if self.is_published else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'pages_count': len(self.pages),
            # NEW: Published pages count
            'published_pages_count': len(self.get_published_pages())
        }

class Page(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    # NEW: Slug field cho URL routing (ví dụ: about, contact, services)
    slug = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    template = db.Column(db.String(50), default='default')
    content = db.Column(db.Text)  # JSON content hoặc HTML content
    html_path = db.Column(db.String(500))  # Path to generated HTML file
    
    # Silex editor content fields
    html_content = db.Column(db.Text)  # Processed HTML from Silex
    css_content = db.Column(db.Text)   # Extracted CSS from Silex
    
    is_published = db.Column(db.Boolean, default=False)
    published_at = db.Column(db.DateTime)  # Timestamp when published
    # NEW: Field để mark page là homepage của site
    is_homepage = db.Column(db.Boolean, default=False)
    
    # Foreign keys for data isolation
    site_id = db.Column(db.Integer, db.ForeignKey('site.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)  # Direct user reference for faster queries
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # NEW: Helper method để get full URL của page
    def get_url(self):
        """Get full URL for this page"""
        if self.is_homepage:
            return f"https://{self.site.subdomain}.pagemade.site"
        return f"https://{self.site.subdomain}.pagemade.site/{self.slug}"
    
    # NEW: Helper method để generate slug từ title
    def generate_slug(self):
        """Generate URL-friendly slug from title (Vietnamese-aware)"""
        import re
        import unicodedata
        
        # Convert Vietnamese characters to ASCII
        # Normalize to NFD (decomposed form), then remove combining marks
        slug = unicodedata.normalize('NFD', self.title.lower())
        slug = slug.encode('ascii', 'ignore').decode('utf-8')
        
        # Replace spaces and special chars with hyphens
        slug = re.sub(r'[^\w\s-]', '', slug)
        slug = re.sub(r'[-\s]+', '-', slug)
        
        return slug.strip('-')[:50]  # Limit to 50 chars
    
    def __repr__(self):
        return f'<Page {self.title}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            # NEW: Include slug và homepage status
            'slug': self.slug,
            'description': self.description,
            'template': self.template,
            'is_published': self.is_published,
            'published_at': self.published_at.isoformat() if self.published_at else None,
            # NEW: Homepage status và public URL
            'is_homepage': self.is_homepage,
            'public_url': self.get_url() if self.is_published else None,
            'site_id': self.site_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            # UPDATED: Use new URL format
            'url': self.get_url() if self.is_published else None,
            # Include content status for debugging
            'has_html_content': bool(self.html_content),
            'has_css_content': bool(self.css_content)
        }
    
    def publish_from_silex(self, html_content, css_content=None):
        """Publish page with content from Silex editor"""
        try:
            # Store Silex content
            self.html_content = html_content
            self.css_content = css_content or ""
            self.is_published = True
            self.published_at = datetime.utcnow()
            
            return True
        except Exception as e:
            print(f"Error publishing page from Silex: {e}")
            return False
    
    def publish(self, storage_path):
        """Generate and save HTML file (legacy method)"""
        if not self.content:
            return False
            
        try:
            # Create site directory
            site_dir = os.path.join(storage_path, self.site.subdomain)
            os.makedirs(site_dir, exist_ok=True)
            
            # Generate HTML filename
            html_filename = f"page_{self.id}.html"
            html_path = os.path.join(site_dir, html_filename)
            
            # Generate HTML content
            html_content = self.generate_html()
            
            # Save to file
            with open(html_path, 'w', encoding='utf-8') as f:
                f.write(html_content)
            
            # Update database
            self.html_path = html_path
            self.is_published = True
            self.published_at = datetime.utcnow()
            
            return True
        except Exception as e:
            print(f"Error publishing page: {e}")
            return False
    
    def generate_html(self):
        """Generate HTML from page content (supports both PageMaker JSON and legacy formats)"""
        
        # Parse content if it's PageMaker JSON format
        html_body = ''
        css_styles = ''
        
        if self.content:
            try:
                # Check if content is JSON (PageMaker format)
                if isinstance(self.content, str) and self.content.strip().startswith('{'):
                    content_data = json.loads(self.content)
                    html_body = content_data.get('html', '')
                    css_styles = content_data.get('css', '')
                elif isinstance(self.content, dict):
                    # Already parsed JSON
                    html_body = self.content.get('html', '')
                    css_styles = self.content.get('css', '')
                else:
                    # Legacy: content is plain HTML
                    html_body = self.content
            except json.JSONDecodeError:
                # Fallback: treat as plain HTML
                html_body = self.content
        
        # If no content, use default template
        if not html_body:
            html_body = f"""
    <div class="hero-section text-center">
        <div class="container">
            <h1 class="display-4 mb-4">{self.title}</h1>
            <p class="lead">{self.description or 'Trang được tạo bằng PageMade'}</p>
        </div>
    </div>
    
    <div class="content-section">
        <div class="container">
            <p>Nội dung đang được cập nhật...</p>
        </div>
    </div>
    
    <footer class="footer text-center">
        <div class="container">
            <p>&copy; 2025 {self.site.title} - 
            <a href="https://pagemade.site" class="text-decoration-none">Được tạo bằng PageMade</a></p>
        </div>
    </footer>
"""
            css_styles = """
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        .hero-section { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 100px 0; 
        }
        .content-section { padding: 60px 0; }
        .footer { background: #2c3e50; color: white; padding: 40px 0; }
"""
        
        # NEW: Enhanced HTML template với subdomain support
        return f"""<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{self.title} - {self.site.title}</title>
    <!-- NEW: Meta tags cho SEO -->
    <meta name="description" content="{self.description or 'Trang được tạo bằng PageMade'}">
    <meta property="og:title" content="{self.title}">
    <meta property="og:description" content="{self.description or 'Trang được tạo bằng PageMade'}">
    <meta property="og:url" content="{self.get_url()}">
    
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
{css_styles}
    </style>
</head>
<body>
{html_body}
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>"""


class Asset(db.Model):
    """Model for managing uploaded assets (images, files) for sites"""
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)  # Stored filename (UUID-based)
    original_name = db.Column(db.String(255), nullable=False)  # Original upload filename
    file_size = db.Column(db.Integer, nullable=False)  # File size in bytes
    file_type = db.Column(db.String(50), nullable=False)  # MIME type (image/jpeg, etc.)
    width = db.Column(db.Integer)  # Image width (for images)
    height = db.Column(db.Integer)  # Image height (for images)
    url = db.Column(db.String(500), nullable=False)  # Full URL path to file
    
    # Relationships
    site_id = db.Column(db.Integer, db.ForeignKey('site.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<Asset {self.original_name}>'
    
    @property
    def file_size_formatted(self):
        """Return human-readable file size"""
        size = self.file_size
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024.0:
                return f"{size:.1f} {unit}"
            size /= 1024.0
        return f"{size:.1f} TB"
    
    @property
    def is_image(self):
        """Check if asset is an image"""
        return self.file_type.startswith('image/')
    
    def to_dict(self):
        """Convert asset to dictionary for API responses"""
        return {
            'id': self.id,
            'filename': self.filename,
            'original_name': self.original_name,
            'file_size': self.file_size,
            'file_size_formatted': self.file_size_formatted,
            'file_type': self.file_type,
            'width': self.width,
            'height': self.height,
            'url': self.url,
            'is_image': self.is_image,
            'created_at': self.created_at.isoformat(),
            'site_id': self.site_id,
            'user_id': self.user_id
        }