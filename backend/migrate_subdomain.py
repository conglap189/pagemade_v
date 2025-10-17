#!/usr/bin/env python3
"""
PageMade Subdomain System Database Migration Script

This script migrates the existing database to support subdomain functionality by:
1. Adding new fields to Site and Page models
2. Updating existing data with default values
3. Generating slugs for existing pages
4. Ensuring data integrity

Usage:
    python3 migrate_subdomain.py

Make sure to backup your database before running this migration!
"""

import os
import sys
import sqlite3
from datetime import datetime
import re

# Add the app directory to Python path
sys.path.insert(0, '/home/helios/test_GPT')

from app import create_app, db
from app.models import Site, Page
from sqlalchemy import text

def print_status(message):
    """Print status message with timestamp"""
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"[{timestamp}] {message}")

def backup_database():
    """Create a backup of the current database"""
    db_path = '/home/helios/test_GPT/instance/app.db'
    backup_path = f'/home/helios/test_GPT/instance/app.db.backup_{datetime.now().strftime("%Y%m%d_%H%M%S")}'
    
    if os.path.exists(db_path):
        import shutil
        shutil.copy2(db_path, backup_path)
        print_status(f"Database backed up to: {backup_path}")
        return backup_path
    else:
        print_status("No existing database found - creating new one")
        return None

def generate_slug(title):
    """Generate URL-friendly slug from title"""
    if not title:
        return "untitled"
    
    # Convert to lowercase and replace spaces with hyphens
    slug = re.sub(r'[^\w\s-]', '', title.lower())
    slug = re.sub(r'[-\s]+', '-', slug)
    slug = slug.strip('-')
    
    return slug[:100] if slug else "untitled"

def check_column_exists(table_name, column_name):
    """Check if a column exists in a table"""
    db_path = '/home/helios/test_GPT/instance/app.db'
    
    if not os.path.exists(db_path):
        return False
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Get table info
        cursor.execute(f"PRAGMA table_info({table_name})")
        columns = [row[1] for row in cursor.fetchall()]
        
        conn.close()
        return column_name in columns
    except Exception as e:
        print_status(f"Error checking column {column_name} in {table_name}: {e}")
        return False

def migrate_site_table():
    """Add is_published field to Site table"""
    print_status("Migrating Site table...")
    
    try:
        # Check if column already exists
        if check_column_exists('site', 'is_published'):
            print_status("Site.is_published column already exists")
            return True
        
        # Add is_published column
        db.session.execute(text('ALTER TABLE site ADD COLUMN is_published BOOLEAN DEFAULT 0'))
        db.session.commit()
        
        print_status("Added is_published column to Site table")
        
        # Update existing sites - set is_published = True for sites with pages
        sites_with_pages = db.session.execute(text("""
            UPDATE site 
            SET is_published = 1 
            WHERE id IN (
                SELECT DISTINCT site_id 
                FROM page 
                WHERE site_id IS NOT NULL
            )
        """))
        
        db.session.commit()
        print_status(f"Updated existing sites with published status")
        
        return True
        
    except Exception as e:
        print_status(f"Error migrating Site table: {e}")
        db.session.rollback()
        return False

def migrate_page_table():
    """Add slug and is_homepage fields to Page table"""
    print_status("Migrating Page table...")
    
    try:
        # Add slug column
        if not check_column_exists('page', 'slug'):
            db.session.execute(text('ALTER TABLE page ADD COLUMN slug VARCHAR(100)'))
            print_status("Added slug column to Page table")
        else:
            print_status("Page.slug column already exists")
        
        # Add is_homepage column
        if not check_column_exists('page', 'is_homepage'):
            db.session.execute(text('ALTER TABLE page ADD COLUMN is_homepage BOOLEAN DEFAULT 0'))
            print_status("Added is_homepage column to Page table")
        else:
            print_status("Page.is_homepage column already exists")
        
        db.session.commit()
        
        # Generate slugs for existing pages
        print_status("Generating slugs for existing pages...")
        pages = Page.query.filter(Page.slug.is_(None) | (Page.slug == '')).all()
        
        updated_count = 0
        for page in pages:
            if not page.slug:
                base_slug = generate_slug(page.title)
                
                # Ensure slug is unique within the site
                counter = 1
                unique_slug = base_slug
                
                while Page.query.filter(
                    Page.site_id == page.site_id,
                    Page.slug == unique_slug,
                    Page.id != page.id
                ).first():
                    unique_slug = f"{base_slug}-{counter}"
                    counter += 1
                
                page.slug = unique_slug
                updated_count += 1
        
        if updated_count > 0:
            db.session.commit()
            print_status(f"Generated slugs for {updated_count} pages")
        else:
            print_status("All pages already have slugs")
        
        return True
        
    except Exception as e:
        print_status(f"Error migrating Page table: {e}")
        db.session.rollback()
        return False

