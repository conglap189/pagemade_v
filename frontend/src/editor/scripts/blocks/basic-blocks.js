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
            <div style="display: flex; gap: 20px; padding: 20px; min-height: 200px; border: 1px dashed #e5e7eb;">
                <div style="flex: 1; padding: 15px; background: #f8fafc; border: 1px dashed #d1d5db; text-align: center; color: #6b7280;">
                    Column 1
                </div>
                <div style="flex: 1; padding: 15px; background: #f8fafc; border: 1px dashed #d1d5db; text-align: center; color: #6b7280;">
                    Column 2
                </div>
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
            <div style="display: flex; gap: 15px; padding: 20px; min-height: 200px; border: 1px dashed #e5e7eb;">
                <div style="flex: 1; padding: 15px; background: #f8fafc; border: 1px dashed #d1d5db; text-align: center; color: #6b7280; font-size: 14px;">
                    Column 1
                </div>
                <div style="flex: 1; padding: 15px; background: #f8fafc; border: 1px dashed #d1d5db; text-align: center; color: #6b7280; font-size: 14px;">
                    Column 2
                </div>
                <div style="flex: 1; padding: 15px; background: #f8fafc; border: 1px dashed #d1d5db; text-align: center; color: #6b7280; font-size: 14px;">
                    Column 3
                </div>
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
            <div style="display: flex; gap: 10px; padding: 20px; min-height: 200px; border: 1px dashed #e5e7eb;">
                <div style="flex: 1; padding: 10px; background: #f8fafc; border: 1px dashed #d1d5db; text-align: center; color: #6b7280; font-size: 12px;">
                    Col 1
                </div>
                <div style="flex: 1; padding: 10px; background: #f8fafc; border: 1px dashed #d1d5db; text-align: center; color: #6b7280; font-size: 12px;">
                    Col 2
                </div>
                <div style="flex: 1; padding: 10px; background: #f8fafc; border: 1px dashed #d1d5db; text-align: center; color: #6b7280; font-size: 12px;">
                    Col 3
                </div>
                <div style="flex: 1; padding: 10px; background: #f8fafc; border: 1px dashed #d1d5db; text-align: center; color: #6b7280; font-size: 12px;">
                    Col 4
                </div>
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
            <section style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 80px 20px; text-align: center;">
                <div style="max-width: 800px; margin: 0 auto;">
                    <h1 style="font-size: 3rem; margin-bottom: 20px; font-weight: bold;">Welcome to PageMade</h1>
                    <p style="font-size: 1.25rem; margin-bottom: 30px; opacity: 0.9;">Build beautiful websites with our powerful editor</p>
                    <button style="background: white; color: #667eea; padding: 15px 30px; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer;">Get Started</button>
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
            <section style="padding: 60px 20px; background: #f9fafb;">
                <div style="max-width: 1200px; margin: 0 auto;">
                    <h2 style="text-align: center; font-size: 2.5rem; margin-bottom: 50px; color: #1f2937;">Our Features</h2>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px;">
                        <div style="text-align: center; padding: 30px; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                            <div style="width: 60px; height: 60px; background: #667eea; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                                <i class="fas fa-rocket" style="color: white; font-size: 24px;"></i>
                            </div>
                            <h3 style="font-size: 1.5rem; margin-bottom: 15px; color: #1f2937;">Fast Performance</h3>
                            <p style="color: #6b7280; line-height: 1.6;">Lightning-fast loading times and smooth interactions</p>
                        </div>
                        <div style="text-align: center; padding: 30px; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                            <div style="width: 60px; height: 60px; background: #10b981; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                                <i class="fas fa-shield-alt" style="color: white; font-size: 24px;"></i>
                            </div>
                            <h3 style="font-size: 1.5rem; margin-bottom: 15px; color: #1f2937;">Secure</h3>
                            <p style="color: #6b7280; line-height: 1.6;">Enterprise-grade security for your peace of mind</p>
                        </div>
                        <div style="text-align: center; padding: 30px; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                            <div style="width: 60px; height: 60px; background: #f59e0b; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                                <i class="fas fa-cog" style="color: white; font-size: 24px;"></i>
                            </div>
                            <h3 style="font-size: 1.5rem; margin-bottom: 15px; color: #1f2937;">Easy to Use</h3>
                            <p style="color: #6b7280; line-height: 1.6;">Intuitive interface that anyone can master</p>
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
            <section style="padding: 60px 20px; background: white;">
                <div style="max-width: 800px; margin: 0 auto; text-align: center;">
                    <div style="font-size: 3rem; color: #f59e0b; margin-bottom: 30px;">"</div>
                    <p style="font-size: 1.5rem; color: #374151; margin-bottom: 30px; line-height: 1.6; font-style: italic;">
                        PageMade has completely transformed how we build websites. The intuitive interface and powerful features make it a joy to use.
                    </p>
                    <div style="display: flex; align-items: center; justify-content: center; gap: 15px;">
                        <div style="width: 50px; height: 50px; background: #667eea; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
                            JD
                        </div>
                        <div style="text-align: left;">
                            <div style="font-weight: bold; color: #1f2937;">John Doe</div>
                            <div style="color: #6b7280;">CEO, Tech Company</div>
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
            <form style="max-width: 600px; margin: 40px auto; padding: 30px; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <h3 style="margin-bottom: 25px; color: #1f2937; font-size: 1.5rem;">Get in Touch</h3>
                
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; color: #374151; font-weight: 500;">Name</label>
                    <input type="text" style="width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 16px;" placeholder="Your name">
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; color: #374151; font-weight: 500;">Email</label>
                    <input type="email" style="width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 16px;" placeholder="your@email.com">
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; color: #374151; font-weight: 500;">Message</label>
                    <textarea style="width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 16px; min-height: 120px; resize: vertical;" placeholder="Your message..."></textarea>
                </div>
                
                <button type="submit" style="background: #667eea; color: white; padding: 12px 30px; border: none; border-radius: 6px; font-size: 16px; font-weight: 500; cursor: pointer; width: 100%;">
                    Send Message
                </button>
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
            <div style="padding: 40px 20px; background: #f9fafb;">
                <div style="max-width: 1200px; margin: 0 auto;">
                    <h2 style="text-align: center; font-size: 2rem; margin-bottom: 40px; color: #1f2937;">Gallery</h2>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
                        <div style="aspect-ratio: 1; background: #e5e7eb; border-radius: 8px; overflow: hidden;">
                            <img src="https://via.placeholder.com/400x400/667eea/ffffff?text=Image+1" alt="Gallery Image 1" style="width: 100%; height: 100%; object-fit: cover;">
                        </div>
                        <div style="aspect-ratio: 1; background: #e5e7eb; border-radius: 8px; overflow: hidden;">
                            <img src="https://via.placeholder.com/400x400/10b981/ffffff?text=Image+2" alt="Gallery Image 2" style="width: 100%; height: 100%; object-fit: cover;">
                        </div>
                        <div style="aspect-ratio: 1; background: #e5e7eb; border-radius: 8px; overflow: hidden;">
                            <img src="https://via.placeholder.com/400x400/f59e0b/ffffff?text=Image+3" alt="Gallery Image 3" style="width: 100%; height: 100%; object-fit: cover;">
                        </div>
                        <div style="aspect-ratio: 1; background: #e5e7eb; border-radius: 8px; overflow: hidden;">
                            <img src="https://via.placeholder.com/400x400/ef4444/ffffff?text=Image+4" alt="Gallery Image 4" style="width: 100%; height: 100%; object-fit: cover;">
                        </div>
                        <div style="aspect-ratio: 1; background: #e5e7eb; border-radius: 8px; overflow: hidden;">
                            <img src="https://via.placeholder.com/400x400/8b5cf6/ffffff?text=Image+5" alt="Gallery Image 5" style="width: 100%; height: 100%; object-fit: cover;">
                        </div>
                        <div style="aspect-ratio: 1; background: #e5e7eb; border-radius: 8px; overflow: hidden;">
                            <img src="https://via.placeholder.com/400x400/06b6d4/ffffff?text=Image+6" alt="Gallery Image 6" style="width: 100%; height: 100%; object-fit: cover;">
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
            <footer style="background: #1f2937; color: white; padding: 40px 20px 20px;">
                <div style="max-width: 1200px; margin: 0 auto;">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 40px; margin-bottom: 30px;">
                        <div>
                            <h4 style="font-size: 1.25rem; margin-bottom: 20px; color: white;">PageMade</h4>
                            <p style="color: #9ca3af; line-height: 1.6;">Build beautiful websites with our powerful and intuitive editor.</p>
                        </div>
                        <div>
                            <h4 style="font-size: 1.25rem; margin-bottom: 20px; color: white;">Product</h4>
                            <ul style="list-style: none; padding: 0;">
                                <li style="margin-bottom: 10px;"><a href="#" style="color: #9ca3af; text-decoration: none;">Features</a></li>
                                <li style="margin-bottom: 10px;"><a href="#" style="color: #9ca3af; text-decoration: none;">Pricing</a></li>
                                <li style="margin-bottom: 10px;"><a href="#" style="color: #9ca3af; text-decoration: none;">Templates</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 style="font-size: 1.25rem; margin-bottom: 20px; color: white;">Company</h4>
                            <ul style="list-style: none; padding: 0;">
                                <li style="margin-bottom: 10px;"><a href="#" style="color: #9ca3af; text-decoration: none;">About</a></li>
                                <li style="margin-bottom: 10px;"><a href="#" style="color: #9ca3af; text-decoration: none;">Blog</a></li>
                                <li style="margin-bottom: 10px;"><a href="#" style="color: #9ca3af; text-decoration: none;">Contact</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 style="font-size: 1.25rem; margin-bottom: 20px; color: white;">Connect</h4>
                            <div style="display: flex; gap: 15px;">
                                <a href="#" style="color: #9ca3af; font-size: 1.25rem;"><i class="fab fa-facebook"></i></a>
                                <a href="#" style="color: #9ca3af; font-size: 1.25rem;"><i class="fab fa-twitter"></i></a>
                                <a href="#" style="color: #9ca3af; font-size: 1.25rem;"><i class="fab fa-linkedin"></i></a>
                                <a href="#" style="color: #9ca3af; font-size: 1.25rem;"><i class="fab fa-instagram"></i></a>
                            </div>
                        </div>
                    </div>
                    <div style="border-top: 1px solid #374151; padding-top: 20px; text-align: center; color: #9ca3af;">
                        <p>&copy; 2024 PageMade. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        `,
        attributes: { class: 'footer-component' }
    });
    
    console.log('✅ Basic Blocks loaded successfully');
}