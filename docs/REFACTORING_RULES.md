# Refactoring Rules - PageMade Backend

## 🚨 CRITICAL RULES

### Rule #1: NEVER Change Model Fields
```python
# ❌ ABSOLUTELY FORBIDDEN
class User(db.Model):
    username = db.Column(...)      # WRONG - Original has 'name'
    full_name = db.Column(...)     # WRONG - Original has 'name'
    
# ✅ MUST USE ORIGINAL FIELDS
class User(db.Model):
    name = db.Column(...)          # CORRECT - From original
    email = db.Column(...)         # CORRECT - For authentication
```

**Original User Model Fields** (IMMUTABLE):
- `id` - Primary key
- `email` - For authentication (NOT username!)
- `name` - For display (NOT full_name, NOT username!)
- `password_hash` - Hashed password
- `google_id` - OAuth identifier
- `avatar_url` - Profile picture URL (NOT avatar!)
- `role` - 'user' or 'admin'
- `created_at`, `updated_at`, `last_login` - Timestamps

**Original Asset Model Fields** (IMMUTABLE):
- `id` - Primary key
- `site_id`, `user_id` - Foreign keys
- `original_name` - Original filename (NOT filename!)
- `file_size` - Size in bytes
- `file_type` - MIME type
- `width`, `height` - Image dimensions
- `url` - File URL (NOT file_url, NOT file_path!)
- `created_at` - Timestamp

---

### Rule #2: NEVER Create New Files If Equivalent Exists

#### Before Creating ANY File:
1. ✅ Check if functionality exists in current files
2. ✅ Check if you can add to existing file
3. ✅ Verify target folder is one of 7 layers
4. ✅ Confirm naming follows convention

#### Existing Files Reference:

**Routes** (`app/routes/`):
- `auth.py` - ALL authentication (register, login, logout, profile, password)
- `sites.py` - ALL site operations (create, edit, publish, delete)
- `admin.py` - ALL admin functionality
- `api.py` - ALL API endpoints
- `main.py` - Homepage, redirects, general pages

**Services** (`app/services/`):
- `auth_service.py` - ALL user/auth business logic
- `site_service.py` - ALL site operations logic
- `asset_service.py` - ALL asset management logic
- `subscription_service.py` - ALL subscription logic
- `subdomain_service.py` - ALL subdomain operations

**Repositories** (`app/repositories/`):
- `user_repository.py` - ALL User DB queries
- `site_repository.py` - ALL Site DB queries
- `asset_repository.py` - ALL Asset DB queries
- `subscription_repository.py` - ALL Subscription DB queries

**Models** (`app/models/`):
- `user.py` - User model
- `site.py` - Site model
- `asset.py` - Asset model
- `subscription.py` - Subscription model
- `subdomain.py` - Subdomain model

**DO NOT CREATE**:
- ❌ `user_routes.py` (use `auth.py`)
- ❌ `login_routes.py` (use `auth.py`)
- ❌ `profile_routes.py` (use `auth.py`)
- ❌ `dashboard_routes.py` (use `sites.py`)
- ❌ `user_service.py` (use `auth_service.py`)
- ❌ `login_service.py` (use `auth_service.py`)
- ❌ `email_service.py` (add to existing service or utils)
- ❌ `storage_service.py` (add to `asset_service.py`)
- ❌ Files in `lib/`, `core/`, `common/`, `shared/` folders

---

### Rule #3: Copy Original Logic, Don't Rewrite

When refactoring from `archive/routes.py.YYYYMMDD_HHMMSS`:

#### ❌ WRONG Approach:
```python
# Reading archive and "improving" the code
def register_user(username, email, password, full_name=None):
    """Improved version with better field names"""
    if User.query.filter_by(username=username).first():
        return False, None, "Username exists"
    user = User(username=username, full_name=full_name, email=email)
    # ... rest of logic
```

#### ✅ CORRECT Approach:
```python
# Copy EXACT logic from archive/routes.py line 312-370
def register_user(name, email, password):
    """Copied exactly from original"""
    if User.query.filter_by(email=email).first():  # Same check
        return False, None, "Email đã được sử dụng"  # Same message
    user = User(name=name, email=email, role='user')  # Same fields
    # ... exact same logic
```

