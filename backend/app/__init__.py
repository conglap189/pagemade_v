from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_migrate import Migrate
from flask_cors import CORS
from authlib.integrations.flask_client import OAuth
from config import Config
import os

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()
login_manager = LoginManager()
oauth = OAuth()

# Initialize cache manager
from cache import cache

def create_app(config_name=None):
    # Always use absolute path for templates to ensure they are found
    template_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'templates'))
    static_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'static'))
    
    app = Flask(__name__, template_folder=template_dir, static_folder=static_dir)
    
    # Load configuration
    if config_name == 'production':
        app.config.from_object('config.ProductionConfig')
    else:
        app.config.from_object('config.DevelopmentConfig')
        
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)
    oauth.init_app(app)
    cache.init_app(app)
    
    # Configure CORS for Next.js integration - support both dev and production
    cors_origins = ['http://localhost:6805', 'http://localhost:3000', 'http://localhost:3002']  # Development
    if config_name == 'production':
        cors_origins.extend([
            'https://pagemade.site',
            'http://pagemade.site'
        ])
    
    CORS(app, 
         origins=cors_origins, 
         supports_credentials=True,
         allow_headers=['Content-Type', 'Authorization'],
         methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])
    
    
    # Configure login manager
    login_manager.login_view = 'auth.login'
    login_manager.login_message = 'Vui lòng đăng nhập để truy cập trang này.'
    
    # Import models
    from . import models
    from .models import User
    
    # User loader for Flask-Login
    @login_manager.user_loader
    def load_user(user_id):
        try:
            return User.query.get(int(user_id))
        except Exception as e:
            print(f"⚠️  Error loading user {user_id}: {e}")
            return None
    
    # Register blueprints
    from .routes import auth_bp, main_bp, api_bp
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(main_bp)
    app.register_blueprint(api_bp, url_prefix='/api')
    
    # Create tables and storage directory
    with app.app_context():
        # Create any missing tables
        db.create_all()
        
        # Create storage directory
        storage_dir = os.path.join(app.instance_path, '..', 'storage')
        os.makedirs(storage_dir, exist_ok=True)
    
    return app

# Create application instance
