# Development Guidelines for PageMade Flask Application

## ⚠️ READ FIRST: PROJECT-LEVEL RULES

**BEFORE doing ANYTHING in this project, you MUST read:**

📋 **`../AGENTS.md`** - Project-wide file management rules

### 🔥 PROJECT RULES SUMMARY (CRITICAL COMPLIANCE):
1. **NO NEW FILES**: Forbidden to create `SUMMARY.md`, `COMPLETE.md`, or random scripts.
2. **TEMP FILES**: Must use prefix `TEMP_` and place in `../temp/`.
3. **ALLOWED EXCEPTIONS (For Testing Only)**:
   - ✅ `basic_test.py` (Allowed at **Backend Root**) -> Use for internal logic/DB testing.
   - ✅ `live_test.py` (Allowed at **Project Root**) -> Use for external API testing.
   - ⚠️ These files must be in `.gitignore`.
4. **IMMUTABLE REFERENCE**: `editor_pagemaker_v2.html` is READ-ONLY. Never edit/delete/rename.
**If you violate these rules, your work will be deleted.**

---
### 🧹 CLEANUP PROTOCOL (AUTO-DELETE)
1. **ONE-TIME USE**: Any test script created for debugging (except `basic_test.py`/`live_test.py`) is considered disposable.
2. **MANDATORY CLEANUP**: You MUST delete these scripts immediately after verification.
3. **COMMAND**: Execute `rm path/to/script.py` (or `del` on Windows) as the final step of your turn.
4. **NO CLUTTER**: Do not leave `test_*.py` or `TEMP_*.py` files in the root or directories.
---

## 🚨 CRITICAL RULES FOR AI AGENTS

### 🔥 GOLDEN RULE: OLDER FOLDER IS SOURCE OF TRUTH
**OLDER FOLDER CONTAINS 100% COMPLETE LOGIC - ABSOLUTE REFERENCE**

**OLDER FOLDER LOCATION**: `/older folder/`
- `routes.py` - Original monolithic routes (100% complete logic)
- `models.py` - Original models (100% complete schema)

**🚨 CRITICAL: OLDER FOLDER IS READ-ONLY**
- **ONLY READ** logic from older folder - **NEVER MODIFY**
- **DO NOT CHANGE** any files in `/older folder/`
- **DO NOT EDIT** `routes.py` or `models.py` in older folder
- **OLDER FOLDER IS REFERENCE ONLY** - Use it to understand original logic

**MANDATORY WORKFLOW FOR ALL CHANGES**:
1. **ALWAYS CHECK OLDER FOLDER FIRST** before implementing anything
2. **COMPARE LOGIC 100%** - Backend must match older folder exactly
3. **NEVER INVENT NEW LOGIC** - Only copy from older folder
4. **IF DIFFERENT FOUND** - Must fix backend to match older folder
5. **NO EXCEPTIONS** - Older folder logic is absolute truth
6. **OLDER FOLDER IS READ-ONLY** - Never modify files in `/older folder/`

**VERIFICATION CHECKLIST**:
- [ ] Have I read `/older folder/routes.py` for this feature?
- [ ] Does my implementation match the older logic 100%?
- [ ] Are all field names identical to older folder?
- [ ] Are all validation steps identical?
- [ ] Are all error messages identical?
- [ ] Are all return values identical?

**IF CONFLICT FOUND**:
- ❌ WRONG: "My logic is better" 
- ❌ WRONG: "This is an improvement"
- ❌ WRONG: "Edit older folder to fix"
- ❌ WRONG: "Delete the incorrect file"
- ✅ CORRECT: "Fix backend to match older folder exactly"
- ✅ **CORRECT: "Overwrite existing file with correct content (NEVER DELETE)"**

### Architecture Compliance
**MUST FOLLOW 7-LAYER ARCHITECTURE - NO EXCEPTIONS**

