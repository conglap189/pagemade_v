#!/usr/bin/env python3
"""
Asset Isolation Fix Script
Analyzes and fixes asset site_id isolation issues
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from app.models import Asset, Site, User
from sqlalchemy import text

def analyze_assets():
    """Analyze current asset distribution"""
    print("🔍 Analyzing current asset distribution...\n")
    
    # Count total assets
    total_assets = Asset.query.count()
    print(f"📊 Total assets in database: {total_assets}")
    
    # Assets with NULL site_id
    null_site_assets = Asset.query.filter(Asset.site_id.is_(None)).count()
    print(f"⚠️  Assets with NULL site_id: {null_site_assets}")
    
    # Assets by site
    print("\n📋 Assets per site:")
    sites = Site.query.all()
    for site in sites:
        asset_count = Asset.query.filter_by(site_id=site.id).count()
        print(f"  - Site {site.id} ({site.title}): {asset_count} assets")
    
    # Assets by user
    print("\n👥 Assets per user:")
    users = User.query.all()
    for user in users:
        asset_count = Asset.query.filter_by(user_id=user.id).count()
        print(f"  - User {user.id} ({user.name} - {user.email}): {asset_count} assets")
    
    # Detailed asset list
    print("\n📄 Detailed asset list:")
    assets = Asset.query.order_by(Asset.created_at.desc()).limit(20).all()
    for asset in assets:
        site_title = asset.site.title if asset.site else "NO SITE"
        user_name = asset.user.name if asset.user else "NO USER"
        print(f"  - {asset.original_name} | Site: {asset.site_id} ({site_title}) | User: {asset.user_id} ({user_name})")

def fix_null_site_assets():
    """Fix assets with NULL site_id"""
    print("\n🔧 Fixing assets with NULL site_id...")
    
    null_assets = Asset.query.filter(Asset.site_id.is_(None)).all()
    
    if not null_assets:
        print("✅ No assets with NULL site_id found")
        return
    
    print(f"Found {len(null_assets)} assets with NULL site_id")
    
    # Strategy: Assign to user's first site
    for asset in null_assets:
        if asset.user:
            # Get user's first site
            first_site = Site.query.filter_by(user_id=asset.user_id).first()
            
            if first_site:
                print(f"  📌 Assigning {asset.original_name} to site {first_site.id} ({first_site.title})")
                asset.site_id = first_site.id
            else:
                print(f"  ⚠️  User {asset.user_id} has no sites! Skipping {asset.original_name}")
        else:
            print(f"  ⚠️  Asset {asset.original_name} has no user! Deleting...")
            db.session.delete(asset)
    
    db.session.commit()
    print("✅ Fix complete!")

def verify_isolation():
    """Verify that assets are properly isolated by site"""
    print("\n✅ Verifying asset isolation...")
    
    sites = Site.query.all()
    
    for site in sites:
        assets = Asset.query.filter_by(site_id=site.id).all()
        
        print(f"\n🔍 Site {site.id} ({site.title}):")
        print(f"  - Owner: User {site.user_id}")
        print(f"  - Assets: {len(assets)}")
        
        for asset in assets:
            if asset.user_id != site.user_id:
                print(f"  ⚠️  ISSUE: Asset {asset.original_name} belongs to user {asset.user_id} but site belongs to user {site.user_id}")
            else:
                print(f"  ✅ {asset.original_name}")

def interactive_menu():
    """Interactive menu for asset management"""
    while True:
        print("\n" + "="*50)
        print("🎯 ASSET ISOLATION MANAGER")
        print("="*50)
        print("1. 🔍 Analyze current state")
        print("2. 🔧 Fix NULL site_id assets")
        print("3. ✅ Verify isolation")
        print("4. 🧹 Clean up orphaned assets")
        print("5. 🚪 Exit")
        
        choice = input("\nSelect option (1-5): ").strip()
        
        if choice == '1':
            analyze_assets()
        elif choice == '2':
            fix_null_site_assets()
        elif choice == '3':
            verify_isolation()
        elif choice == '4':
            clean_orphaned_assets()
        elif choice == '5':
            print("👋 Goodbye!")
            break
        else:
            print("❌ Invalid choice")

def clean_orphaned_assets():
    """Remove assets that don't belong to any site or user"""
    print("\n🧹 Cleaning orphaned assets...")
    
    # Assets without valid site
    orphaned_site = Asset.query.filter(
        ~Asset.site_id.in_(db.session.query(Site.id))
    ).all()
    
    # Assets without valid user
    orphaned_user = Asset.query.filter(
        ~Asset.user_id.in_(db.session.query(User.id))
    ).all()
    
    # Assets with NULL references
    null_refs = Asset.query.filter(
        (Asset.site_id.is_(None)) | (Asset.user_id.is_(None))
    ).all()
    
    all_orphaned = list(set(orphaned_site + orphaned_user + null_refs))
    
    if not all_orphaned:
        print("✅ No orphaned assets found")
        return
    
    print(f"Found {len(all_orphaned)} orphaned assets:")
    for asset in all_orphaned:
        print(f"  - {asset.original_name} (site_id: {asset.site_id}, user_id: {asset.user_id})")
    
    confirm = input(f"\n❗ Delete these {len(all_orphaned)} orphaned assets? (y/N): ")
    
    if confirm.lower() == 'y':
        for asset in all_orphaned:
            print(f"🗑️  Deleting {asset.original_name}")
            db.session.delete(asset)
        
        db.session.commit()
        print("✅ Cleanup complete!")
    else:
        print("❌ Cleanup cancelled")

if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        interactive_menu()