# PageMade Backend Architecture

## Overview
PageMade sử dụng kiến trúc **7-Layer Flask Application** để đảm bảo tính mở rộng, bảo trì và tách biệt trách nhiệm (Separation of Concerns).

```
┌─────────────────────────────────────────────────────────────┐
│                        HTTP REQUEST                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Layer 7: MIDDLEWARE (auth, cors, logging)                  │
│  - Xử lý request trước khi vào routes                       │
│  - Thêm headers, check authentication                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Layer 1: ROUTES (HTTP Endpoints)                           │
│  - Nhận HTTP requests                                        │
│  - Validate input với Schemas                               │
│  - Gọi Services                                              │
│  - Trả về HTTP responses                                     │
│  Files: auth.py, sites.py, admin.py, api.py, main.py       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Layer 5: SCHEMAS (Validation)                              │
│  - Validate dữ liệu đầu vào                                 │
│  - Serialize/Deserialize                                     │
│  Files: user_schema.py, site_schema.py, asset_schema.py    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Layer 2: SERVICES (Business Logic)                         │
│  - Xử lý business logic                                      │
│  - Orchestrate workflow                                      │
│  - Gọi Repositories để thao tác DB                          │
│  - Gọi Utils cho helper functions                           │
│  Files: auth_service.py, site_service.py, asset_service.py │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Layer 3: REPOSITORIES (Data Access)                        │
│  - CRUD operations với database                             │
│  - SQLAlchemy queries                                        │
│  - Trả về Model instances                                    │
│  Files: user_repository.py, site_repository.py             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Layer 4: MODELS (Database Schema)                          │
│  - Định nghĩa SQLAlchemy models                            │
│  - Database schema                                           │
│  - Relationships                                             │
│  Files: user.py, site.py, asset.py, subscription.py        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Layer 6: UTILS (Helper Functions)                          │
│  - Pure functions                                            │
│  - Validation, formatting, constants                         │
│  - Không có DB access, không có business logic              │
│  Files: validators.py, helpers.py, formatters.py           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE (SQLite/PostgreSQL)              │
└─────────────────────────────────────────────────────────────┘
```

---

## JWT Authentication System

### Overview
PageMade sử dụng **JWT-based authentication** cho kiến trúc decoupled, thay thế session-based authentication của kiến trúc monolithic.

### Architecture Components

#### 1. JWT Token Management
- **Access Token**: 15 minutes expiry, dùng cho API calls
- **Refresh Token**: 7 days expiry, dùng để renew access token
- **Auto-refresh**: Frontend tự động refresh token trước khi hết hạn

#### 2. Authentication Flow
```
1. User login → JWT tokens generated
2. Frontend stores tokens in localStorage
3. API calls include Bearer token in Authorization header
4. Backend validates JWT token via @jwt_required decorator
5. Auto-refresh when token expires
```

#### 3. JWT Decorators
```python
# For API endpoints requiring authentication
@jwt_required
def get_user_sites():
    user_id = get_jwt_identity()
    # Business logic here

# For API endpoints with user_id parameter
@jwt_api_auth  
def get_site(site_id):
    user_id = get_jwt_identity()
    # Verify user owns the site
```

#### 4. Frontend API Client
```javascript
// Auto-includes JWT token in all requests
window.apiClient = new ApiClient('http://localhost:5000/api');

// Methods available:
await apiClient.login(email, password);
await apiClient.getSites();
await apiClient.createSite(siteData);
await apiClient.uploadAsset(file);
await apiClient.publishPage(siteId, pageId);
```

### Migration from Session to JWT

| Authentication | Session-Based (Old) | JWT-Based (New) |
|----------------|---------------------|-----------------|
| **Storage** | Server-side sessions | Client-side tokens |
| **State** | Stateful | Stateless |
| **Scalability** | Limited | Horizontal scaling |
| **CORS** | Complex issues | Simple HTTP headers |
| **Mobile** | Cookie limitations | Token-based easy |

---

## Layer Responsibilities

### Layer 1: Routes (HTTP Layer)
**Folder**: `app/routes/`

