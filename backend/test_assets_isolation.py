#!/usr/bin/env python3
"""
Test Asset Isolation
Creates test data and verifies proper isolation
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from app.models import Asset, Site, User
from werkzeug.security import generate_password_hash

def create_test_data():
    """Create test users and sites for isolation testing"""
    print("🧪 Creating test data for asset isolation...")
    
    # Create test users
    users_data = [
        {'username': 'test_user_1', 'email': 'user1@test.com'},
        {'username': 'test_user_2', 'email': 'user2@test.com'}
    ]
    
    users = []
    for user_data in users_data:
        # Check if user exists
        existing_user = User.query.filter_by(email=user_data['email']).first()
        if existing_user:
            users.append(existing_user)
            print(f"✅ Using existing user: {existing_user.username}")
        else:
            user = User(
                username=user_data['username'],
                email=user_data['email'],
                password_hash=generate_password_hash('test123')
            )
            db.session.add(user)
            users.append(user)
            print(f"➕ Created user: {user.username}")
    
    db.session.commit()
    
    # Create test sites for each user
    sites = []
    for i, user in enumerate(users, 1):
        for j in range(1, 3):  # 2 sites per user
            site_title = f"Test Site {i}.{j}"
            existing_site = Site.query.filter_by(title=site_title, user_id=user.id).first()
            
            if existing_site:
                sites.append(existing_site)
                print(f"✅ Using existing site: {existing_site.title}")
            else:
                site = Site(
                    title=site_title,
                    description=f"Test site {j} for user {user.username}",
                    user_id=user.id
                )
                db.session.add(site)
                sites.append(site)
                print(f"➕ Created site: {site.title}")
    
    db.session.commit()
    
    # Create test assets for each site
    for i, site in enumerate(sites):
        for j in range(1, 4):  # 3 assets per site
            asset_name = f"test_image_{site.id}_{j}.jpg"
            existing_asset = Asset.query.filter_by(
                original_name=asset_name, 
                site_id=site.id
            ).first()
            
            if existing_asset:
                print(f"✅ Using existing asset: {existing_asset.original_name}")
            else:
                asset = Asset(
                    original_name=asset_name,
                    url=f"/uploads/test_{site.id}_{j}.jpg",
                    file_size=1024 * j,
                    content_type="image/jpeg",
                    site_id=site.id,
                    user_id=site.user_id
                )
                db.session.add(asset)
                print(f"➕ Created asset: {asset_name} for site {site.title}")
    
    db.session.commit()
    print("\n✅ Test data creation complete!")

def test_isolation():
    """Test that assets are properly isolated by site"""
    print("\n🧪 Testing asset isolation...\n")
    
    sites = Site.query.all()
    
    for site in sites:
        print(f"🔍 Testing Site: {site.title} (ID: {site.id}, Owner: {site.user.username})")
        
        # Get assets for this site
        site_assets = Asset.query.filter_by(site_id=site.id).all()
        print(f"  Assets in this site: {len(site_assets)}")
        
        for asset in site_assets:
            # Check that asset belongs to site owner
            if asset.user_id != site.user_id:
                print(f"  ❌ ISOLATION VIOLATION: Asset {asset.original_name} belongs to user {asset.user_id} but site belongs to user {site.user_id}")
            else:
                print(f"  ✅ {asset.original_name}")
        
        print()

def test_api_isolation():
    """Test API isolation behavior"""
    print("🧪 Testing API isolation behavior...\n")
    
    sites = Site.query.all()
    
    for site in sites:
        print(f"🔍 Testing API for Site: {site.title} (ID: {site.id})")
        
        # Simulate API call
        user_assets = Asset.query.filter_by(
            site_id=site.id,
            user_id=site.user_id
        ).all()
        
        other_user_assets = Asset.query.filter(
            Asset.site_id != site.id,
            Asset.user_id != site.user_id
        ).all()
        
        print(f"  ✅ Should see: {len(user_assets)} assets")
        print(f"  🚫 Should NOT see: {len(other_user_assets)} assets from other sites/users")
        
        for asset in user_assets:
            print(f"    - {asset.original_name}")
        
        print()

def cleanup_test_data():
    """Clean up test data"""
    print("🧹 Cleaning up test data...")
    
    # Delete test assets
    test_assets = Asset.query.filter(Asset.original_name.like('test_image_%')).all()
    for asset in test_assets:
        print(f"🗑️  Deleting asset: {asset.original_name}")
        db.session.delete(asset)
    
    # Delete test sites
    test_sites = Site.query.filter(Site.title.like('Test Site %')).all()
    for site in test_sites:
        print(f"🗑️  Deleting site: {site.title}")
        db.session.delete(site)
    
    # Delete test users
    test_users = User.query.filter(User.email.like('%@test.com')).all()
    for user in test_users:
        print(f"🗑️  Deleting user: {user.username}")
        db.session.delete(user)
    
    db.session.commit()
    print("✅ Cleanup complete!")

def main():
    """Main test runner"""
    print("🎯 ASSET ISOLATION TEST SUITE")
    print("="*40)
    
    while True:
        print("\nOptions:")
        print("1. 🧪 Create test data")
        print("2. 🔍 Test isolation")
        print("3. 🌐 Test API isolation") 
        print("4. 🧹 Cleanup test data")
        print("5. 🚪 Exit")
        
        choice = input("\nSelect option (1-5): ").strip()
        
        if choice == '1':
            create_test_data()
        elif choice == '2':
            test_isolation()
        elif choice == '3':
            test_api_isolation()
        elif choice == '4':
            cleanup_test_data()
        elif choice == '5':
            print("👋 Goodbye!")
            break
        else:
            print("❌ Invalid choice")

if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        main()