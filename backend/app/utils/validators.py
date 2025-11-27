"""Validators for input validation."""
import re
from urllib.parse import urlparse


class Validators:
    """Utility class for input validation."""
    
    # Regex patterns
    EMAIL_PATTERN = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    USERNAME_PATTERN = re.compile(r'^[a-zA-Z0-9_-]{3,30}$')
    SUBDOMAIN_PATTERN = re.compile(r'^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$')
    SLUG_PATTERN = re.compile(r'^[a-z0-9]+(?:-[a-z0-9]+)*$')
    
    @staticmethod
    def is_valid_email(email):
        """
        Validate email address format.
        
        Args:
            email: Email address to validate
            
        Returns:
            bool: True if valid email format
        """
        if not email:
            return False
        return bool(Validators.EMAIL_PATTERN.match(email))
    
    @staticmethod
    def is_valid_username(username):
        """
        Validate username format.
        Rules: 3-30 characters, alphanumeric, underscore, hyphen only.
        
        Args:
            username: Username to validate
            
        Returns:
            bool: True if valid username format
        """
        if not username:
            return False
        return bool(Validators.USERNAME_PATTERN.match(username))
    
    @staticmethod
    def is_valid_subdomain(subdomain):
        """
        Validate subdomain format.
        Rules: 3-63 characters, lowercase alphanumeric and hyphens only,
        cannot start or end with hyphen.
        
        Args:
            subdomain: Subdomain to validate
            
        Returns:
            bool: True if valid subdomain format
        """
        if not subdomain:
            return False
        
        # Check length
        if len(subdomain) < 3 or len(subdomain) > 63:
            return False
        
        return bool(Validators.SUBDOMAIN_PATTERN.match(subdomain))
    
    @staticmethod
    def is_valid_slug(slug):
        """
        Validate URL slug format.
        Rules: lowercase alphanumeric and hyphens only.
        
        Args:
            slug: Slug to validate
            
        Returns:
            bool: True if valid slug format
        """
        if not slug:
            return False
        return bool(Validators.SLUG_PATTERN.match(slug))
    
    @staticmethod
    def is_valid_password(password, min_length=8):
        """
        Validate password strength.
        Rules: Minimum length, at least one uppercase, one lowercase, one digit.
        
        Args:
            password: Password to validate
            min_length: Minimum password length (default: 8)
            
        Returns:
            tuple: (is_valid: bool, error_message: str|None)
        """
        if not password:
            return False, "Password is required"
        
        if len(password) < min_length:
            return False, f"Password must be at least {min_length} characters"
        
        if not re.search(r'[a-z]', password):
            return False, "Password must contain at least one lowercase letter"
        
        if not re.search(r'[A-Z]', password):
            return False, "Password must contain at least one uppercase letter"
        
        if not re.search(r'\d', password):
            return False, "Password must contain at least one digit"
        
        return True, None
    
    @staticmethod
    def is_valid_url(url):
        """
        Validate URL format.
        
        Args:
            url: URL to validate
            
        Returns:
            bool: True if valid URL format
        """
        if not url:
            return False
        
        try:
            result = urlparse(url)
            return all([result.scheme, result.netloc])
        except:
            return False
    
    @staticmethod
    def sanitize_string(input_string, max_length=None):
        """
        Sanitize string input (remove dangerous characters).
        
        Args:
            input_string: String to sanitize
            max_length: Optional maximum length
            
        Returns:
            str: Sanitized string
        """
        if not input_string:
            return ""
        
        # Remove any script tags
        sanitized = re.sub(r'<script[^>]*>.*?</script>', '', input_string, flags=re.DOTALL | re.IGNORECASE)
        
        # Remove any other potentially dangerous tags
        sanitized = re.sub(r'<(iframe|object|embed)[^>]*>.*?</\1>', '', sanitized, flags=re.DOTALL | re.IGNORECASE)
        
        # Trim whitespace
        sanitized = sanitized.strip()
        
        # Apply max length if specified
        if max_length and len(sanitized) > max_length:
            sanitized = sanitized[:max_length]
        
        return sanitized
    
    @staticmethod
    def is_valid_page_title(title):
        """
        Validate page title.
        
        Args:
            title: Page title to validate
            
        Returns:
            tuple: (is_valid: bool, error_message: str|None)
        """
        if not title:
            return False, "Title is required"
        
        if len(title) < 3:
            return False, "Title must be at least 3 characters"
        
        if len(title) > 200:
            return False, "Title must be less than 200 characters"
        
        return True, None
    
    @staticmethod
    def is_valid_site_title(title):
        """
        Validate site title.
        
        Args:
            title: Site title to validate
            
        Returns:
            tuple: (is_valid: bool, error_message: str|None)
        """
        if not title:
            return False, "Site title is required"
        
        if len(title) < 3:
            return False, "Site title must be at least 3 characters"
        
        if len(title) > 100:
            return False, "Site title must be less than 100 characters"
        
        return True, None
    
    @staticmethod
    def is_safe_filename(filename):
        """
        Check if filename is safe (no path traversal attempts).
        
        Args:
            filename: Filename to check
            
        Returns:
            bool: True if filename is safe
        """
        if not filename:
            return False
        
        # Check for path traversal patterns
        dangerous_patterns = ['..', '/', '\\', '\0']
        return not any(pattern in filename for pattern in dangerous_patterns)
