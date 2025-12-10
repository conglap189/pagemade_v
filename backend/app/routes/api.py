from flask import Blueprint, request, jsonify, abort, current_app
from flask_login import login_required, current_user
from app.models.page import Page
from app.models.site import Site
from app import db
from app.middleware.jwt_auth import jwt_required, optional_jwt
from app.services.jwt_service import JWTService
from datetime import datetime
import os
import json

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
    """Create page with JWT authentication and optional template content."""
    data = request.get_json()
    
    if not data or 'site_id' not in data:
        return jsonify({'error': 'Missing site_id'}), 400
    
    site = Site.query.get_or_404(data['site_id'])
    
    # Check if user owns the site (using JWT user)
    if site.user_id != request.current_user.id:
        abort(403)
    
    # Get template content if specified
    template_id = data.get('template', 'blank')
    html_content = ''
    css_content = ''
    
    if template_id and template_id != 'blank':
        template_file = os.path.join(get_templates_dir(), f'{template_id}.json')
        if os.path.exists(template_file):
            try:
                with open(template_file, 'r', encoding='utf-8') as f:
                    template_data = json.load(f)
                    content = template_data.get('content', {})
                    html_content = content.get('html', '')
                    css_content = content.get('css', '')
            except (json.JSONDecodeError, IOError) as e:
                current_app.logger.error(f"Error loading template {template_id}: {e}")
    
    # Create page with template content
    page = Page(
        title=data['title'],
        description=data.get('description', ''),
        template=template_id,
        site_id=site.id,
        user_id=request.current_user.id,
        html_content=html_content,
        css_content=css_content
    )
    
    # Generate slug from title
    page.slug = page.generate_slug()
    
    # If this is the first page, make it homepage
    if not site.get_homepage():
        page.is_homepage = True
    
    db.session.add(page)
    db.session.commit()
    
    return jsonify(page.to_dict()), 201


# ============================================
# TEMPLATE ENDPOINTS
# ============================================

def get_templates_dir():
    """Get the templates directory path."""
    # Templates are in backend/static/templates/, not app/static/templates/
    # current_app.root_path = backend/app/, so we go up one level
    return os.path.join(current_app.root_path, '..', 'static', 'templates')


@api_bp.route('/templates', methods=['GET'])
def list_templates():
    """
    Get list of available templates.
    Returns template metadata (without full content for performance).
    """
    templates_dir = get_templates_dir()
    templates = []
    
    if not os.path.exists(templates_dir):
        return jsonify({'templates': [], 'message': 'No templates directory found'}), 200
    
    for filename in os.listdir(templates_dir):
        if filename.endswith('.json'):
            filepath = os.path.join(templates_dir, filename)
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    template_data = json.load(f)
                    # Return metadata only (exclude content for list view)
                    templates.append({
                        'id': template_data.get('id'),
                        'name': template_data.get('name'),
                        'description': template_data.get('description'),
                        'category': template_data.get('category'),
                        'thumbnail': template_data.get('thumbnail')
                    })
            except (json.JSONDecodeError, IOError) as e:
                current_app.logger.error(f"Error reading template {filename}: {e}")
                continue
    
    return jsonify({'templates': templates}), 200


@api_bp.route('/templates/<template_id>', methods=['GET'])
def get_template(template_id):
    """
    Get a specific template by ID (includes full content).
    """
    templates_dir = get_templates_dir()
    template_file = os.path.join(templates_dir, f'{template_id}.json')
    
    if not os.path.exists(template_file):
        return jsonify({'error': 'Template not found'}), 404
    
    try:
        with open(template_file, 'r', encoding='utf-8') as f:
            template_data = json.load(f)
        return jsonify(template_data), 200
    except (json.JSONDecodeError, IOError) as e:
        current_app.logger.error(f"Error reading template {template_id}: {e}")
        return jsonify({'error': 'Failed to load template'}), 500