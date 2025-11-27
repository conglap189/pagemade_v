"""User repository for database operations."""
from app.models import db, User


class UserRepository:
    """Repository for User data access."""
    
    @staticmethod
    def create(user_data):
        """Create new user."""
        user = User(**user_data)
        db.session.add(user)
        db.session.commit()
        return user
    
    @staticmethod
    def find_by_id(user_id):
        """Find user by ID."""
        return User.query.get(user_id)
    
    @staticmethod
    def find_by_username(username):
        """Find user by username (deprecated - use email instead)."""
        # User model doesn't have username field, use email instead
        return User.query.filter_by(email=username).first()
    
    @staticmethod
    def find_by_email(email):
        """Find user by email."""
        return User.query.filter_by(email=email).first()
    
    @staticmethod
    def find_by_username_or_email(identifier):
        """Find user by email (username field doesn't exist)."""
        return User.query.filter_by(email=identifier).first()
    
    @staticmethod
    def get_all():
        """Get all users."""
        return User.query.all()
    
    @staticmethod
    def get_paginated(page=1, per_page=20):
        """Get paginated users."""
        return User.query.paginate(page=page, per_page=per_page)
    
    @staticmethod
    def get_recent(limit=10):
        """Get recent users."""
        return User.query.order_by(User.created_at.desc()).limit(limit).all()
    
    @staticmethod
    def update(user, **kwargs):
        """Update user fields."""
        for key, value in kwargs.items():
            if hasattr(user, key):
                setattr(user, key, value)
        db.session.commit()
        return user
    
    @staticmethod
    def delete(user):
        """Delete user."""
        db.session.delete(user)
        db.session.commit()
    
    @staticmethod
    def count():
        """Count total users."""
        return User.query.count()
    
    @staticmethod
    def search(query):
        """Search users by name or email."""
        search_pattern = f"%{query}%"
        return User.query.filter(
            (User.name.ilike(search_pattern)) |
            (User.email.ilike(search_pattern))
        ).all()
