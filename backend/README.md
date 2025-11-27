# PageMade Backend# PageMade Backend



Flask backend for PageMade website builder platform with 7-layer architecture.Flask backend for PageMade website builder platform.



## 📁 Project Structure## 📁 Project Structure



``````

backend/backend/

├── AGENTS.md              # ⚠️ AI agents guidelines (READ FIRST for AI)├── AGENTS.md              # AI agents guidelines (READ FIRST for AI)

├── README.md              # This file├── README.md              # This file

├── run.py                 # Application runner (supports --local flag)├── run.py                 # Application runner (use --local for dev)

├── wsgi.py                # WSGI entry point for production├── wsgi.py                # WSGI entry point for production

├── config.py              # Application configuration├── config.py              # Application configuration

├── cache.py               # Cache configuration├── cache.py               # Cache configuration

├── pytest.ini             # Pytest configuration├── pytest.ini             # Pytest configuration

├── requirements.txt       # Python dependencies├── requirements.txt       # Python dependencies

││

├── config/                # 📂 Configuration files├── config/                # Configuration files

│   ├── README.md│   ├── .env.example       # Environment template

│   ├── .env.example       # Template (safe to commit)│   ├── .env.local         # Local dev config (not committed)

│   ├── .env.local         # Local dev (DO NOT COMMIT)│   ├── .env.production    # Production config (not committed)

│   ├── .env.production    # Production (DO NOT COMMIT)│   └── nginx_subdomain.conf

│   └── nginx_subdomain.conf│

│├── docs/                  # Backend documentation

├── docs/                  # 📂 Backend documentation│   ├── README.md

│   ├── README.md│   ├── ADMIN_MANAGEMENT.md

│   ├── ADMIN_MANAGEMENT.md│   ├── ADMIN_QUICKSTART.md

│   ├── ADMIN_QUICKSTART.md│   ├── HUONG_DAN_ADMIN.md

│   ├── HUONG_DAN_ADMIN.md│   └── CUSTOM_BLOCKS_SUMMARY.md

│   └── CUSTOM_BLOCKS_SUMMARY.md│

│├── scripts/               # Operational scripts

├── scripts/               # 📂 Operational scripts│   ├── deployment/        # Deploy scripts

│   ├── README.md│   ├── setup/            # Setup scripts

│   ├── deployment/        # Deploy scripts│   ├── maintenance/      # Maintenance scripts

│   ├── setup/            # Setup scripts│   └── utils/            # Utility scripts

│   ├── maintenance/      # Maintenance scripts│

│   └── utils/            # Utility scripts├── app/                   # Main application (7-layer architecture)

││   ├── routes/           # HTTP endpoints

├── app/                   # 📂 Main application (7-layer architecture)│   ├── services/         # Business logic

│   ├── routes/           # Layer 1: HTTP endpoints│   ├── repositories/     # Database operations

│   ├── services/         # Layer 2: Business logic│   ├── models/           # SQLAlchemy models

│   ├── repositories/     # Layer 3: Database operations│   ├── schemas/          # Data validation

│   ├── models/           # Layer 4: SQLAlchemy models│   ├── utils/            # Helper functions

│   ├── schemas/          # Layer 5: Data validation│   └── middleware/       # Request/response processing

│   ├── utils/            # Layer 6: Helper functions│

│   └── middleware/       # Layer 7: Request/response processing├── tests/                 # Test suite

││   ├── unit/             # Unit tests

├── tests/                 # 📂 Test suite│   ├── integration/      # Integration tests

│   ├── unit/             # Unit tests│   └── e2e/              # End-to-end tests

│   ├── integration/      # Integration tests│

│   └── e2e/              # End-to-end tests├── migrations/            # Database migrations

│├── instance/              # Instance-specific data

├── migrations/            # Database migrations├── static/                # Static files

├── instance/              # Instance data (gitignored)├── storage/               # User uploads

├── static/                # Static assets├── templates/             # HTML templates

├── storage/               # User uploads (gitignored)└── logs/                  # Application logs

├── templates/             # HTML templates```

├── logs/                  # Logs (gitignored)

└── venv/                  # Virtual environment (gitignored)## 🚀 Quick Start

```

### 1. Setup Environment

## 🚀 Quick Start1. Go to [Google Cloud Console](https://console.cloud.google.com/)

2. Create a new project or select an existing one

### 1. Setup Environment3. Enable the Google+ API:

   - Go to "APIs & Services" > "Library"

```bash   - Search for "Google+ API" and enable it

# Create and activate virtual environment4. Create OAuth 2.0 credentials:

python3 -m venv venv   - Go to "APIs & Services" > "Credentials"

