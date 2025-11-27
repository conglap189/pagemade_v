"""HTML processing utilities for production deployment."""
import re
import html
import os
import stat
from flask import current_app


def clean_html_for_production(html_content):
    """Clean and optimize HTML for production"""
    try:
        # Basic cleaning - remove Silex editor artifacts
        cleaned = html_content
        
        # Remove Silex-specific attributes and classes
        silex_patterns = [
            r'data-silex-[^=]*="[^"]*"',
            r'contenteditable="[^"]*"',
            r'draggable="[^"]*"',
            r'class="[^"]*silex-[^"]*"',
            r'class="[^"]*ui-[^"]*"'
        ]
        
        for pattern in silex_patterns:
            cleaned = re.sub(pattern, '', cleaned, flags=re.IGNORECASE)
        
        # Clean up extra whitespace
        cleaned = re.sub(r'\s+', ' ', cleaned)
        cleaned = re.sub(r'>\s+<', '><', cleaned)
        
        # Ensure proper HTML structure
        if not cleaned.startswith('<!DOCTYPE'):
            cleaned = f'<!DOCTYPE html>\n{cleaned}'
            
        return cleaned
        
    except Exception as e:
        print(f"HTML cleaning error: {e}")
        return html_content  # Return original if cleaning fails


def save_html_to_storage(page, html_content):
    """Save HTML content to storage directory (backup)"""
    try:
        # Create storage directory structure
        storage_dir = os.path.join(current_app.root_path, '..', 'storage', 'sites', str(page.site_id))
        os.makedirs(storage_dir, exist_ok=True)
        
        # Save HTML file
        filename = f"{page.slug or 'page'}.html"
        file_path = os.path.join(storage_dir, filename)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(html_content)
            
        print(f"HTML saved to storage: {file_path}")
        return True
        
    except Exception as e:
        print(f"Storage save error: {e}")
        return False


def deploy_static_website(subdomain, html_content, css_content=''):
    """Deploy static HTML/CSS files to subdomain directory for Nginx serving"""
    try:
        print(f"🚀 Deploying static website for subdomain: {subdomain}")
        
        # 1. Create subdomain directory structure
        static_dir = os.path.join('/var/www/subdomains', subdomain)
        os.makedirs(static_dir, exist_ok=True)
        
        # 2. Write main index.html
        index_file = os.path.join(static_dir, 'index.html')
        with open(index_file, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        # 3. Write separate CSS file if provided
        if css_content and css_content.strip():
            css_file = os.path.join(static_dir, 'styles.css')
            with open(css_file, 'w', encoding='utf-8') as f:
                f.write(css_content)
        
        # 4. Set proper permissions for Nginx
        os.chmod(static_dir, stat.S_IRWXU | stat.S_IRGRP | stat.S_IXGRP | stat.S_IROTH | stat.S_IXOTH)  # 755
        os.chmod(index_file, stat.S_IRUSR | stat.S_IWUSR | stat.S_IRGRP | stat.S_IROTH)  # 644
        
        if os.path.exists(os.path.join(static_dir, 'styles.css')):
            os.chmod(os.path.join(static_dir, 'styles.css'), stat.S_IRUSR | stat.S_IWUSR | stat.S_IRGRP | stat.S_IROTH)
        
        print(f"✅ Static files deployed successfully to: {static_dir}")
        
        return {
            'success': True,
            'info': {
                'static_dir': static_dir,
                'files_created': ['index.html'] + (['styles.css'] if css_content else []),
                'url': f"https://{subdomain}.pagemade.site"
            }
        }
        
    except Exception as e:
        print(f"❌ Static deployment error: {e}")
        return {
            'success': False,
            'error': str(e)
        }