"""End-to-end tests for complete user workflows."""

import pytest
import json


class TestUserJourneyComplete:
    """Test complete user journey from registration to publishing."""
    
    def test_complete_user_workflow(self, client, db_session):
        """
        Test complete workflow:
        1. Register user
        2. Login
        3. Create site
        4. Create page
        5. Publish site
        6. Access published site
        """
        # Step 1: Register
        register_response = client.post('/auth/api/register',
            json={
                'username': 'e2euser',
                'email': 'e2e@example.com',
                'password': 'password123'
            }
        )
        assert register_response.status_code == 201
        
        # Step 2: Login
        login_response = client.post('/auth/api/login',
            json={
                'username': 'e2euser',
                'password': 'password123'
            }
        )
        assert login_response.status_code == 200
        auth_headers = {'Cookie': login_response.headers.get('Set-Cookie')}
        
        # Step 3: Create site
        site_response = client.post('/sites/api/sites',
            headers=auth_headers,
            json={
                'name': 'E2E Test Site',
                'subdomain': 'e2etest'
            }
        )
        assert site_response.status_code == 201
        site_data = json.loads(site_response.data)
        site_id = site_data['site']['id']
        
        # Step 4: Create page
        page_response = client.post(f'/pages/api/sites/{site_id}/pages',
            headers=auth_headers,
            json={
                'title': 'Home Page',
                'slug': 'home',
                'content': '<h1>Welcome to E2E Test</h1>'
            }
        )
        assert page_response.status_code == 201
        
        # Step 5: Publish site
        publish_response = client.put(f'/sites/api/sites/{site_id}',
            headers=auth_headers,
            json={'is_published': True}
        )
        assert publish_response.status_code == 200
        
        # Step 6: Access published site (no auth required)
        public_response = client.get('/sites/e2etest')
        assert public_response.status_code == 200


class TestSiteManagementWorkflow:
    """Test site management workflows."""
    
    def test_create_edit_delete_site(self, client, db_session, auth_headers):
        """
        Test site lifecycle:
        1. Create site
        2. Update site details
        3. Create multiple pages
        4. Publish site
        5. Unpublish site
        6. Delete site
        """
        # Create site
        create_response = client.post('/sites/api/sites',
            headers=auth_headers,
            json={
                'name': 'Workflow Site',
                'subdomain': 'workflowtest'
            }
        )
        assert create_response.status_code == 201
        site_data = json.loads(create_response.data)
        site_id = site_data['site']['id']
        
        # Update site
        update_response = client.put(f'/sites/api/sites/{site_id}',
            headers=auth_headers,
            json={
                'name': 'Updated Workflow Site',
                'description': 'A test site for workflow testing'
            }
        )
        assert update_response.status_code == 200
        
        # Create pages
        for i in range(3):
            page_response = client.post(f'/pages/api/sites/{site_id}/pages',
                headers=auth_headers,
                json={
                    'title': f'Page {i+1}',
                    'slug': f'page-{i+1}',
                    'content': f'<h1>Page {i+1} Content</h1>'
                }
            )
            assert page_response.status_code == 201
        
        # Verify pages created
        pages_response = client.get(f'/pages/api/sites/{site_id}/pages',
            headers=auth_headers
        )
        pages_data = json.loads(pages_response.data)
        assert len(pages_data['pages']) >= 3
        
        # Publish
        publish_response = client.put(f'/sites/api/sites/{site_id}',
            headers=auth_headers,
            json={'is_published': True}
        )
        assert publish_response.status_code == 200
        
        # Unpublish
        unpublish_response = client.put(f'/sites/api/sites/{site_id}',
            headers=auth_headers,
            json={'is_published': False}
        )
        assert unpublish_response.status_code == 200
        
        # Delete
        delete_response = client.delete(f'/sites/api/sites/{site_id}',
            headers=auth_headers
        )
        assert delete_response.status_code == 200