#### Process:
1. **Find original function** in archive file:
   ```bash
   grep -n "def register" archive/routes.py.20251117_172512
   ```

2. **Read exact code**:
   ```bash
   sed -n '312,370p' archive/routes.py.20251117_172512
   ```

3. **Copy line by line**, only change:
   - Import statements (adjust to new file structure)
   - Indentation (if moving to class method)
   - Function signature (if extracting parameters)

4. **DO NOT CHANGE**:
   - Field names
   - Logic flow
   - Variable names (unless absolutely necessary)
   - Error messages
   - Return types

---

### Rule #4: Respect Layer Boundaries

#### Layer Responsibilities:

**Routes** - HTTP ONLY:
```python
# ✅ CORRECT
@bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    success, user, error = AuthService.register_user(**data)
    if success:
        return jsonify({'success': True}), 201
    return jsonify({'error': error}), 400

# ❌ WRONG - Business logic in route
@bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if len(data['password']) < 6:  # Business rule in route!
        return jsonify({'error': 'Password too short'}), 400
    if User.query.filter_by(email=data['email']).first():  # DB query!
        return jsonify({'error': 'Email exists'}), 400
```

**Services** - Business Logic ONLY:
```python
# ✅ CORRECT
class AuthService:
    @staticmethod
    def register_user(name, email, password):
        # Validate business rules
        if len(password) < 6:
            return False, None, "Password too short"
        
        # Use repository for DB
        if UserRepository.find_by_email(email):
            return False, None, "Email exists"
        
        # Create via repository
        user = UserRepository.create({'name': name, 'email': email})
        return True, user, None

# ❌ WRONG - HTTP handling in service
class AuthService:
    @staticmethod
    def register_user(request):  # Taking Flask request!
        data = request.get_json()  # HTTP handling!
        return jsonify({...}), 201  # Returning HTTP response!
```

**Repositories** - DB Queries ONLY:
```python
# ✅ CORRECT
class UserRepository:
    @staticmethod
    def find_by_email(email):
        return User.query.filter_by(email=email).first()
    
    @staticmethod
    def create(data):
        user = User(**data)
        db.session.add(user)
        db.session.commit()
        return user

# ❌ WRONG - Business logic in repository
class UserRepository:
    @staticmethod
    def create_user(email, password):
        if len(password) < 6:  # Business validation!
            return None
        if not validate_email(email):  # Business rule!
            return None
        user = User(email=email)
        db.session.add(user)
        return user
```

---

### Rule #5: Follow Naming Conventions

#### File Names:
- **Routes**: `<domain>.py` (e.g., `auth.py`, `sites.py`, `admin.py`)
- **Services**: `<domain>_service.py` (e.g., `auth_service.py`, `site_service.py`)
- **Repositories**: `<model>_repository.py` (e.g., `user_repository.py`, `site_repository.py`)
- **Models**: `<model>.py` (e.g., `user.py`, `site.py`, `asset.py`)
- **Schemas**: `<model>_schema.py` (e.g., `user_schema.py`, `site_schema.py`)
- **Utils**: `<purpose>.py` (e.g., `validators.py`, `helpers.py`, `formatters.py`)

#### Class Names:
- **Services**: `<Domain>Service` (e.g., `AuthService`, `SiteService`)
- **Repositories**: `<Model>Repository` (e.g., `UserRepository`, `SiteRepository`)
- **Models**: `<ModelName>` (e.g., `User`, `Site`, `Asset`)
- **Schemas**: `<Purpose>Schema` (e.g., `RegisterSchema`, `LoginSchema`)

#### Method Names:
- **Routes**: `<verb>_<noun>()` (e.g., `get_profile()`, `create_site()`)
- **Services**: `<verb>_<noun>()` (e.g., `register_user()`, `publish_site()`)
- **Repositories**: `find_by_<field>()`, `create()`, `update()`, `delete()`, `count()`

---

### Rule #6: Standard Return Types

#### Services Return Tuple:
```python
# ✅ CORRECT
def register_user(name, email, password):
    # ...
    return (True, user, None)  # (success: bool, data: Any, error: str|None)

def authenticate(email, password):
    # ...
    return (False, None, "Invalid password")
```

