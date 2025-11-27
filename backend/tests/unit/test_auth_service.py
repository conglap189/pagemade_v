"""Unit tests for AuthService."""

import pytest
from app.services.auth_service import AuthService
from app.middlewares import ValidationError, AuthenticationError
from app.models import User


class TestAuthServiceRegister:
    """Tests for user registration."""
    
    def test_register_user_success(self, app, db_session):
        """Test successful user registration."""
        with app.app_context():
            user_data = {
                'username': 'newuser',
                'email': 'newuser@example.com',
                'password': 'password123'
            }
            
            result = AuthService.register_user(user_data)
            
            assert result['success'] is True
            assert 'user' in result
            assert result['user']['username'] == 'newuser'
            assert result['user']['email'] == 'newuser@example.com'
            
            # Verify user in database
            user = User.query.filter_by(username='newuser').first()
            assert user is not None
            assert user.check_password('password123')
    
    def test_register_duplicate_username(self, app, db_session, sample_user):
        """Test registration with duplicate username."""
        with app.app_context():
            user_data = {
                'username': sample_user.username,
                'email': 'different@example.com',
                'password': 'password123'
            }
            
            with pytest.raises(ValidationError) as exc_info:
                AuthService.register_user(user_data)
            
            assert 'already exists' in str(exc_info.value).lower()
    
    def test_register_duplicate_email(self, app, db_session, sample_user):
        """Test registration with duplicate email."""
        with app.app_context():
            user_data = {
                'username': 'differentuser',
                'email': sample_user.email,
                'password': 'password123'
            }
            
            with pytest.raises(ValidationError) as exc_info:
                AuthService.register_user(user_data)
            
            assert 'already exists' in str(exc_info.value).lower()
    
    def test_register_missing_username(self, app, db_session):
        """Test registration without username."""
        with app.app_context():
            user_data = {
                'email': 'test@example.com',
                'password': 'password123'
            }
            
            with pytest.raises(ValidationError) as exc_info:
                AuthService.register_user(user_data)
            
            assert 'username' in str(exc_info.value).lower()
    
    def test_register_missing_email(self, app, db_session):
        """Test registration without email."""
        with app.app_context():
            user_data = {
                'username': 'testuser',
                'password': 'password123'
            }
            
            with pytest.raises(ValidationError) as exc_info:
                AuthService.register_user(user_data)
            
            assert 'email' in str(exc_info.value).lower()
    
    def test_register_missing_password(self, app, db_session):
        """Test registration without password."""
        with app.app_context():
            user_data = {
                'username': 'testuser',
                'email': 'test@example.com'
            }
            
            with pytest.raises(ValidationError) as exc_info:
                AuthService.register_user(user_data)
            
            assert 'password' in str(exc_info.value).lower()
    
    def test_register_invalid_email(self, app, db_session):
        """Test registration with invalid email format."""
        with app.app_context():
            user_data = {
                'username': 'testuser',
                'email': 'invalid-email',
                'password': 'password123'
            }
            
            with pytest.raises(ValidationError) as exc_info:
                AuthService.register_user(user_data)
            
            assert 'email' in str(exc_info.value).lower()


class TestAuthServiceLogin:
    """Tests for user login."""
    
    def test_login_success_with_username(self, app, db_session, sample_user):
        """Test successful login with username."""
        with app.app_context():
            result = AuthService.login_user(
                sample_user.username,
                'testpass123'
            )
            
            assert result['success'] is True
            assert 'user' in result
            assert result['user']['id'] == sample_user.id
    
    def test_login_success_with_email(self, app, db_session, sample_user):
        """Test successful login with email."""
        with app.app_context():
            result = AuthService.login_user(
                sample_user.email,
                'testpass123'
            )
            
            assert result['success'] is True
            assert 'user' in result
            assert result['user']['id'] == sample_user.id
    
    def test_login_invalid_username(self, app, db_session):
        """Test login with non-existent username."""
        with app.app_context():
            with pytest.raises(AuthenticationError) as exc_info:
                AuthService.login_user('nonexistent', 'password123')
            
            assert 'invalid' in str(exc_info.value).lower()
    
    def test_login_wrong_password(self, app, db_session, sample_user):
        """Test login with wrong password."""
        with app.app_context():
            with pytest.raises(AuthenticationError) as exc_info:
                AuthService.login_user(
                    sample_user.username,
                    'wrongpassword'
                )
            
            assert 'invalid' in str(exc_info.value).lower()
    
    def test_login_empty_username(self, app, db_session):
        """Test login with empty username."""
        with app.app_context():
            with pytest.raises(ValidationError) as exc_info:
                AuthService.login_user('', 'password123')
            
            assert 'username' in str(exc_info.value).lower()
    
    def test_login_empty_password(self, app, db_session, sample_user):
        """Test login with empty password."""
        with app.app_context():
            with pytest.raises(ValidationError) as exc_info:
                AuthService.login_user(sample_user.username, '')
            
            assert 'password' in str(exc_info.value).lower()


