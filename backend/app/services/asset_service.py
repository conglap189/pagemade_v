"""Asset service for file management."""
import os
import uuid
from werkzeug.utils import secure_filename
from app.models import db, Asset


class AssetService:
    """Service for asset operations."""
    
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg', 'ico'}
    MAX_FILE_SIZE = 16 * 1024 * 1024  # 16MB - match older folder
    
    @staticmethod
    def is_allowed_file(filename):
        """Check if file extension is allowed - match older folder."""
        return '.' in filename and \
               filename.rsplit('.', 1)[1].lower() in AssetService.ALLOWED_EXTENSIONS
    
    @staticmethod
    def get_file_size(file):
        """Get file size from uploaded file - match older folder."""
        file.seek(0, 2)  # Move to end
        size = file.tell()
        file.seek(0)  # Reset to beginning
        return size
    
    @staticmethod
    def get_image_dimensions(filepath):
        """Get image dimensions if file is an image - match older folder."""
        try:
            from PIL import Image
            with Image.open(filepath) as img:
                return img.width, img.height
        except Exception:
            return None, None
    
    @staticmethod
    def upload_asset(file, user_id, site_id, static_folder):
        """
        Upload and save asset file.
        
        Args:
            file: FileStorage object from request
            user_id: User ID who owns the asset
            site_id: Site ID where asset belongs
            static_folder: Path to static folder
            
        Returns:
            tuple: (success: bool, asset: Asset|None, error: str|None)
        """
        if not file or file.filename == '':
            return False, None, "No file selected"
        
        if not AssetService.is_allowed_file(file.filename):
            return False, None, f"File type not allowed. Allowed: {', '.join(AssetService.ALLOWED_EXTENSIONS)}"
        
        try:
            # Secure filename - match older folder logic
            original_filename = file.filename
            filename = secure_filename(original_filename)
            file_extension = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
            unique_filename = f"{uuid.uuid4().hex}.{file_extension}"
            
            # Create upload directory for this site
            upload_dir = os.path.join(static_folder, 'uploads', str(site_id))
            os.makedirs(upload_dir, exist_ok=True)
            
            # Save file
            file_path = os.path.join(upload_dir, unique_filename)
            file.save(file_path)
            
            # Get file size - match older folder logic
            file_size = AssetService.get_file_size(file)
            
            # Check file size
            if file_size > AssetService.MAX_FILE_SIZE:
                os.remove(file_path)
                return False, None, f"File too large. Max size: {AssetService.MAX_FILE_SIZE / 1024 / 1024}MB"
            
            # Create asset record - use API serve route
            file_url = f"/api/assets/uploads/{site_id}/{unique_filename}"
            
            # Get image dimensions if it's an image - match older folder
            width, height = AssetService.get_image_dimensions(file_path)
            
            asset = Asset(
                filename=unique_filename,
                original_name=original_filename,
                url=file_url,
                file_size=file_size,
                file_type=file.content_type,
                width=width,
                height=height,
                site_id=site_id,
                user_id=user_id
            )
            
            db.session.add(asset)
            db.session.commit()
            
            # Convert to dict - match older folder to_dict format
            asset_dict = asset.to_dict()
            db.session.expunge(asset)
            
            return True, asset_dict, None
            
        except Exception as e:
            db.session.rollback()
            return False, None, f"Upload failed: {str(e)}"
    
    @staticmethod
    def get_assets_by_site(site_id, user_id):
        """
        Get all assets for a specific site (with ownership verification).
        
        Args:
            site_id: Site ID
            user_id: User ID for ownership verification
            
        Returns:
            list: List of Asset objects
        """
        return Asset.query.filter_by(
            site_id=site_id,
            user_id=user_id
        ).order_by(Asset.created_at.desc()).all()
    
    @staticmethod
    def get_asset_by_id(asset_id):
        """Get asset by ID."""
        return Asset.query.get(asset_id)
    
    @staticmethod
    def delete_asset(asset_id, user_id, static_folder):
        """
        Delete asset (both file and database record).
        
        Args:
            asset_id: Asset ID to delete
            user_id: User ID for ownership verification
            static_folder: Path to static folder
            
        Returns:
            tuple: (success: bool, error: str|None)
        """
        asset = Asset.query.get(asset_id)
        
        if not asset:
            return False, "Asset not found"
        
        # Verify ownership
        if asset.user_id != user_id:
            return False, "Unauthorized: You don't own this asset"
        
        try:
            # Delete physical file
            # URL format: /api/assets/uploads/{site_id}/{filename}
            if asset.url.startswith('/api/assets/uploads/'):
                # Extract site_id and filename from URL
                url_parts = asset.url.split('/')
                if len(url_parts) >= 5:
                    site_id = url_parts[4]
                    filename = url_parts[5]
                    file_path = os.path.join(static_folder, 'uploads', site_id, filename)
                    if os.path.exists(file_path):
                        os.remove(file_path)
            # Handle old format URLs for backward compatibility
            elif asset.url.startswith('/static/'):
                relative_path = asset.url.replace('/static/', '')
                file_path = os.path.join(static_folder, relative_path)
                if os.path.exists(file_path):
                    os.remove(file_path)
            
            # Delete database record
            db.session.delete(asset)
            db.session.commit()
            
            print(f"✓ Asset deleted successfully: {asset.filename}")
            return True, None
            
        except Exception as e:
            db.session.rollback()
            return False, f"Delete failed: {str(e)}"
    
    @staticmethod
    def get_total_size_by_site(site_id):
        """Calculate total storage used by a site."""
        assets = Asset.query.filter_by(site_id=site_id).all()
        return sum(asset.file_size or 0 for asset in assets)
    
    @staticmethod
    def cleanup_orphaned_files(static_folder):
        """
        Find and optionally remove files without database records.
        
        Returns:
            list: List of orphaned file paths
        """
        orphaned_files = []
        uploads_dir = os.path.join(static_folder, 'uploads')
        
        if not os.path.exists(uploads_dir):
            return orphaned_files
        
        # Get all files in uploads directory
        for root, dirs, files in os.walk(uploads_dir):
            for filename in files:
                file_path = os.path.join(root, filename)
                relative_path = os.path.relpath(file_path, static_folder)
                
                # Check if file has database record
                # Try both new and old URL formats
                relative_url = relative_path.replace(os.sep, '/')
                
                # New format: /api/assets/uploads/{site_id}/{filename}
                if relative_url.startswith('uploads/'):
                    parts = relative_url.split('/')
                    if len(parts) >= 3:
                        site_id = parts[1]
                        filename = parts[2]
                        file_url_new = f"/api/assets/uploads/{site_id}/{filename}"
                        asset = Asset.query.filter_by(url=file_url_new).first()
                        if asset:
                            continue  # File has record, skip
                
                # Old format: /static/uploads/{site_id}/{filename}
                file_url_old = f"/static/{relative_url}"
                asset = Asset.query.filter_by(url=file_url_old).first()
                if not asset:
                    orphaned_files.append(file_path)
        
        return orphaned_files
