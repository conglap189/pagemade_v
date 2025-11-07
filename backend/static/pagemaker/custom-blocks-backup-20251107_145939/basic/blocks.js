/**
 * BASIC BLOCKS
 * Các blocks cơ bản: Text, Image, Video, Button, Container...
 * 
 * Cách thêm block mới:
 * editor.BlockManager.add('block-id', {
 *   label: 'Tên hiển thị',
 *   category: 'Basic',
 *   media: '<svg>...</svg>',
 *   content: '<div>HTML content</div>'
 * });
 */

export default function(editor) {
  console.log('📦 Loading Basic Blocks...');
  
  // ===== TEXT BLOCKS =====
  editor.BlockManager.add('basic-text', {
    label: 'Text Block',
    category: 'Basic',
    media: `<svg viewBox="0 0 24 24" width="40" height="40">
      <path fill="currentColor" d="M3,5H21V7H3V5M3,13H21V11H3V13M3,19H21V17H3V19Z"/>
    </svg>`,
    content: '<p class="text-gray-700 text-base">Your text content here...</p>'
  });

  editor.BlockManager.add('basic-heading', {
    label: 'Heading',
    category: 'Basic',
    media: `<svg viewBox="0 0 24 24" width="40" height="40">
      <path fill="currentColor" d="M5,3H7V5H5V10A2,2 0 0,1 3,12A2,2 0 0,1 5,14V19H7V21H5C3.93,20.73 3,20.1 3,19V15A2,2 0 0,0 1,13H0V11H1A2,2 0 0,0 3,9V5A2,2 0 0,1 5,3M19,3A2,2 0 0,1 21,5V9A2,2 0 0,0 23,11H24V13H23A2,2 0 0,0 21,15V19A2,2 0 0,1 19,21H17V19H19V14A2,2 0 0,1 21,12A2,2 0 0,1 19,10V5H17V3H19Z"/>
    </svg>`,
    content: '<h2 class="text-3xl font-bold text-gray-900 mb-4">Your Heading Here</h2>'
  });

  editor.BlockManager.add('basic-quote', {
    label: 'Quote',
    category: 'Basic',
    media: `<svg viewBox="0 0 24 24" width="40" height="40">
      <path fill="currentColor" d="M14,17H17L19,13V7H13V13H16M6,17H9L11,13V7H5V13H8L6,17Z"/>
    </svg>`,
    content: `
      <blockquote class="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-gray-50 rounded-r-lg">
        <p class="text-lg italic text-gray-700">"This is a powerful quote that inspires action and drives results."</p>
        <footer class="text-sm text-gray-600 mt-2">— Author Name</footer>
      </blockquote>
    `
  });

  // ===== IMAGE BLOCKS =====
  editor.BlockManager.add('basic-image', {
    label: 'Image',
    category: 'Basic',
    media: `<svg viewBox="0 0 24 24" width="40" height="40">
      <path fill="currentColor" d="M21,3H3C2,3 1,4 1,5V19A2,2 0 0,0 3,21H21C22,21 23,20 23,19V5C23,4 22,3 21,3M5,17L8.5,12.5L11,15.5L14.5,11L19,17H5Z"/>
    </svg>`,
    content: `
      <img 
        src="https://via.placeholder.com/600x400/e5e7eb/6b7280?text=Image" 
        alt="Placeholder" 
        class="w-full h-auto rounded-lg"
      />
    `
  });

  editor.BlockManager.add('basic-image-card', {
    label: 'Image Card',
    category: 'Basic',
    media: `<svg viewBox="0 0 24 24" width="40" height="40">
      <path fill="currentColor" d="M19,3H14.82C14.4,1.84 13.3,1 12,1C10.7,1 9.6,1.84 9.18,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M12,3A1,1 0 0,1 13,4A1,1 0 0,1 12,5A1,1 0 0,1 11,4A1,1 0 0,1 12,3M7,7H17V5H19V19H5V5H7V7Z"/>
    </svg>`,
    content: `
      <div class="bg-white rounded-xl shadow-lg overflow-hidden max-w-sm mx-auto">
        <img src="https://via.placeholder.com/400x250/3b82f6/ffffff?text=Card+Image" alt="Card" class="w-full h-48 object-cover">
        <div class="p-6">
          <h3 class="text-xl font-bold text-gray-900 mb-2">Card Title</h3>
          <p class="text-gray-600">This is a beautiful card with an image and description.</p>
        </div>
      </div>
    `
  });

  // ===== BUTTON BLOCKS =====
  editor.BlockManager.add('basic-button', {
    label: 'Button',
    category: 'Basic',
    media: `<svg viewBox="0 0 24 24" width="40" height="40">
      <path fill="currentColor" d="M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
    </svg>`,
    content: '<button class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition">Click Me</button>'
  });

  editor.BlockManager.add('basic-button-group', {
    label: 'Button Group',
    category: 'Basic',
    media: `<svg viewBox="0 0 24 24" width="40" height="40">
      <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z"/>
    </svg>`,
    content: `
      <div class="flex gap-4 justify-center">
        <button class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition">Primary</button>
        <button class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-6 py-3 rounded-lg transition">Secondary</button>
        <button class="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold px-6 py-3 rounded-lg transition">Outline</button>
      </div>
    `
  });

  editor.BlockManager.add('basic-container', {
    label: 'Container',
    category: 'Basic',
    media: `<svg viewBox="0 0 24 24" width="40" height="40">
      <path fill="currentColor" d="M3,3H21V21H3V3M5,5V19H19V5H5Z"/>
    </svg>`,
    content: '<div class="container mx-auto px-4 py-8 max-w-6xl">Your content here...</div>'
  });

  editor.BlockManager.add('basic-divider', {
    label: 'Divider',
    category: 'Basic',
    media: `<svg viewBox="0 0 24 24" width="40" height="40">
      <path fill="currentColor" d="M21,11H3V13H21V11Z"/>
    </svg>`,
    content: '<hr class="border-gray-300 my-8">'
  });

  console.log('✅ Basic Blocks loaded with 8 new blocks');
}
