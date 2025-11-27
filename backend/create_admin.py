#!/usr/bin/env python3
"""
Script tạo tài khoản admin cho production database
Sử dụng đúng config như server đang chạy
"""
import os
import sys
from datetime import datetime
sys.path.insert(0, '/home/helios/ver1.1/backend')

from werkzeug.security import generate_password_hash

def create_production_admin():
    """Tạo admin user cho production database"""
    
    print("🚀 Tạo Admin Account cho Production Database")
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
        
        # Kiểm tra user đã tồn tại chưa
        cursor.execute("SELECT id, email FROM user WHERE email = ?", ('admin@pagemade.site',))
        existing_user = cursor.fetchone()
        
        if existing_user:
            print(f"✅ User 'admin@pagemade.site' đã tồn tại với ID: {existing_user[0]}")
            
            # Update password nếu cần
            new_password = input("🔑 Nhập password mới (hoặc Enter để giữ cũ): ").strip()
            if new_password:
                password_hash = generate_password_hash(new_password)
                cursor.execute("UPDATE user SET password_hash = ?, updated_at = ? WHERE email = ?", 
                           (password_hash, datetime('now'), 'admin@pagemade.site'))
                conn.commit()
                print("✅ Đã cập nhật password cho admin user")
            else:
                print("✅ Giữ nguyên password cũ")
        else:
            # Tạo user mới
            print("📝 Tạo admin user mới...")
            
            # Get user input
            email = input("📧 Email admin [default: admin@pagemade.site]: ").strip() or "admin@pagemade.site"
            name = input("👤 Tên admin [default: Admin]: ").strip() or "Admin"
            password = input("🔑 Password admin [default: admin123]: ").strip() or "admin123"
            
            # Generate password hash
            password_hash = generate_password_hash(password)
            
            # Insert user
            cursor.execute("""
                INSERT INTO user (email, name, password_hash, role, created_at, updated_at) 
                VALUES (?, ?, ?, 'admin', ?, ?)
            """, (email, name, password_hash, datetime('now'), datetime('now')))
            
            conn.commit()
            print(f"✅ Đã tạo admin user thành công!")
            print(f"   📧 Email: {email}")
            print(f"   👤 Tên: {name}")
            print(f"   🔑 Password: {password}")
        
        # Hiển thị tất cả users
        print("\n📋 Danh sách tất cả users:")
        cursor.execute("SELECT id, email, name, role FROM user")
        users = cursor.fetchall()
        for user in users:
            print(f"   ID: {user[0]} | Email: {user[1]} | Tên: {user[2]} | Role: {user[3]}")
        
        conn.close()
        
    except Exception as e:
        print(f"❌ Lỗi khi thao tác với database: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    create_production_admin()