```
app/
├── routes/          # Layer 1: HTTP endpoints ONLY
├── services/        # Layer 2: Business logic ONLY  
├── repositories/    # Layer 3: Database queries ONLY
├── models/          # Layer 4: SQLAlchemy models
├── schemas/         # Layer 5: Data validation
├── utils/           # Layer 6: Helper functions
└── middleware/      # Layer 7: Request/response processing
```

### Golden Rules
1. **OLDER FOLDER IS ABSOLUTE TRUTH** - Never deviate from its logic
2. **OLDER FOLDER IS READ-ONLY** - Never modify files in `/older folder/`
3. **DO NOT CREATE NEW FILES** if equivalent functionality exists
4. **DO NOT CREATE NEW FOLDERS** outside 7-layer structure
5. **DO NOT CHANGE MODEL FIELDS** - only split/reorganize code
6. **DO NOT INVENT NEW LOGIC** - copy from older folder, not archive
7. **ALWAYS CHECK** older folder first before implementing anything
8. **100% LOGIC PRESERVATION** - Backend must behave identically to older folder

### File Organization Rules
- ✅ **Routes**: Only handle HTTP requests/responses, call services
- ✅ **Services**: Only business logic, call repositories
- ✅ **Repositories**: Only database operations (query, save, delete)
- ✅ **Models**: Only SQLAlchemy model definitions
- ✅ **Schemas**: Only Marshmallow validation schemas
- ✅ **Utils**: Only pure helper functions (no DB, no business logic)
- ✅ **Middleware**: Only request/response interceptors

### Anti-Patterns (FORBIDDEN)
- ❌ Database queries in routes
- ❌ Business logic in repositories
- ❌ Direct model imports in routes (use services)
- ❌ Creating files like `helper.py`, `common.py`, `misc.py`
- ❌ Creating folders like `lib/`, `core/`, `base/`, `shared/`
- ❌ Mixing concerns (e.g., validation + business logic in one function)

---

## Commands

### Running the Application
```bash
# Development server with debug info
python run_local.py

# Production deployment
gunicorn -w 4 -b 0.0.0.0:5000 run:app
```

### Database & Cache Management
```bash
# Clear Redis cache
python clear_cache.py clear

# Create admin user
python manage_admin.py create <email> <name>
```

### Testing
No formal test framework currently configured. Manual testing via `/create-test-account` route.

## Code Style Guidelines

### Python Conventions
- **Indentation**: 4 spaces
- **Naming**: `snake_case` for variables/functions, `PascalCase` for classes
- **Line length**: Under 120 characters
- **Imports order**: Standard library → Third-party → Local imports

### Import Organization
```python
# Standard library
import os
import json
from datetime import datetime

# Third-party
from flask import Flask, render_template
from flask_sqlalchemy import SQLAlchemy

# Local imports
from . import db
from .models import User
```

### Error Handling
- Use try/except blocks with logging
- Rollback database transactions on errors
- Return proper HTTP status codes in API responses
- Use flash() for user-facing error messages

### Security Practices
- Hash passwords with `werkzeug.security.generate_password_hash`
- Use `secure_filename()` for file uploads
- Validate user authorization with `@login_required`
- Sanitize HTML content before storage

### Database Patterns
- Use `datetime.utcnow` for timestamps
- Implement cascade delete for related records
- Add `repr` methods for debugging
- Use lazy loading for relationships

### API Response Format
```python
return jsonify({
    'success': True,
    'message': 'Operation successful',
    'data': {...}
}), 200
```

---

## 7-Layer Architecture Details

### Layer 1: Routes (`app/routes/`)
**Purpose**: HTTP endpoint definitions ONLY

**Files**:
- `auth.py` - Authentication endpoints (/register, /login, /logout, /profile)
- `sites.py` - Site management (/dashboard, /create, /publish)
- `admin.py` - Admin panel routes
- `api.py` - API endpoints
- `main.py` - General pages (homepage, redirect)

**Rules**:
- Only handle request/response
- Validate input with schemas
- Call services for business logic
- Return standardized responses

