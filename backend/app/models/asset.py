"""Asset model."""
from datetime import datetime
from . import db


class Asset(db.Model):
    """Model for managing uploaded assets (images, files) for sites."""
    
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
        """Return human-readable file size."""
        size = self.file_size
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024.0:
                return f"{size:.1f} {unit}"
            size /= 1024.0
        return f"{size:.1f} TB"
    
    @property
    def is_image(self):
        """Check if asset is an image."""
        return self.file_type.startswith('image/')
    
    def to_dict(self):
        """Convert asset to dictionary for API responses."""
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