**Trách nhiệm**:
- Nhận HTTP requests (GET, POST, PUT, DELETE)
- Parse request data (JSON, form, query params)
- Validate input sử dụng Schemas
- Gọi Services để xử lý business logic
- Format và trả về HTTP responses
- Handle errors và return status codes
- **JWT Authentication**: Sử dụng decorators `@jwt_required` và `@jwt_api_auth`

**KHÔNG ĐƯỢC**:
- ❌ Viết SQL queries trực tiếp
- ❌ Implement business logic
- ❌ Direct database access
- ❌ Complex data transformations
- ❌ Session-based authentication (sử dụng JWT thay thế)

**Pattern**:
```python
# app/routes/auth.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.auth_service import AuthService
from app.schemas.user_schema import RegisterSchema, LoginSchema
from app.utils.helpers import Helpers

bp = Blueprint('auth', __name__, url_prefix='/auth')

@bp.route('/register', methods=['POST'])
def register():
    """User registration endpoint"""
    try:
        # 1. Validate input
        schema = RegisterSchema()
        data = schema.load(request.get_json())
        
        # 2. Call service
        success, user, error = AuthService.register_user(
            name=data['name'],
            email=data['email'],
            password=data['password']
        )
        
        # 3. Return response
        if success:
            return Helpers.success_response(
                data={'user_id': user.id},
                message='Đăng ký thành công',
                status=201
            )
        
        return Helpers.error_response(error, status=400)
        
    except Exception as e:
        return Helpers.error_response(str(e), status=500)

@bp.route('/profile', methods=['GET'])
@jwt_required
def get_profile():
    """Get current user profile - JWT version"""
    user_id = get_jwt_identity()
    user = UserService.get_by_id(user_id)
    
    return Helpers.success_response(
        data={
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'avatar_url': user.avatar_url
        }
    )
```

---

### Layer 2: Services (Business Logic Layer)
**Folder**: `app/services/`

**Trách nhiệm**:
- Implement toàn bộ business logic
- Orchestrate workflows (call nhiều repositories)
- Validate business rules
- Handle transactions
- Transform data giữa layers
- Return standardized tuples: `(success: bool, data: Any, error: str|None)`

**KHÔNG ĐƯỢC**:
- ❌ Handle HTTP requests/responses
- ❌ Write SQL queries trực tiếp (dùng repositories)
- ❌ Import Flask request/response objects
- ❌ Hardcode configuration

**Pattern**:
```python
# app/services/auth_service.py
from app.repositories.user_repository import UserRepository
from app.utils.validators import validate_email, validate_password_strength
from app.utils.helpers import hash_password
from app import db

class AuthService:
    """Authentication business logic"""
    
    @staticmethod
    def register_user(name, email, password):
        """
        Register a new user
        
        Args:
            name: User's display name
            email: User's email (must be unique)
            password: Plain text password
            
        Returns:
            tuple: (success: bool, user: User|None, error: str|None)
        """
        # Business validation
        if not validate_email(email):
            return False, None, "Email không hợp lệ"
        
        if not validate_password_strength(password):
            return False, None, "Mật khẩu phải có ít nhất 6 ký tự"
        
        # Check existing user
        if UserRepository.find_by_email(email):
            return False, None, "Email đã được sử dụng"
        
        try:
            # Create user via repository
            user_data = {
                'name': name,
                'email': email,
                'password_hash': hash_password(password),
                'role': 'user'
            }
            user = UserRepository.create(user_data)
            
            # Update last login
            user.update_last_login()
            db.session.commit()
            
            return True, user, None
            
        except Exception as e:
            db.session.rollback()
            return False, None, f"Lỗi tạo tài khoản: {str(e)}"
    
    @staticmethod
    def authenticate(email, password):
        """
        Authenticate user with email and password
        
        Args:
            email: User's email
            password: Plain text password
            
        Returns:
            tuple: (success: bool, user: User|None, error: str|None)
        """
        user = UserRepository.find_by_email(email)
        
        if not user:
            return False, None, "Tài khoản không tồn tại"
        
        if not user.check_password(password):
            return False, None, "Mật khẩu không đúng"
        
        # Update last login
        user.update_last_login()
        db.session.commit()
        
        return True, user, None
    
    @staticmethod
    def change_password(user_id, old_password, new_password):
        """Change user password"""
        user = UserRepository.find_by_id(user_id)
        
        if not user:
            return False, None, "User không tồn tại"
        
        if not user.check_password(old_password):
            return False, None, "Mật khẩu cũ không đúng"
        
        if not validate_password_strength(new_password):
            return False, None, "Mật khẩu mới không đủ mạnh"
        
        try:
            user.set_password(new_password)
            db.session.commit()
            return True, user, None
        except Exception as e:
            db.session.rollback()
            return False, None, str(e)
```