**Example Pattern**:
```python
from flask import Blueprint, request, jsonify
from app.services.auth_service import AuthService
from app.schemas.user_schema import RegisterSchema

bp = Blueprint('auth', __name__, url_prefix='/auth')

@bp.route('/register', methods=['POST'])
def register():
    # Validate input
    schema = RegisterSchema()
    data = schema.load(request.get_json())
    
    # Call service
    success, user, error = AuthService.register_user(**data)
    
    # Return response
    if success:
        return jsonify({'success': True, 'user': user}), 201
    return jsonify({'success': False, 'error': error}), 400
```

### Layer 2: Services (`app/services/`)
**Purpose**: Business logic and workflow orchestration

**Files**:
- `auth_service.py` - User authentication, registration, password management
- `site_service.py` - Site creation, publishing, deletion
- `asset_service.py` - Asset upload, management
- `subscription_service.py` - Subscription plans, payments
- `subdomain_service.py` - Subdomain creation, DNS management

**Rules**:
- No direct database queries (use repositories)
- No HTTP request/response handling
- Return tuples: (success: bool, data: Any, error: str|None)
- Implement complex business logic here

**Example Pattern**:
```python
from app.repositories.user_repository import UserRepository
from app.utils.validators import validate_email

class AuthService:
    @staticmethod
    def register_user(name, email, password):
        # Business validation
        if not validate_email(email):
            return False, None, "Email không hợp lệ"
        
        # Check existing user via repository
        if UserRepository.find_by_email(email):
            return False, None, "Email đã được sử dụng"
        
        # Create user via repository
        user = UserRepository.create({
            'name': name,
            'email': email,
            'password_hash': hash_password(password)
        })
        
        return True, user, None
```

### Layer 3: Repositories (`app/repositories/`)
**Purpose**: Database operations ONLY (CRUD)

**Files**:
- `user_repository.py` - User queries
- `site_repository.py` - Site queries
- `asset_repository.py` - Asset queries
- `subscription_repository.py` - Subscription queries

**Rules**:
- Only SQLAlchemy queries
- No business logic
- Return model instances or None
- Use class methods (@staticmethod)

**Example Pattern**:
```python
from app.models.user import User
from app import db

class UserRepository:
    @staticmethod
    def find_by_email(email):
        return User.query.filter_by(email=email).first()
    
    @staticmethod
    def find_by_id(user_id):
        return User.query.get(user_id)
    
    @staticmethod
    def create(data):
        user = User(**data)
        db.session.add(user)
        db.session.commit()
        return user
    
    @staticmethod
    def update(user, data):
        for key, value in data.items():
            setattr(user, key, value)
        db.session.commit()
        return user
    
    @staticmethod
    def delete(user):
        db.session.delete(user)
        db.session.commit()
```

### Layer 4: Models (`app/models/`)
**Purpose**: Database schema definitions

**Files**:
- `user.py` - User model
- `site.py` - Site model
- `asset.py` - Asset model
- `subscription.py` - Subscription model
- `subdomain.py` - Subdomain model

**Rules**:
- Only SQLAlchemy column definitions
- Include relationships
- Add helper methods (set_password, check_password)
- Keep business logic OUT

**Example Pattern**:
```python
from app import db
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    password_hash = db.Column(db.String(255))
    
    # Relationships
    sites = db.relationship('Site', backref='owner', lazy=True)
    
    # Helper methods
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
```

### Layer 5: Schemas (`app/schemas/`)
**Purpose**: Request/response validation

**Files**:
- `user_schema.py` - User validation schemas
- `site_schema.py` - Site validation schemas
- `asset_schema.py` - Asset validation schemas

**Rules**:
- Use Marshmallow or similar
- Validate input data
- Define serialization/deserialization

**Example Pattern**:
```python
from marshmallow import Schema, fields, validate

class RegisterSchema(Schema):
    name = fields.Str(required=True, validate=validate.Length(min=2, max=100))
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=validate.Length(min=6))

class UserResponseSchema(Schema):
    id = fields.Int()
    name = fields.Str()
    email = fields.Email()
    created_at = fields.DateTime()
```

### Layer 6: Utils (`app/utils/`)
**Purpose**: Pure helper functions