#### Repositories Return Models:
```python
# ✅ CORRECT
def find_by_email(email):
    return User.query.filter_by(email=email).first()  # User | None

def create(data):
    user = User(**data)
    db.session.add(user)
    db.session.commit()
    return user  # User instance
```

#### Routes Return HTTP Responses:
```python
# ✅ CORRECT
@bp.route('/register', methods=['POST'])
def register():
    success, user, error = AuthService.register_user(**data)
    if success:
        return jsonify({'success': True, 'user': user.to_dict()}), 201
    return jsonify({'success': False, 'error': error}), 400
```

---

## Refactoring Checklist

### Before Splitting Code:
- [ ] Read original file from `archive/`
- [ ] Identify what layer each piece belongs to
- [ ] Check if target files already exist
- [ ] Verify model field names match original
- [ ] Plan split without changing logic

### While Splitting:
- [ ] Copy exact code (don't rewrite)
- [ ] Preserve field names
- [ ] Keep variable names same
- [ ] Maintain error messages
- [ ] Adjust only imports and indentation

### After Splitting:
- [ ] Test immediately with `python run.py`
- [ ] Check terminal for errors
- [ ] Verify no "has no attribute" errors
- [ ] Test affected endpoints
- [ ] Commit changes with clear message

---

## Common Refactoring Scenarios

### Scenario 1: Extract Registration Logic

**Original** (`archive/routes.py`):
```python
@app.route('/register', methods=['POST'])
def register():
    name = request.form.get('name')
    email = request.form.get('email')
    password = request.form.get('password')
    
    if User.query.filter_by(email=email).first():
        flash('Email đã được sử dụng', 'error')
        return redirect('/register')
    
    new_user = User(name=name, email=email, role='user')
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()
    
    login_user(new_user)
    return redirect('/dashboard')
```

**Refactored** - Split into 3 layers:

**1. Repository** (`app/repositories/user_repository.py`):
```python
class UserRepository:
    @staticmethod
    def find_by_email(email):
        return User.query.filter_by(email=email).first()
    
    @staticmethod
    def create(data):
        user = User(**data)
        db.session.add(user)
        db.session.commit()
        return user
```

**2. Service** (`app/services/auth_service.py`):
```python
class AuthService:
    @staticmethod
    def register_user(name, email, password):
        # Check existing (using repository)
        if UserRepository.find_by_email(email):
            return False, None, "Email đã được sử dụng"
        
        # Create user (using repository)
        user = UserRepository.create({
            'name': name,
            'email': email,
            'role': 'user'
        })
        user.set_password(password)
        db.session.commit()
        
        return True, user, None
```

**3. Route** (`app/routes/auth.py`):
```python
@bp.route('/register', methods=['POST'])
def register():
    name = request.form.get('name')
    email = request.form.get('email')
    password = request.form.get('password')
    
    # Call service
    success, user, error = AuthService.register_user(name, email, password)
    
    if not success:
        flash(error, 'error')
        return redirect('/register')
    
    login_user(user)
    return redirect('/dashboard')
```

### Scenario 2: Extract Site Publishing Logic

**Original** (`archive/routes.py`):
```python
@app.route('/sites/<int:site_id>/publish', methods=['POST'])
@login_required
def publish_site(site_id):
    site = Site.query.get_or_404(site_id)
    
    if site.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    # Generate HTML
    html_content = render_template('site_template.html', site=site)
    
    # Save to storage
    site_dir = f'storage/sites/{site.subdomain}'
    os.makedirs(site_dir, exist_ok=True)
    
    with open(f'{site_dir}/index.html', 'w') as f:
        f.write(html_content)
    
    # Update database
    site.is_published = True
    site.published_url = f'https://{site.subdomain}.pagemaker.com'
    site.published_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify({'success': True, 'url': site.published_url})
```

**Refactored**:

**1. Repository** (`app/repositories/site_repository.py`):
```python
class SiteRepository:
    @staticmethod
    def find_by_id(site_id):
        return Site.query.get(site_id)
    
    @staticmethod
    def update_publish_status(site, url):
        site.is_published = True
        site.published_url = url
        site.published_at = datetime.utcnow()
        db.session.commit()
        return site
```

**2. Service** (`app/services/site_service.py`):
```python
class SiteService:
    @staticmethod
    def publish_site(site_id, user_id):
        # Get site via repository
        site = SiteRepository.find_by_id(site_id)
        if not site:
            return False, None, "Site not found"
        
        # Check ownership
        if site.user_id != user_id:
            return False, None, "Unauthorized"
        
        # Generate HTML
        html_content = render_template('site_template.html', site=site)
        
        # Save to storage
        site_dir = f'storage/sites/{site.subdomain}'
        os.makedirs(site_dir, exist_ok=True)
        with open(f'{site_dir}/index.html', 'w') as f:
            f.write(html_content)
        
        # Update via repository
        url = f'https://{site.subdomain}.pagemaker.com'
        site = SiteRepository.update_publish_status(site, url)
        
        return True, site, None
```

**3. Route** (`app/routes/sites.py`):
```python
@bp.route('/sites/<int:site_id>/publish', methods=['POST'])
@login_required
def publish_site(site_id):
    # Call service
    success, site, error = SiteService.publish_site(site_id, current_user.id)
    
    if not success:
        return jsonify({'error': error}), 403 if error == "Unauthorized" else 400
    
    return jsonify({
        'success': True,
        'url': site.published_url
    })
```

---

## Error Prevention

### Check for These Anti-Patterns:

#### ❌ Wrong Field Names:
```bash
# Check for wrong field usage
grep -r "username\|full_name" app/

# Should return NO matches in services/repositories/routes
# If found, replace with 'name' and 'email'
```

#### ❌ DB Queries in Routes:
```bash
# Check routes for DB queries
grep -r "\.query\." app/routes/

# Should return NO matches
# If found, move to repositories
```

#### ❌ Business Logic in Repositories:
```bash
# Check repositories for business logic
grep -r "if.*len\|if.*validate" app/repositories/

# Should return NO matches
# If found, move to services
```

#### ❌ HTTP Handling in Services:
```bash
# Check services for Flask imports
grep -r "from flask import request\|jsonify" app/services/

# Should return NO matches
# If found, remove and handle in routes
```

---

## Testing After Refactoring

### Manual Test Checklist:
1. **Start server**: `python run.py`
2. **Check terminal**: No import errors, no attribute errors
3. **Test registration**: POST to `/auth/register`
4. **Test login**: POST to `/auth/login`
5. **Test profile**: GET `/auth/profile` (authenticated)
6. **Check database**: Verify records created correctly

### Automated Checks:
```bash
# Check Python syntax
python -m py_compile app/**/*.py

# Check imports
python -c "from app import create_app; app = create_app()"

# Check database
python -c "from app import db; from app.models import *; print('Models OK')"
```

---

## Recovery from Bad Refactoring

### If Errors Occur:

1. **Check terminal output** for specific error
2. **Identify wrong field names** (username, full_name, etc.)
3. **Find original code** in archive files
4. **Replace with correct field names**:
   - `username` → `email` (for authentication)
   - `full_name` → `name` (for display)
   - `avatar` → `avatar_url`
   - `filename` → `original_name`
   - `file_path` → `url`

5. **Verify model structure**:
   ```python
   python -c "from app.models.user import User; print([c.name for c in User.__table__.columns])"
   ```

6. **Test immediately** after fix

### Emergency Rollback:
```bash
# If too many errors, restore from archive
cp archive/routes.py.20251117_172512 app/routes/auth.py
# Then split again carefully
```

---

## Summary

### The 6 Golden Rules:
1. ✅ **NEVER change model fields** - Use exact original field names
2. ✅ **NEVER create new files** if equivalent exists
3. ✅ **ALWAYS copy original logic** - Don't rewrite
4. ✅ **ALWAYS respect layer boundaries** - Right code in right place
5. ✅ **ALWAYS follow naming conventions** - Consistent file/class names
6. ✅ **ALWAYS test immediately** - Catch errors early

### Quick Decision Tree:

**Need to add feature?**
→ Check existing files first
→ Add to existing file if related
→ Create new file ONLY if truly new domain

**Splitting old code?**
→ Read archive file first
→ Copy exact logic
→ Split by layer responsibility
→ Test immediately

**Getting errors?**
→ Check field names match model
→ Verify layer boundaries respected
→ Compare with archive file
→ Fix and test again

---

**Remember**: Refactoring means **reorganizing**, not **rewriting**. The goal is better structure with ZERO logic changes.
