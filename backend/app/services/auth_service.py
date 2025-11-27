"""Authentication service for user management."""
from werkzeug.security import check_password_hash
from app.models import db, User


class AuthService:
    """Service for authentication operations."""
    
    @staticmethod
    def register_user(name=None, email=None, password=None, username=None, full_name=None):
        """
        Register a new user.
        
        Args:
            name: User's name (alias for full_name)
            email: Email address (must be unique)
            password: Plain text password (will be hashed)
            username: Username (optional)
            full_name: Full name (optional)
            
        Returns:
            tuple: (success: bool, user: User|None, error: str|None)
        """
        # Use appropriate name field
        user_name = full_name or name or username or email.split('@')[0] if email else 'User'
        
        # Check if email already exists
        if User.query.filter_by(email=email).first():
            return False, None, "Email đã được sử dụng"
        
        try:
            # Create new user
            user = User()
            user.name = user_name
            user.email = email
            user.role = 'user'
            user.set_password(password)
            user.update_last_login()
            
            db.session.add(user)
            db.session.commit()
            
            return True, user, None
            
        except Exception as e:
            db.session.rollback()
            return False, None, f"Lỗi tạo tài khoản: {str(e)}"
    
    @staticmethod
    def authenticate(email, password):
        """
        Authenticate user with email and password.
        
        Args:
            email: User's email address
            password: Plain text password
            
        Returns:
            tuple: (success: bool, user: User|None, error: str|None)
        """
        # Find user by email
        user = User.query.filter_by(email=email).first()
        
        if not user:
            return False, None, "Tài khoản không tồn tại"
        
        if not user.check_password(password):
            return False, None, "Mật khẩu không đúng"
        
        # Update last login
        user.update_last_login()
        db.session.commit()
        
        return True, user, None
    
    @staticmethod
    def change_password(user_id, old_password, new_password):
        """
        Change user password.
        
        Args:
            user_id: User ID
            old_password: Current password for verification
            new_password: New password to set
            
        Returns:
            tuple: (success: bool, error: str|None)
        """
        user = User.query.get(user_id)
        if not user:
            return False, "User not found"
        
        # Verify old password
        if not user.check_password(old_password):
            return False, "Mật khẩu hiện tại không đúng"
        
        try:
            user.set_password(new_password)
            db.session.commit()
            return True, None
        except Exception as e:
            db.session.rollback()
            return False, f"Lỗi đổi mật khẩu: {str(e)}"
    
    @staticmethod
    def update_profile(user_id, **kwargs):
        """
        Update user profile information.
        
        Args:
            user_id: User ID
            **kwargs: Fields to update (full_name, email, avatar, etc.)
            
        Returns:
            tuple: (success: bool, user: User|None, error: str|None)
        """
        user = User.query.get(user_id)
        if not user:
            return False, None, "User not found"
        
        try:
            # Update allowed fields
            allowed_fields = ['full_name', 'email', 'avatar', 'bio', 'website']
            for field, value in kwargs.items():
                if field in allowed_fields:
                    setattr(user, field, value)
            
            db.session.commit()
            return True, user, None
            
        except Exception as e:
            db.session.rollback()
            return False, None, f"Lỗi cập nhật profile: {str(e)}"
    
    @staticmethod
    def get_user_by_id(user_id):
        """Get user by ID."""
        return User.query.get(user_id)
    
    @staticmethod
    def get_user_by_username(username):
        """Get user by username."""
        return User.query.filter_by(username=username).first()
    
    @staticmethod
    def get_user_by_email(email):
        """Get user by email."""
        return User.query.filter_by(email=email).first()