**Files**:
- `validators.py` - Validation functions
- `helpers.py` - General helpers
- `formatters.py` - Data formatting
- `constants.py` - Application constants

**Rules**:
- No database access
- No business logic
- Pure functions (input → output)
- Reusable across application

**Example Pattern**:
```python
import re

def validate_email(email):
    pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
    return re.match(pattern, email) is not None

def format_file_size(bytes):
    for unit in ['B', 'KB', 'MB', 'GB']:
        if bytes < 1024:
            return f"{bytes:.2f} {unit}"
        bytes /= 1024
    return f"{bytes:.2f} TB"
```

### Layer 7: Middleware (`app/middleware/`)
**Purpose**: Request/response interceptors

**Files**:
- `auth_middleware.py` - Authentication checks
- `cors_middleware.py` - CORS handling
- `logging_middleware.py` - Request logging

**Rules**:
- Process before/after request
- Add headers, logging, security
- Don't include business logic

---

## Existing File Reference

### Current Routes
- `app/routes/auth.py` - ALL authentication endpoints
- `app/routes/sites.py` - ALL site management
- `app/routes/admin.py` - ALL admin functionality
- `app/routes/api.py` - ALL API endpoints
- `app/routes/main.py` - Homepage, redirects

**⚠️ DO NOT CREATE**: `user_routes.py`, `login_routes.py`, `dashboard_routes.py` etc.

### Current Services
- `app/services/auth_service.py` - ALL auth business logic
- `app/services/site_service.py` - ALL site operations
- `app/services/asset_service.py` - ALL asset management
- `app/services/subscription_service.py` - ALL subscription logic
- `app/services/subdomain_service.py` - ALL subdomain operations

**⚠️ DO NOT CREATE**: `user_service.py`, `email_service.py`, `storage_service.py` unless truly needed

### Current Repositories
- `app/repositories/user_repository.py` - User DB operations
- `app/repositories/site_repository.py` - Site DB operations
- `app/repositories/asset_repository.py` - Asset DB operations
- `app/repositories/subscription_repository.py` - Subscription DB operations

**⚠️ DO NOT CREATE**: Duplicate repositories with different names

### Current Models
- `app/models/user.py` - User model (fields: id, email, name, password_hash, google_id, avatar_url, role)
- `app/models/site.py` - Site model
- `app/models/asset.py` - Asset model (fields: id, site_id, user_id, original_name, file_size, file_type, width, height, url)
- `app/models/subscription.py` - Subscription model
- `app/models/subdomain.py` - Subdomain model

**⚠️ CRITICAL**: These field names are FINAL. Do NOT add username, full_name, file_path, etc.

---

## Refactoring Guidelines

### When Splitting Old Code
1. **Read older folder first**: `/older folder/routes.py` (NOT archive!)
2. **Copy exact logic**: Do NOT rewrite or "improve"
3. **Keep field names**: Use EXACT same model fields from older folder
4. **Split by responsibility**: Move to correct layer
5. **Test immediately**: Check for errors after split
6. **Verify 100% match**: Backend must behave identically to older folder

### Before Creating New File
**CHECKLIST**:
- [ ] Does equivalent functionality exist?
- [ ] Which layer does this belong to?
- [ ] Can I add to existing file instead?
- [ ] Have I checked all files in target folder?
- [ ] Does this follow naming convention?

### ⚠️ Handling Incorrect Files (OVERWRITE POLICY)
**If you encounter a file in the backend that is incorrect, buggy, or doesn't match the Older Folder:**

1. ❌ **DO NOT DELETE THE FILE**:
   - Never use `delete` or `rm` on existing source code files.
   - Deleting files breaks imports, causes confusion, and loses file history.

2. ✅ **SOLUTION = OVERWRITE (WRITE_OVER)**:
   - Open the existing file.
   - **Overwrite/Replace** the entire content with the correct logic (copied from Older Folder).
   - **Rule**: "Fix in place" is always the correct action. Do not delete and recreate.

### Example: Adding Login Feature
❌ **WRONG**:
```
Create: app/routes/login_routes.py
Create: app/services/login_service.py
Create: app/lib/auth_helper.py
```

