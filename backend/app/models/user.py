"""User model."""
from flask_login import UserMixin
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from . import db


class User(UserMixin, db.Model):
    """User model for authentication and user management."""
    
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
    pages = db.relationship('Page', back_populates='user', lazy=True, cascade='all, delete-orphan')
    assets = db.relationship('Asset', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<User {self.email}>'
    
    # Password methods
    def set_password(self, password):
        """Set password hash for email/password authentication."""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Check password for email/password authentication."""
        if not self.password_hash:
            return False
        return check_password_hash(self.password_hash, password)
    
    # Google OAuth methods
    def set_google_id(self, google_id):
        """Set Google ID for OAuth authentication."""
        self.google_id = google_id
    
    # Role methods
    def is_admin(self):
        """Check if user is admin."""
        return self.role == 'admin'
    
    def make_admin(self):
        """Promote user to admin."""
        self.role = 'admin'
    
    # Utility methods
    def update_last_login(self):
        """Update last login timestamp."""
        self.last_login = datetime.utcnow()
    
    def to_dict(self):
        """Convert user to dictionary (safe for JSON)."""
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'avatar_url': self.avatar_url,
            'role': self.role,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }
