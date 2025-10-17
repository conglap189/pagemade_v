# 🎨 PageMaker - Website Builder Platform

A professional web builder platform powered by customized GrapesJS, enabling users to create and publish websites through intuitive drag-and-drop interface.

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
├── .gitignore                 # Git ignore rules
├── README.md                  # This file
├── DEPLOYMENT_QUICKREF.txt    # Quick deployment reference
├── CLEANUP_PLAN.md            # Project cleanup documentation
├── build-grapesjs.sh          # Build script for PageMaker
│
├── docs/                      # Documentation
│   ├── GRAPESJS_CUSTOMIZE_GUIDE.md
│   ├── PAGEMAKER_BUILD_GUIDE.md
│   ├── PAGEMAKER_DEPLOYMENT_PRODUCTION.md
│   ├── PAGEMAKER_INTEGRATION.md
│   ├── PAGEMAKER_PROFESSIONAL_CHECKLIST.md
│   ├── SUBDOMAIN_SYSTEM_SUMMARY.md
│   └── SUBDOMAIN_USER_GUIDE.md
│
├── grapesjs/                  # GrapesJS source (local development only)
│   └── packages/core/
│       ├── src/               # Source code for customization
│       └── dist/              # Build output
│
└── backend/                   # Flask backend application
    ├── app/                   # Flask application
    ├── templates/             # Jinja2 templates
    ├── static/                # Static files (CSS, JS, images)
    ├── migrations/            # Database migrations
    └── requirements.txt       # Python dependencies
```

---

## 🛠️ Tech Stack

### Frontend
- **PageMaker** (Custom GrapesJS v0.22.13) - Visual editor
- **Tailwind CSS** - Utility-first CSS framework
- **JavaScript ES6+** - Modern JavaScript

### Backend
- **Flask** - Python web framework
- **SQLAlchemy** - ORM for database
- **Flask-Login** - User authentication
- **Flask-Migrate** - Database migrations
- **Redis** - Caching (optional)

### Infrastructure
- **Nginx** - Web server & reverse proxy
- **Gunicorn** - WSGI HTTP server
- **PostgreSQL** / **SQLite** - Database
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
python run_local.py
```

Open: http://localhost:5000

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

### Run Local Server

```bash
cd backend
source .venv/bin/activate
python run_local.py
```

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