✅ **CORRECT**:
```
Edit: app/routes/auth.py (add login endpoint)
Edit: app/services/auth_service.py (add authenticate method)
```

---

## Database Model Reference

### User Model Fields (IMMUTABLE)
```python
id              # Integer, primary key
email           # String(100), unique, for authentication
name            # String(100), for display
password_hash   # String(255), hashed password
google_id       # String(100), OAuth ID
avatar_url      # String(500), profile picture
role            # String(20), 'user' or 'admin'
created_at      # DateTime
updated_at      # DateTime
last_login      # DateTime
```

**⚠️ DO NOT USE**: username, full_name, first_name, last_name, display_name

### Asset Model Fields (IMMUTABLE)
```python
id              # Integer, primary key
site_id         # Integer, foreign key
user_id         # Integer, foreign key
original_name   # String(255), original filename
file_size       # Integer, size in bytes
file_type       # String(50), MIME type
width           # Integer, image width
height          # Integer, image height
url             # String(500), file URL
created_at      # DateTime
```

**⚠️ DO NOT USE**: filename, file_path, file_url, original_filename, storage_path

---

## Common Tasks

### Task: Add New Endpoint
1. Identify route file: `app/routes/*.py`
2. Add route function
3. Call service method
4. Return standardized response

### Task: Add Business Logic
1. Identify service file: `app/services/*.py`
2. Add method to service class
3. Use repositories for data access
4. Return (success, data, error) tuple

### Task: Add Database Query
1. Identify repository file: `app/repositories/*.py`
2. Add method to repository class
3. Use SQLAlchemy query API
4. Return model instance(s) or None

### Task: Add New Model
1. Create file: `app/models/new_model.py`
2. Define SQLAlchemy model
3. Create repository: `app/repositories/new_model_repository.py`
4. Add migrations: `flask db migrate -m "Add new_model"`
5. Run migrations: `flask db upgrade`

---

## Documentation Reference

### For AI Agents:
- **This file** (`AGENTS.md`) - Quick command reference and rules
- **`/older folder/`** - **PRIMARY SOURCE OF TRUTH** - 100% complete logic
- **`/docs/ARCHITECTURE.md`** - Complete 7-layer architecture guide with examples
- **`/docs/REFACTORING_RULES.md`** - Detailed refactoring do's and don'ts
- **Archive files** (`/backend/archive/*.py`) - Secondary reference only

### For Developers:
- **Setup**: `/backend/README.md`
- **Admin Guide**: `/backend/ADMIN_QUICKSTART.md`
- **Testing**: `/backend/TESTING_SUMMARY.md`
- **Deployment**: `/DEPLOYMENT_GUIDE_PRODUCTION.md`

---

## File Structure
- `/app/`: Core Flask application (7-layer architecture)
  - `/routes/`: HTTP endpoints
  - `/services/`: Business logic
  - `/repositories/`: Database operations
  - `/models/`: SQLAlchemy models
  - `/schemas/`: Data validation
  - `/utils/`: Helper functions
  - `/middleware/`: Request interceptors
  - `/static/`: CSS, JS, images
- `/templates/`: Jinja2 HTML templates
- `/storage/sites/`: Published website files
- `/archive/`: Original code backups
- Environment configs: `.env.local` (dev), `.env.production` (prod)

---

## 🚨 CRITICAL RULES FOR FRONTEND DEVELOPMENT

### 🔥 MODULAR MONOLITH ARCHITECTURE COMPLIANCE

**Dự án đã chuyển sang Modular Monolith structure cho SaaS platform. AI PHẢI tuân thủ nghiêm ngặt:**

#### 📋 PROJECT STRUCTURE

