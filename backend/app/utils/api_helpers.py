"""
API Helper utilities for consistent JSON responses
Standardizes API responses across all endpoints
"""

from flask import jsonify
from typing import Any, Dict, Optional
from datetime import datetime


class APIResponse:
    """Standard API response helper"""
    
    @staticmethod
    def success(data: Any = None, message: str = "Success", status: int = 200) -> tuple:
        """
        Create a successful API response
        
        Args:
            data: Response data (can be dict, list, or None)
            message: Success message
            status: HTTP status code
            
        Returns:
            Tuple of (response_dict, status_code)
        """
        response = {
            "success": True,
            "message": message,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
        
        if data is not None:
            response["data"] = data
            
        return jsonify(response), status
    
    @staticmethod
    def error(message: str, status: int = 400, errors: Optional[Dict] = None) -> tuple:
        """
        Create an error API response
        
        Args:
            message: Error message
            status: HTTP status code
            errors: Optional detailed errors dictionary
            
        Returns:
            Tuple of (response_dict, status_code)
        """
        response = {
            "success": False,
            "error": message,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
        
        if errors:
            response["errors"] = errors
            
        return jsonify(response), status
    
    @staticmethod
    def paginated(data: list, page: int, per_page: int, total: int, 
                 message: str = "Data retrieved successfully") -> tuple:
        """
        Create a paginated API response
        
        Args:
            data: List of items
            page: Current page number
            per_page: Items per page
            total: Total number of items
            message: Success message
            
        Returns:
            Tuple of (response_dict, status_code)
        """
        total_pages = (total + per_page - 1) // per_page
        
        response = {
            "success": True,
            "message": message,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "data": {
                "items": data,
                "pagination": {
                    "page": page,
                    "per_page": per_page,
                    "total": total,
                    "total_pages": total_pages,
                    "has_next": page < total_pages,
                    "has_prev": page > 1
                }
            }
        }
        
        return jsonify(response), 200
    
    @staticmethod
    def created(data: Any, message: str = "Resource created successfully") -> tuple:
        """Create a 201 Created response"""
        return APIResponse.success(data=data, message=message, status=201)
    
    @staticmethod
    def updated(data: Any = None, message: str = "Resource updated successfully") -> tuple:
        """Create a 200 Updated response"""
        return APIResponse.success(data=data, message=message, status=200)
    
    @staticmethod
    def deleted(message: str = "Resource deleted successfully") -> tuple:
        """Create a 200 Deleted response"""
        return APIResponse.success(data=None, message=message, status=200)
    
    @staticmethod
    def not_found(resource: str = "Resource") -> tuple:
        """Create a 404 Not Found response"""
        return APIResponse.error(f"{resource} not found", status=404)
    
    @staticmethod
    def unauthorized(message: str = "Unauthorized") -> tuple:
        """Create a 401 Unauthorized response"""
        return APIResponse.error(message, status=401)
    
    @staticmethod
    def forbidden(message: str = "Forbidden") -> tuple:
        """Create a 403 Forbidden response"""
        return APIResponse.error(message, status=403)
    
    @staticmethod
    def validation_error(errors: Dict, message: str = "Validation failed") -> tuple:
        """Create a 422 Validation Error response"""
        return APIResponse.error(message, status=422, errors=errors)


def success_response(data: Any = None, message: str = "Success", status: int = 200) -> tuple:
    """Shortcut function for success response"""
    return APIResponse.success(data=data, message=message, status=status)


def error_response(message: str, status: int = 400, errors: Optional[Dict] = None) -> tuple:
    """Shortcut function for error response"""
    return APIResponse.error(message=message, status=status, errors=errors)


def paginated_response(data: list, page: int, per_page: int, total: int, 
                      message: str = "Data retrieved successfully") -> tuple:
    """Shortcut function for paginated response"""
    return APIResponse.paginated(data=data, page=page, per_page=per_page, total=total, message=message)