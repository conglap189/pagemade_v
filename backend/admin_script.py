#!/usr/bin/env python3
"""
ADMIN SCRIPT - Complete admin management tool
Features:
1. Create Admin Account
2. List All Users  
3. Delete User by ID
4. Clear All Data (Reset System)
5. Exit
"""

import os
import sys
import sqlite3
import hashlib
import getpass
import shutil
from pathlib import Path

# Database path
DB_PATH = "/home/helios/ver1.1/backend/instance/app.db"
BASE_DIR = "/home/helios/ver1.1/backend"

def connect_db():
    """Connect to database."""
    if not os.path.exists(DB_PATH):
        print(f"❌ Database not found: {DB_PATH}")
        print(f"💡 Creating new database...")
        init_database()
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    return conn, cursor

def hash_password(password):
    """Hash password using werkzeug (same as Flask app)."""
    # Import from system path
    import sys
    sys.path.append('/home/helios/ver1.1/backend')
    
    try:
        from werkzeug.security import generate_password_hash
        return generate_password_hash(password)
    except ImportError:
        print("❌ Error: werkzeug not available. Please install: pip install werkzeug")
        return None

def init_database():
    """Initialize database with tables."""
    print("\n🗄️  INITIALIZING DATABASE")
    print("=" * 40)
    
    # Create instance directory if it doesn't exist
    instance_dir = os.path.dirname(DB_PATH)
    if not os.path.exists(instance_dir):
        os.makedirs(instance_dir)
        print(f"  ✅ Created directory: {instance_dir}")
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Create user table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email VARCHAR(100) UNIQUE NOT NULL,
                name VARCHAR(100) NOT NULL,
                password_hash VARCHAR(255),
                google_id VARCHAR(100),
                avatar_url VARCHAR(500),
                role VARCHAR(20) DEFAULT 'user',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                last_login DATETIME
            )
        """)
        print("  ✅ Created table: user")
        
        # Create site table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS site (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                name VARCHAR(100) NOT NULL,
                subdomain VARCHAR(100) UNIQUE NOT NULL,
                title VARCHAR(200),
                description TEXT,
                is_published BOOLEAN DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE
            )
        """)
        print("  ✅ Created table: site")
        
        # Create page table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS page (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                site_id INTEGER NOT NULL,
                title VARCHAR(200) NOT NULL,
                slug VARCHAR(200) NOT NULL,
                content TEXT,
                is_published BOOLEAN DEFAULT 0,
                is_homepage BOOLEAN DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (site_id) REFERENCES site (id) ON DELETE CASCADE
            )
        """)
        print("  ✅ Created table: page")
        
        # Create asset table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS asset (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                site_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                original_name VARCHAR(255) NOT NULL,
                file_size INTEGER NOT NULL,
                file_type VARCHAR(50) NOT NULL,
                width INTEGER,
                height INTEGER,
                url VARCHAR(500) NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (site_id) REFERENCES site (id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE
            )
        """)
        print("  ✅ Created table: asset")
        
        conn.commit()
        conn.close()
        
        print(f"\n✅ Database initialized successfully!")
        print(f"   Location: {DB_PATH}")
        return True
        
    except Exception as e:
        print(f"❌ Error initializing database: {e}")
        conn.close()
        return False

def create_admin():
    """Create admin account."""
    print("\n👑 CREATE ADMIN ACCOUNT")
    print("=" * 40)
    
    email = input("📧 Email: ").strip()
    name = input("👤 Name: ").strip()
    
    if not email or not name:
        print("❌ Email and name are required!")
        return False
    
    # Check if email already exists
    conn, cursor = connect_db()
    if not conn:
        return False
    
    try:
        cursor.execute("SELECT id FROM user WHERE email = ?", (email,))
        if cursor.fetchone():
            print(f"❌ Email {email} already exists!")
            conn.close()
            return False
        
        # Get password
        password = getpass.getpass("🔒 Password: ")
        confirm_password = getpass.getpass("🔒 Confirm Password: ")
        
        if password != confirm_password:
            print("❌ Passwords do not match!")
            conn.close()
            return False
        
        if len(password) < 6:
            print("❌ Password must be at least 6 characters!")
            conn.close()
            return False
        
        # Create admin user
        password_hash = hash_password(password)
        
        if not password_hash:
            print("❌ Failed to hash password!")
            conn.close()
            return False
        
        cursor.execute("""
            INSERT INTO user (email, name, password_hash, role, created_at, updated_at)
            VALUES (?, ?, ?, 'admin', datetime('now'), datetime('now'))
        """, (email, name, password_hash))
        
        conn.commit()
        admin_id = cursor.lastrowid
        
        print(f"✅ Admin account created successfully!")
        print(f"   ID: {admin_id}")
        print(f"   Email: {email}")
        print(f"   Name: {name}")
        print(f"   Role: admin")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Error creating admin: {e}")
        conn.close()
        return False

