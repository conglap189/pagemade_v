from flask import Blueprint, request, jsonify, abort
from flask_login import login_required, current_user
from app.models.page import Page
from app.models.site import Site
from app import db
from app.middleware.jwt_auth import jwt_required, optional_jwt
from app.services.jwt_service import JWTService
from datetime import datetime

api_bp = Blueprint('api', __name__, url_prefix='/api')

@api_bp.route('/health', methods=['GET'])
def health_check():
    """Simple health check endpoint for debugging."""
    return jsonify({
        'status': 'healthy', 
        'timestamp': datetime.now().isoformat(),
        'message': 'API is running'
    }), 200

@api_bp.route('/pages', methods=['POST'])
@jwt_required
def create_page():
    """Create page with JWT authentication."""
    data = request.get_json()
    
    if not data or 'site_id' not in data:
        return jsonify({'error': 'Missing site_id'}), 400
    
    site = Site.query.get_or_404(data['site_id'])
    
    # Check if user owns the site (using JWT user)
    if site.user_id != request.current_user.id:
        abort(403)
    data = request.get_json()
    
    if not data or 'site_id' not in data:
        return jsonify({'error': 'Missing site_id'}), 400
    
    site = Site.query.get_or_404(data['site_id'])
    
    # NEW: Create page with auto-generated slug
    page = Page(
        title=data['title'],
        description=data.get('description', ''),
        template=data.get('template', 'default'),
        site_id=site.id,
        user_id=request.current_user.id  # ✅ FIX: Add user_id from JWT
    )
    
    # NEW: Generate slug from title
    page.slug = page.generate_slug()
    
    # NEW: If this is the first page, make it homepage
    if not site.get_homepage():
        page.is_homepage = True
    
    db.session.add(page)
    db.session.commit()
    
    return jsonify(page.to_dict()), 201