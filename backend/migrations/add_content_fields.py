#!/usr/bin/env python3
"""
Migration: Add html_content, css_content, published_at fields to Page model
Date: 2025-10-01
Purpose: Support Silex editor HTML/CSS storage and publish tracking
"""

from datetime import datetime
import sys
import os

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app, db
from sqlalchemy import text

def migrate_up():
    """Add new fields to Page table"""
    app = create_app()
    
    with app.app_context():
        try:
            # Add new columns to Page table
            with db.engine.connect() as conn:
                conn.execute(text("""
                    ALTER TABLE page 
                    ADD COLUMN html_content TEXT;
                """))
                
                conn.execute(text("""
                    ALTER TABLE page 
                    ADD COLUMN css_content TEXT;
                """))
                
                conn.execute(text("""
                    ALTER TABLE page 
                    ADD COLUMN published_at DATETIME;
                """))
                
                # Update existing published pages with current timestamp
                conn.execute(text("""
                    UPDATE page 
                    SET published_at = updated_at 
                    WHERE is_published = 1;
                """))
                
                conn.commit()
            
            print("✅ Migration completed successfully!")
            print("   - Added html_content (TEXT) field")
            print("   - Added css_content (TEXT) field") 
            print("   - Added published_at (DATETIME) field")
            print("   - Updated existing published pages with published_at timestamp")
            
        except Exception as e:
            print(f"❌ Migration failed: {e}")
            return False
    
    return True

def migrate_down():
    """Remove added fields from Page table"""
    app = create_app()
    
    with app.app_context():
        try:
            # Remove columns from Page table
            with db.engine.connect() as conn:
                conn.execute(text("""
                    ALTER TABLE page 
                    DROP COLUMN html_content;
                """))
                
                conn.execute(text("""
                    ALTER TABLE page 
                    DROP COLUMN css_content;
                """))
                
                conn.execute(text("""
                    ALTER TABLE page 
                    DROP COLUMN published_at;
                """))
                
                conn.commit()
            
            print("✅ Rollback completed successfully!")
            print("   - Removed html_content field")
            print("   - Removed css_content field")
            print("   - Removed published_at field")
            
        except Exception as e:
            print(f"❌ Rollback failed: {e}")
            return False
    
    return True

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "down":
        migrate_down()
    else:
        migrate_up()