def list_users():
    """List all users."""
    print("\n👥 LIST ALL USERS")
    print("=" * 80)
    
    conn, cursor = connect_db()
    if not conn:
        return False
    
    try:
        cursor.execute("""
            SELECT id, email, name, role, created_at, last_login,
                   (SELECT COUNT(*) FROM site WHERE user_id = user.id) as sites_count
            FROM user 
            ORDER BY role DESC, created_at ASC
        """)
        
        users = cursor.fetchall()
        
        if not users:
            print("📭 No users found!")
            conn.close()
            return True
        
        # Print header
        print(f"{'ID':<5} {'EMAIL':<30} {'NAME':<20} {'ROLE':<8} {'SITES':<6} {'CREATED':<20}")
        print("-" * 89)
        
        # Print users
        admin_count = 0
        user_count = 0
        
        for user in users:
            user_id, email, name, role, created_at, last_login, sites_count = user
            
            # Count roles
            if role == 'admin':
                admin_count += 1
            else:
                user_count += 1
            
            # Format created_at
            created_display = created_at.split(' ')[0] if created_at else 'N/A'
            
            print(f"{user_id:<5} {email:<30} {name:<20} {role:<8} {sites_count:<6} {created_display:<20}")
        
        print(f"\n📊 Total: {len(users)} users ({admin_count} admins, {user_count} users)")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Error listing users: {e}")
        conn.close()
        return False

def delete_user():
    """Delete user by ID."""
    print("\n🗑️  DELETE USER BY ID")
    print("=" * 40)
    
    # First show users
    if not list_users():
        return False
    
    try:
        user_id = input("\n🆔 Enter User ID to delete (or 0 to cancel): ").strip()
        
        if user_id == '0':
            print("❌ Cancelled!")
            return False
        
        if not user_id.isdigit():
            print("❌ Invalid ID!")
            return False
        
        user_id = int(user_id)
        
        # Get user info and confirm deletion
        conn, cursor = connect_db()
        if not conn:
            return False
        
        # Get user info with sites count
        cursor.execute("""
            SELECT email, name, role, 
                   (SELECT COUNT(*) FROM site WHERE user_id = ?) as sites_count
            FROM user WHERE id = ?
        """, (user_id, user_id))
        user = cursor.fetchone()
        
        if not user:
            print(f"❌ User with ID {user_id} not found!")
            conn.close()
            return False
        
        email, name, role, sites_count = user
        
        print(f"\n⚠️  WARNING: You are about to delete:")
        print(f"   👤 ID: {user_id}")
        print(f"   📧 Email: {email}")
        print(f"   📝 Name: {name}")
        print(f"   🎭 Role: {role}")
        print(f"   🌐 Sites: {sites_count}")
        print(f"\n🔥 This will also delete:")
        print(f"   • All {sites_count} sites owned by this user")
        print(f"   • All pages in those sites")
        print(f"   • All assets uploaded by this user")
        print(f"   • All related data")
        
        confirm = input(f"\n💥 Type 'DELETE {user_id}' to confirm: ").strip()
        
        if confirm != f'DELETE {user_id}':
            print("❌ Deletion cancelled!")
            conn.close()
            return False
        
        # Delete user (cascade will handle related records)
        cursor.execute("DELETE FROM user WHERE id = ?", (user_id,))
        rows_deleted = cursor.rowcount
        
        conn.commit()
        
        if rows_deleted > 0:
            print(f"\n✅ User deleted successfully!")
            print(f"   👤 {name} ({email})")
            print(f"   🗑️  {sites_count} sites and all related data removed")
        else:
            print(f"❌ Failed to delete user {user_id}")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Error deleting user: {e}")
        return False

