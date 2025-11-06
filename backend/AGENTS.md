# Development Guidelines for PageMade Flask Application

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

## File Structure
- `/app/`: Core Flask application (models, routes, static)
- `/templates/`: Jinja2 HTML templates
- `/storage/sites/`: Published website files
- Environment configs: `.env.local` (dev), `.env.production` (prod)