source venv/bin/activate  # Linux/Mac   - Click "Create Credentials" > "OAuth 2.0 Client IDs"

   - Choose "Web application"

# Install dependencies   - Add authorized redirect URIs:

pip install -r requirements.txt     - `http://localhost:8080/callback`

     - `http://127.0.0.1:8080/callback`

# Configure environment   - Copy the Client ID and Client Secret

cp config/.env.example config/.env.local

nano config/.env.local  # Edit with your values## 🚀 Quick Start

```

### 1. Setup Environment

### 2. Initialize Database

```bash

```bash# Create virtual environment

flask db initpython -m venv venv

flask db migrate -m "Initial migration"source venv/bin/activate  # Linux/Mac

flask db upgrade# or: venv\Scripts\activate  # Windows

```

# Install dependencies

### 3. Run Applicationpip install -r requirements.txt



```bash# Setup configuration

# Development modecp config/.env.example config/.env.local

python run.py --localnano config/.env.local  # Edit with your values

```

# Production mode

python run.py### 2. Initialize Database

```

```bash

## 🔧 Configurationflask db init

flask db migrate -m "Initial migration"

All config files in `/config/` directory. Required variables:flask db upgrade

```

```bash

SECRET_KEY=your-secret-key### 3. Run Application

DATABASE_URL=sqlite:///instance/app.db

GOOGLE_CLIENT_ID=your-client-id**Development mode:**

GOOGLE_CLIENT_SECRET=your-client-secret```bash

```python run.py --local

# or

## 🏗️ Architecturepython run.py --dev

```

**7-layer architecture:**

Routes → Services → Repositories → Models**Production mode:**

```bash

See `/docs/ARCHITECTURE.md` for details.python run.py

```

## 📜 Scripts

## 🔧 Configuration

- **Setup:** `./scripts/setup/setup.sh`

- **Deploy:** `./scripts/deployment/deploy_production.sh`### Environment Files

- **Admin:** `python scripts/utils/manage_admin.py`

All config files are in `/config/` directory:

See `scripts/README.md` for all scripts.

- **`.env.example`** - Template with all available options

## 📚 Documentation- **`.env.local`** - Your local development config

- **`.env.production`** - Production configuration

- `/backend/AGENTS.md` - AI guidelines

- `/backend/docs/` - Backend docs### Google OAuth Setup

- `/docs/` - Project docs   ```



## 🚨 For AI Agents4. Run the application:

   ```bash

READ FIRST:   python run.py

1. `/PROJECT_RULES.md` - File management   ```

2. `/backend/AGENTS.md` - Backend guidelines

3. `/docs/ARCHITECTURE.md` - Architecture5. Open your browser and go to `http://localhost:8080`


## Features Implemented

✅ **Phase 1 MVP Features:**
- [x] Flask application with SQLAlchemy models
- [x] Google OAuth login setup (needs credentials)
- [x] Database schema (User, Site, Page models)
- [x] REST API endpoints:
  - `POST /api/sites` - Create new site
  - `POST /api/pages` - Create new page
  - `POST /api/pages/{id}/publish` - Publish page HTML
- [x] Main landing page
- [x] User dashboard with profile and site management
- [x] Site and page creation forms
- [x] Basic HTML editor (Silex integration ready)
- [x] File storage system for published pages

## Next Steps

1. **Set up Google OAuth credentials** as described above
2. **Integrate Silex Editor** - Replace the textarea with actual Silex editor
3. **Domain/Subdomain routing** - Configure Nginx or similar for subdomain routing
4. **Production deployment** - Set up proper hosting and domain

## File Structure

```
test_GPT/
├── app/
│   ├── __init__.py          # Flask app initialization
│   ├── models.py            # Database models
│   ├── routes.py            # API and web routes
│   └── templates/           # HTML templates
│       ├── base.html
│       ├── index.html       # Landing page
│       ├── dashboard.html   # User dashboard
│       ├── new_site.html    # Create site form
│       ├── new_page.html    # Create page form
│       ├── site_detail.html # Site management
│       └── editor.html      # Page editor
├── storage/                 # Published HTML files
├── config.py                # Application configuration
├── run.py                   # Application entry point
├── requirements.txt         # Python dependencies
└── .env                     # Environment variables
```

## API Endpoints

- `GET /` - Landing page
- `GET /login` - Initiate Google OAuth
- `GET /callback` - OAuth callback
- `GET /dashboard` - User dashboard
- `POST /api/sites` - Create site
- `POST /api/pages` - Create page
- `POST /api/pages/{id}/publish` - Publish page

The application is now ready for development and testing!