---

### Layer 3: Repositories (Data Access Layer)
**Folder**: `app/repositories/`

**Trách nhiệm**:
- CRUD operations (Create, Read, Update, Delete)
- SQLAlchemy queries
- Database transactions
- Return model instances hoặc None
- Encapsulate tất cả database access

**KHÔNG ĐƯỢC**:
- ❌ Business logic
- ❌ Data validation (dùng schemas)
- ❌ HTTP handling
- ❌ Complex computations

**Pattern**:
```python
# app/repositories/user_repository.py
from app.models.user import User
from app import db
from typing import Optional, List

class UserRepository:
    """User data access layer"""
    
    @staticmethod
    def find_by_id(user_id: int) -> Optional[User]:
        """Find user by ID"""
        return User.query.get(user_id)
    
    @staticmethod
    def find_by_email(email: str) -> Optional[User]:
        """Find user by email"""
        return User.query.filter_by(email=email).first()
    
    @staticmethod
    def find_by_google_id(google_id: str) -> Optional[User]:
        """Find user by Google OAuth ID"""
        return User.query.filter_by(google_id=google_id).first()
    
    @staticmethod
    def find_all(limit: int = 100, offset: int = 0) -> List[User]:
        """Get all users with pagination"""
        return User.query.limit(limit).offset(offset).all()
    
    @staticmethod
    def find_by_role(role: str) -> List[User]:
        """Find users by role"""
        return User.query.filter_by(role=role).all()
    
    @staticmethod
    def create(data: dict) -> User:
        """Create new user"""
        user = User(**data)
        db.session.add(user)
        db.session.commit()
        return user
    
    @staticmethod
    def update(user: User, data: dict) -> User:
        """Update existing user"""
        for key, value in data.items():
            if hasattr(user, key):
                setattr(user, key, value)
        db.session.commit()
        return user
    
    @staticmethod
    def delete(user: User) -> None:
        """Delete user"""
        db.session.delete(user)
        db.session.commit()
    
    @staticmethod
    def count() -> int:
        """Count total users"""
        return User.query.count()
    
    @staticmethod
    def search(keyword: str, limit: int = 20) -> List[User]:
        """Search users by name or email"""
        pattern = f"%{keyword}%"
        return User.query.filter(
            db.or_(
                User.name.ilike(pattern),
                User.email.ilike(pattern)
            )
        ).limit(limit).all()
```

---

### Layer 4: Models (Database Schema Layer)
**Folder**: `app/models/`

**Trách nhiệm**:
- Định nghĩa SQLAlchemy models
- Database columns và relationships
- Helper methods (set_password, check_password, to_dict)
- Model-specific computations

**KHÔNG ĐƯỢC**:
- ❌ Business logic
- ❌ Database queries (belongs to repositories)
- ❌ HTTP handling
- ❌ External API calls

**Pattern**:
```python
# app/models/user.py
from app import db
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
from datetime import datetime

class User(UserMixin, db.Model):
    """User model"""
    __tablename__ = 'users'
    
    # Primary key
    id = db.Column(db.Integer, primary_key=True)
    
    # Authentication fields
    email = db.Column(db.String(100), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255))
    google_id = db.Column(db.String(100), unique=True, index=True)
    
    # Profile fields
    name = db.Column(db.String(100), nullable=False)
    avatar_url = db.Column(db.String(500))
    
    # Authorization
    role = db.Column(db.String(20), default='user')  # 'user' or 'admin'
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    
    # Relationships
    sites = db.relationship('Site', backref='owner', lazy=True, cascade='all, delete-orphan')
    assets = db.relationship('Asset', backref='uploader', lazy=True, cascade='all, delete-orphan')
    subscriptions = db.relationship('Subscription', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def set_password(self, password):
        """Hash and set password"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Verify password"""
        if not self.password_hash:
            return False
        return check_password_hash(self.password_hash, password)
    
    def update_last_login(self):
        """Update last login timestamp"""
        self.last_login = datetime.utcnow()
    
    def to_dict(self, include_sensitive=False):
        """Convert to dictionary"""
        data = {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'avatar_url': self.avatar_url,
            'role': self.role,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }
        
        if include_sensitive:
            data['google_id'] = self.google_id
        
        return data
    
    def __repr__(self):
        return f'<User {self.email}>'
```