```
pagemade/                        # Root project
├── backend/                     # Flask Backend (7-layer architecture)
│   ├── app/                    # Backend logic
│   ├── static/                 # Chỉ chứa build output
│   │   └── dist/              # Frontend build files
│   └── templates/              # Base templates
│
├── frontend/                   # ⭐ React/Vue Frontend (NEW)
│   ├── src/
│   │   ├── features/          # Chia theo FEATURE (tư duy solo dev)
│   │   │   ├── editor/        # PageMade Editor
│   │   │   ├── dashboard/     # Site management, user profile
│   │   │   └── auth/          # Login/Register
│   │   ├── shared/            # UI Kit, utils, components
│   │   └── App.jsx            # Router chính
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
└── docker-compose.yml
```

#### 📋 MANDATORY WORKFLOW FOR FRONTEND FEATURES

1. **KIỂM TRA FEATURE CÓ SẴN TRƯỚC**:
   - Luôn kiểm tra trong `frontend/src/features/` trước
   - Search trong `frontend/src/shared/` cho reusable components
   - Đọc existing files để hiểu pattern

2. **ƯU TIÊN UPDATE FILE CÓ SẴN**:
   - ✅ **PREFERRED**: Update existing component trong feature folder
   - ✅ **PREFERRED**: Thêm component vào shared nếu reusable
   - ✅ **PREFERRED**: Mở rộng existing feature thay vì tạo mới

3. **CHỈ TẠO FEATURE MỚI KHI**:
   - ❌ KHÔNG tồn tại feature folder cho tính năng đó
   - ❌ KHÔNG thể mở rộng existing feature
   - ❌ KHÔNG có cách nào khác để implement

4. **TUÂN THỦ FEATURE-BASED ARCHITECTURE**:
   - Features trong `frontend/src/features/` (editor, dashboard, auth)
   - Shared components trong `frontend/src/shared/`
   - Routing trong `frontend/src/App.jsx`
   - Entry point: `frontend/src/main.jsx`

#### 🎯 SPECIFIC RULES FOR FRONTEND FEATURES

**✅ ALLOWED (Khi cần thiết)**:
```jsx
// Thêm component vào existing feature
// File: frontend/src/features/editor/EditorPage.jsx
export function EditorPage() {
    // Thêm new functionality
    const addNewFeature = () => {
        // Implementation
    }
    
    return <div>...</div>
}

// Thêm shared component
// File: frontend/src/shared/components/Button.jsx
export function Button({ children, variant }) {
    return <button className={`btn-${variant}`}>{children}</button>
}
```

**❌ FORBIDDEN (Trừ khi thực sự cần thiết)**:
```jsx
// Tạo feature mới khi đã có tương đương
// ❌ WRONG: frontend/src/features/NewFeature/
// ✅ CORRECT: Update frontend/src/features/editor/

// Tạo component duplicate
// ❌ WRONG: frontend/src/features/editor/components/CustomButton.jsx
// ✅ CORRECT: Sử dụng frontend/src/shared/components/Button.jsx
```

#### 🔍 DECISION TREE FOR FRONTEND DEVELOPMENT

```
Cần thêm tính năng mới?
│
├─ Thuộc feature nào? (editor, dashboard, auth)
│  ├─ Editor → frontend/src/features/editor/
│  ├─ Dashboard → frontend/src/features/dashboard/
│  └─ Auth → frontend/src/features/auth/
│
├─ Component có reusable không?
│  ├─ YES → frontend/src/shared/components/
│  └─ NO → Giữ trong feature folder
│
├─ Có thể mở rộng existing component?
│  ├─ YES → Update existing component
│  └─ NO → Tạo component mới trong feature
│
└─ Utility function?
   ├─ YES → frontend/src/shared/utils/
   └─ NO → Giữ trong feature
```

#### 📁 FILE STRUCTURE COMPLIANCE

```
frontend/src/
├── main.jsx                    # ✅ UPDATE: React entry point
├── App.jsx                     # ✅ UPDATE: Router configuration
├── features/                   # ✅ UPDATE: Feature-based structure
│   ├── editor/                 # ✅ UPDATE: Editor components
│   │   ├── components/          # Editor-specific components
│   │   ├── hooks/              # Editor hooks
│   │   ├── core/               # Editor core logic
│   │   └── EditorPage.jsx       # Main editor page
│   ├── dashboard/              # ✅ UPDATE: Dashboard components
│   │   ├── components/
│   │   └── DashboardPage.jsx
│   └── auth/                  # ✅ UPDATE: Auth components
│       ├── components/
│       └── AuthPage.jsx
└── shared/                     # ✅ UPDATE: Shared resources
    ├── components/              # Reusable UI components
    ├── utils/                  # Utility functions
    ├── hooks/                  # Shared hooks
    └── styles/                 # Global styles
```

