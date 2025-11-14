#!/usr/bin/env python3
from app import create_app, db
from app.models import Asset
import sqlalchemy as sa

app = create_app()
with app.app_context():
    print("Checking Asset table structure:")
    with db.engine.connect() as conn:
        result = conn.execute(sa.text("PRAGMA table_info(asset)"))
        for row in result:
            print(f"Column: {row[1]}, Type: {row[2]}, NotNull: {row[3]}, Default: {row[4]}")
    
    # Also check if we can query the Asset model
    print("\nTesting Asset model query...")
    try:
        count = Asset.query.count()
        print(f"Asset table accessible, contains {count} records")
    except Exception as e:
        print(f"Error accessing Asset table: {e}")