class TestMultiUserScenarios:
    """Test scenarios involving multiple users."""
    
    def test_user_isolation(self, client, db_session):
        """
        Test that users can only access their own sites:
        1. Create two users
        2. Each creates a site
        3. Verify user A cannot access user B's site
        """
        # Create user A
        client.post('/auth/api/register',
            json={
                'username': 'userA',
                'email': 'userA@example.com',
                'password': 'password123'
            }
        )
        login_a = client.post('/auth/api/login',
            json={'username': 'userA', 'password': 'password123'}
        )
        auth_a = {'Cookie': login_a.headers.get('Set-Cookie')}
        
        # User A creates site
        site_a = client.post('/sites/api/sites',
            headers=auth_a,
            json={'name': 'Site A', 'subdomain': 'sitea'}
        )
        site_a_data = json.loads(site_a.data)
        site_a_id = site_a_data['site']['id']
        
        # Logout user A
        client.post('/auth/api/logout', headers=auth_a)
        
        # Create user B
        client.post('/auth/api/register',
            json={
                'username': 'userB',
                'email': 'userB@example.com',
                'password': 'password123'
            }
        )
        login_b = client.post('/auth/api/login',
            json={'username': 'userB', 'password': 'password123'}
        )
        auth_b = {'Cookie': login_b.headers.get('Set-Cookie')}
        
        # User B tries to access User A's site
        access_response = client.get(f'/sites/api/sites/{site_a_id}',
            headers=auth_b
        )
        assert access_response.status_code == 403
        
        # User B tries to update User A's site
        update_response = client.put(f'/sites/api/sites/{site_a_id}',
            headers=auth_b,
            json={'name': 'Hacked Site'}
        )
        assert update_response.status_code == 403
        
        # User B tries to delete User A's site
        delete_response = client.delete(f'/sites/api/sites/{site_a_id}',
            headers=auth_b
        )
        assert delete_response.status_code == 403


class TestErrorHandling:
    """Test error handling throughout the application."""
    
    def test_404_handling(self, client):
        """Test 404 error handling."""
        response = client.get('/nonexistent/path')
        assert response.status_code == 404
    
    def test_validation_errors(self, client, db_session, auth_headers):
        """Test validation error responses."""
        # Invalid site data
        response = client.post('/sites/api/sites',
            headers=auth_headers,
            json={'name': ''}  # Missing subdomain
        )
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['success'] is False
    
    def test_authentication_errors(self, client, db_session):
        """Test authentication error handling."""
        # Access protected route without auth
        response = client.get('/auth/api/profile')
        assert response.status_code == 401
        
        data = json.loads(response.data)
        assert data['success'] is False


class TestPerformance:
    """Test application performance scenarios."""
    
    def test_list_many_sites(self, client, db_session, auth_headers):
        """Test listing performance with many sites."""
        # Create 20 sites
        for i in range(20):
            client.post('/sites/api/sites',
                headers=auth_headers,
                json={
                    'name': f'Site {i}',
                    'subdomain': f'site{i}'
                }
            )
        
        # List sites should be fast
        response = client.get('/sites/api/sites', headers=auth_headers)
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert len(data['sites']) >= 20
    
    def test_pagination(self, client, db_session, auth_headers):
        """Test pagination for large datasets."""
        # Create many sites
        for i in range(25):
            client.post('/sites/api/sites',
                headers=auth_headers,
                json={
                    'name': f'Paginated Site {i}',
                    'subdomain': f'paginated{i}'
                }
            )
        
        # Get first page
        response = client.get('/sites/api/sites?page=1&per_page=10',
            headers=auth_headers
        )
        data = json.loads(response.data)
        assert len(data['sites']) == 10
        
        # Get second page
        response = client.get('/sites/api/sites?page=2&per_page=10',
            headers=auth_headers
        )
        data = json.loads(response.data)
        assert len(data['sites']) == 10
