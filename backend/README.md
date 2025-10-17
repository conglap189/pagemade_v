# AutoLandingPage Setup Instructions

## Google OAuth Setup

To enable Google OAuth login, follow these steps:

### 1. Google Cloud Console Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:8080/callback`
     - `http://127.0.0.1:8080/callback`
   - Copy the Client ID and Client Secret

### 2. Environment Variables
Update your `.env` file with the Google OAuth credentials:

```
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///app.db

# Google OAuth credentials (replace with your actual values)
GOOGLE_CLIENT_ID=your-google-client-id.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 3. Running the Application

1. Activate the virtual environment:
   ```bash
   source .venv/bin/activate  # Linux/Mac
   # or
   .venv\Scripts\activate     # Windows
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Initialize the database:
   ```bash
   python -c "from app import app, db; app.app_context().push(); db.create_all()"
   ```

4. Run the application:
   ```bash
   python run.py
   ```

5. Open your browser and go to `http://localhost:8080`

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