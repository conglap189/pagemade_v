/**
 * CUSTOM HEADER BLOCK
 * Custom header block with navigation
 */

export default function(editor) {
  console.log('📱 Loading Custom Header Block...');
  
  // Custom Header Block
  editor.BlockManager.add('custom-header', {
    label: 'Custom Header',
    category: 'Header',
    media: `<svg viewBox="0 0 24 24" width="40" height="40">
      <path fill="currentColor" d="M4,6H20V8H4V6M4,11H20V13H4V11M4,16H20V18H4V16Z"/>
    </svg>`,
    content: `
      <header class="custom-header" style="background: white; border-bottom: 1px solid #e5e7eb; padding: 0 20px;">
        <div class="container" style="max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; height: 70px;">
          <div class="logo" style="font-size: 1.5rem; font-weight: 700; color: #1f2937;">
            Your Logo
          </div>
          <nav class="navigation" style="display: flex; gap: 30px;">
            <a href="#" style="color: #6b7280; text-decoration: none; font-weight: 500;">Home</a>
            <a href="#" style="color: #6b7280; text-decoration: none; font-weight: 500;">About</a>
            <a href="#" style="color: #6b7280; text-decoration: none; font-weight: 500;">Services</a>
            <a href="#" style="color: #6b7280; text-decoration: none; font-weight: 500;">Contact</a>
          </nav>
          <button style="background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: 500; cursor: pointer;">
            Get Started
          </button>
        </div>
      </header>
    `,
    attributes: {
      class: 'custom-header-section',
      'data-gjs-type': 'custom-header'
    }
  });

  console.log('✅ Custom Header Block loaded');
}