---

### Layer 5: Schemas (Validation Layer)
**Folder**: `app/schemas/`

**Trách nhiệm**:
- Input validation
- Data serialization/deserialization
- Type checking
- Required fields enforcement

**KHÔNG ĐƯỢC**:
- ❌ Business logic
- ❌ Database access
- ❌ Complex transformations

**Pattern**:
```python
# app/schemas/user_schema.py
from marshmallow import Schema, fields, validate, validates, ValidationError

class RegisterSchema(Schema):
    """Registration request validation"""
    name = fields.Str(
        required=True,
        validate=validate.Length(min=2, max=100),
        error_messages={'required': 'Tên là bắt buộc'}
    )
    email = fields.Email(
        required=True,
        error_messages={'required': 'Email là bắt buộc'}
    )
    password = fields.Str(
        required=True,
        validate=validate.Length(min=6),
        error_messages={'required': 'Mật khẩu là bắt buộc'}
    )

class LoginSchema(Schema):
    """Login request validation"""
    email = fields.Email(required=True)
    password = fields.Str(required=True)

class UpdateProfileSchema(Schema):
    """Profile update validation"""
    name = fields.Str(validate=validate.Length(min=2, max=100))
    avatar_url = fields.Url()

class UserResponseSchema(Schema):
    """User response serialization"""
    id = fields.Int()
    name = fields.Str()
    email = fields.Email()
    avatar_url = fields.Str()
    role = fields.Str()
    created_at = fields.DateTime()
    last_login = fields.DateTime()
```

---

### Layer 6: Utils (Helper Layer)
**Folder**: `app/utils/`

**Trách nhiệm**:
- Pure helper functions
- Constants và configuration
- Formatters và validators
- Reusable utilities

**KHÔNG ĐƯỢC**:
- ❌ Database access
- ❌ Business logic
- ❌ HTTP handling
- ❌ Stateful operations

**Pattern**:
```python
# app/utils/validators.py
import re

def validate_email(email):
    """Validate email format"""
    pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
    return re.match(pattern, email) is not None

def validate_password_strength(password):
    """Check password strength"""
    if len(password) < 6:
        return False
    return True

def validate_subdomain(subdomain):
    """Validate subdomain format"""
    pattern = r'^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$'
    return re.match(pattern, subdomain) is not None

# app/utils/helpers.py
from flask import jsonify

class Helpers:
    """General helper functions"""
    
    @staticmethod
    def success_response(data=None, message='Success', status=200):
        """Standardized success response"""
        return jsonify({
            'success': True,
            'message': message,
            'data': data
        }), status
    
    @staticmethod
    def error_response(error, status=400):
        """Standardized error response"""
        return jsonify({
            'success': False,
            'error': error
        }), status

# app/utils/formatters.py
def format_file_size(bytes):
    """Format bytes to human readable"""
    for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
        if bytes < 1024:
            return f"{bytes:.2f} {unit}"
        bytes /= 1024

def format_datetime(dt):
    """Format datetime to ISO string"""
    return dt.isoformat() if dt else None

# app/utils/constants.py
ALLOWED_IMAGE_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
ITEMS_PER_PAGE = 20
```

---

### Layer 7: Middleware
**Folder**: `app/middleware/`

**Trách nhiệm**:
- Request/response interceptors
- Authentication checks
- CORS handling
- Logging
- Rate limiting