def clear_all_data():
    """Clear all data and reset system to fresh state."""
    print("\n💣 CLEAR ALL DATA - COMPLETE SYSTEM RESET")
    print("=" * 60)
    print("⚠️  🚨 EXTREME WARNING 🚨")
    print("This will completely DESTROY everything and reset to factory state:")
    print()
    print("🗂️  DATABASE:")
    print("   ❌ All users (including admins)")
    print("   ❌ All sites and pages") 
    print("   ❌ All assets and uploads")
    print("   ❌ All database records")
    print()
    print("📁 FILES:")
    print("   ❌ All uploaded files")
    print("   ❌ All user avatars")
    print("   ❌ All site storage")
    print()
    print("🔄 RESULT:")
    print("   ✅ Fresh, empty system like first install")
    print("   ✅ Ready for new admin registration")
    
    print(f"\n{'='*60}")
    print("💀 THIS ACTION CANNOT BE UNDONE! 💀")
    print(f"{'='*60}")
    
    confirm1 = input("\n🔥 Type 'I UNDERSTAND' to continue: ").strip()
    
    if confirm1 != 'I UNDERSTAND':
        print("❌ System reset cancelled!")
        return False
    
    confirm2 = input("\n💥 Type 'RESET EVERYTHING' to execute: ").strip()
    
    if confirm2 != 'RESET EVERYTHING':
        print("❌ System reset cancelled!")
        return False
    
    print(f"\n{'='*60}")
    print("🗑️  EXECUTING COMPLETE SYSTEM RESET...")
    print(f"{'='*60}")
    
    # Step 1: Clear Database
    print("\n1️⃣  Clearing Database...")
    try:
        if os.path.exists(DB_PATH):
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            
            # Get all tables
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
            tables = [row[0] for row in cursor.fetchall()]
            
            # Clear each table
            for table in tables:
                if table != 'sqlite_sequence':
                    cursor.execute(f"DELETE FROM {table};")
                    print(f"    ✅ Cleared table: {table}")
            
            # Reset sequences
            cursor.execute("DELETE FROM sqlite_sequence;")
            print(f"    ✅ Reset auto-increment sequences")
            
            conn.commit()
            conn.close()
            print("    💾 Database cleared successfully!")
        else:
            print("    ⚠️  Database file not found, will create fresh one")
    except Exception as e:
        print(f"    ❌ Error clearing database: {e}")
    
    # Step 2: Clear Uploads
    print("\n2️⃣  Clearing Uploads...")
    try:
        uploads_dir = os.path.join(BASE_DIR, 'static', 'uploads')
        if os.path.exists(uploads_dir):
            removed_count = 0
            for item in os.listdir(uploads_dir):
                if item == '.gitkeep':
                    continue
                    
                item_path = os.path.join(uploads_dir, item)
                if os.path.isdir(item_path):
                    shutil.rmtree(item_path)
                    print(f"    📂 Removed directory: uploads/{item}/")
                else:
                    os.remove(item_path)
                    print(f"    📄 Removed file: uploads/{item}")
                removed_count += 1
            
            if removed_count == 0:
                print("    ✅ Uploads directory already clean")
            else:
                print(f"    🗑️  Removed {removed_count} items from uploads")
        else:
            print("    ⚠️  Uploads directory not found")
    except Exception as e:
        print(f"    ❌ Error clearing uploads: {e}")
    
    # Step 3: Clear Storage
    print("\n3️⃣  Clearing Storage...")
    try:
        storage_dir = os.path.join(BASE_DIR, 'storage')
        if os.path.exists(storage_dir):
            removed_count = 0
            for item in os.listdir(storage_dir):
                if item == '.gitkeep':
                    continue
                    
                item_path = os.path.join(storage_dir, item)
                if os.path.isdir(item_path):
                    shutil.rmtree(item_path)
                    print(f"    📂 Removed directory: storage/{item}/")
                    removed_count += 1
                elif os.path.isfile(item_path):
                    os.remove(item_path)
                    print(f"    📄 Removed file: storage/{item}")
                    removed_count += 1
            
            if removed_count == 0:
                print("    ✅ Storage directory already clean")
            else:
                print(f"    🗑️  Removed {removed_count} items from storage")
        else:
            print("    ⚠️  Storage directory not found")
    except Exception as e:
        print(f"    ❌ Error clearing storage: {e}")
    
    # Step 4: Reinitialize Database
    print("\n4️⃣  Reinitializing Database...")
    if init_database():
        print("    ✅ Fresh database created!")
    else:
        print("    ❌ Failed to create fresh database")
    
    # Final Result
    print(f"\n{'='*60}")
    print("🎉 SYSTEM RESET COMPLETED!")
    print(f"{'='*60}")
    print("✅ Your system is now completely fresh!")
    print("✅ All data has been erased")
    print("✅ Database is ready for new users")
    print()
    print("🚀 Next steps:")
    print("   1. Create your first admin account")
    print("   2. Register new users")
    print("   3. Build fresh websites")
    print(f"{'='*60}")
    
    return True

