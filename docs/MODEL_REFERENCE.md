# Model Field Reference - PageMade Backend

## 🚨 CRITICAL: These Field Names Are IMMUTABLE

This document lists the EXACT field names used in database models. When writing code, you MUST use these exact field names. DO NOT use similar names like `username`, `full_name`, `filename`, etc.

---

## User Model

**File**: `app/models/user.py`  
**Table**: `users`

### Fields:
```python
id              # Integer, Primary Key
email           # String(100), Unique, Not Null - USE FOR AUTHENTICATION
name            # String(100), Not Null - USE FOR DISPLAY
password_hash   # String(255) - Hashed password
google_id       # String(100), Unique - OAuth identifier
avatar_url      # String(500) - Profile picture URL
role            # String(20), Default='user' - 'user' or 'admin'
created_at      # DateTime, Default=utcnow
updated_at      # DateTime, Default=utcnow, OnUpdate=utcnow
last_login      # DateTime - Last login timestamp
```

### ✅ CORRECT Usage:
```python
# Creating user
user = User(
    name="John Doe",           # ✅ name (not username, not full_name)
    email="john@example.com",  # ✅ email
    role="user"
)

# Querying user
user = User.query.filter_by(email=email).first()  # ✅ email for auth

# Displaying user
print(f"Welcome {user.name}")  # ✅ name for display
```

### ❌ FORBIDDEN Field Names:
```python
# DO NOT USE THESE - They don't exist!
user.username       # ❌ NO! Use user.email for auth
user.full_name      # ❌ NO! Use user.name
user.first_name     # ❌ NO! Use user.name
user.last_name      # ❌ NO! Use user.name
user.display_name   # ❌ NO! Use user.name
user.avatar         # ❌ NO! Use user.avatar_url
user.profile_pic    # ❌ NO! Use user.avatar_url
```

### Relationships:
```python
user.sites          # One-to-many: User has many Sites
user.assets         # One-to-many: User has many Assets
user.subscriptions  # One-to-many: User has many Subscriptions
```

### Methods:
```python
user.set_password(password)      # Hash and set password
user.check_password(password)    # Verify password
user.update_last_login()         # Update last_login timestamp
user.to_dict(include_sensitive)  # Convert to dictionary
```

---

## Site Model

**File**: `app/models/site.py`  
**Table**: `sites`

### Fields:
```python
id                  # Integer, Primary Key
user_id             # Integer, Foreign Key → users.id
name                # String(100), Not Null - Site name
subdomain           # String(50), Unique - Subdomain identifier
html_content        # Text - Site HTML content
css_content         # Text - Site CSS
js_content          # Text - Site JavaScript
is_published        # Boolean, Default=False - Published status
published_url       # String(500) - Published site URL
published_at        # DateTime - When published
created_at          # DateTime, Default=utcnow
updated_at          # DateTime, Default=utcnow, OnUpdate=utcnow
```

### ✅ CORRECT Usage:
```python
site = Site(
    user_id=current_user.id,
    name="My Awesome Site",
    subdomain="mysite",
    html_content="<html>...</html>"
)
```

### Relationships:
```python
site.owner    # Many-to-one: Site belongs to User
site.assets   # One-to-many: Site has many Assets
```

---

## Asset Model

**File**: `app/models/asset.py`  
**Table**: `asset`

### Fields:
```python
id              # Integer, Primary Key
site_id         # Integer, Foreign Key → sites.id
user_id         # Integer, Foreign Key → users.id
original_name   # String(255), Not Null - Original filename
file_size       # Integer - Size in bytes
file_type       # String(50) - MIME type (image/png, etc.)
width           # Integer - Image width in pixels
height          # Integer - Image height in pixels
url             # String(500), Not Null - File URL/path
created_at      # DateTime, Default=utcnow
```

### ✅ CORRECT Usage:
```python
asset = Asset(
    site_id=site.id,
    user_id=current_user.id,
    original_name="photo.jpg",     # ✅ original_name
    file_size=1024000,
    file_type="image/jpeg",
    width=1920,
    height=1080,
    url="/storage/sites/mysite/photo.jpg"  # ✅ url
)
```

### ❌ FORBIDDEN Field Names:
```python
# DO NOT USE THESE - They don't exist!
asset.filename          # ❌ NO! Use asset.original_name
asset.original_filename # ❌ NO! Use asset.original_name
asset.file_name         # ❌ NO! Use asset.original_name
asset.name              # ❌ NO! Use asset.original_name
asset.file_path         # ❌ NO! Use asset.url
asset.path              # ❌ NO! Use asset.url
asset.file_url          # ❌ NO! Use asset.url
asset.storage_path      # ❌ NO! Use asset.url
```

### Relationships:
```python
asset.site      # Many-to-one: Asset belongs to Site
asset.uploader  # Many-to-one: Asset belongs to User
```

---

## Subscription Model

**File**: `app/models/subscription.py`  
**Table**: `subscriptions`

