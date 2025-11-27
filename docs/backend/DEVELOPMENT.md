# Development Guide

Complete guide for setting up and developing the PageMaker application.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Running the Application](#running-the-application)
4. [Development Workflow](#development-workflow)
5. [Testing](#testing)
6. [Code Standards](#code-standards)
7. [Database Management](#database-management)
8. [Debugging](#debugging)
9. [Common Tasks](#common-tasks)

---

## Prerequisites

### Required Software

- **Python:** 3.9+ (recommended: 3.11)
- **PostgreSQL:** 14+ (or SQLite for development)
- **Redis:** 7+ (optional, for caching)
- **Node.js:** 18+ (for frontend)
- **Git:** 2.30+

### Recommended Tools

- **Python IDE:** VS Code, PyCharm
- **Database Client:** pgAdmin, DBeaver
- **API Testing:** Postman, Insomnia
- **Redis Client:** RedisInsight

---

## Initial Setup

### 1. Clone Repository

```bash
git clone https://github.com/conglap189/pagemade_v.git
cd pagemade_v/backend
```

### 2. Create Virtual Environment

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# Linux/Mac:
source venv/bin/activate
# Windows:
venv\Scripts\activate
```

### 3. Install Dependencies

```bash
# Install production dependencies
pip install -r requirements.txt

# Install development dependencies
pip install -r requirements_local.txt

# Install test dependencies
pip install -r requirements_test.txt
```

### 4. Environment Configuration

Create `.env` file in backend directory:

```bash
# Copy from example
cp .env.example .env

# Edit with your settings
nano .env
```

**Required Environment Variables:**

```env
# Flask Configuration
FLASK_APP=run_local.py
FLASK_ENV=development
SECRET_KEY=your-secret-key-here-change-in-production

# Database
DATABASE_URL=sqlite:///app.db
# Or PostgreSQL:
# DATABASE_URL=postgresql://user:password@localhost/pagemaker_dev

# Redis (optional)
REDIS_URL=redis://localhost:6379/0

# Upload Settings
UPLOAD_FOLDER=/home/helios/ver1.1/backend/storage/uploads
MAX_UPLOAD_SIZE=10485760  # 10MB in bytes

# Session
SESSION_TYPE=filesystem
PERMANENT_SESSION_LIFETIME=86400  # 1 day in seconds

# CORS (development)
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5000

# Debug
DEBUG=True
TESTING=False
```

### 5. Initialize Database

```bash
# Create database tables
flask db upgrade

# Create initial admin user (optional)
python manage_admin.py create admin admin@example.com password123
```

### 6. Create Required Directories

```bash
mkdir -p storage/uploads
mkdir -p logs
mkdir -p instance
```

---

## Running the Application

### Development Server

```bash
# Activate virtual environment
source venv/bin/activate

# Run development server
python run_local.py

# Or with Flask CLI
flask run --debug --host=0.0.0.0 --port=5000
```

**Access:**
- Application: http://localhost:5000
- API: http://localhost:5000/api

### Production Server

```bash
# Using Gunicorn
gunicorn -c gunicorn.conf.py wsgi:app

# Or manually
gunicorn --workers 4 --bind 0.0.0.0:5000 wsgi:app
```

---

## Development Workflow

### 1. Feature Development

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes
# ... code changes ...

# Run tests
pytest

# Commit changes
git add .
git commit -m "Add new feature: description"

# Push to remote
git push origin feature/new-feature

# Create Pull Request on GitHub
```

### 2. Code Organization

**Adding New Route:**

```bash
# 1. Create route in appropriate blueprint
# File: app/routes/sites.py

@sites_bp.route('/api/sites', methods=['POST'])
@require_api_auth
def create_site():
    data = request.get_json()
    result = SiteService.create_site(current_user.id, data)
    return jsonify(result), 201
```

**Adding New Service:**

```bash
# 2. Add business logic to service
# File: app/services/site_service.py

class SiteService:
    @staticmethod
    def create_site(user_id, data):
        # Validate data
        Validators.validate_required(data.get('name'), 'name')
        
        # Create site via repository
        site = SiteRepository.create(user_id, data)
        
        return {'success': True, 'site': site}
```

**Adding New Repository Method:**

```bash
# 3. Add data access logic
# File: app/repositories/site_repository.py

class SiteRepository:
    @staticmethod
    def create(user_id, data):
        site = Site(
            name=data['name'],
            subdomain=data['subdomain'],
            user_id=user_id
        )
        db.session.add(site)
        db.session.commit()
        return site
```

### 3. Adding Tests

```bash
# Unit test
# File: tests/unit/test_site_service.py

def test_create_site_success(app, db_session, sample_user):
    with app.app_context():
        site_data = {
            'name': 'Test Site',
            'subdomain': 'testsite'
        }
        result = SiteService.create_site(sample_user.id, site_data)
        assert result['success'] is True
```

---

## Testing

### Running Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html --cov-report=term

# Run specific test file
pytest tests/unit/test_auth_service.py

# Run specific test class
pytest tests/unit/test_auth_service.py::TestAuthServiceLogin

# Run specific test
pytest tests/unit/test_auth_service.py::TestAuthServiceLogin::test_login_success

# Run with markers
pytest -m unit              # Unit tests only
pytest -m integration       # Integration tests only
pytest -m "not slow"        # Skip slow tests
```

### Writing Tests

**Unit Test Template:**

```python
# tests/unit/test_example_service.py
import pytest
from app.services.example_service import ExampleService

class TestExampleService:
    def test_example_method(self, app, db_session):
        with app.app_context():
            # Arrange
            input_data = {'key': 'value'}
            
            # Act
            result = ExampleService.method(input_data)
            
            # Assert
            assert result['success'] is True
            assert 'data' in result
```

**Integration Test Template:**

```python
# tests/integration/test_example_routes.py
import pytest
import json

class TestExampleRoutes:
    def test_endpoint(self, client, auth_headers):
        # Act
        response = client.post('/api/endpoint',
            headers=auth_headers,
            json={'key': 'value'}
        )
        
        # Assert
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] is True
```

### Test Coverage

```bash
# Generate coverage report
pytest --cov=app --cov-report=html

# View report
firefox htmlcov/index.html
```

**Target Coverage:** 80%+

---

## Code Standards

### Python Style Guide

**Follow PEP 8:**
- 4 spaces for indentation
- Max line length: 88 characters (Black formatter)
- Use snake_case for functions/variables
- Use PascalCase for classes

**Example:**

```python
# Good
def calculate_total_price(items):
    """Calculate total price of items."""
    total = sum(item.price for item in items)
    return total

# Bad
def CalculateTotalPrice(Items):
    Total=sum([item.price for item in Items])
    return Total
```

### Docstrings

**Use Google-style docstrings:**

```python
def create_site(user_id, data):
    """
    Create a new site for user.
    
    Args:
        user_id (int): ID of the user creating the site
        data (dict): Site data containing name, subdomain, etc.
        
    Returns:
        dict: Result with success flag and site object
        
    Raises:
        ValidationError: If data is invalid
        AuthorizationError: If user lacks permissions
        
    Example:
        >>> create_site(1, {'name': 'My Site', 'subdomain': 'mysite'})
        {'success': True, 'site': {...}}
    """
    pass
```

### Import Organization

**Order:**

1. Standard library imports
2. Third-party imports
3. Local application imports

```python
# Standard library
import os
import json
from datetime import datetime

# Third-party
from flask import request, jsonify
from sqlalchemy import func

# Local
from app.models import User, Site
from app.services import AuthService
from app.utils import Validators
```

### Naming Conventions

- **Files:** `snake_case.py`
- **Classes:** `PascalCase`
- **Functions:** `snake_case`
- **Constants:** `UPPER_CASE`
- **Private methods:** `_leading_underscore`

### Error Handling

**Use custom exceptions:**

```python
from app.middlewares import ValidationError, AuthorizationError

def update_site(site_id, user_id, data):
    site = Site.query.get(site_id)
    
    if not site:
        raise ResourceNotFoundError('Site', site_id)
    
    if site.user_id != user_id:
        raise AuthorizationError('You do not own this site')
    
    if not data.get('name'):
        raise ValidationError('Site name is required', field='name')
    
    # Update site...
```

---

## Database Management

### Migrations

**Create Migration:**

```bash
# After model changes
flask db migrate -m "Add new field to User model"

# Review migration file
# File: migrations/versions/xxx_add_new_field.py

# Apply migration
flask db upgrade

# Rollback migration
flask db downgrade
```

**Manual Migration:**

```python
# migrations/versions/xxx_manual_migration.py
from alembic import op
import sqlalchemy as sa

def upgrade():
    op.add_column('users', sa.Column('phone', sa.String(20)))
    
def downgrade():
    op.drop_column('users', 'phone')
```

### Database Console

```bash
# Open Flask shell
flask shell

# Query database
>>> from app.models import User, Site
>>> users = User.query.all()
>>> print(users)
>>> site = Site.query.filter_by(subdomain='test').first()
>>> print(site.user.username)
```

### Seeding Data

```python
# scripts/seed_data.py
from app import create_app, db
from app.models import User, Site, Page

app = create_app()

with app.app_context():
    # Create test users
    user = User(username='testuser', email='test@example.com')
    user.set_password('password123')
    db.session.add(user)
    
    # Create test sites
    site = Site(name='Test Site', subdomain='testsite', user=user)
    db.session.add(site)
    
    # Create test pages
    page = Page(title='Home', slug='home', site=site)
    db.session.add(page)
    
    db.session.commit()
    print('Data seeded successfully!')
```

Run:
```bash
python scripts/seed_data.py
```

---

## Debugging

### VS Code Debug Configuration

Create `.vscode/launch.json`:

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Flask",
            "type": "python",
            "request": "launch",
            "module": "flask",
            "env": {
                "FLASK_APP": "run_local.py",
                "FLASK_ENV": "development"
            },
            "args": [
                "run",
                "--no-debugger",
                "--no-reload"
            ],
            "jinja": true,
            "justMyCode": true
        },
        {
            "name": "Pytest",
            "type": "python",
            "request": "launch",
            "module": "pytest",
            "args": [
                "-v",
                "${file}"
            ],
            "justMyCode": false
        }
    ]
}
```

### Logging

**Enable debug logging:**

```python
# In development
import logging
logging.basicConfig(level=logging.DEBUG)

# Or via config
DEBUG = True
```

**View logs:**

```bash
# Application logs
tail -f logs/app.log

# Error logs
tail -f logs/errors.log

# Nginx logs (production)
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Interactive Debugging

**Using pdb:**

```python
# Add breakpoint
import pdb; pdb.set_trace()

# Or Python 3.7+
breakpoint()
```

**Commands:**
- `n` - Next line
- `s` - Step into function
- `c` - Continue
- `p variable` - Print variable
- `l` - List code
- `q` - Quit

---

## Common Tasks

### Create Admin User

```bash
python manage_admin.py create username email@example.com password
```

### Clear Cache

```bash
# Clear Redis cache
python clear_cache.py

# Or manually
redis-cli FLUSHDB
```

### Export Database

```bash
# SQLite
cp app.db backups/app_$(date +%Y%m%d).db

# PostgreSQL
pg_dump pagemaker_dev > backups/db_$(date +%Y%m%d).sql
```

### Reset Database

```bash
# Drop all tables
flask db downgrade base

# Recreate tables
flask db upgrade

# Seed data
python scripts/seed_data.py
```

### Check Dependencies

```bash
# List installed packages
pip list

# Check for updates
pip list --outdated

# Update package
pip install --upgrade package-name

# Update requirements
pip freeze > requirements.txt
```

### Code Formatting

```bash
# Install formatters
pip install black isort flake8

# Format code with Black
black app/ tests/

# Sort imports
isort app/ tests/

# Check style
flake8 app/ tests/
```

### Pre-commit Hooks

Create `.git/hooks/pre-commit`:

```bash
#!/bin/bash

# Run tests
pytest || exit 1

# Check formatting
black --check app/ tests/ || exit 1

# Check imports
isort --check app/ tests/ || exit 1

# Lint code
flake8 app/ tests/ || exit 1

echo "Pre-commit checks passed!"
```

Make executable:
```bash
chmod +x .git/hooks/pre-commit
```

---

## Environment-Specific Settings

### Development

```python
# config/development.py
DEBUG = True
TESTING = False
SQLALCHEMY_DATABASE_URI = 'sqlite:///app.db'
SQLALCHEMY_ECHO = True  # Log all SQL queries
```

### Testing

```python
# config/testing.py
TESTING = True
SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
WTF_CSRF_ENABLED = False
```

### Production

```python
# config/production.py
DEBUG = False
TESTING = False
SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')
SESSION_COOKIE_SECURE = True
SESSION_COOKIE_HTTPONLY = True
```

---

## Troubleshooting

### Common Issues

**1. Import Errors**
```bash
# Solution: Reinstall dependencies
pip install -r requirements.txt
```

**2. Database Locked (SQLite)**
```bash
# Solution: Close all connections
flask shell
>>> from app import db
>>> db.session.remove()
```

**3. Migration Conflicts**
```bash
# Solution: Reset migrations
rm -rf migrations/
flask db init
flask db migrate
flask db upgrade
```

**4. Port Already in Use**
```bash
# Find process
lsof -i :5000

# Kill process
kill -9 <PID>
```

**5. Redis Connection Error**
```bash
# Check Redis status
redis-cli ping

# Start Redis
redis-server

# Or disable Redis in config
REDIS_URL=None
```

---

## Performance Tips

### 1. Database Queries

**Use eager loading:**
```python
# Bad (N+1 query)
sites = Site.query.all()
for site in sites:
    print(site.user.username)  # Extra query per site

# Good
sites = Site.query.options(db.joinedload(Site.user)).all()
for site in sites:
    print(site.user.username)  # No extra queries
```

### 2. Caching

**Cache expensive operations:**
```python
from flask_caching import Cache

cache = Cache(app)

@cache.memoize(timeout=300)
def get_site_stats(site_id):
    # Expensive calculation
    return stats
```

### 3. Pagination

**Always paginate large datasets:**
```python
# Bad
sites = Site.query.all()

# Good
sites = Site.query.paginate(page=1, per_page=20)
```

---

## Resources

### Documentation
- [Flask Documentation](https://flask.palletsprojects.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [pytest Documentation](https://docs.pytest.org/)

### Code Style
- [PEP 8](https://pep8.org/)
- [Google Python Style Guide](https://google.github.io/styleguide/pyguide.html)

### Tools
- [Black Formatter](https://black.readthedocs.io/)
- [isort](https://pycqa.github.io/isort/)
- [flake8](https://flake8.pycqa.org/)

---

**Last Updated:** November 17, 2025  
**Version:** 1.0.0
