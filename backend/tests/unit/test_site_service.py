"""Unit tests for SiteService."""

import pytest
from app.services.site_service import SiteService
from app.middlewares import ValidationError, AuthorizationError, ResourceNotFoundError
from app.models import Site


class TestSiteServiceCreate:
    """Tests for site creation."""
    
    def test_create_site_success(self, app, db_session, sample_user):
        """Test successful site creation."""
        with app.app_context():
            site_data = {
                'name': 'My New Site',
                'subdomain': 'mynewsite'
            }
            
            result = SiteService.create_site(sample_user.id, site_data)
            
            assert result['success'] is True
            assert 'site' in result
            assert result['site']['name'] == 'My New Site'
            assert result['site']['subdomain'] == 'mynewsite'
            assert result['site']['user_id'] == sample_user.id
            
            # Verify in database
            site = Site.query.filter_by(subdomain='mynewsite').first()
            assert site is not None
    
    def test_create_site_missing_name(self, app, db_session, sample_user):
        """Test site creation without name."""
        with app.app_context():
            site_data = {
                'subdomain': 'testsite'
            }
            
            with pytest.raises(ValidationError) as exc_info:
                SiteService.create_site(sample_user.id, site_data)
            
            assert 'name' in str(exc_info.value).lower()
    
    def test_create_site_missing_subdomain(self, app, db_session, sample_user):
        """Test site creation without subdomain."""
        with app.app_context():
            site_data = {
                'name': 'Test Site'
            }
            
            with pytest.raises(ValidationError) as exc_info:
                SiteService.create_site(sample_user.id, site_data)
            
            assert 'subdomain' in str(exc_info.value).lower()
    
    def test_create_site_duplicate_subdomain(self, app, db_session, sample_user, sample_site):
        """Test site creation with duplicate subdomain."""
        with app.app_context():
            site_data = {
                'name': 'Another Site',
                'subdomain': sample_site.subdomain
            }
            
            with pytest.raises(ValidationError) as exc_info:
                SiteService.create_site(sample_user.id, site_data)
            
            assert 'already exists' in str(exc_info.value).lower()
    
    def test_create_site_invalid_subdomain(self, app, db_session, sample_user):
        """Test site creation with invalid subdomain format."""
        with app.app_context():
            invalid_subdomains = [
                'invalid subdomain',  # spaces
                'invalid@subdomain',  # special chars
                'UPPERCASE',          # uppercase
                'sub..domain',        # double dots
                '-startdash',         # starts with dash
                'enddash-',          # ends with dash
            ]
            
            for subdomain in invalid_subdomains:
                site_data = {
                    'name': 'Test Site',
                    'subdomain': subdomain
                }
                
                with pytest.raises(ValidationError):
                    SiteService.create_site(sample_user.id, site_data)
    
    def test_create_site_with_description(self, app, db_session, sample_user):
        """Test site creation with description."""
        with app.app_context():
            site_data = {
                'name': 'Test Site',
                'subdomain': 'testsite',
                'description': 'This is a test site'
            }
            
            result = SiteService.create_site(sample_user.id, site_data)
            
            assert result['success'] is True
            assert result['site']['description'] == 'This is a test site'


class TestSiteServiceRead:
    """Tests for reading sites."""
    
    def test_get_site_by_id(self, app, db_session, sample_site):
        """Test getting site by ID."""
        with app.app_context():
            result = SiteService.get_site_by_id(sample_site.id)
            
            assert result is not None
            assert result['id'] == sample_site.id
            assert result['name'] == sample_site.name
    
    def test_get_site_by_id_not_found(self, app, db_session):
        """Test getting non-existent site."""
        with app.app_context():
            result = SiteService.get_site_by_id(99999)
            
            assert result is None
    
    def test_get_site_by_subdomain(self, app, db_session, sample_site):
        """Test getting site by subdomain."""
        with app.app_context():
            result = SiteService.get_site_by_subdomain(sample_site.subdomain)
            
            assert result is not None
            assert result['subdomain'] == sample_site.subdomain
    
    def test_get_user_sites(self, app, db_session, sample_user):
        """Test getting all sites for a user."""
        with app.app_context():
            # Create multiple sites
            for i in range(3):
                site_data = {
                    'name': f'Site {i}',
                    'subdomain': f'site{i}'
                }
                SiteService.create_site(sample_user.id, site_data)
            
            result = SiteService.get_user_sites(sample_user.id)
            
            assert len(result['sites']) >= 3
    
    def test_get_published_sites(self, app, db_session, sample_user):
        """Test getting only published sites."""
        with app.app_context():
            # Create published and unpublished sites
            published_data = {
                'name': 'Published Site',
                'subdomain': 'published',
                'is_published': True
            }
            unpublished_data = {
                'name': 'Unpublished Site',
                'subdomain': 'unpublished',
                'is_published': False
            }
            
            SiteService.create_site(sample_user.id, published_data)
            SiteService.create_site(sample_user.id, unpublished_data)
            
            result = SiteService.get_user_sites(
                sample_user.id,
                published_only=True
            )
            
            for site in result['sites']:
                assert site['is_published'] is True


