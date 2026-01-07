"""URL helpers for generating proper URLs with subdomains."""
import os
from flask import url_for as flask_url_for, request

def get_app_url():
    """Get the APP_URL from environment or fallback to localhost."""
    return os.environ.get('APP_URL', 'http://localhost:5000')

def get_website_url():
    """Get the WEBSITE_URL from environment."""
    return os.environ.get('WEBSITE_URL', 'http://localhost:3000')

def get_editor_url():
    """Get the EDITOR_URL from environment with smart defaults."""
    editor_url = os.environ.get('EDITOR_URL', '')
    
    # If empty or localhost, detect production environment
    if not editor_url or 'localhost' in editor_url:
        # Check if we're in production by looking at request host
        try:
            if request and hasattr(request, 'host'):
                host = request.host.split(':')[0]
                # If accessing via pagemade.site domain, use production editor URL
                if 'pagemade.site' in host:
                    return 'https://editor.pagemade.site'
        except:
            pass
        
        # Fallback to localhost for development
        return 'http://localhost:5001'
    
    return editor_url

def url_for_external(endpoint, **values):
    """
    Generate absolute URL for an endpoint.
    
    If user is accessing via IP (not subdomain), use relative URL so browser stays on same host.
    If accessing via subdomain, use APP_URL from environment BUT preserve the protocol (http/https).
    
    This handles all cases:
    - Access via IP: http://160.191.50.233/login -> /dashboard (relative)
    - Access via domain HTTP: http://app.pagemade.site/login -> http://app.pagemade.site/dashboard
    - Access via domain HTTPS: https://app.pagemade.site/login -> https://app.pagemade.site/dashboard
    
    Example:
        url_for_external('sites.dashboard') 
        -> 'http://app.pagemade.site/dashboard' or '/dashboard' or 'https://app.pagemade.site/dashboard'
    """
    # Generate relative URL
    relative_url = flask_url_for(endpoint, **values)
    
    # Check if request host is an IP address or 'localhost'
    host = request.host.split(':')[0]  # Remove port if present
    
    # If accessing via IP or localhost, return relative URL
    # This keeps the user on the same IP/localhost they're using
    if _is_ip_or_localhost(host):
        return relative_url
    
    # If accessing via domain name, use APP_URL from environment
    # But preserve the protocol (http/https) from the current request
    app_url = get_app_url().rstrip('/')
    
    # Detect current protocol
    current_protocol = 'https' if request.is_secure or request.headers.get('X-Forwarded-Proto') == 'https' else 'http'
    
    # Replace protocol in app_url with current protocol
    if app_url.startswith('http://'):
        app_url = app_url.replace('http://', f'{current_protocol}://', 1)
    elif app_url.startswith('https://'):
        app_url = app_url.replace('https://', f'{current_protocol}://', 1)
    else:
        # No protocol in app_url, add current protocol
        app_url = f'{current_protocol}://{app_url}'
    
    return f"{app_url}{relative_url}"

def _is_ip_or_localhost(host):
    """Check if host is an IP address or localhost."""
    # Check for localhost
    if host in ('localhost', '127.0.0.1', '0.0.0.0'):
        return True
    
    # Check for IPv4 address
    parts = host.split('.')
    if len(parts) == 4:
        try:
            # Try to convert each part to int (valid IP has 4 numbers)
            for part in parts:
                num = int(part)
                if num < 0 or num > 255:
                    return False
            return True
        except ValueError:
            return False
    
    return False
