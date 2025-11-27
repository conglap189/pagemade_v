# AI Agent Quick Reference - PageMade Backend

## ⚡ 30-Second Rules

### Before ANY code change:
1. ✅ Check existing files - DON'T create duplicates
2. ✅ Use EXACT model field names from [MODEL_REFERENCE.md](./MODEL_REFERENCE.md)
3. ✅ Place code in correct layer (see below)
4. ✅ Copy from archive/, DON'T rewrite logic
5. ✅ Test immediately after change

---

## 🏗️ 7-Layer Architecture (One Line Each)

1. **routes/** - HTTP in/out, call services, return JSON
2. **services/** - Business logic, call repositories, return (bool, data, error)
3. **repositories/** - DB queries ONLY, return models or None
4. **models/** - SQLAlchemy definitions, relationships, helper methods
5. **schemas/** - Marshmallow validation, serialize/deserialize
6. **utils/** - Pure functions, NO DB, NO business logic
7. **middleware/** - Request/response interceptors, auth checks

---

## 📋 Model Fields (IMMUTABLE)

### User Model:
- ✅ `email` (for auth), `name` (for display), `avatar_url`
- ❌ NOT: username, full_name, avatar

### Asset Model:
- ✅ `original_name` (filename), `url` (path/URL)
- ❌ NOT: filename, file_path, file_url

---

## 📂 Existing Files (DO NOT DUPLICATE)

**Routes**: auth.py, sites.py, admin.py, api.py, main.py  
**Services**: auth_service.py, site_service.py, asset_service.py  
**Repositories**: user_repository.py, site_repository.py, asset_repository.py  
**Models**: user.py, site.py, asset.py, subscription.py

---

## 🚨 Common Mistakes

| ❌ WRONG | ✅ CORRECT |
|---------|-----------|
| `User.query.filter_by(username=...)` | `User.query.filter_by(email=...)` |
| `user.full_name or user.username` | `user.name` |
| `asset.filename` | `asset.original_name` |
| `asset.file_path` | `asset.url` |
| DB query in routes | DB query in repositories |
| Business logic in repositories | Business logic in services |
| Creating `user_routes.py` | Use existing `auth.py` |

---

## 📖 Full Documentation

- **Architecture**: [/docs/ARCHITECTURE.md](./ARCHITECTURE.md) - Complete guide with examples
- **Refactoring**: [/docs/REFACTORING_RULES.md](./REFACTORING_RULES.md) - 6 golden rules
- **Models**: [/docs/MODEL_REFERENCE.md](./MODEL_REFERENCE.md) - Exact field names
- **Commands**: [/backend/AGENTS.md](/backend/AGENTS.md) - Command reference

---

## 🎯 Decision Tree

**Need to add feature?**
→ Check existing files → Add to existing → Create new ONLY if necessary

**Refactoring old code?**
→ Read archive/ → Copy exact logic → Split by layer → Test

**Getting errors?**
→ Check field names → Check layer boundaries → Compare with archive/ → Fix

---

**READ FULL DOCS BEFORE MAKING CHANGES!**
