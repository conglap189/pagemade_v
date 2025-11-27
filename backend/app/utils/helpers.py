"""General helper functions."""
import json
from datetime import datetime
from functools import wraps
from flask import jsonify, request, session, make_response


class Helpers:
    """Utility class for general helper functions."""
    
    @staticmethod
    def json_response(data=None, message=None, status=200, success=True):
        """
        Create standardized JSON response.
        
        Args:
            data: Response data (dict or list)
            message: Response message
            status: HTTP status code
            success: Success flag
            
        Returns:
            tuple: (json_response, status_code)
        """
        response = {
            'success': success,
            'message': message,
            'data': data,
            'timestamp': datetime.utcnow().isoformat()
        }
        return jsonify(response), status
    
    @staticmethod
    def error_response(message, status=400, error_code=None):
        """
        Create standardized error response.
        
        Args:
            message: Error message
            status: HTTP status code
            error_code: Optional error code
            
        Returns:
            tuple: (json_response, status_code)
        """
        response = {
            'success': False,
            'message': message,
            'error_code': error_code,
            'timestamp': datetime.utcnow().isoformat()
        }
        return jsonify(response), status
    
    @staticmethod
    def success_response(data=None, message="Success", status=200):
        """
        Create standardized success response.
        
        Args:
            data: Response data
            message: Success message
            status: HTTP status code
            
        Returns:
            tuple: (json_response, status_code)
        """
        return Helpers.json_response(data=data, message=message, status=status, success=True)
    
    @staticmethod
    def success_response_with_cookie(data=None, message="Success", status=200, 
                                   cookie_name=None, cookie_value=None, 
                                   cookie_expires=None, secure=False, httponly=True,
                                   samesite='Lax', domain='localhost', path='/'):
        """
        Create standardized success response with HttpOnly cookie.
        
        Args:
            data: Response data
            message: Success message
            status: HTTP status code
            cookie_name: Cookie name
            cookie_value: Cookie value (JWT token)
            cookie_expires: Cookie expiration datetime
            secure: HTTPS only flag
            httponly: HttpOnly flag
            samesite: SameSite policy
            domain: Cookie domain
            path: Cookie path for cross-origin sharing
            
        Returns:
            tuple: (json_response, status_code)
        """
        response = Helpers.json_response(data=data, message=message, status=status, success=True)
        
        if cookie_name and cookie_value:
            # Set the cookie
            response[0].set_cookie(
                key=cookie_name,
                value=cookie_value,
                expires=cookie_expires,
                secure=secure,
                httponly=httponly,
                samesite=samesite,
                domain=domain,
                path=path
            )
        
        return response
    
    @staticmethod
    def format_datetime(dt, format='%Y-%m-%d %H:%M:%S'):
        """
        Format datetime object to string.
        
        Args:
            dt: datetime object
            format: strftime format string
            
        Returns:
            str: Formatted datetime string or None
        """
        if not dt:
            return None
        return dt.strftime(format)
    
    @staticmethod
    def parse_datetime(date_string, format='%Y-%m-%d %H:%M:%S'):
        """
        Parse datetime string to datetime object.
        
        Args:
            date_string: Date string to parse
            format: strptime format string
            
        Returns:
            datetime: Parsed datetime object or None
        """
        if not date_string:
            return None
        try:
            return datetime.strptime(date_string, format)
        except:
            return None
    
    @staticmethod
    def paginate_query(query, page=1, per_page=20):
        """
        Paginate SQLAlchemy query.
        
        Args:
            query: SQLAlchemy query object
            page: Page number (default: 1)
            per_page: Items per page (default: 20)
            
        Returns:
            dict: Pagination data with items, total, pages, etc.
        """
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        
        return {
            'items': [item.to_dict() if hasattr(item, 'to_dict') else item for item in pagination.items],
            'total': pagination.total,
            'page': page,
            'per_page': per_page,
            'pages': pagination.pages,
            'has_next': pagination.has_next,
            'has_prev': pagination.has_prev
        }
    
    @staticmethod
    def get_request_json():
        """
        Safely get JSON from request.
        
        Returns:
            dict: JSON data or empty dict if invalid
        """
        try:
            return request.get_json() or {}
        except:
            return {}
    
    @staticmethod
    def get_current_user_id():
        """
        Get current user ID from session.
        
        Returns:
            int: User ID or None
        """
        return session.get('user_id')
    
    @staticmethod
    def is_authenticated():
        """
        Check if user is authenticated.
        
        Returns:
            bool: True if user is logged in
        """
        return 'user_id' in session
    
    @staticmethod
    def require_auth(f):
        """
        Decorator to require authentication for routes.
        
        Usage:
            @app.route('/protected')
            @Helpers.require_auth
            def protected_route():
                ...
        """
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not Helpers.is_authenticated():
                return Helpers.error_response("Authentication required", status=401)
            return f(*args, **kwargs)
        return decorated_function
    
    @staticmethod
    def safe_json_loads(json_string, default=None):
        """
        Safely load JSON string.
        
        Args:
            json_string: JSON string to parse
            default: Default value if parsing fails
            
        Returns:
            Parsed JSON or default value
        """
        try:
            return json.loads(json_string)
        except:
            return default if default is not None else {}
    
    @staticmethod
    def safe_json_dumps(obj, default=None):
        """
        Safely dump object to JSON string.
        
        Args:
            obj: Object to serialize
            default: Default value if serialization fails
            
        Returns:
            JSON string or default value
        """
        try:
            return json.dumps(obj)
        except:
            return default if default is not None else "{}"
    
    @staticmethod
    def truncate_string(text, max_length=100, suffix='...'):
        """
        Truncate string to maximum length.
        
        Args:
            text: String to truncate
            max_length: Maximum length
            suffix: Suffix to add if truncated
            
        Returns:
            str: Truncated string
        """
        if not text:
            return ""
        
        if len(text) <= max_length:
            return text
        
        return text[:max_length - len(suffix)] + suffix
    
    @staticmethod
    def get_client_ip():
        """
        Get client IP address from request.
        
        Returns:
            str: Client IP address
        """
        # Check for forwarded IP (behind proxy)
        forwarded_for = request.headers.get('X-Forwarded-For')
        if forwarded_for:
            return forwarded_for.split(',')[0].strip()
        
        # Check for real IP
        if request.headers.get('X-Real-IP'):
            return request.headers.get('X-Real-IP')
        
        # Fallback to remote address
        return request.remote_addr
    
    @staticmethod
    def merge_dicts(*dicts):
        """
        Merge multiple dictionaries.
        
        Args:
            *dicts: Variable number of dictionaries
            
        Returns:
            dict: Merged dictionary
        """
        result = {}
        for d in dicts:
            if d:
                result.update(d)
        return result


def get_subdomain():
    """
    Extract subdomain from request.
    
    Returns:
        str: Subdomain if present, None otherwise
    """
    import re
    host = request.headers.get('Host', '')
    
    # Skip main domain
    if host == 'pagemade.site' or host == 'www.pagemade.site':
        return None
    
    # Extract subdomain from test.pagemade.site
    match = re.match(r'^([^.]+)\.pagemade\.site$', host)
    return match.group(1) if match else None
