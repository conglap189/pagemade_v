"""Page model."""
import os
import json
import re
import unicodedata
from datetime import datetime
from . import db


class Page(db.Model):
    """Page model for managing website pages."""
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    slug = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    template = db.Column(db.String(50), default='default')
    content = db.Column(db.Text)  # JSON content or HTML content
    html_path = db.Column(db.String(500))  # Path to generated HTML file
    
    # Silex editor content fields
    html_content = db.Column(db.Text)  # Processed HTML from Silex
    css_content = db.Column(db.Text)   # Extracted CSS from Silex
    
    is_published = db.Column(db.Boolean, default=False)
    published_at = db.Column(db.DateTime)
    is_homepage = db.Column(db.Boolean, default=False)
    
    # Foreign keys for data isolation
    site_id = db.Column(db.Integer, db.ForeignKey('site.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # Relationships
    site = db.relationship('Site', back_populates='pages')
    user = db.relationship('User', back_populates='pages')
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<Page {self.title}>'
    
    def get_url(self):
        """Get full URL for this page."""
        if self.is_homepage:
            return f"https://{self.site.subdomain}.pagemade.site"
        return f"https://{self.site.subdomain}.pagemade.site/{self.slug}"
    
    def generate_slug(self):
        """Generate URL-friendly slug from title (Vietnamese-aware)."""
        # Normalize to NFD (decomposed form), then remove combining marks
        slug = unicodedata.normalize('NFD', self.title.lower())
        slug = slug.encode('ascii', 'ignore').decode('utf-8')
        
        # Replace spaces and special chars with hyphens
        slug = re.sub(r'[^\w\s-]', '', slug)
        slug = re.sub(r'[-\s]+', '-', slug)
        
        return slug.strip('-')[:50]  # Limit to 50 chars
    
    def publish_from_silex(self, html_content, css_content=None):
        """Publish page with content from Silex editor."""
        try:
            self.html_content = html_content
            self.css_content = css_content or ""
            self.is_published = True
            self.published_at = datetime.utcnow()
            return True
        except Exception as e:
            print(f"Error publishing page from Silex: {e}")
            return False
    
    def publish(self, storage_path):
        """Generate and save HTML file (legacy method)."""
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
        """Generate HTML from page content."""
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
                    html_body = self.content.get('html', '')
                    css_styles = self.content.get('css', '')
                else:
                    html_body = self.content
            except json.JSONDecodeError:
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
        
        return f"""<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{self.title} - {self.site.title}</title>
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
    
    def to_dict(self):
        """Convert page to dictionary."""
        return {
            'id': self.id,
            'title': self.title,
            'slug': self.slug,
            'description': self.description,
            'template': self.template,
            'is_published': self.is_published,
            'published_at': self.published_at.isoformat() if self.published_at else None,
            'is_homepage': self.is_homepage,
            'public_url': self.get_url() if self.is_published else None,
            'site_id': self.site_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'url': self.get_url() if self.is_published else None,
            'has_html_content': bool(self.html_content),
            'has_css_content': bool(self.css_content)
        }
