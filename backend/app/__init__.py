"""Flask application factory."""
from flask import Flask
from flask_login import LoginManager
from flask_migrate import Migrate
from flask_cors import CORS
from authlib.integrations.flask_client import OAuth
import os

# Initialize extensions (will be bound to app later)
from app.models import db  # Import db from new models package
migrate = Migrate()
login_manager = LoginManager()
oauth = OAuth()

# Initialize cache manager
from cache import cache


def create_app(config_name=None):
    """Create and configure Flask application."""
    # Always use absolute path for templates to ensure they are found
    template_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'templates'))
    static_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'static'))
    
    # Set instance_path to backend/instance to avoid path issues
    instance_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'instance'))
    app = Flask(__name__, template_folder=template_dir, static_folder=static_dir, instance_path=instance_path)
    
    # Load configuration from new config system
    if config_name == 'production':
        from app.config.production import ProductionConfig
        app.config.from_object(ProductionConfig)
    else:
        from app.config.development import DevelopmentConfig
        app.config.from_object(DevelopmentConfig)
        
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)
    login_manager.login_view = 'auth.login'
    login_manager.login_message = 'Please log in to access this page.'
    login_manager.login_message_category = 'info'
    
    # Configure Flask-Login to ignore API routes completely
    @login_manager.unauthorized_handler
    def unauthorized():
        """Handle unauthorized requests."""
        from flask import request, jsonify
        
        # For API routes, return JSON instead of redirect
        if request.path.startswith('/api/'):
            return jsonify({
                'success': False,
                'error': 'Authentication required',
                'message': 'Please provide a valid JWT token'
            }), 401
        
        # For web routes, use default redirect behavior
        from flask import redirect, url_for, flash
        flash(login_manager.login_message, login_manager.login_message_category)
        return redirect(url_for(login_manager.login_view, next=request.url))
    oauth.init_app(app)
    cache.init_app(app)
    
    # Setup logging
    from app.middlewares.logging_middleware import setup_logging
    setup_logging(app)
    
    # Setup JWT bypass for API routes
    from app.middleware.jwt_bypass import setup_jwt_bypass
    setup_jwt_bypass(app)
    
    # Configure login manager after initialization
    # Note: login_view and login_message will be set after app context
    
    # Configure Google OAuth
    oauth.register(
        name='google',
        client_id=app.config.get('GOOGLE_CLIENT_ID'),
        client_secret=app.config.get('GOOGLE_CLIENT_SECRET'),
        server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
        client_kwargs={'scope': 'openid email profile'}
    )
    
    # Configure CORS for Shared Cookie approach between ports
    cors_origins = ['http://localhost:6805', 'http://localhost:3000', 'http://localhost:3002', 'http://localhost:5001']
    if config_name == 'production':
        cors_origins.extend([
            'https://pagemade.site',
            'http://pagemade.site'
        ])
    
    # CORS configuration for shared cookies across ports
    CORS(app, 
         origins=cors_origins, 
         supports_credentials=True,  # Important: Allow cookies
         allow_headers=['Content-Type', 'Authorization', 'X-Requested-With'],
         methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
         expose_headers=['Set-Cookie'],  # Expose cookie headers
         vary_header=True,  # Handle cross-origin properly
         max_age=3600)  # Cache preflight for 1 hour
    
    # CRITICAL FIX: Add CORS headers for static files (CSS, fonts, images)
    # Flask-CORS does NOT automatically apply to static files - we need manual handler
    @app.after_request
    def add_cors_headers_for_static(response):
        """
        Add CORS headers to ALL responses, especially static files.
        
        This is CRITICAL for:
        - Font files (.woff2, .ttf, .woff) loaded in canvas iframe
        - CSS files loaded from Port 5000 into Port 5001 canvas
        - Images and other assets
        
        Without this, browser blocks cross-origin font/CSS loading.
        """
        from flask import request
        
        # Allow ALL origins for static files (fonts are very strict about CORS)
        response.headers['Access-Control-Allow-Origin'] = '*'
        
        # Allow credentials for API routes (override for non-static)
        if request.path.startswith('/api/') or request.path.startswith('/auth/'):
            # For API routes, use specific origins with credentials
            origin = request.headers.get('Origin')
            if origin in cors_origins:
                response.headers['Access-Control-Allow-Origin'] = origin
                response.headers['Access-Control-Allow-Credentials'] = 'true'
                # 🚨 CRITICAL: Must include Authorization header for JWT tokens
                response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With'
                response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        
        return response
    
    # Import models for Flask-Login
    from app.models import User
    
    # User loader for Flask-Login
    @login_manager.user_loader
    def load_user(user_id):
        try:
            return User.query.get(int(user_id))
        except Exception as e:
            app.logger.error(f"Error loading user {user_id}: {e}")
            return None
    
    # Template context processor
    @app.context_processor
    def inject_editor_token_generator():
        """Make generate_editor_token available in templates."""
        def generate_editor_token(page_id):
            """Generate JWT token for frontend editor access."""
            from flask import current_app
            from flask_login import current_user
            from datetime import datetime, timedelta, timezone
            import jwt
            
            # Get current user
            user = current_user
            
            # Create access token payload with page_id
            now = datetime.now(timezone.utc)
            payload = {
                'user_id': user.id,
                'email': user.email,
                'role': user.role,
                'page_id': page_id,  # Include page_id in token
                'iat': now,
                'exp': now + timedelta(hours=24),  # 24 hours expiry for editor session
                'type': 'access'
            }
            
            # Generate JWT token
            token = jwt.encode(
                payload,
                current_app.config['JWT_SECRET_KEY'],
                algorithm=current_app.config['JWT_ALGORITHM']
            )
            
            return token
        
        return dict(generate_editor_token=generate_editor_token)
    
    # Register routes (Phase 2)
    from app.routes import auth_bp, sites_bp, pages_bp, assets_bp, admin_bp
    from app.routes.api import api_bp
    from app.routes.sites_api import sites_api_bp
    from app.routes.pages_api import pages_api_bp
    from app.routes.assets_api import assets_api_bp
    
    # Initialize OAuth in auth routes
    from app.routes.auth import init_oauth
    init_oauth(oauth)
    
    # Register blueprints - match old routes structure (5 blueprints for easy scaling)
    app.register_blueprint(auth_bp)           # /login, /register, /profile (no prefix)
    app.register_blueprint(sites_bp)          # /dashboard, /site/* (no prefix)
    app.register_blueprint(pages_bp)          # /, /editor/*, /page/* (no prefix)
    app.register_blueprint(assets_bp)         # /api/assets/* (keep prefix)
    app.register_blueprint(admin_bp)          # /admin/* (keep prefix)
    app.register_blueprint(api_bp)            # /api/* (keep prefix)
    app.register_blueprint(sites_api_bp)      # /api/sites/* (new API endpoints)
    app.register_blueprint(pages_api_bp)      # /api/pages/* (new API endpoints)
    app.register_blueprint(assets_api_bp)     # /api/assets/* (new API endpoints)
    
    # Create tables and storage directory
    with app.app_context():
        # Create any missing tables - skip for now since database exists
        try:
            # Test database connection first
            from sqlalchemy import text
            with db.engine.connect() as conn:
                result = conn.execute(text("SELECT 1"))
                app.logger.info("✅ Database connection verified")
        except Exception as e:
            app.logger.error(f"❌ Database connection failed: {e}")
            # Don't try to create tables if connection fails
            app.logger.info("Skipping table creation - will handle on first request")
        
        # Create storage directory
        storage_dir = os.path.join(app.instance_path, '..', 'storage')
        os.makedirs(storage_dir, exist_ok=True)
        
        # Create uploads directory
        uploads_dir = os.path.join(static_dir, 'uploads')
        os.makedirs(uploads_dir, exist_ok=True)
        
        app.logger.info(f"✅ Flask app created successfully (config: {config_name or 'development'})")
    
    return app

# Create application instance