class TestSiteServiceUpdate:
    """Tests for updating sites."""
    
    def test_update_site_name(self, app, db_session, sample_user, sample_site):
        """Test updating site name."""
        with app.app_context():
            update_data = {
                'name': 'Updated Site Name'
            }
            
            result = SiteService.update_site(
                sample_site.id,
                sample_user.id,
                update_data
            )
            
            assert result['success'] is True
            assert result['site']['name'] == 'Updated Site Name'
    
    def test_update_site_description(self, app, db_session, sample_user, sample_site):
        """Test updating site description."""
        with app.app_context():
            update_data = {
                'description': 'New description'
            }
            
            result = SiteService.update_site(
                sample_site.id,
                sample_user.id,
                update_data
            )
            
            assert result['success'] is True
            assert result['site']['description'] == 'New description'
    
    def test_update_site_unauthorized(self, app, db_session, sample_user, admin_user, sample_site):
        """Test updating site by non-owner."""
        with app.app_context():
            update_data = {
                'name': 'Hacked Name'
            }
            
            # Admin user trying to update sample_user's site
            with pytest.raises(AuthorizationError):
                SiteService.update_site(
                    sample_site.id,
                    admin_user.id,
                    update_data
                )
    
    def test_update_site_not_found(self, app, db_session, sample_user):
        """Test updating non-existent site."""
        with app.app_context():
            update_data = {
                'name': 'New Name'
            }
            
            with pytest.raises(ResourceNotFoundError):
                SiteService.update_site(
                    99999,
                    sample_user.id,
                    update_data
                )
    
    def test_publish_site(self, app, db_session, sample_user, sample_site):
        """Test publishing a site."""
        with app.app_context():
            update_data = {
                'is_published': True
            }
            
            result = SiteService.update_site(
                sample_site.id,
                sample_user.id,
                update_data
            )
            
            assert result['success'] is True
            assert result['site']['is_published'] is True
    
    def test_unpublish_site(self, app, db_session, sample_user, sample_site):
        """Test unpublishing a site."""
        with app.app_context():
            # First publish
            sample_site.is_published = True
            db_session.commit()
            
            # Then unpublish
            update_data = {
                'is_published': False
            }
            
            result = SiteService.update_site(
                sample_site.id,
                sample_user.id,
                update_data
            )
            
            assert result['success'] is True
            assert result['site']['is_published'] is False


class TestSiteServiceDelete:
    """Tests for deleting sites."""
    
    def test_delete_site_success(self, app, db_session, sample_user, sample_site):
        """Test successful site deletion."""
        with app.app_context():
            site_id = sample_site.id
            
            result = SiteService.delete_site(site_id, sample_user.id)
            
            assert result['success'] is True
            
            # Verify site deleted
            site = Site.query.get(site_id)
            assert site is None
    
    def test_delete_site_unauthorized(self, app, db_session, sample_user, admin_user, sample_site):
        """Test deleting site by non-owner."""
        with app.app_context():
            with pytest.raises(AuthorizationError):
                SiteService.delete_site(sample_site.id, admin_user.id)
    
    def test_delete_site_not_found(self, app, db_session, sample_user):
        """Test deleting non-existent site."""
        with app.app_context():
            with pytest.raises(ResourceNotFoundError):
                SiteService.delete_site(99999, sample_user.id)
    
    def test_delete_site_cascades_to_pages(self, app, db_session, sample_user, sample_site, sample_page):
        """Test that deleting site also deletes its pages."""
        with app.app_context():
            from app.models import Page
            
            site_id = sample_site.id
            page_id = sample_page.id
            
            # Verify page exists
            assert Page.query.get(page_id) is not None
            
            # Delete site
            SiteService.delete_site(site_id, sample_user.id)
            
            # Verify page also deleted
            assert Page.query.get(page_id) is None


class TestSiteServiceValidation:
    """Tests for site validation logic."""
    
    def test_validate_subdomain_format(self, app):
        """Test subdomain validation."""
        with app.app_context():
            valid_subdomains = [
                'test',
                'test-site',
                'test123',
                'my-cool-site',
                'site2024'
            ]
            
            for subdomain in valid_subdomains:
                # Should not raise exception
                SiteService._validate_subdomain_format(subdomain)
    
    def test_check_subdomain_availability(self, app, db_session, sample_site):
        """Test subdomain availability check."""
        with app.app_context():
            # Existing subdomain should not be available
            is_available = SiteService.check_subdomain_availability(
                sample_site.subdomain
            )
            assert is_available is False
            
            # New subdomain should be available
            is_available = SiteService.check_subdomain_availability(
                'new-unique-subdomain'
            )
            assert is_available is True
