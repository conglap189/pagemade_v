"""Unit tests for Validators."""

import pytest
from app.utils.validators import Validators
from app.middlewares import ValidationError


class TestEmailValidation:
    """Tests for email validation."""
    
    def test_valid_emails(self):
        """Test valid email formats."""
        valid_emails = [
            'test@example.com',
            'user.name@example.com',
            'user+tag@example.co.uk',
            'test123@test-domain.com',
            'a@b.c'
        ]
        
        for email in valid_emails:
            # Should not raise exception
            Validators.validate_email(email)
    
    def test_invalid_emails(self):
        """Test invalid email formats."""
        invalid_emails = [
            'notanemail',
            '@example.com',
            'user@',
            'user @example.com',
            'user@.com',
            '',
            None
        ]
        
        for email in invalid_emails:
            with pytest.raises(ValidationError) as exc_info:
                Validators.validate_email(email)
            
            assert 'email' in str(exc_info.value).lower()


class TestUsernameValidation:
    """Tests for username validation."""
    
    def test_valid_usernames(self):
        """Test valid username formats."""
        valid_usernames = [
            'testuser',
            'test_user',
            'test-user',
            'TestUser123',
            'user1',
            'a'
        ]
        
        for username in valid_usernames:
            Validators.validate_username(username)
    
    def test_invalid_usernames(self):
        """Test invalid username formats."""
        invalid_usernames = [
            '',                    # Empty
            'ab',                  # Too short
            'a' * 51,             # Too long
            'user name',          # Spaces
            'user@name',          # Special chars
            'user.name',          # Dots
        ]
        
        for username in invalid_usernames:
            with pytest.raises(ValidationError):
                Validators.validate_username(username)
    
    def test_username_length_limits(self):
        """Test username length validation."""
        # Minimum length (3 chars)
        Validators.validate_username('abc')
        
        # Maximum length (50 chars)
        Validators.validate_username('a' * 50)
        
        # Too short
        with pytest.raises(ValidationError):
            Validators.validate_username('ab')
        
        # Too long
        with pytest.raises(ValidationError):
            Validators.validate_username('a' * 51)


class TestPasswordValidation:
    """Tests for password validation."""
    
    def test_valid_passwords(self):
        """Test valid passwords."""
        valid_passwords = [
            'password123',
            'MyP@ssw0rd',
            'a' * 8,
            'Complex!Pass123'
        ]
        
        for password in valid_passwords:
            Validators.validate_password(password)
    
    def test_password_too_short(self):
        """Test password minimum length."""
        with pytest.raises(ValidationError) as exc_info:
            Validators.validate_password('short')
        
        assert 'password' in str(exc_info.value).lower()
        assert '8' in str(exc_info.value)
    
    def test_password_empty(self):
        """Test empty password."""
        with pytest.raises(ValidationError):
            Validators.validate_password('')
    
    def test_password_none(self):
        """Test None password."""
        with pytest.raises(ValidationError):
            Validators.validate_password(None)


class TestSubdomainValidation:
    """Tests for subdomain validation."""
    
    def test_valid_subdomains(self):
        """Test valid subdomain formats."""
        valid_subdomains = [
            'test',
            'test-site',
            'my-cool-site',
            'site123',
            'abc',
            's' + 'a' * 62  # 63 chars (max)
        ]
        
        for subdomain in valid_subdomains:
            Validators.validate_subdomain(subdomain)
    
    def test_invalid_subdomains(self):
        """Test invalid subdomain formats."""
        invalid_subdomains = [
            '',                      # Empty
            'ab',                    # Too short
            's' * 64,               # Too long
            'Test',                 # Uppercase
            'test_site',            # Underscore
            'test site',            # Space
            'test@site',            # Special char
            '-test',                # Starts with dash
            'test-',                # Ends with dash
            'test..site',           # Double dots
        ]
        
        for subdomain in invalid_subdomains:
            with pytest.raises(ValidationError):
                Validators.validate_subdomain(subdomain)
    
    def test_reserved_subdomains(self):
        """Test reserved subdomain names."""
        reserved = [
            'www',
            'admin',
            'api',
            'mail',
            'ftp',
            'blog',
            'shop'
        ]
        
        for subdomain in reserved:
            with pytest.raises(ValidationError) as exc_info:
                Validators.validate_subdomain(subdomain)
            
            assert 'reserved' in str(exc_info.value).lower()


