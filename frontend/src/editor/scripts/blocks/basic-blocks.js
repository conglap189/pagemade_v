/**
 * Basic Blocks System
 * Simple, fundamental blocks for page building
 * Based on older system blocks
 */

export default (editor) => {
    const bm = editor.BlockManager;
    
    console.log('🎯 Loading Basic Blocks...');
    
    // ===== BASIC CATEGORY =====
    
    // Heading
    bm.add('basic-heading', {
        label: 'Heading',
        category: 'Basic',
        media: '<i class="fas fa-heading"></i>',
        content: '<h1>Heading Text</h1>',
        attributes: { class: 'heading-block' }
    });
    
    // Text
    bm.add('basic-text', {
        label: 'Text',
        category: 'Basic',
        media: '<i class="fas fa-paragraph"></i>',
        content: '<p>Your text content here...</p>',
        attributes: { class: 'text-block' }
    });
    
    // Button
    bm.add('basic-button', {
        label: 'Button',
        category: 'Basic',
        media: '<i class="fas fa-square"></i>',
        content: '<button class="btn btn-primary">Click me</button>',
        attributes: { class: 'button-block' }
    });
    
    // Image
    bm.add('basic-image', {
        label: 'Image',
        category: 'Basic',
        media: '<i class="fas fa-image"></i>',
        content: '<img src="https://via.placeholder.com/350x200" alt="Image" />',
        attributes: { class: 'image-block' }
    });
    
    // Container
    bm.add('basic-container', {
        label: 'Container',
        category: 'Basic',
        media: '<i class="fas fa-square-full"></i>',
        content: '<div class="container"></div>',
        attributes: { class: 'container-block' }
    });

    // ===== LAYOUT COLUMNS =====
    
    // 1 Column
    bm.add('layout-1-column', {
        label: '1 Column',
        category: 'Layout',
        media: '<div style="display: flex; gap: 2px;"><div style="flex: 1; height: 10px; background: #667eea;"></div></div>',
        content: `
            <div style="display: flex; flex-direction: column; gap: 20px; padding: 20px; min-height: 200px; border: 1px dashed #e5e7eb;">
                <div style="flex: 1; padding: 15px; background: #f8fafc; border: 1px dashed #d1d5db; text-align: center; color: #6b7280;">
                    Drop content here
                </div>
            </div>
        `,
        attributes: { class: 'layout-1-column' }
    });
    
    // 2 Columns
    bm.add('layout-2-columns', {
        label: '2 Columns',
        category: 'Layout',
        media: '<div style="display: flex; gap: 2px;"><div style="flex: 1; height: 10px; background: #667eea;"></div><div style="flex: 1; height: 10px; background: #667eea;"></div></div>',
        content: `
            <div class="pm-layout-2col">
                <style>
                    .pm-layout-2col { display: flex; flex-wrap: wrap; gap: 20px; padding: 20px; min-height: 200px; border: 1px dashed #e5e7eb; }
                    .pm-layout-2col .pm-col { flex: 1 1 calc(50% - 10px); min-width: 0; padding: 15px; background: #f8fafc; border: 1px dashed #d1d5db; text-align: center; color: #6b7280; }
                    @media (max-width: 480px) {
                        .pm-layout-2col { gap: 15px; padding: 15px; }
                        .pm-layout-2col .pm-col { flex: 1 1 100%; }
                    }
                </style>
                <div class="pm-col">Column 1</div>
                <div class="pm-col">Column 2</div>
            </div>
        `,
        attributes: { class: 'layout-2-columns' }
    });
    
    // 3 Columns
    bm.add('layout-3-columns', {
        label: '3 Columns',
        category: 'Layout',
        media: '<div style="display: flex; gap: 2px;"><div style="flex: 1; height: 10px; background: #667eea;"></div><div style="flex: 1; height: 10px; background: #667eea;"></div><div style="flex: 1; height: 10px; background: #667eea;"></div></div>',
        content: `
            <div class="pm-layout-3col">
                <style>
                    .pm-layout-3col { display: flex; flex-wrap: wrap; gap: 15px; padding: 20px; min-height: 200px; border: 1px dashed #e5e7eb; }
                    .pm-layout-3col .pm-col { flex: 1 1 calc(33.333% - 10px); min-width: 0; padding: 15px; background: #f8fafc; border: 1px dashed #d1d5db; text-align: center; color: #6b7280; font-size: 14px; }
                    @media (max-width: 768px) {
                        .pm-layout-3col .pm-col { flex: 1 1 calc(50% - 10px); }
                    }
                    @media (max-width: 480px) {
                        .pm-layout-3col { gap: 12px; padding: 15px; }
                        .pm-layout-3col .pm-col { flex: 1 1 100%; }
                    }
                </style>
                <div class="pm-col">Column 1</div>
                <div class="pm-col">Column 2</div>
                <div class="pm-col">Column 3</div>
            </div>
        `,
        attributes: { class: 'layout-3-columns' }
    });
    
    // 4 Columns
    bm.add('layout-4-columns', {
        label: '4 Columns',
        category: 'Layout',
        media: '<div style="display: flex; gap: 1px;"><div style="flex: 1; height: 10px; background: #667eea;"></div><div style="flex: 1; height: 10px; background: #667eea;"></div><div style="flex: 1; height: 10px; background: #667eea;"></div><div style="flex: 1; height: 10px; background: #667eea;"></div></div>',
        content: `
            <div class="pm-layout-4col">
                <style>
                    .pm-layout-4col { display: flex; flex-wrap: wrap; gap: 10px; padding: 20px; min-height: 200px; border: 1px dashed #e5e7eb; }
                    .pm-layout-4col .pm-col { flex: 1 1 calc(25% - 10px); min-width: 0; padding: 10px; background: #f8fafc; border: 1px dashed #d1d5db; text-align: center; color: #6b7280; font-size: 12px; }
                    @media (max-width: 768px) {
                        .pm-layout-4col .pm-col { flex: 1 1 calc(50% - 5px); }
                    }
                    @media (max-width: 480px) {
                        .pm-layout-4col { gap: 8px; padding: 15px; }
                        .pm-layout-4col .pm-col { flex: 1 1 100%; }
                    }
                </style>
                <div class="pm-col">Col 1</div>
                <div class="pm-col">Col 2</div>
                <div class="pm-col">Col 3</div>
                <div class="pm-col">Col 4</div>
            </div>
        `,
        attributes: { class: 'layout-4-columns' }
    });

    // ===== COMPONENTS CATEGORY =====
    
    // Hero Section
    bm.add('component-hero', {
        label: 'Hero Section',
        category: 'Components',
        media: '<div style="background: linear-gradient(45deg, #667eea, #764ba2); height: 40px; border-radius: 4px;"></div>',
        content: `
            <section class="pm-hero" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center;">
                <style>
                    .pm-hero { padding: 80px 20px; }
                    .pm-hero .pm-hero-container { max-width: 800px; margin: 0 auto; }
                    .pm-hero .pm-hero-title { font-size: clamp(1.75rem, 5vw, 3rem); margin-bottom: 20px; font-weight: bold; line-height: 1.2; }
                    .pm-hero .pm-hero-subtitle { font-size: clamp(1rem, 2.5vw, 1.25rem); margin-bottom: 30px; opacity: 0.9; line-height: 1.5; }
                    .pm-hero .pm-hero-btn { background: white; color: #667eea; padding: 15px 30px; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; }
                    .pm-hero .pm-hero-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
                    @media (max-width: 768px) {
                        .pm-hero { padding: 60px 18px; }
                    }
                    @media (max-width: 480px) {
                        .pm-hero { padding: 50px 16px; }
                        .pm-hero .pm-hero-btn { padding: 12px 24px; font-size: 14px; width: 100%; }
                    }
                </style>
                <div class="pm-hero-container">
                    <h1 class="pm-hero-title">Welcome to PageMade</h1>
                    <p class="pm-hero-subtitle">Build beautiful websites with our powerful editor</p>
                    <button class="pm-hero-btn">Get Started</button>
                </div>
            </section>
        `,
        attributes: { class: 'hero-section' }
    });
    
    // Feature Section
    bm.add('component-features', {
        label: 'Feature Section',
        category: 'Components',
        media: '<div style="display: flex; gap: 4px;"><div style="flex: 1; height: 20px; background: #10b981;"></div><div style="flex: 1; height: 20px; background: #10b981;"></div><div style="flex: 1; height: 20px; background: #10b981;"></div></div>',
        content: `
            <section class="pm-features">
                <style>
                    .pm-features { padding: 60px 20px; background: #f9fafb; }
                    .pm-features .pm-features-container { max-width: 1200px; margin: 0 auto; }
                    .pm-features .pm-features-title { text-align: center; font-size: clamp(1.75rem, 4vw, 2.5rem); margin-bottom: 50px; color: #1f2937; }
                    .pm-features .pm-features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; }
                    .pm-features .pm-feature-card { text-align: center; padding: 30px; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                    .pm-features .pm-feature-icon { width: 60px; height: 60px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; }
                    .pm-features .pm-feature-icon i { color: white; font-size: 24px; }
                    .pm-features .pm-feature-card h3 { font-size: 1.5rem; margin-bottom: 15px; color: #1f2937; }
                    .pm-features .pm-feature-card p { color: #6b7280; line-height: 1.6; }
                    @media (max-width: 768px) {
                        .pm-features { padding: 40px 16px; }
                        .pm-features .pm-features-grid { grid-template-columns: 1fr; gap: 20px; }
                        .pm-features .pm-features-title { margin-bottom: 30px; }
                    }
                </style>
                <div class="pm-features-container">
                    <h2 class="pm-features-title">Our Features</h2>
                    <div class="pm-features-grid">
                        <div class="pm-feature-card">
                            <div class="pm-feature-icon" style="background: #667eea;">
                                <i class="fas fa-rocket"></i>
                            </div>
                            <h3>Fast Performance</h3>
                            <p>Lightning-fast loading times and smooth interactions</p>
                        </div>
                        <div class="pm-feature-card">
                            <div class="pm-feature-icon" style="background: #10b981;">
                                <i class="fas fa-shield-alt"></i>
                            </div>
                            <h3>Secure</h3>
                            <p>Enterprise-grade security for your peace of mind</p>
                        </div>
                        <div class="pm-feature-card">
                            <div class="pm-feature-icon" style="background: #f59e0b;">
                                <i class="fas fa-cog"></i>
                            </div>
                            <h3>Easy to Use</h3>
                            <p>Intuitive interface that anyone can master</p>
                        </div>
                    </div>
                </div>
            </section>
        `,
        attributes: { class: 'features-section' }
    });
    
    // Testimonial Section
    bm.add('component-testimonial', {
        label: 'Testimonial',
        category: 'Components',
        media: '<div style="background: #fef3c7; height: 40px; border-radius: 4px; display: flex; align-items: center; justify-content: center;"><i class="fas fa-quote-left" style="color: #f59e0b;"></i></div>',
        content: `
            <section class="pm-testimonial">
                <style>
                    .pm-testimonial { padding: 60px 20px; background: white; }
                    .pm-testimonial .pm-testimonial-container { max-width: 800px; margin: 0 auto; text-align: center; }
                    .pm-testimonial .pm-quote-icon { font-size: 3rem; color: #f59e0b; margin-bottom: 30px; }
                    .pm-testimonial .pm-quote-text { font-size: clamp(1.125rem, 3vw, 1.5rem); color: #374151; margin-bottom: 30px; line-height: 1.6; font-style: italic; }
                    .pm-testimonial .pm-author { display: flex; align-items: center; justify-content: center; gap: 15px; }
                    .pm-testimonial .pm-author-avatar { width: 50px; height: 50px; background: #667eea; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; }
                    .pm-testimonial .pm-author-info { text-align: left; }
                    .pm-testimonial .pm-author-name { font-weight: bold; color: #1f2937; }
                    .pm-testimonial .pm-author-title { color: #6b7280; }
                    @media (max-width: 480px) {
                        .pm-testimonial { padding: 40px 16px; }
                        .pm-testimonial .pm-quote-icon { font-size: 2rem; margin-bottom: 20px; }
                        .pm-testimonial .pm-author { flex-direction: column; gap: 10px; }
                        .pm-testimonial .pm-author-info { text-align: center; }
                    }
                </style>
                <div class="pm-testimonial-container">
                    <div class="pm-quote-icon">"</div>
                    <p class="pm-quote-text">
                        PageMade has completely transformed how we build websites. The intuitive interface and powerful features make it a joy to use.
                    </p>
                    <div class="pm-author">
                        <div class="pm-author-avatar">JD</div>
                        <div class="pm-author-info">
                            <div class="pm-author-name">John Doe</div>
                            <div class="pm-author-title">CEO, Tech Company</div>
                        </div>
                    </div>
                </div>
            </section>
        `,
        attributes: { class: 'testimonial-section' }
    });

    // ===== FORM CATEGORY =====
    
    // Contact Form
    bm.add('form-contact', {
        label: 'Contact Form',
        category: 'Forms',
        media: '<div style="background: #e5e7eb; height: 40px; border-radius: 4px; display: flex; align-items: center; justify-content: center;"><i class="fas fa-envelope"></i></div>',
        content: `
            <form class="pm-contact-form">
                <style>
                    .pm-contact-form { max-width: 600px; margin: 40px auto; padding: 30px; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                    .pm-contact-form h3 { margin-bottom: 25px; color: #1f2937; font-size: 1.5rem; }
                    .pm-contact-form .pm-form-group { margin-bottom: 20px; }
                    .pm-contact-form label { display: block; margin-bottom: 8px; color: #374151; font-weight: 500; }
                    .pm-contact-form input, .pm-contact-form textarea { width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 16px; box-sizing: border-box; }
                    .pm-contact-form textarea { min-height: 120px; resize: vertical; }
                    .pm-contact-form button { background: #667eea; color: white; padding: 12px 30px; border: none; border-radius: 6px; font-size: 16px; font-weight: 500; cursor: pointer; width: 100%; }
                    .pm-contact-form button:hover { background: #5a67d8; }
                    @media (max-width: 480px) {
                        .pm-contact-form { margin: 20px 16px; padding: 20px; }
                        .pm-contact-form h3 { font-size: 1.25rem; margin-bottom: 20px; }
                        .pm-contact-form input, .pm-contact-form textarea { padding: 10px; font-size: 14px; }
                    }
                </style>
                <h3>Get in Touch</h3>
                <div class="pm-form-group">
                    <label>Name</label>
                    <input type="text" placeholder="Your name">
                </div>
                <div class="pm-form-group">
                    <label>Email</label>
                    <input type="email" placeholder="your@email.com">
                </div>
                <div class="pm-form-group">
                    <label>Message</label>
                    <textarea placeholder="Your message..."></textarea>
                </div>
                <button type="submit">Send Message</button>
            </form>
        `,
        attributes: { class: 'contact-form' }
    });

    // ===== MEDIA CATEGORY =====
    
    // Image Gallery
    bm.add('media-gallery', {
        label: 'Image Gallery',
        category: 'Media',
        media: '<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; height: 40px;"><div style="background: #667eea;"></div><div style="background: #667eea;"></div><div style="background: #667eea;"></div></div>',
        content: `
            <div class="pm-gallery">
                <style>
                    .pm-gallery { padding: 40px 20px; background: #f9fafb; }
                    .pm-gallery .pm-gallery-container { max-width: 1200px; margin: 0 auto; }
                    .pm-gallery .pm-gallery-title { text-align: center; font-size: clamp(1.5rem, 4vw, 2rem); margin-bottom: 40px; color: #1f2937; }
                    .pm-gallery .pm-gallery-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
                    .pm-gallery .pm-gallery-item { aspect-ratio: 1; background: #e5e7eb; border-radius: 8px; overflow: hidden; }
                    .pm-gallery .pm-gallery-item img { width: 100%; height: 100%; object-fit: cover; }
                    @media (max-width: 768px) {
                        .pm-gallery .pm-gallery-grid { grid-template-columns: repeat(2, 1fr); gap: 15px; }
                    }
                    @media (max-width: 480px) {
                        .pm-gallery { padding: 30px 16px; }
                        .pm-gallery .pm-gallery-title { margin-bottom: 25px; }
                        .pm-gallery .pm-gallery-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
                    }
                </style>
                <div class="pm-gallery-container">
                    <h2 class="pm-gallery-title">Gallery</h2>
                    <div class="pm-gallery-grid">
                        <div class="pm-gallery-item">
                            <img src="https://via.placeholder.com/400x400/667eea/ffffff?text=Image+1" alt="Gallery Image 1">
                        </div>
                        <div class="pm-gallery-item">
                            <img src="https://via.placeholder.com/400x400/10b981/ffffff?text=Image+2" alt="Gallery Image 2">
                        </div>
                        <div class="pm-gallery-item">
                            <img src="https://via.placeholder.com/400x400/f59e0b/ffffff?text=Image+3" alt="Gallery Image 3">
                        </div>
                        <div class="pm-gallery-item">
                            <img src="https://via.placeholder.com/400x400/ef4444/ffffff?text=Image+4" alt="Gallery Image 4">
                        </div>
                        <div class="pm-gallery-item">
                            <img src="https://via.placeholder.com/400x400/8b5cf6/ffffff?text=Image+5" alt="Gallery Image 5">
                        </div>
                        <div class="pm-gallery-item">
                            <img src="https://via.placeholder.com/400x400/06b6d4/ffffff?text=Image+6" alt="Gallery Image 6">
                        </div>
                    </div>
                </div>
            </div>
        `,
        attributes: { class: 'image-gallery' }
    });

    // ===== FOOTER CATEGORY =====
    
    // Footer
    bm.add('component-footer', {
        label: 'Footer',
        category: 'Components',
        media: '<div style="background: #1f2937; height: 40px; border-radius: 4px;"></div>',
        content: `
            <footer class="pm-footer" style="background: #1f2937; color: white;">
                <style>
                    .pm-footer { padding: 40px 20px 20px; }
                    .pm-footer .pm-footer-container { max-width: 1200px; margin: 0 auto; }
                    .pm-footer .pm-footer-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 40px; margin-bottom: 30px; }
                    .pm-footer .pm-footer-col h4 { font-size: 1.25rem; margin-bottom: 20px; color: white; }
                    .pm-footer .pm-footer-col p { color: #9ca3af; line-height: 1.6; }
                    .pm-footer .pm-footer-col ul { list-style: none; padding: 0; margin: 0; }
                    .pm-footer .pm-footer-col li { margin-bottom: 10px; }
                    .pm-footer .pm-footer-col a { color: #9ca3af; text-decoration: none; }
                    .pm-footer .pm-footer-col a:hover { color: white; }
                    .pm-footer .pm-footer-social { display: flex; gap: 15px; }
                    .pm-footer .pm-footer-social a { color: #9ca3af; font-size: 1.25rem; }
                    .pm-footer .pm-footer-bottom { border-top: 1px solid #374151; padding-top: 20px; text-align: center; color: #9ca3af; }
                    @media (max-width: 768px) {
                        .pm-footer .pm-footer-grid { grid-template-columns: repeat(2, 1fr); gap: 30px; }
                    }
                    @media (max-width: 480px) {
                        .pm-footer { padding: 30px 16px 16px; }
                        .pm-footer .pm-footer-grid { grid-template-columns: 1fr; gap: 25px; text-align: center; }
                        .pm-footer .pm-footer-social { justify-content: center; }
                    }
                </style>
                <div class="pm-footer-container">
                    <div class="pm-footer-grid">
                        <div class="pm-footer-col">
                            <h4>PageMade</h4>
                            <p>Build beautiful websites with our powerful and intuitive editor.</p>
                        </div>
                        <div class="pm-footer-col">
                            <h4>Product</h4>
                            <ul>
                                <li><a href="#">Features</a></li>
                                <li><a href="#">Pricing</a></li>
                                <li><a href="#">Templates</a></li>
                            </ul>
                        </div>
                        <div class="pm-footer-col">
                            <h4>Company</h4>
                            <ul>
                                <li><a href="#">About</a></li>
                                <li><a href="#">Blog</a></li>
                                <li><a href="#">Contact</a></li>
                            </ul>
                        </div>
                        <div class="pm-footer-col">
                            <h4>Connect</h4>
                            <div class="pm-footer-social">
                                <a href="#"><i class="fab fa-facebook"></i></a>
                                <a href="#"><i class="fab fa-twitter"></i></a>
                                <a href="#"><i class="fab fa-linkedin"></i></a>
                                <a href="#"><i class="fab fa-instagram"></i></a>
                            </div>
                        </div>
                    </div>
                    <div class="pm-footer-bottom">
                        <p>&copy; 2024 PageMade. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        `,
        attributes: { class: 'footer-component' }
    });
    
    console.log('✅ Basic Blocks loaded successfully');
}