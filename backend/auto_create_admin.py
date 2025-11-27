#!/usr/bin/env python3
"""
Script tự động tạo tài khoản admin cho production database
"""
import os
import sys
from datetime import datetime
sys.path.insert(0, '/home/helios/ver1.1/backend')

from werkzeug.security import generate_password_hash

def auto_create_admin():
    """Tự động tạo admin user với password mặc định"""
    
    print("🚀 Tự động tạo Admin Account")
    print("=" * 50)
    
    # Lấy database path từ production config
    try:
        from app.config.production import ProductionConfig
        db_uri = ProductionConfig.SQLALCHEMY_DATABASE_URI
        print(f"📍 Database URI: {db_uri}")
        
        # Extract path từ URI
        if db_uri.startswith('sqlite:///'):
            db_path = db_uri[10:]  # Remove sqlite:///
            print(f"📁 Database Path: {db_path}")
        else:
            print("❌ Chỉ hỗ trợ SQLite database")
            return
            
    except Exception as e:
        print(f"❌ Lỗi khi load config: {e}")
        return
    
    # Kiểm tra database có tồn tại không
    if not os.path.exists(db_path):
        print(f"❌ Database file không tồn tại: {db_path}")
        return
    
    print(f"✅ Database file tồn tại: {db_path}")
    
    # Kết nối database
    try:
        import sqlite3
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Admin user info
        admin_email = "admin@pagemade.site"
        admin_name = "Admin"
        admin_password = "admin123"
        
        # Kiểm tra user đã tồn tại chưa
        cursor.execute("SELECT id, email FROM user WHERE email = ?", (admin_email,))
        existing_user = cursor.fetchone()
        
        if existing_user:
            print(f"✅ User '{admin_email}' đã tồn tại với ID: {existing_user[0]}")
            
            # Update password thành admin123
            password_hash = generate_password_hash(admin_password)
            cursor.execute("UPDATE user SET password_hash = ?, updated_at = datetime('now') WHERE email = ?", 
                       (password_hash, admin_email))
            conn.commit()
            print("✅ Đã cập nhật password thành 'admin123' cho admin user")
        else:
            # Tạo user mới
            print("📝 Tạo admin user mới...")
            
            # Generate password hash
            password_hash = generate_password_hash(admin_password)
            
            # Insert user
            cursor.execute("""
                INSERT INTO user (email, name, password_hash, role, created_at, updated_at) 
                VALUES (?, ?, ?, 'admin', datetime('now'), datetime('now'))
            """, (admin_email, admin_name, password_hash))
            
            conn.commit()
            print(f"✅ Đã tạo admin user thành công!")
        
        # Hiển thị thông tin admin
        print(f"\n👤 THÔNG TIN ADMIN:")
        print(f"   📧 Email: {admin_email}")
        print(f"   👤 Tên: {admin_name}")
        print(f"   🔑 Password: {admin_password}")
        print(f"   🌐 Login URL: http://localhost:5000/login")
        
        # Hiển thị tất cả users
        print(f"\n📋 Danh sách tất cả users:")
        cursor.execute("SELECT id, email, name, role FROM user")
        users = cursor.fetchall()
        for user in users:
            print(f"   ID: {user[0]} | Email: {user[1]} | Tên: {user[2]} | Role: {user[3]}")
        
        conn.close()
        print(f"\n🎉 BẠN GIỜ BẠN TEST LOGIN!")
        
    except Exception as e:
        print(f"❌ Lỗi khi thao tác với database: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    auto_create_admin()