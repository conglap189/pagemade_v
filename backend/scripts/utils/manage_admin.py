#!/usr/bin/env python3
"""
Script quản lý tài khoản Admin cho hệ thống PageMade
Chỉ chạy được từ server, không có giao diện web

Cách sử dụng:
    python manage_admin.py create <email> <name>     # Tạo admin mới
    python manage_admin.py list                       # Liệt kê tất cả admin
    python manage_admin.py promote <email>            # Nâng cấp user thành admin
    python manage_admin.py demote <email>             # Hạ cấp admin xuống user
    python manage_admin.py delete <email>             # Xóa tài khoản admin
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from app.models import User
from datetime import datetime
import secrets
import string

def generate_random_password(length=16):
    """Tạo mật khẩu ngẫu nhiên mạnh"""
    alphabet = string.ascii_letters + string.digits + string.punctuation
    password = ''.join(secrets.choice(alphabet) for i in range(length))
    return password

def create_admin(email, name):
    """Tạo tài khoản admin mới"""
    app = create_app()
    
    with app.app_context():
        # Kiểm tra email đã tồn tại chưa
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            print(f"❌ Lỗi: Email '{email}' đã tồn tại trong hệ thống!")
            if existing_user.role == 'admin':
                print(f"   Người dùng này đã là admin.")
            else:
                print(f"   Người dùng này có role: {existing_user.role}")
                print(f"   Sử dụng lệnh 'promote' để nâng cấp lên admin.")
            return False
        
        # Tạo mật khẩu ngẫu nhiên
        password = generate_random_password()
        
        # Tạo user mới
        new_admin = User(
            email=email,
            name=name,
            role='admin',
            created_at=datetime.utcnow(),
            last_login=None
        )
        new_admin.set_password(password)
        
        db.session.add(new_admin)
        db.session.commit()
        
        print("✅ Tạo tài khoản admin thành công!")
        print("-" * 60)
        print(f"📧 Email:    {email}")
        print(f"👤 Tên:      {name}")
        print(f"🔑 Mật khẩu: {password}")
        print(f"👑 Role:     admin")
        print("-" * 60)
        print("⚠️  LƯU Ý: Hãy lưu mật khẩu này ngay! Không thể xem lại.")
        print("   Bạn có thể đổi mật khẩu sau khi đăng nhập.")
        return True

def list_admins():
    """Liệt kê tất cả admin trong hệ thống"""
    app = create_app()
    
    with app.app_context():
        admins = User.query.filter_by(role='admin').all()
        
        if not admins:
            print("ℹ️  Không có admin nào trong hệ thống.")
            return
        
        print(f"\n📋 Danh sách Admin ({len(admins)} người):")
        print("=" * 80)
        print(f"{'ID':<5} {'Email':<30} {'Tên':<25} {'Tạo lúc':<20}")
        print("-" * 80)
        
        for admin in admins:
            created = admin.created_at.strftime('%Y-%m-%d %H:%M:%S') if admin.created_at else 'N/A'
            print(f"{admin.id:<5} {admin.email:<30} {admin.name:<25} {created:<20}")
        
        print("=" * 80)

def promote_to_admin(email):
    """Nâng cấp user thường thành admin"""
    app = create_app()
    
    with app.app_context():
        user = User.query.filter_by(email=email).first()
        
        if not user:
            print(f"❌ Lỗi: Không tìm thấy user với email '{email}'")
            return False
        
        if user.role == 'admin':
            print(f"ℹ️  User '{email}' đã là admin rồi.")
            return True
        
        user.role = 'admin'
        db.session.commit()
        
        print(f"✅ Đã nâng cấp '{email}' ({user.name}) lên admin!")
        return True

def demote_from_admin(email):
    """Hạ cấp admin xuống user thường"""
    app = create_app()
    
    with app.app_context():
        user = User.query.filter_by(email=email).first()
        
        if not user:
            print(f"❌ Lỗi: Không tìm thấy user với email '{email}'")
            return False
        
        if user.role != 'admin':
            print(f"ℹ️  User '{email}' không phải là admin.")
            return True
        
        # Đếm số admin còn lại
        admin_count = User.query.filter_by(role='admin').count()
        if admin_count <= 1:
            print(f"❌ Lỗi: Không thể hạ cấp admin cuối cùng!")
            print(f"   Hệ thống phải có ít nhất 1 admin.")
            return False
        
        user.role = 'user'
        db.session.commit()
        
        print(f"✅ Đã hạ cấp '{email}' ({user.name}) xuống user thường!")
        return True

def delete_admin(email):
    """Xóa tài khoản admin"""
    app = create_app()
    
    with app.app_context():
        user = User.query.filter_by(email=email).first()
        
        if not user:
            print(f"❌ Lỗi: Không tìm thấy user với email '{email}'")
            return False
        
        if user.role == 'admin':
            # Đếm số admin còn lại
            admin_count = User.query.filter_by(role='admin').count()
            if admin_count <= 1:
                print(f"❌ Lỗi: Không thể xóa admin cuối cùng!")
                print(f"   Hệ thống phải có ít nhất 1 admin.")
                return False
        
        # Xác nhận xóa
        print(f"⚠️  CẢNH BÁO: Bạn sắp xóa tài khoản:")
        print(f"   Email: {user.email}")
        print(f"   Tên:   {user.name}")
        print(f"   Role:  {user.role}")
        
        confirm = input("\nGõ 'YES' để xác nhận xóa: ")
        if confirm != 'YES':
            print("❌ Đã hủy.")
            return False
        
        db.session.delete(user)
        db.session.commit()
        
        print(f"✅ Đã xóa tài khoản '{email}'!")
        return True

def show_help():
    """Hiển thị hướng dẫn sử dụng"""
    help_text = """