class TestAuthServiceUserManagement:
    """Tests for user management operations."""
    
    def test_get_user_by_id(self, app, db_session, sample_user):
        """Test getting user by ID."""
        with app.app_context():
            user = AuthService.get_user_by_id(sample_user.id)
            
            assert user is not None
            assert user['id'] == sample_user.id
            assert user['username'] == sample_user.username
    
    def test_get_user_by_id_not_found(self, app, db_session):
        """Test getting non-existent user."""
        with app.app_context():
            user = AuthService.get_user_by_id(99999)
            
            assert user is None
    
    def test_get_user_by_username(self, app, db_session, sample_user):
        """Test getting user by username."""
        with app.app_context():
            user = AuthService.get_user_by_username(sample_user.username)
            
            assert user is not None
            assert user['username'] == sample_user.username
    
    def test_update_user_profile(self, app, db_session, sample_user):
        """Test updating user profile."""
        with app.app_context():
            update_data = {
                'email': 'newemail@example.com'
            }
            
            result = AuthService.update_user(sample_user.id, update_data)
            
            assert result['success'] is True
            assert result['user']['email'] == 'newemail@example.com'
    
    def test_change_password_success(self, app, db_session, sample_user):
        """Test successful password change."""
        with app.app_context():
            result = AuthService.change_password(
                sample_user.id,
                'testpass123',
                'newpass123'
            )
            
            assert result['success'] is True
            
            # Verify new password works
            user = User.query.get(sample_user.id)
            assert user.check_password('newpass123')
    
    def test_change_password_wrong_old_password(self, app, db_session, sample_user):
        """Test password change with wrong old password."""
        with app.app_context():
            with pytest.raises(AuthenticationError) as exc_info:
                AuthService.change_password(
                    sample_user.id,
                    'wrongpassword',
                    'newpass123'
                )
            
            assert 'current password' in str(exc_info.value).lower()
    
    def test_delete_user(self, app, db_session, sample_user):
        """Test deleting a user."""
        with app.app_context():
            user_id = sample_user.id
            result = AuthService.delete_user(user_id)
            
            assert result['success'] is True
            
            # Verify user deleted
            user = User.query.get(user_id)
            assert user is None


class TestAuthServiceAdminOperations:
    """Tests for admin operations."""
    
    def test_list_all_users(self, app, db_session, sample_user, admin_user):
        """Test listing all users."""
        with app.app_context():
            result = AuthService.get_all_users()
            
            assert len(result['users']) >= 2
            usernames = [u['username'] for u in result['users']]
            assert sample_user.username in usernames
            assert admin_user.username in usernames
    
    def test_promote_user_to_admin(self, app, db_session, sample_user):
        """Test promoting user to admin."""
        with app.app_context():
            result = AuthService.update_user(
                sample_user.id,
                {'is_admin': True}
            )
            
            assert result['success'] is True
            assert result['user']['is_admin'] is True
    
    def test_list_users_with_pagination(self, app, db_session):
        """Test user listing with pagination."""
        with app.app_context():
            # Create multiple users
            for i in range(15):
                user = User(
                    username=f'user{i}',
                    email=f'user{i}@example.com'
                )
                user.set_password('password123')
                db_session.add(user)
            db_session.commit()
            
            # Test pagination
            result = AuthService.get_all_users(page=1, per_page=10)
            
            assert len(result['users']) == 10
            assert result['total'] >= 15