#### 🚨 EXAMPLES

**✅ CORRECT APPROACH**:
```jsx
// Thêm editor component
// File: frontend/src/features/editor/components/Toolbar.jsx
export function Toolbar({ onDeviceChange }) {
    return (
        <div className="toolbar">
            <button onClick={() => onDeviceChange('desktop')}>
                Desktop
            </button>
        </div>
    )
}

// Thêm shared component
// File: frontend/src/shared/components/Modal.jsx
export function Modal({ children, isOpen }) {
    if (!isOpen) return null
    return <div className="modal">{children}</div>
}
```

**❌ WRONG APPROACH**:
```jsx
// Tạo feature không cần thiết
// File: frontend/src/features/toolbar/ToolbarComponent.jsx
export function ToolbarComponent() {
    // Duplicate functionality
}
```

---

## Final Checklist for AI Agents

### 📋 BEFORE MAKING CHANGES:

**For Frontend Features (Modular Monolith):**
- [ ] Have I searched `frontend/src/features/` for existing features?
- [ ] Does this belong to an existing feature (editor, dashboard, auth)?
- [ ] Can this be a shared component in `frontend/src/shared/`?
- [ ] Am I following feature-based architecture?
- [ ] Is this truly a new feature that requires new feature folder?
- [ ] Have I checked all existing features and shared components?

**For Backend Changes:**
- [ ] Have I read `/older folder/routes.py` for this feature?
- [ ] Does my implementation match older folder 100%?
- [ ] Do I understand which layer this belongs to?
- [ ] Does a similar file already exist?
- [ ] Am I using correct model field names from older folder?
- [ ] Am I copying from older folder, not rewriting?
- [ ] Have I tested after changes?
- [ ] Will backend behave identically to older folder?
- [ ] Am I deleting a file? (STOP! Unless it's a temp file, prefer **OVERWRITING** with correct content instead).

**Remember**: 
- 🔥 **OLDER FOLDER IS ABSOLUTE TRUTH** (Backend)
- 🏗️ **FEATURE-BASED ARCHITECTURE IS MANDATORY** (Frontend)
- ✅ Update existing features/components first
- ❌ Create new features only when absolutely necessary
- ✅ Follow React/Vite patterns
- ❌ Don't break existing architecture
- ✅ Maintain consistency between features
- ❌ Don't duplicate functionality across features


### 🔒 FRONTEND LEGACY REFERENCES (SOURCES OF TRUTH)

**FILES**: 
- `editor_pagemaker_v2.html` - Original editor logic (READ-ONLY)
- `static/src/` - Current modular editor implementation
- `templates/editor_pagemaker_v3.html` - Current editor template

**STATUS**: 🔴 **READ-ONLY / IMMUTABLE**

**ROLE:**
These files contain the **original working logic and structure** of the editor that needs to be migrated to React.

**RULES:**
1. **REFERENCE ONLY**: You may ONLY read these files to understand how the editor *should* behave.
2. **NO MODIFICATIONS**: Never edit, rename, or delete legacy files.
3. **LOGIC MIGRATION**: If you need functionality from these files:
   - ❌ **WRONG**: "I will refactor this legacy file."
   - ✅ **CORRECT**: "I will READ the logic here and RE-IMPLEMENT it in `frontend/src/features/editor/`."
4. **PRESERVE BEHAVIOR**: Any new React implementation must respect the logic defined in these files.
5. **MIGRATION PATH**: 
   - Legacy: `static/src/` → New: `frontend/src/features/editor/`
   - Legacy: Templates → New: React components
   - Legacy: Pure JS → New: React hooks & components