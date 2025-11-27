"""
JWT Service for handling JWT token operations
Handles access tokens, refresh tokens, and token validation
"""

from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
import jwt
from flask import current_app
from app.models.user import User


class JWTService:
    """Service for JWT token management"""
    
    @staticmethod
    def generate_tokens(user: User) -> Dict[str, str]:
        """
        Generate access and refresh tokens for a user
        
        Args:
            user: User object
            
        Returns:
            Dictionary containing access_token and refresh_token
        """
        now = datetime.now(timezone.utc)
        
        # Access token payload (short-lived)
        access_payload = {
            'user_id': user.id,
            'email': user.email,
            'role': user.role,
            'iat': now,
            'exp': now + current_app.config['JWT_ACCESS_TOKEN_EXPIRES'],
            'type': 'access'
        }
        
        # Refresh token payload (long-lived)
        refresh_payload = {
            'user_id': user.id,
            'iat': now,
            'exp': now + current_app.config['JWT_REFRESH_TOKEN_EXPIRES'],
            'type': 'refresh'
        }
        
        # Generate tokens
        access_token = jwt.encode(
            access_payload,
            current_app.config['JWT_SECRET_KEY'],
            algorithm=current_app.config['JWT_ALGORITHM']
        )
        
        refresh_token = jwt.encode(
            refresh_payload,
            current_app.config['JWT_SECRET_KEY'],
            algorithm=current_app.config['JWT_ALGORITHM']
        )
        
        return {
            'access_token': access_token,
            'refresh_token': refresh_token,
            'expires_in': str(int(current_app.config['JWT_ACCESS_TOKEN_EXPIRES'].total_seconds()))
        }
    
    @staticmethod
    def verify_token(token: str, token_type: str = 'access') -> Optional[Dict[str, Any]]:
        """
        Verify and decode a JWT token
        
        Args:
            token: JWT token string
            token_type: 'access' or 'refresh'
            
        Returns:
            Decoded payload if valid, None otherwise
        """
        try:
            payload = jwt.decode(
                token,
                current_app.config['JWT_SECRET_KEY'],
                algorithms=[current_app.config['JWT_ALGORITHM']]
            )
            
            # Check token type
            if payload.get('type') != token_type:
                return None
                
            return payload
            
        except jwt.ExpiredSignatureError:
            # Token has expired
            return None
        except jwt.InvalidTokenError:
            # Invalid token
            return None
    
    @staticmethod
    def get_user_from_token(token: str) -> Optional[User]:
        """
        Get user from valid access token
        
        Args:
            token: JWT access token
            
        Returns:
            User object if valid, None otherwise
        """
        payload = JWTService.verify_token(token, 'access')
        
        if not payload:
            return None
            
        user_id = payload.get('user_id')
        if not user_id:
            return None
            
        return User.query.get(user_id)
    
    @staticmethod
    def refresh_access_token(refresh_token: str) -> Optional[Dict[str, str]]:
        """
        Generate new access token from refresh token
        
        Args:
            refresh_token: Valid refresh token
            
        Returns:
            Dictionary with new access_token and expires_in, or None if invalid
        """
        payload = JWTService.verify_token(refresh_token, 'refresh')
        
        if not payload:
            return None
            
        user_id = payload.get('user_id')
        if not user_id:
            return None
            
        user = User.query.get(user_id)
        if not user:
            return None
            
        # Generate new access token
        now = datetime.now(timezone.utc)
        access_payload = {
            'user_id': user.id,
            'email': user.email,
            'role': user.role,
            'iat': now,
            'exp': now + current_app.config['JWT_ACCESS_TOKEN_EXPIRES'],
            'type': 'access'
        }
        
        access_token = jwt.encode(
            access_payload,
            current_app.config['JWT_SECRET_KEY'],
            algorithm=current_app.config['JWT_ALGORITHM']
        )
        
        return {
            'access_token': access_token,
            'expires_in': str(int(current_app.config['JWT_ACCESS_TOKEN_EXPIRES'].total_seconds()))
        }
    
    @staticmethod
    def revoke_token(token: str) -> bool:
        """
        Revoke a token (add to blacklist)
        In a production environment, this should store revoked tokens in Redis or database
        
        Args:
            token: Token to revoke
            
        Returns:
            True if revoked successfully
        """
        try:
            # For now, we'll implement a simple in-memory blacklist
            # In production, use Redis or database for token blacklisting
            payload = jwt.decode(
                token,
                current_app.config['JWT_SECRET_KEY'],
                algorithms=[current_app.config['JWT_ALGORITHM']],
                options={"verify_exp": False}
            )
            
            # Add to revoked tokens list (simplified implementation)
            if not hasattr(current_app, 'revoked_tokens'):
                current_app.revoked_tokens = set()
            
            current_app.revoked_tokens.add(token)
            return True
            
        except jwt.InvalidTokenError:
            return False
    
    @staticmethod
    def is_token_revoked(token: str) -> bool:
        """
        Check if a token is revoked
        
        Args:
            token: Token to check
            
        Returns:
            True if token is revoked
        """
        if not hasattr(current_app, 'revoked_tokens'):
            return False
            
        return token in current_app.revoked_tokens
    
    @staticmethod
    def decode_token(token: str) -> Optional[Dict[str, Any]]:
        """
        Decode a JWT token without type checking (for custom tokens)
        
        Args:
            token: JWT token string
            
        Returns:
            Decoded payload if valid, None otherwise
        """
        try:
            payload = jwt.decode(
                token,
                current_app.config['JWT_SECRET_KEY'],
                algorithms=[current_app.config['JWT_ALGORITHM']]
            )
            return payload
            
        except jwt.ExpiredSignatureError:
            # Token has expired
            return None
        except jwt.InvalidTokenError:
            # Invalid token
            return None