def show_menu():
    """Show main menu."""
    print("\n🛠️  ADMIN MANAGER")
    print("=" * 40)
    print("1. 👑 Create Admin Account")
    print("2. 👥 List All Users")
    print("3. 🗑️  Delete User by ID")
    print("4. 💣 Clear All Data (Reset System)")
    print("5. 🚪 Exit")
    print("=" * 40)

def create_admin_auto(email, name, password):
    """Create admin account automatically with provided credentials."""
    print("\n👑 AUTO CREATE ADMIN ACCOUNT")
    print("=" * 40)
    print(f"📧 Email: {email}")
    print(f"👤 Name: {name}")
    print(f"🔒 Password: {'*' * len(password)}")
    
    # Check if email already exists
    conn, cursor = connect_db()
    if not conn:
        return False
    
    try:
        cursor.execute("SELECT id FROM user WHERE email = ?", (email,))
        if cursor.fetchone():
            print(f"❌ Email {email} already exists!")
            conn.close()
            return False
        
        # Validate password
        if len(password) < 6:
            print("❌ Password must be at least 6 characters!")
            conn.close()
            return False
        
        # Create admin user
        password_hash = hash_password(password)
        
        if not password_hash:
            print("❌ Failed to hash password!")
            conn.close()
            return False
        
        cursor.execute("""
            INSERT INTO user (email, name, password_hash, role, created_at, updated_at)
            VALUES (?, ?, ?, 'admin', datetime('now'), datetime('now'))
        """, (email, name, password_hash))
        
        conn.commit()
        admin_id = cursor.lastrowid
        
        print(f"✅ Admin account created successfully!")
        print(f"   ID: {admin_id}")
        print(f"   Email: {email}")
        print(f"   Name: {name}")
        print(f"   Role: admin")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Error creating admin: {e}")
        conn.close()
        return False

def main():
    """Main function."""
    # Check for command line arguments for auto admin creation
    if len(sys.argv) >= 4 and sys.argv[1] == "--create-admin":
        email = sys.argv[2]
        name = sys.argv[3]
        password = sys.argv[4] if len(sys.argv) > 4 else "123456"
        
        success = create_admin_auto(email, name, password)
        return 0 if success else 1
    
    print("🚀 PageMade Admin Manager")
    print("Complete admin management tool")
    
    while True:
        show_menu()
        
        try:
            choice = input("\n🎯 Choose option (1-5): ").strip()
            
            if choice == '1':
                create_admin()
            elif choice == '2':
                list_users()
            elif choice == '3':
                delete_user()
            elif choice == '4':
                clear_all_data()
            elif choice == '5':
                print("\n👋 Goodbye!")
                break
            else:
                print("❌ Invalid choice! Please choose 1-5.")
                
        except KeyboardInterrupt:
            print("\n\n👋 Goodbye!")
            break
        except Exception as e:
            print(f"❌ Error: {e}")
        
        input("\n📝 Press Enter to continue...")

if __name__ == '__main__':
    main()