╔══════════════════════════════════════════════════════════════════════════╗
║                  QUẢN LÝ TÀI KHOẢN ADMIN - PAGEMADE                      ║
╚══════════════════════════════════════════════════════════════════════════╝

📖 CÁC LỆNH:

  1️⃣  Tạo admin mới:
      python manage_admin.py create <email> <name>
      
      Ví dụ:
      python manage_admin.py create admin@pagemade.site "Admin System"

  2️⃣  Liệt kê tất cả admin:
      python manage_admin.py list

  3️⃣  Nâng cấp user thành admin:
      python manage_admin.py promote <email>
      
      Ví dụ:
      python manage_admin.py promote user@example.com

  4️⃣  Hạ cấp admin xuống user:
      python manage_admin.py demote <email>
      
      Ví dụ:
      python manage_admin.py demote admin@pagemade.site

  5️⃣  Xóa tài khoản:
      python manage_admin.py delete <email>
      
      Ví dụ:
      python manage_admin.py delete old_admin@pagemade.site

⚠️  LƯU Ý:
  • Script này chỉ chạy được trên server (không có giao diện web)
  • Cần có quyền truy cập vào database
  • Mật khẩu tự động sinh ngẫu nhiên khi tạo admin mới
  • Không thể xóa/hạ cấp admin cuối cùng
  • Mật khẩu chỉ hiển thị 1 lần, không thể xem lại

🔗 TRUY CẬP:
  • URL: http://pagemade.site
  • Đăng nhập bằng email và mật khẩu đã tạo
    """
    print(help_text)

def main():
    if len(sys.argv) < 2:
        show_help()
        sys.exit(1)
    
    command = sys.argv[1].lower()
    
    if command == 'help' or command == '--help' or command == '-h':
        show_help()
    
    elif command == 'create':
        if len(sys.argv) < 4:
            print("❌ Lỗi: Thiếu tham số!")
            print("   Cách dùng: python manage_admin.py create <email> <name>")
            sys.exit(1)
        
        email = sys.argv[2]
        name = ' '.join(sys.argv[3:])  # Cho phép tên có khoảng trắng
        create_admin(email, name)
    
    elif command == 'list':
        list_admins()
    
    elif command == 'promote':
        if len(sys.argv) < 3:
            print("❌ Lỗi: Thiếu email!")
            print("   Cách dùng: python manage_admin.py promote <email>")
            sys.exit(1)
        
        email = sys.argv[2]
        promote_to_admin(email)
    
    elif command == 'demote':
        if len(sys.argv) < 3:
            print("❌ Lỗi: Thiếu email!")
            print("   Cách dùng: python manage_admin.py demote <email>")
            sys.exit(1)
        
        email = sys.argv[2]
        demote_from_admin(email)
    
    elif command == 'delete':
        if len(sys.argv) < 3:
            print("❌ Lỗi: Thiếu email!")
            print("   Cách dùng: python manage_admin.py delete <email>")
            sys.exit(1)
        
        email = sys.argv[2]
        delete_admin(email)
    
    else:
        print(f"❌ Lỗi: Lệnh '{command}' không hợp lệ!")
        print("   Chạy 'python manage_admin.py help' để xem hướng dẫn.")
        sys.exit(1)

if __name__ == '__main__':
    main()