class TestSlugValidation:
    """Tests for slug validation."""
    
    def test_valid_slugs(self):
        """Test valid slug formats."""
        valid_slugs = [
            'my-page',
            'about-us',
            'contact',
            'page-123',
            'home'
        ]
        
        for slug in valid_slugs:
            Validators.validate_slug(slug)
    
    def test_invalid_slugs(self):
        """Test invalid slug formats."""
        invalid_slugs = [
            '',
            'My Page',           # Spaces
            'page_name',         # Underscores
            'PAGE',              # Uppercase
            'page@123',          # Special chars
            '-page',             # Starts with dash
            'page-',             # Ends with dash
        ]
        
        for slug in invalid_slugs:
            with pytest.raises(ValidationError):
                Validators.validate_slug(slug)


class TestFileValidation:
    """Tests for file validation."""
    
    def test_validate_file_extension(self):
        """Test file extension validation."""
        # Valid image extensions
        valid_images = [
            'photo.jpg',
            'image.png',
            'graphic.gif',
            'icon.svg',
            'picture.jpeg'
        ]
        
        for filename in valid_images:
            Validators.validate_file_extension(
                filename,
                allowed_extensions=['jpg', 'jpeg', 'png', 'gif', 'svg']
            )
    
    def test_invalid_file_extension(self):
        """Test invalid file extensions."""
        with pytest.raises(ValidationError):
            Validators.validate_file_extension(
                'script.exe',
                allowed_extensions=['jpg', 'png']
            )
    
    def test_validate_file_size(self):
        """Test file size validation."""
        # 5MB max
        max_size = 5 * 1024 * 1024
        
        # Valid size
        Validators.validate_file_size(1024, max_size)
        
        # Too large
        with pytest.raises(ValidationError):
            Validators.validate_file_size(max_size + 1, max_size)
    
    def test_validate_image_dimensions(self):
        """Test image dimension validation."""
        # Valid dimensions
        Validators.validate_image_dimensions(
            width=1920,
            height=1080,
            max_width=2000,
            max_height=2000
        )
        
        # Width too large
        with pytest.raises(ValidationError):
            Validators.validate_image_dimensions(
                width=3000,
                height=1080,
                max_width=2000,
                max_height=2000
            )
        
        # Height too large
        with pytest.raises(ValidationError):
            Validators.validate_image_dimensions(
                width=1920,
                height=3000,
                max_width=2000,
                max_height=2000
            )


class TestContentValidation:
    """Tests for content validation."""
    
    def test_validate_required_field(self):
        """Test required field validation."""
        # Valid
        Validators.validate_required('Some value', 'field_name')
        
        # Empty string
        with pytest.raises(ValidationError):
            Validators.validate_required('', 'field_name')
        
        # None
        with pytest.raises(ValidationError):
            Validators.validate_required(None, 'field_name')
        
        # Whitespace only
        with pytest.raises(ValidationError):
            Validators.validate_required('   ', 'field_name')
    
    def test_validate_string_length(self):
        """Test string length validation."""
        # Valid
        Validators.validate_string_length(
            'test',
            min_length=2,
            max_length=10
        )
        
        # Too short
        with pytest.raises(ValidationError):
            Validators.validate_string_length(
                'a',
                min_length=2,
                max_length=10
            )
        
        # Too long
        with pytest.raises(ValidationError):
            Validators.validate_string_length(
                'a' * 11,
                min_length=2,
                max_length=10
            )
    
    def test_sanitize_html(self):
        """Test HTML sanitization."""
        # Allowed tags
        safe_html = '<p>Hello <strong>world</strong></p>'
        sanitized = Validators.sanitize_html(safe_html)
        assert '<p>' in sanitized
        assert '<strong>' in sanitized
        
        # Remove script tags
        unsafe_html = '<p>Hello</p><script>alert("xss")</script>'
        sanitized = Validators.sanitize_html(unsafe_html)
        assert '<script>' not in sanitized
        assert 'alert' not in sanitized
        
        # Remove event handlers
        unsafe_html = '<img src="x" onerror="alert(1)">'
        sanitized = Validators.sanitize_html(unsafe_html)
        assert 'onerror' not in sanitized


class TestURLValidation:
    """Tests for URL validation."""
    
    def test_valid_urls(self):
        """Test valid URL formats."""
        valid_urls = [
            'https://example.com',
            'http://example.com',
            'https://sub.example.com',
            'https://example.com/path',
            'https://example.com/path?query=1'
        ]
        
        for url in valid_urls:
            Validators.validate_url(url)
    
    def test_invalid_urls(self):
        """Test invalid URL formats."""
        invalid_urls = [
            'not-a-url',
            'ftp://example.com',  # Wrong protocol
            'javascript:alert(1)',
            '//example.com',
            ''
        ]
        
        for url in invalid_urls:
            with pytest.raises(ValidationError):
                Validators.validate_url(url)
