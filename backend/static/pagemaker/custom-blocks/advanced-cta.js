/**
 * ADVANCED CTA BLOCK
 * Advanced Call-to-Action block with enhanced features
 */

export default function(editor) {
  console.log('🎯 Loading Advanced CTA Block...');
  
  // Advanced CTA Block
  editor.BlockManager.add('advanced-cta', {
    label: 'Advanced CTA',
    category: 'CTA',
    media: `<svg viewBox="0 0 24 24" width="40" height="40">
      <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M11,7V13H13V7H11M11,15V17H13V15H11Z"/>
    </svg>`,
    content: `
      <section class="advanced-cta" style="padding: 60px 20px; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; text-align: center;">
        <div class="container" style="max-width: 800px; margin: 0 auto;">
          <h2 style="font-size: 2.5rem; margin-bottom: 20px; font-weight: 700;">Ready to Get Started?</h2>
          <p style="font-size: 1.2rem; margin-bottom: 30px; opacity: 0.9;">Join thousands of satisfied customers using our platform</p>
          <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
            <button style="background: white; color: #3b82f6; border: none; padding: 15px 30px; font-size: 1rem; font-weight: 600; border-radius: 8px; cursor: pointer;">
              Start Free Trial
            </button>
            <button style="background: transparent; color: white; border: 2px solid white; padding: 13px 30px; font-size: 1rem; font-weight: 600; border-radius: 8px; cursor: pointer;">
              Learn More
            </button>
          </div>
        </div>
      </section>
    `,
    attributes: {
      class: 'advanced-cta-section',
      'data-gjs-type': 'advanced-cta'
    }
  });

  console.log('✅ Advanced CTA Block loaded');
}