def set_default_homepages():
    """Set the first page of each site as homepage if none exists"""
    print_status("Setting default homepages...")
    
    try:
        # Get sites without homepage
        sites_without_homepage = db.session.execute(text("""
            SELECT s.id, s.title 
            FROM site s 
            WHERE s.id NOT IN (
                SELECT DISTINCT p.site_id 
                FROM page p 
                WHERE p.is_homepage = true AND p.site_id IS NOT NULL
            )
        """)).fetchall()
        
        updated_sites = 0
        
        for site_id, site_title in sites_without_homepage:
            # Get the first page of this site
            first_page = Page.query.filter(
                Page.site_id == site_id
            ).order_by(Page.id.asc()).first()
            
            if first_page:
                first_page.is_homepage = True
                updated_sites += 1
                print_status(f"Set '{first_page.title}' as homepage for site '{site_title}'")
        
        if updated_sites > 0:
            db.session.commit()
            print_status(f"Set default homepage for {updated_sites} sites")
        else:
            print_status("All sites already have homepages or no pages")
        
        return True
        
    except Exception as e:
        print_status(f"Error setting default homepages: {e}")
        db.session.rollback()
        return False

def validate_migration():
    """Validate that migration was successful"""
    print_status("Validating migration...")
    
    try:
        # Check Site table
        sites_count = Site.query.count()
        published_sites = Site.query.filter(Site.is_published == True).count()
        
        print_status(f"Total sites: {sites_count}")
        print_status(f"Published sites: {published_sites}")
        
        # Check Page table
        pages_count = Page.query.count()
        pages_with_slugs = Page.query.filter(Page.slug.isnot(None)).count()
        homepage_count = Page.query.filter(Page.is_homepage == True).count()
        
        print_status(f"Total pages: {pages_count}")
        print_status(f"Pages with slugs: {pages_with_slugs}")
        print_status(f"Homepage pages: {homepage_count}")
        
        # Check for duplicate slugs within sites
        duplicate_slugs = db.session.execute(text("""
            SELECT site_id, slug, COUNT(*) as count
            FROM page 
            WHERE slug IS NOT NULL 
            GROUP BY site_id, slug 
            HAVING COUNT(*) > 1
        """)).fetchall()
        
        if duplicate_slugs:
            print_status(f"WARNING: Found {len(duplicate_slugs)} duplicate slug(s):")
            for site_id, slug, count in duplicate_slugs:
                print_status(f"  Site {site_id}: slug '{slug}' appears {count} times")
            return False
        else:
            print_status("No duplicate slugs found")
        
        print_status("Migration validation completed successfully")
        return True
        
    except Exception as e:
        print_status(f"Error during validation: {e}")
        return False

def main():
    """Main migration function"""
    print_status("=== PageMade Subdomain System Database Migration ===")
    print_status("Starting migration process...")
    
    # Create Flask app context
    app = create_app()
    
    with app.app_context():
        # Create backup
        backup_file = backup_database()
        
        # Create tables if they don't exist
        print_status("Creating database tables...")
        db.create_all()
        
        # Run migrations
        success = True
        
        success &= migrate_site_table()
        success &= migrate_page_table()
        success &= set_default_homepages()
        success &= validate_migration()
        
        if success:
            print_status("=== MIGRATION COMPLETED SUCCESSFULLY ===")
            print_status("Your database is now ready for subdomain functionality!")
            
            if backup_file:
                print_status(f"Backup saved at: {backup_file}")
            
            print_status("")
            print_status("Next steps:")
            print_status("1. Deploy nginx configuration")
            print_status("2. Restart your Flask application")
            print_status("3. Test subdomain functionality")
            
        else:
            print_status("=== MIGRATION FAILED ===")
            print_status("Some migration steps failed. Check the errors above.")
            
            if backup_file:
                print_status(f"You can restore from backup: {backup_file}")
            
            sys.exit(1)

if __name__ == "__main__":
    main()