**Pattern**:
```python
# app/middleware/auth_middleware.py
from functools import wraps
from flask import request, jsonify
from flask_login import current_user

def admin_required(f):
    """Require admin role"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated:
            return jsonify({'error': 'Unauthorized'}), 401
        if current_user.role != 'admin':
            return jsonify({'error': 'Admin required'}), 403
        return f(*args, **kwargs)
    return decorated_function

# app/middleware/logging_middleware.py
from flask import request
import logging

def log_request():
    """Log incoming request"""
    logging.info(f"{request.method} {request.path} - IP: {request.remote_addr}")
```

---

## Data Flow Examples

### Example 1: User Registration (JWT)
```
1. POST /auth/register
   ↓
2. auth.py (Route)
   - Validate input with RegisterSchema
   ↓
3. auth_service.py (Service)
   - Check business rules (email unique, password strength)
   - Call UserRepository.create()
   ↓
4. user_repository.py (Repository)
   - Create User model instance
   - db.session.add() + commit()
   ↓
5. user.py (Model)
   - SQLAlchemy creates DB record
   ↓
6. Return user instance back through layers
   ↓
7. auth.py formats response and returns JSON
```

### Example 2: JWT Login Flow
```
1. POST /auth/login
   ↓
2. auth.py (Route)
   - Validate credentials with LoginSchema
   ↓
3. auth_service.py (Service)
   - Authenticate user via UserRepository
   - Generate JWT tokens (access + refresh)
   ↓
4. Return tokens to frontend
   ↓
5. Frontend stores tokens in localStorage
   ↓
6. Subsequent API calls include Bearer token
```

### Example 3: Site Publishing (JWT)
```
1. POST /api/sites/<id>/publish
   - Header: Authorization: Bearer <access_token>
   ↓
2. sites_api.py (Route)
   - @jwt_required validates token
   - Get user_id from JWT: get_jwt_identity()
   - Get site_id from URL
   ↓
3. site_service.py (Service)
   - Validate ownership via SiteRepository
   - Generate HTML via template engine
   - Upload files to storage
   - Update site status via SiteRepository
   ↓
4. site_repository.py (Repository)
   - Update Site model: published=True, published_url=...
   - db.session.commit()
   ↓
5. Return success through layers
```

### Example 4: Frontend API Client Flow
```
1. Frontend: apiClient.getSites()
   ↓
2. API Client: GET /api/sites
   - Auto-adds Authorization: Bearer <token>
   ↓
3. Backend: @jwt_required validates token
   - Extracts user_id from JWT
   ↓
4. Service layer processes request
   ↓
5. Response returns to frontend
   ↓
6. Auto-refresh token if needed
```

---

## File Naming Conventions

### Routes
- `auth.py` - Authentication routes (JWT-based)
- `sites.py` - Site management (session-based for admin)
- `admin.py` - Admin panel (session-based)
- `*_api.py` - API endpoints (JWT-based): `sites_api.py`, `pages_api.py`, `assets_api.py`
- `main.py` - General pages

### Services
- `auth_service.py` - AuthService class (JWT + session)
- `site_service.py` - SiteService class
- `asset_service.py` - AssetService class
- `subscription_service.py` - SubscriptionService class

### Repositories
- `user_repository.py` - UserRepository class
- `site_repository.py` - SiteRepository class
- `asset_repository.py` - AssetRepository class

### Models
- `user.py` - User model
- `site.py` - Site model
- `asset.py` - Asset model
- `subscription.py` - Subscription model

### Schemas
- `user_schema.py` - User-related schemas
- `site_schema.py` - Site-related schemas
- `asset_schema.py` - Asset-related schemas

### JWT Authentication Files
- `app/utils/jwt_utils.py` - JWT token utilities
- `frontend/src/editor/scripts/api-client.js` - Frontend JWT client
- `config.py` - JWT configuration settings

---

## Migration Strategy

### When Refactoring Old Code

**Step 1**: Read archive file
```bash
cat archive/routes.py.20251117_172512
```

**Step 2**: Identify responsibility
- HTTP handling → routes/
- Business logic → services/
- Database queries → repositories/
- Data validation → schemas/
- Helper functions → utils/

