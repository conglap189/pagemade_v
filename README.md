# 🎨 PageMaker - Website Builder Platform

A professional web builder platform powered by customized GrapesJS, enabling users to create and publish websites through intuitive drag-and-drop interface.

---

## ⚠️ FOR AI AGENTS: READ FIRST

**📋 [PROJECT_RULES.md](./PROJECT_RULES.md)** - MANDATORY reading before any action

This file contains critical rules about:
- File management (when to create/update files)
- Documentation practices (update existing, don't create new)
- Temporary file naming conventions (TEMP_*, REPORT_*)
- Script management (use arguments, not variants)

**🚨 If you're an AI agent and haven't read PROJECT_RULES.md → STOP and read it now!**

---

## 🚀 Features

- **Drag & Drop Editor**: Intuitive visual editor based on PageMaker (GrapesJS)
- **Tailwind CSS**: Built-in Tailwind CSS support with pre-built blocks
- **Custom Blocks**: Extensive library of customizable components
- **Multi-Page Support**: Create multiple pages within a single site
- **Subdomain Publishing**: Instant website publishing to custom subdomains
- **Save & Load**: Automatic content persistence
- **Responsive Design**: Mobile-first, fully responsive layouts

---

## 📁 Project Structure

```
/home/helios/ver1.1/
├── .gitignore                        # Git ignore rules
├── README.md                         # This file
├── PROJECT_RULES.md                  # 🚨 File management rules (READ FIRST!)
├── landing_page.html                 # Landing page
│
├── temp/                             # 📦 Temporary files (git-ignored)
│   └── README.md                     # Temp folder guidelines
│
├── docs/                             # 📚 Complete Documentation
│   ├── README.md                     # Documentation index
│   ├── AI_QUICK_REF.md              # Quick reference for AI
│   ├── ARCHITECTURE.md               # 7-layer architecture
│   ├── REFACTORING_RULES.md         # Refactoring guidelines
│   ├── MODEL_REFERENCE.md            # Database model reference
│   ├── DEPLOYMENT_GUIDE_PRODUCTION.md # Full production deployment
│   │
│   ├── backend/                      # Backend-specific docs
│   │   ├── API.md                    # API documentation
│   │   ├── DEVELOPMENT.md            # Development guide
│   │   └── DEPLOYMENT.md             # Backend deployment
│   │
│   └── (PageMaker, GrapeJS, Subdomain guides...)
│
├── backend/                          # 🐍 Flask Backend (Port 5000)
│   ├── app/                          # 7-layer architecture
│   │   ├── routes/                   # HTTP endpoints
│   │   ├── services/                 # Business logic
│   │   ├── repositories/             # Database queries
│   │   ├── models/                   # SQLAlchemy models
│   │   ├── schemas/                  # Data validation
│   │   ├── utils/                    # Helper functions
│   │   └── middleware/               # Request interceptors
│   │
│   ├── templates/                    # Jinja2 templates
│   ├── static/                       # Static files
│   ├── instance/                     # Database files
│   ├── migrations/                   # Database migrations
│   ├── archive/                      # Original code backups
│   │
│   ├── AGENTS.md                     # AI agents guidelines
│   ├── README.md                     # Backend setup guide
│   └── requirements.txt              # Python dependencies
│
├── frontend/                         # ✏️ PageMade Editor (Port 5001)
│   ├── src/                          # Modular JavaScript source
│   │   ├── core/                     # Core editor modules
│   │   ├── modules/                  # Feature modules
│   │   └── styles/                   # CSS styles
│   ├── templates/                     # HTML templates
│   ├── dist/                          # Webpack build output
│   ├── webpack.config.js               # Webpack configuration
│   └── package.json                  # Node.js dependencies
│
├── website/                          # 🌐 Main Website (Port 3000)
│   ├── src/                          # Next.js source
│   │   ├── app/                      # App router pages
│   │   ├── components/               # React components
│   │   └── styles/                   # Global styles
│   ├── public/                        # Static assets
│   ├── next.config.js                 # Next.js configuration
│   └── package.json                  # Node.js dependencies
│
├── grapesjs/                         # 🎨 GrapesJS (Page Builder)
│   └── packages/core/
│       ├── src/                      # Source code
│       └── dist/                     # Build output
│
└── tailadmin-free-tailwind-dashboard-template-main/
    └── (Tailwind admin template)
```

### 🏗️ Service Architecture

```
┌─────────────────┬──────────────┬─────────────────────────────────┐
│    Service    │     Port     │          Purpose              │
├─────────────────┼──────────────┼─────────────────────────────────┤
│ Backend API   │     5000    │ Flask REST API & Auth       │
│ PageMaker Ed. │     5001    │ Visual Drag & Drop Editor   │
│ Main Website  │     3000    │ Next.js User Frontend      │
└─────────────────┴──────────────┴─────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend (3 Services)
- **PageMade Editor** (Port 5001) - Custom GrapesJS v0.22.13 + Webpack
- **Main Website** (Port 3000) - Next.js 14+ React application
- **Tailwind CSS** - Utility-first CSS framework (shared)
- **JavaScript ES6+** - Modern JavaScript with modular architecture

### Backend
- **Flask API** (Port 5000) - Python REST API with authentication
- **SQLAlchemy** - ORM for database operations
- **Flask-Login** - Session-based authentication
- **Flask-Migrate** - Database schema migrations
- **Flask-CORS** - Cross-origin resource sharing
- **Redis** - Caching layer (optional)

### Build Tools
- **Webpack** - Module bundling for PageMade editor
- **Babel** - JavaScript transpilation
- **Next.js** - React framework with SSR/SSG
- **PNPM** - Package manager (website)

### Infrastructure
- **Nginx** - Web server & reverse proxy
- **Gunicorn** - WSGI HTTP server (production)
- **PostgreSQL** / **SQLite** - Database systems
- **Git** - Version control

---

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/conglap189/pademade.git
cd pademade
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Setup environment
cp .env.local .env
# Edit .env with your config

# Initialize database
flask db upgrade

# Run development server
python run.py
```

Open: http://localhost:5000

### 3. Services Setup (Hybrid Architecture)

The project uses a **3-service architecture** for optimal development:

```bash
# Terminal 1: Backend API (Port 5000)
cd backend
source .venv/bin/activate
python run.py

# Terminal 2: PageMade Editor (Port 5001)
cd frontend
npm run dev

# Terminal 3: Main Website (Port 3000)
cd website
npm run dev
```

#### 🌐 Port Allocation

| Service | Port | Description | URL |
|---------|------|-------------|-----|
| **Backend API** | 5000 | Flask REST API | http://localhost:5000 |
| **PageMade Editor** | 5001 | Visual page editor | http://localhost:5001/editor/{id} |
| **Main Website** | 3000 | Next.js frontend | http://localhost:3000 |

#### 🔐 Default Login Credentials

- **Email**: `admin@pagemade.site`
- **Password**: `admin123`

#### 🚀 Quick Access

1. **Backend Admin**: http://localhost:5000/login
2. **Editor**: http://localhost:5001/editor/5 (after login)
3. **Main Website**: http://localhost:3000

#### 🛠️ Service Management

```bash
# Stop all services
pkill -f "python.*run.py"
pkill -f webpack
pkill -f "next.*dev"

# Start all services (run in separate terminals)
cd backend && python run.py &
cd frontend && npm run dev &
cd website && npm run dev &
```

#### 🔧 Service Dependencies

- **Editor (5001)** ↔ **Backend (5000)**: CORS-enabled API calls
- **Website (3000)**: Independent frontend (can integrate later)
- **Authentication**: Shared session between Editor and Backend

### 3. PageMaker Customization (Optional)

If you want to customize the editor:

```bash
cd grapesjs
pnpm install
pnpm --filter grapesjs build
```

Or use the build script:

```bash
./build-grapesjs.sh
```

---

## 📚 Documentation

- **[Deployment Guide](docs/PAGEMAKER_DEPLOYMENT_PRODUCTION.md)** - Production deployment
- **[Build Guide](docs/PAGEMAKER_BUILD_GUIDE.md)** - PageMaker build instructions
- **[Customize Guide](docs/GRAPESJS_CUSTOMIZE_GUIDE.md)** - Customization guide
- **[Subdomain System](docs/SUBDOMAIN_SYSTEM_SUMMARY.md)** - Subdomain publishing
- **[Quick Reference](DEPLOYMENT_QUICKREF.txt)** - Quick deployment reference

---

## 🔧 Development

### 🚀 Start All Services (Recommended)

For full development experience, run all 3 services in separate terminals:

```bash
# Terminal 1: Backend API (Port 5000)
cd backend
source .venv/bin/activate
python run.py

# Terminal 2: PageMade Editor (Port 5001)
cd frontend
npm run dev

# Terminal 3: Main Website (Port 3000)
cd website
npm run dev
```

### ⚡ Quick Start Scripts

```bash
# Start all services in background
./start-all-services.sh

# Stop all services
./stop-all-services.sh

# Check service status
./check-services.sh
```

### 🔗 Service Communication

- **Editor (5001)** ↔ **Backend (5000)**: CORS-enabled API calls with session authentication
- **Website (3000)**: Independent (can integrate with backend later)
- **Authentication**: Shared cookies between editor and backend

### 🛠️ Individual Service Control

```bash
# Backend only
cd backend && python run.py

# Editor only
cd frontend && npm run dev

# Website only
cd website && npm run dev
```

### 🔄 Service Restart

```bash
# Restart specific service
pkill -f "python.*run.py" && cd backend && python run.py &
pkill -f webpack && cd frontend && npm run dev &
pkill -f "next.*dev" && cd website && npm run dev &
```

### 🧪 Testing Workflow

1. **Login**: http://localhost:5000/login (admin@pagemade.site / admin123)
2. **Editor**: http://localhost:5001/editor/5 (auto-authenticated)
3. **Website**: http://localhost:3000 (independent)

### Build PageMaker (After Customization)

```bash
./build-grapesjs.sh
```

This will:
1. Build PageMaker from GrapesJS source
2. Output: `pagemaker.min.js` + `pagemaker.min.css`
3. Copy to `backend/static/pagemaker/`

### Database Migrations

```bash
cd backend
flask db migrate -m "Description"
flask db upgrade
```

---

## 🚀 Production Deployment

### Quick Deploy

```bash
# On VPS
git pull origin main
sudo systemctl restart pagemade
```

**Note:** No need to deploy `grapesjs/` folder to production. Only deploy built files in `backend/static/pagemaker/`.

See [Deployment Guide](docs/PAGEMAKER_DEPLOYMENT_PRODUCTION.md) for details.

---

## 🗂️ Key Files

### Configuration
- `backend/.env` - Environment variables
- `backend/config.py` - Flask configuration
- `backend/wsgi.py` - WSGI entry point

### Application
- `backend/app/routes.py` - API routes
- `backend/app/models.py` - Database models
- `backend/templates/editor_pagemaker_v2.html` - Editor interface

### Scripts
- `build-grapesjs.sh` - Build PageMaker
- `backend/setup.sh` - Initial setup
- `backend/deploy_production.sh` - Production deployment

---

## 🌐 Features Workflow

### 1. Create Site
```
User → Create Site → Enter subdomain → Site created
```

### 2. Create Pages
```
Site → Create Page → Page 1 (Homepage)
     → Create Page → Page 2 (slug: about)
```

### 3. Edit with PageMaker
```
Editor → Drag & Drop blocks → Customize styles → Save
```

### 4. Publish
```
Save → Publish → Deploy to subdomain
```

**Result:**
- Homepage: `https://subdomain.pagemade.site`
- Page 2: `https://subdomain.pagemade.site/about`

---

## 🔐 Environment Variables

Create `.env` file in `backend/`:

```bash
# Flask
FLASK_APP=run.py
FLASK_ENV=development
SECRET_KEY=your-secret-key

# Database
DATABASE_URL=sqlite:///instance/pagemade.db

# Redis (optional)
REDIS_URL=redis://localhost:6379/0

# Subdomain
SUBDOMAIN_BASE_DOMAIN=pagemade.site
SUBDOMAIN_DEPLOY_PATH=/var/www/subdomains
```

---

## 🧪 Testing

```bash
cd backend
python -m pytest
```

---

## 📦 Dependencies

### Python (Backend)
```
Flask==2.3.0
SQLAlchemy==2.0.0
Flask-Login==0.6.2
Flask-Migrate==4.0.0
Gunicorn==20.1.0
Redis==4.5.0
```

### Node.js (Development Only)
```
pnpm (for building PageMaker)
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📝 License

This project is proprietary software.

---

## 👥 Team

- **Development**: PageMaker Team
- **Maintainer**: conglap189

---

## 📧 Support

For issues and questions:
- GitHub Issues: [Create Issue](https://github.com/conglap189/pademade/issues)
- Email: support@pagemade.site

---

## 🔄 Changelog

### v1.0.0 (2025-10-17)
- ✅ PageMaker editor integration
- ✅ Subdomain publishing system
- ✅ Save/Load functionality
- ✅ Multi-page support
- ✅ Tailwind CSS blocks
- ✅ Production deployment

---

## 🎯 Roadmap

- [ ] Template library
- [ ] Asset manager (images, files)
- [ ] Custom domain support
- [ ] Export to static HTML
- [ ] AI-powered content generation
- [ ] SEO optimization tools
- [ ] Analytics integration

---

**Made with ❤️ by PageMaker Team**
