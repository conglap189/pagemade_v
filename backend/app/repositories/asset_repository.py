"""Asset repository for database operations."""
from app.models import db, Asset


class AssetRepository:
    """Repository for Asset data access."""
    
    @staticmethod
    def create(asset_data):
        """Create new asset."""
        asset = Asset(**asset_data)
        db.session.add(asset)
        db.session.commit()
        return asset
    
    @staticmethod
    def find_by_id(asset_id):
        """Find asset by ID."""
        return Asset.query.get(asset_id)
    
    @staticmethod
    def find_by_site(site_id):
        """Find all assets by site ID."""
        return Asset.query.filter_by(site_id=site_id).order_by(
            Asset.created_at.desc()
        ).all()
    
    @staticmethod
    def find_by_site_and_user(site_id, user_id):
        """Find all assets by site ID and user ID (with ownership verification)."""
        return Asset.query.filter_by(site_id=site_id, user_id=user_id).order_by(
            Asset.created_at.desc()
        ).all()
    
    @staticmethod
    def count():
        """Count all assets."""
        return Asset.query.count()
    
    @staticmethod
    def find_by_user(user_id):
        """Find all assets by user ID."""
        return Asset.query.filter_by(user_id=user_id).order_by(
            Asset.created_at.desc()
        ).all()
    
    @staticmethod
    def find_images_by_site(site_id):
        """Find all image assets by site ID."""
        return Asset.query.filter(
            Asset.site_id == site_id,
            Asset.file_type.startswith('image/')
        ).order_by(Asset.created_at.desc()).all()
    
    @staticmethod
    def find_by_url(url):
        """Find asset by URL."""
        return Asset.query.filter_by(url=url).first()
    
    @staticmethod
    def get_all():
        """Get all assets."""
        return Asset.query.all()
    
    @staticmethod
    def get_paginated(page=1, per_page=20):
        """Get paginated assets."""
        return Asset.query.order_by(Asset.created_at.desc()).paginate(
            page=page, per_page=per_page
        )
    
    @staticmethod
    def update(asset, **kwargs):
        """Update asset fields."""
        for key, value in kwargs.items():
            if hasattr(asset, key):
                setattr(asset, key, value)
        db.session.commit()
        return asset
    
    @staticmethod
    def delete(asset):
        """Delete asset."""
        db.session.delete(asset)
        db.session.commit()
    
    @staticmethod
    def count():
        """Count total assets."""
        return Asset.query.count()
    
    @staticmethod
    def count_by_site(site_id):
        """Count assets by site."""
        return Asset.query.filter_by(site_id=site_id).count()
    
    @staticmethod
    def get_total_size_by_site(site_id):
        """Calculate total storage used by a site."""
        assets = Asset.query.filter_by(site_id=site_id).all()
        return sum(asset.file_size or 0 for asset in assets)
    
    @staticmethod
    def get_total_size_by_user(user_id):
        """Calculate total storage used by a user."""
        assets = Asset.query.filter_by(user_id=user_id).all()
        return sum(asset.file_size or 0 for asset in assets)
    
    @staticmethod
    def search(query):
        """Search assets by filename."""
        search_pattern = f"%{query}%"
        return Asset.query.filter(
            (Asset.filename.ilike(search_pattern)) |
            (Asset.original_name.ilike(search_pattern))
        ).all()