### Fields:
```python
id              # Integer, Primary Key
user_id         # Integer, Foreign Key → users.id
plan_name       # String(50), Not Null - Plan name (free, pro, business)
status          # String(20) - active, cancelled, expired
start_date      # DateTime - Subscription start
end_date        # DateTime - Subscription end
created_at      # DateTime, Default=utcnow
updated_at      # DateTime, Default=utcnow, OnUpdate=utcnow
```

### ✅ CORRECT Usage:
```python
subscription = Subscription(
    user_id=user.id,
    plan_name="pro",
    status="active",
    start_date=datetime.utcnow()
)
```

### Relationships:
```python
subscription.user  # Many-to-one: Subscription belongs to User
```

---

## Subdomain Model

**File**: `app/models/subdomain.py`  
**Table**: `subdomains`

### Fields:
```python
id              # Integer, Primary Key
site_id         # Integer, Foreign Key → sites.id, Unique
subdomain       # String(100), Unique, Not Null
status          # String(20) - pending, active, failed
created_at      # DateTime, Default=utcnow
```

### ✅ CORRECT Usage:
```python
subdomain = Subdomain(
    site_id=site.id,
    subdomain="mysite",
    status="active"
)
```

### Relationships:
```python
subdomain.site  # One-to-one: Subdomain belongs to Site
```

---

## Quick Field Lookup

### For Authentication:
```python
# Login/authentication
user = User.query.filter_by(email=email).first()  # Use 'email'
if user.check_password(password):
    login_user(user)
```

### For Display Names:
```python
# Showing user name
print(f"Hello {user.name}")              # Use 'name'
return {'user_name': user.name}          # Use 'name'
flash(f'Welcome back, {user.name}')      # Use 'name'
```

### For Profile Pictures:
```python
# Avatar URL
<img src="{{ user.avatar_url }}">        # Use 'avatar_url'
user_data['avatar'] = user.avatar_url    # Use 'avatar_url'
```

### For File Information:
```python
# Asset filename
print(f"Uploaded: {asset.original_name}")  # Use 'original_name'

# Asset URL
<img src="{{ asset.url }}">                # Use 'url'
```

---

## Verification Commands

### Check User Model Fields:
```python
python -c "from app.models.user import User; print([c.name for c in User.__table__.columns])"
# Expected: ['id', 'email', 'name', 'password_hash', 'google_id', 'avatar_url', 'role', 'created_at', 'updated_at', 'last_login']
```

### Check Asset Model Fields:
```python
python -c "from app.models.asset import Asset; print([c.name for c in Asset.__table__.columns])"
# Expected: ['id', 'site_id', 'user_id', 'original_name', 'file_size', 'file_type', 'width', 'height', 'url', 'created_at']
```

### Find Wrong Field Usage:
```bash
# Check for forbidden field names
grep -r "username\|full_name" app/ --exclude-dir=__pycache__

# Should return NO results (or only in comments)
# If found in code, replace immediately:
# - username → email (for auth) or name (for display)
# - full_name → name
```

---

## Migration History

### Why These Exact Names?

**User Model**:
- `email` instead of `username`: Email is unique identifier for login
- `name` instead of `full_name`: Simple, one field for user's display name
- `avatar_url` instead of `avatar`: Stores full URL, not just filename

**Asset Model**:
- `original_name` instead of `filename`: Preserves uploaded filename
- `url` instead of `file_path`: Can store both paths and URLs
- Dimensions (`width`, `height`): For image optimization

**These names were in the original `archive/models.py.20251117_172512` and MUST NOT be changed.**

---

## Common Mistakes and Fixes

### Mistake 1: Using `username`
```python
# ❌ WRONG
user = User.query.filter_by(username=username).first()

# ✅ CORRECT
user = User.query.filter_by(email=email).first()
```

### Mistake 2: Using `full_name`
```python
# ❌ WRONG
user = User(username=email, full_name=name)

# ✅ CORRECT
user = User(email=email, name=name)
```

### Mistake 3: Using `avatar`
```python
# ❌ WRONG
return {'avatar': user.avatar}

# ✅ CORRECT
return {'avatar_url': user.avatar_url}
```

### Mistake 4: Using `filename` or `file_path`
```python
# ❌ WRONG
asset = Asset(filename="photo.jpg", file_path="/uploads/photo.jpg")

# ✅ CORRECT
asset = Asset(original_name="photo.jpg", url="/uploads/photo.jpg")
```

---

## Summary Table

| Purpose | ✅ CORRECT | ❌ WRONG |
|---------|-----------|---------|
| User authentication | `email` | username |
| User display name | `name` | full_name, username, display_name |
| Profile picture | `avatar_url` | avatar, profile_pic, picture |
| Asset filename | `original_name` | filename, name, file_name |
| Asset location | `url` | file_path, path, file_url |

---

**CRITICAL REMINDER**: These field names come from the original code in `archive/` and are used throughout the database. Changing them would require full database migration and would break existing data. **DO NOT CHANGE THEM.**

For questions, refer to:
- Model definitions: `/backend/app/models/`
- Archive files: `/backend/archive/models.py.*`
- Architecture: `/docs/ARCHITECTURE.md`