**Step 3**: Copy exact logic (DO NOT REWRITE)
```python
# ❌ WRONG - Rewriting logic
def register_user(username, email, password, full_name):
    user = User(username=username, full_name=full_name, ...)

# ✅ CORRECT - Copying exact logic
def register_user(name, email, password):
    user = User(name=name, email=email, ...)
```

**Step 4**: Place in correct layer
- Extract HTTP handling → `app/routes/auth.py`
- Extract business logic → `app/services/auth_service.py`
- Extract DB queries → `app/repositories/user_repository.py`

**Step 5**: Test immediately
```bash
python run.py
# Check for errors in terminal
```

---

## Common Mistakes to Avoid

### ❌ Mistake 1: Creating unnecessary files
```
app/routes/user_routes.py      # Already have auth.py
app/routes/login_routes.py     # Already have auth.py
app/services/email_service.py  # Add to existing service
```

### ❌ Mistake 2: Wrong layer placement
```python
# routes/auth.py
user = User.query.filter_by(email=email).first()  # DB query in route!
```

### ❌ Mistake 3: Changing model fields
```python
# Original
user = User(name=name, email=email)

# Refactored (WRONG!)
user = User(username=username, full_name=full_name)  # Changed field names!
```

### ❌ Mistake 4: Business logic in repositories
```python
# user_repository.py
def create_user(email, password):
    if not validate_email(email):  # Business validation in repo!
        return None
```

### ✅ Correct Approach
```python
# auth_service.py (Business validation)
if not validate_email(email):
    return False, None, "Invalid email"

# user_repository.py (Just DB operations)
def create(data):
    user = User(**data)
    db.session.add(user)
    db.session.commit()
    return user
```

---

## Testing Architecture Compliance

### Checklist
- [ ] Routes only handle HTTP, no DB queries
- [ ] Services contain business logic, return tuples
- [ ] Repositories only have DB queries
- [ ] Models only have schema definitions
- [ ] Utils are pure functions
- [ ] No duplicate files
- [ ] File names follow convention
- [ ] All model fields match original

### Verification Commands
```bash
# Check for DB queries in routes
grep -r "query.filter" app/routes/

# Check for business logic in repositories
grep -r "if.*validate" app/repositories/

# Check for HTTP handling in services
grep -r "request.get" app/services/

# Verify model field usage
grep -r "username\|full_name" app/
```

---

## 3-Service Architecture

### Service Overview
PageMade sử dụng kiến trúc **3-service decoupled**:

| Service | Port | Technology | Authentication | Purpose |
|---------|------|------------|----------------|---------|
| **Backend API** | 5000 | Flask + SQLAlchemy | JWT-based | API Server (JSON only) |
| **Frontend Editor** | 5001 | HTML/JS/CSS (PageMade) | JWT tokens | Client độc lập, kéo-thả |
| **Main Website** | 3000 | Next.js | JWT tokens | User-facing website |

### Communication Flow
```
Frontend Editor (5001) ←→ Backend API (5000)
        ↓                           ↓
    JWT tokens               JWT validation
        ↓                           ↓
Website (3000) ←─────────────────────┘
```

### Authentication Architecture
- **Backend**: JWT token validation via `@jwt_required`
- **Frontend**: Auto token management via `api-client.js`
- **Website**: JWT token consumption for public content

---

## Summary

### Layer Quick Reference
1. **Routes** - HTTP in/out (JWT decorators)
2. **Services** - Business logic
3. **Repositories** - DB operations
4. **Models** - Schema definitions
5. **Schemas** - Validation
6. **Utils** - Pure helpers + JWT utilities
7. **Middleware** - Request interceptors

### Key Principles
- ✅ Separation of Concerns
- ✅ Single Responsibility
- ✅ Don't Repeat Yourself (DRY)
- ✅ Use existing files first
- ✅ Follow naming conventions
- ✅ Keep model fields immutable
- ✅ Copy logic when refactoring (don't rewrite)
- ✅ **JWT-based authentication for decoupled services**
- ✅ **3-service architecture (Backend:5000, Editor:5001, Website:3000)**

### Contact
For questions about architecture:
- Check `/backend/AGENTS.md` for guidelines
- Check `/docs/ARCHITECTURE.md` (this file)
- Verify against archive files in `/backend/archive/`
