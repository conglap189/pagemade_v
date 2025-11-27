"""File handler utilities for file operations."""
import os
import hashlib
from datetime import datetime
from werkzeug.utils import secure_filename


class FileHandler:
    """Utility class for file handling operations."""
    
    ALLOWED_IMAGE_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'}
    ALLOWED_DOCUMENT_EXTENSIONS = {'pdf', 'doc', 'docx', 'txt'}
    ALLOWED_MEDIA_EXTENSIONS = {'mp4', 'mp3', 'wav', 'avi'}
    
    MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5MB
    MAX_DOCUMENT_SIZE = 10 * 1024 * 1024  # 10MB
    MAX_MEDIA_SIZE = 50 * 1024 * 1024  # 50MB
    
    @staticmethod
    def get_file_extension(filename):
        """Get file extension from filename."""
        if '.' not in filename:
            return None
        return filename.rsplit('.', 1)[1].lower()
    
    @staticmethod
    def is_allowed_extension(filename, allowed_extensions):
        """Check if file extension is in allowed list."""
        ext = FileHandler.get_file_extension(filename)
        return ext in allowed_extensions if ext else False
    
    @staticmethod
    def is_image(filename):
        """Check if file is an image."""
        return FileHandler.is_allowed_extension(filename, FileHandler.ALLOWED_IMAGE_EXTENSIONS)
    
    @staticmethod
    def is_document(filename):
        """Check if file is a document."""
        return FileHandler.is_allowed_extension(filename, FileHandler.ALLOWED_DOCUMENT_EXTENSIONS)
    
    @staticmethod
    def is_media(filename):
        """Check if file is a media file."""
        return FileHandler.is_allowed_extension(filename, FileHandler.ALLOWED_MEDIA_EXTENSIONS)
    
    @staticmethod
    def get_max_size_for_type(filename):
        """Get maximum allowed size for file type."""
        if FileHandler.is_image(filename):
            return FileHandler.MAX_IMAGE_SIZE
        elif FileHandler.is_document(filename):
            return FileHandler.MAX_DOCUMENT_SIZE
        elif FileHandler.is_media(filename):
            return FileHandler.MAX_MEDIA_SIZE
        return FileHandler.MAX_IMAGE_SIZE  # Default to image size
    
    @staticmethod
    def generate_unique_filename(original_filename, user_id=None):
        """
        Generate unique filename using timestamp and hash.
        
        Args:
            original_filename: Original uploaded filename
            user_id: Optional user ID for additional uniqueness
            
        Returns:
            str: Secure unique filename
        """
        # Secure the filename first
        secure_name = secure_filename(original_filename)
        
        # Get extension
        name, ext = os.path.splitext(secure_name)
        
        # Generate hash from timestamp + user_id + filename
        timestamp = datetime.utcnow().isoformat()
        hash_input = f"{timestamp}_{user_id}_{secure_name}"
        file_hash = hashlib.md5(hash_input.encode()).hexdigest()[:8]
        
        # Combine name with hash
        unique_name = f"{name}_{file_hash}{ext}"
        
        return unique_name
    
    @staticmethod
    def ensure_directory_exists(directory_path):
        """
        Create directory if it doesn't exist.
        
        Args:
            directory_path: Path to directory
            
        Returns:
            bool: True if directory exists or was created successfully
        """
        try:
            os.makedirs(directory_path, exist_ok=True)
            return True
        except Exception as e:
            print(f"Error creating directory {directory_path}: {e}")
            return False
    
    @staticmethod
    def delete_file_safe(file_path):
        """
        Safely delete a file (no error if doesn't exist).
        
        Args:
            file_path: Path to file
            
        Returns:
            bool: True if deleted or didn't exist, False on error
        """
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                return True
            return True  # File doesn't exist, consider success
        except Exception as e:
            print(f"Error deleting file {file_path}: {e}")
            return False
    
    @staticmethod
    def get_file_size_formatted(size_bytes):
        """
        Format file size in human-readable format.
        
        Args:
            size_bytes: File size in bytes
            
        Returns:
            str: Formatted size (e.g., "1.5 MB")
        """
        if size_bytes is None:
            return "0 B"
        
        size = float(size_bytes)
        for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
            if size < 1024.0:
                return f"{size:.1f} {unit}"
            size /= 1024.0
        
        return f"{size:.1f} PB"
    
    @staticmethod
    def validate_file_size(file_path, max_size=None):
        """
        Validate if file size is within limits.
        
        Args:
            file_path: Path to file
            max_size: Maximum allowed size in bytes (optional)
            
        Returns:
            tuple: (is_valid: bool, actual_size: int)
        """
        try:
            actual_size = os.path.getsize(file_path)
            
            if max_size is None:
                # Determine max size based on file type
                max_size = FileHandler.get_max_size_for_type(file_path)
            
            is_valid = actual_size <= max_size
            return is_valid, actual_size
            
        except Exception as e:
            print(f"Error validating file size: {e}")
            return False, 0
    
    @staticmethod
    def get_mime_type(filename):
        """
        Get MIME type from filename extension.
        
        Args:
            filename: Filename with extension
            
        Returns:
            str: MIME type or 'application/octet-stream'
        """
        ext = FileHandler.get_file_extension(filename)
        
        if not ext:
            return 'application/octet-stream'
        
        mime_types = {
            # Images
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'svg': 'image/svg+xml',
            'webp': 'image/webp',
            
            # Documents
            'pdf': 'application/pdf',
            'doc': 'application/msword',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'txt': 'text/plain',
            
            # Media
            'mp4': 'video/mp4',
            'mp3': 'audio/mpeg',
            'wav': 'audio/wav',
            'avi': 'video/x-msvideo'
        }
        
        return mime_types.get(ext, 'application/octet-stream')
