import os
import sys

# Thêm đường dẫn thư mục gốc của project vào Python path
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_root)

from app import create_app, db
from app.models import Site, Page
from datetime import datetime

def upgrade():
    """Thêm cột is_published vào bảng site"""
    app = create_app()
    
    with app.app_context():
        try:
            # Thêm cột mới
            db.session.execute('ALTER TABLE site ADD COLUMN is_published BOOLEAN DEFAULT FALSE')
            db.session.commit()
            print(f"✅ [{datetime.now()}] Đã thêm cột is_published vào bảng site")
            
            # Cập nhật dữ liệu hiện có
            sites = Site.query.all()
            for site in sites:
                site.is_published = False
            db.session.commit()
            print(f"✅ [{datetime.now()}] Đã cập nhật {len(sites)} site hiện có")
            
            print("✅ Migration hoàn tất thành công!")
            
        except Exception as e:
            print(f"❌ [{datetime.now()}] Lỗi: {str(e)}")
            db.session.rollback()
            raise e

if __name__ == '__main__':
    upgrade()