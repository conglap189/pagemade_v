"""Integration tests for site routes."""

import pytest
import json


class TestSiteCreation:
    """Tests for site creation endpoints."""
    
    def test_create_site_success(self, client, db_session, auth_headers):
        """Test successful site creation."""
        response = client.post('/sites/api/sites',
            headers=auth_headers,
            json={
                'name': 'My New Site',
                'subdomain': 'mynewsite'
            }
        )
        
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['success'] is True
        assert data['site']['name'] == 'My New Site'
        assert data['site']['subdomain'] == 'mynewsite'
    
    def test_create_site_unauthenticated(self, client, db_session):
        """Test site creation without authentication."""
        response = client.post('/sites/api/sites',
            json={
                'name': 'Test Site',
                'subdomain': 'testsite'
            }
        )
        
        assert response.status_code == 401
    
    def test_create_site_duplicate_subdomain(self, client, db_session, auth_headers, sample_site):
        """Test site creation with duplicate subdomain."""
        response = client.post('/sites/api/sites',
            headers=auth_headers,
            json={
                'name': 'Another Site',
                'subdomain': sample_site.subdomain
            }
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['success'] is False


class TestSiteRetrieval:
    """Tests for site retrieval endpoints."""
    
    def test_get_user_sites(self, client, db_session, auth_headers):
        """Test getting list of user's sites."""
        response = client.get('/sites/api/sites', headers=auth_headers)
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'sites' in data
        assert isinstance(data['sites'], list)
    
    def test_get_site_by_id(self, client, db_session, auth_headers, sample_site):
        """Test getting specific site by ID."""
        response = client.get(
            f'/sites/api/sites/{sample_site.id}',
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['site']['id'] == sample_site.id
    
    def test_get_site_unauthorized(self, client, db_session, admin_headers, sample_site):
        """Test getting site owned by another user."""
        response = client.get(
            f'/sites/api/sites/{sample_site.id}',
            headers=admin_headers
        )
        
        assert response.status_code == 403
    
    def test_get_site_not_found(self, client, db_session, auth_headers):
        """Test getting non-existent site."""
        response = client.get(
            '/sites/api/sites/99999',
            headers=auth_headers
        )
        
        assert response.status_code == 404


class TestSiteUpdate:
    """Tests for site update endpoints."""
    
    def test_update_site_name(self, client, db_session, auth_headers, sample_site):
        """Test updating site name."""
        response = client.put(
            f'/sites/api/sites/{sample_site.id}',
            headers=auth_headers,
            json={'name': 'Updated Site Name'}
        )
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] is True
        assert data['site']['name'] == 'Updated Site Name'
    
    def test_publish_site(self, client, db_session, auth_headers, sample_site):
        """Test publishing a site."""
        response = client.put(
            f'/sites/api/sites/{sample_site.id}',
            headers=auth_headers,
            json={'is_published': True}
        )
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['site']['is_published'] is True
    
    def test_update_site_unauthorized(self, client, db_session, admin_headers, sample_site):
        """Test updating site by non-owner."""
        response = client.put(
            f'/sites/api/sites/{sample_site.id}',
            headers=admin_headers,
            json={'name': 'Hacked Name'}
        )
        
        assert response.status_code == 403


class TestSiteDeletion:
    """Tests for site deletion endpoints."""
    
    def test_delete_site_success(self, client, db_session, auth_headers, sample_site):
        """Test successful site deletion."""
        site_id = sample_site.id
        
        response = client.delete(
            f'/sites/api/sites/{site_id}',
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] is True
        
        # Verify site deleted
        response = client.get(
            f'/sites/api/sites/{site_id}',
            headers=auth_headers
        )
        assert response.status_code == 404
    
    def test_delete_site_unauthorized(self, client, db_session, admin_headers, sample_site):
        """Test deleting site by non-owner."""
        response = client.delete(
            f'/sites/api/sites/{sample_site.id}',
            headers=admin_headers
        )
        
        assert response.status_code == 403


class TestSitePublicAccess:
    """Tests for public site access."""
    
    def test_access_published_site(self, client, db_session, sample_site):
        """Test accessing published site without authentication."""
        # Publish site first
        sample_site.is_published = True
        db_session.commit()
        
        response = client.get(f'/sites/{sample_site.subdomain}')
        
        assert response.status_code == 200
    
    def test_access_unpublished_site(self, client, db_session, sample_site):
        """Test accessing unpublished site without authentication."""
        response = client.get(f'/sites/{sample_site.subdomain}')
        
        # Should be forbidden or redirect
        assert response.status_code in [403, 404]
    
    def test_access_nonexistent_site(self, client, db_session):
        """Test accessing non-existent subdomain."""
        response = client.get('/sites/nonexistent')
        
        assert response.status_code == 404
