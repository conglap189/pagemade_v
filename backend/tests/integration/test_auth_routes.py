"""Integration tests for authentication routes."""

import pytest
import json


class TestAuthRegistration:
    """Tests for user registration endpoint."""
    
    def test_register_success(self, client, db_session):
        """Test successful user registration."""
        response = client.post('/auth/register', 
            data={
                'username': 'newuser',
                'email': 'newuser@example.com',
                'password': 'password123',
                'confirm_password': 'password123'
            },
            follow_redirects=True
        )
        
        assert response.status_code == 200
        # Check redirect to login or dashboard
    
    def test_register_api_success(self, client, db_session):
        """Test API registration endpoint."""
        response = client.post('/auth/api/register',
            json={
                'username': 'apiuser',
                'email': 'apiuser@example.com',
                'password': 'password123'
            }
        )
        
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['success'] is True
        assert 'user' in data
        assert data['user']['username'] == 'apiuser'
    
    def test_register_duplicate_username(self, client, db_session, sample_user):
        """Test registration with existing username."""
        response = client.post('/auth/api/register',
            json={
                'username': sample_user.username,
                'email': 'different@example.com',
                'password': 'password123'
            }
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['success'] is False
    
    def test_register_duplicate_email(self, client, db_session, sample_user):
        """Test registration with existing email."""
        response = client.post('/auth/api/register',
            json={
                'username': 'differentuser',
                'email': sample_user.email,
                'password': 'password123'
            }
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['success'] is False
    
    def test_register_missing_fields(self, client, db_session):
        """Test registration with missing required fields."""
        # Missing username
        response = client.post('/auth/api/register',
            json={
                'email': 'test@example.com',
                'password': 'password123'
            }
        )
        assert response.status_code == 400
        
        # Missing email
        response = client.post('/auth/api/register',
            json={
                'username': 'testuser',
                'password': 'password123'
            }
        )
        assert response.status_code == 400
        
        # Missing password
        response = client.post('/auth/api/register',
            json={
                'username': 'testuser',
                'email': 'test@example.com'
            }
        )
        assert response.status_code == 400


class TestAuthLogin:
    """Tests for user login endpoint."""
    
    def test_login_success(self, client, db_session, sample_user):
        """Test successful login."""
        response = client.post('/auth/login',
            data={
                'username': sample_user.username,
                'password': 'testpass123'
            },
            follow_redirects=True
        )
        
        assert response.status_code == 200
        # Session should be created
    
    def test_login_api_success(self, client, db_session, sample_user):
        """Test API login endpoint."""
        response = client.post('/auth/api/login',
            json={
                'username': sample_user.username,
                'password': 'testpass123'
            }
        )
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] is True
        assert 'user' in data
        assert data['user']['username'] == sample_user.username
    
    def test_login_with_email(self, client, db_session, sample_user):
        """Test login with email instead of username."""
        response = client.post('/auth/api/login',
            json={
                'username': sample_user.email,
                'password': 'testpass123'
            }
        )
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] is True
    
    def test_login_wrong_password(self, client, db_session, sample_user):
        """Test login with wrong password."""
        response = client.post('/auth/api/login',
            json={
                'username': sample_user.username,
                'password': 'wrongpassword'
            }
        )
        
        assert response.status_code == 401
        data = json.loads(response.data)
        assert data['success'] is False
    
    def test_login_nonexistent_user(self, client, db_session):
        """Test login with non-existent username."""
        response = client.post('/auth/api/login',
            json={
                'username': 'nonexistent',
                'password': 'password123'
            }
        )
        
        assert response.status_code == 401
        data = json.loads(response.data)
        assert data['success'] is False


class TestAuthLogout:
    """Tests for user logout endpoint."""
    
    def test_logout_success(self, client, db_session, sample_user):
        """Test successful logout."""
        # Login first
        client.post('/auth/login',
            data={
                'username': sample_user.username,
                'password': 'testpass123'
            }
        )
        
        # Logout
        response = client.get('/auth/logout', follow_redirects=True)
        
        assert response.status_code == 200
    
    def test_logout_api(self, client, db_session, auth_headers):
        """Test API logout endpoint."""
        response = client.post('/auth/api/logout', headers=auth_headers)
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] is True


class TestAuthProfile:
    """Tests for user profile endpoints."""
    
    def test_get_profile(self, client, db_session, auth_headers):
        """Test getting user profile."""
        response = client.get('/auth/api/profile', headers=auth_headers)
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'user' in data
        assert 'username' in data['user']
    
    def test_get_profile_unauthenticated(self, client, db_session):
        """Test getting profile without authentication."""
        response = client.get('/auth/api/profile')
        
        assert response.status_code == 401
    
    def test_update_profile(self, client, db_session, auth_headers):
        """Test updating user profile."""
        response = client.put('/auth/api/profile',
            headers=auth_headers,
            json={
                'email': 'newemail@example.com'
            }
        )
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] is True
        assert data['user']['email'] == 'newemail@example.com'
    
    def test_change_password(self, client, db_session, auth_headers, sample_user):
        """Test password change."""
        response = client.post('/auth/api/change-password',
            headers=auth_headers,
            json={
                'current_password': 'testpass123',
                'new_password': 'newpass123'
            }
        )
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] is True
    
    def test_change_password_wrong_current(self, client, db_session, auth_headers):
        """Test password change with wrong current password."""
        response = client.post('/auth/api/change-password',
            headers=auth_headers,
            json={
                'current_password': 'wrongpassword',
                'new_password': 'newpass123'
            }
        )
        
        assert response.status_code == 401
        data = json.loads(response.data)
        assert data['success'] is False


class TestAuthMiddleware:
    """Tests for authentication middleware."""
    
    def test_protected_route_without_auth(self, client, db_session):
        """Test accessing protected route without authentication."""
        response = client.get('/auth/api/profile')
        
        assert response.status_code == 401
    
    def test_protected_route_with_auth(self, client, db_session, auth_headers):
        """Test accessing protected route with authentication."""
        response = client.get('/auth/api/profile', headers=auth_headers)
        
        assert response.status_code == 200
    
    def test_admin_route_as_user(self, client, db_session, auth_headers):
        """Test accessing admin route as regular user."""
        response = client.get('/admin/api/users', headers=auth_headers)
        
        assert response.status_code == 403
    
    def test_admin_route_as_admin(self, client, db_session, admin_headers):
        """Test accessing admin route as admin."""
        response = client.get('/admin/api/users', headers=admin_headers)
        
        assert response.status_code == 200


class TestPasswordReset:
    """Tests for password reset functionality."""
    
    def test_request_password_reset(self, client, db_session, sample_user):
        """Test requesting password reset."""
        response = client.post('/auth/api/password-reset-request',
            json={
                'email': sample_user.email
            }
        )
        
        # Should return 200 even if email doesn't exist (security)
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] is True
    
    def test_request_password_reset_invalid_email(self, client, db_session):
        """Test password reset with invalid email."""
        response = client.post('/auth/api/password-reset-request',
            json={
                'email': 'invalid-email'
            }
        )
        
        assert response.status_code == 400
