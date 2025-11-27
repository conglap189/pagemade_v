"""Site model."""
from datetime import datetime
from . import db


class Site(db.Model):
    """Site model for managing user websites."""
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    subdomain = db.Column(db.String(50), unique=True, nullable=False)
    description = db.Column(db.Text)
    is_published = db.Column(db.Boolean, default=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    pages = db.relationship('Page', back_populates='site', lazy=True, cascade='all, delete-orphan')
    assets = db.relationship('Asset', backref='site', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Site {self.title}>'
    
    def get_homepage(self):
        """Get main/homepage for this site."""
        from .page import Page
        return Page.query.filter_by(site_id=self.id, is_homepage=True, is_published=True).first()
    
    def get_published_pages(self):
        """Get all published pages for this site."""
        from .page import Page
        return Page.query.filter_by(site_id=self.id, is_published=True).all()
    
    def to_dict(self):
        """Convert site to dictionary."""
        from .page import Page
        from .asset import Asset
        
        pages_count = Page.query.filter_by(site_id=self.id).count()
        published_pages_count = Page.query.filter_by(site_id=self.id, is_published=True).count()
        
        return {
            'id': self.id,
            'title': self.title,
            'subdomain': self.subdomain,
            'description': self.description,
            'is_published': self.is_published,
            'homepage_url': f"https://{self.subdomain}.pagemade.site" if self.is_published else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'pages_count': pages_count,
            'published_pages_count': published_pages_count
        }
