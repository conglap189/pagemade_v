"""Pytest configuration and fixtures for testing."""

import pytest
import os
import tempfile
from app import create_app
from app.models import db, User, Site, Page, Asset
from app.config import TestConfig


@pytest.fixture(scope='session')
def app():
    """Create and configure a test Flask application instance."""
    # Create temporary database
    db_fd, db_path = tempfile.mkstemp()
    
    # Configure test app
    test_config = TestConfig()
    test_config.SQLALCHEMY_DATABASE_URI = f'sqlite:///{db_path}'
    test_config.TESTING = True
    test_config.WTF_CSRF_ENABLED = False
    
    # Create app
    app = create_app(test_config)
    
    # Create tables
    with app.app_context():
        db.create_all()
    
    yield app
    
    # Cleanup
    with app.app_context():
        db.drop_all()
    os.close(db_fd)
    os.unlink(db_path)


@pytest.fixture(scope='function')
def client(app):
    """Create a test client for the app."""
    return app.test_client()


@pytest.fixture(scope='function')
def runner(app):
    """Create a test CLI runner for the app."""
    return app.test_cli_runner()


@pytest.fixture(scope='function')
def db_session(app):
    """Create a database session for tests."""
    with app.app_context():
        # Clear all tables before each test
        db.session.remove()
        db.drop_all()
        db.create_all()
        
        yield db.session
        
        # Cleanup
        db.session.remove()


@pytest.fixture
def sample_user(db_session):
    """Create a sample user for testing."""
    user = User(
        username='testuser',
        email='test@example.com',
        is_admin=False
    )
    user.set_password('testpass123')
    db_session.add(user)
    db_session.commit()
    return user


@pytest.fixture
def admin_user(db_session):
    """Create an admin user for testing."""
    admin = User(
        username='admin',
        email='admin@example.com',
        is_admin=True
    )
    admin.set_password('adminpass123')
    db_session.add(admin)
    db_session.commit()
    return admin


@pytest.fixture
def sample_site(db_session, sample_user):
    """Create a sample site for testing."""
    site = Site(
        name='Test Site',
        subdomain='testsite',
        user_id=sample_user.id,
        is_published=False
    )
    db_session.add(site)
    db_session.commit()
    return site


@pytest.fixture
def sample_page(db_session, sample_site):
    """Create a sample page for testing."""
    page = Page(
        title='Test Page',
        slug='test-page',
        site_id=sample_site.id,
        content='<h1>Test Content</h1>',
        is_published=False
    )
    db_session.add(page)
    db_session.commit()
    return page


@pytest.fixture
def sample_asset(db_session, sample_user, sample_site):
    """Create a sample asset for testing."""
    asset = Asset(
        filename='test.jpg',
        original_name='test.jpg',
        file_type='image/jpeg',
        file_size=1024,
        url='/static/uploads/1/test.jpg',
        site_id=sample_site.id,
        user_id=sample_user.id
    )
    db_session.add(asset)
    db_session.commit()
    return asset


@pytest.fixture
def auth_headers(client, sample_user):
    """Get authentication headers for API requests."""
    # Login user
    response = client.post('/auth/login', data={
        'username': sample_user.username,
        'password': 'testpass123'
    }, follow_redirects=True)
    
    # Extract session cookie
    return {'Cookie': response.headers.get('Set-Cookie')}


@pytest.fixture
def admin_headers(client, admin_user):
    """Get admin authentication headers for API requests."""
    # Login admin
    response = client.post('/auth/login', data={
        'username': admin_user.username,
        'password': 'adminpass123'
    }, follow_redirects=True)
    
    return {'Cookie': response.headers.get('Set-Cookie')}
