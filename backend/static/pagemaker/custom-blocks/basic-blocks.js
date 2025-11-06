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
  
  // ===== VÍ DỤ: Text Block =====
  // Uncomment để sử dụng:
  /*
  editor.BlockManager.add('basic-text', {
    label: 'Text Block',
    category: 'Basic',
    media: `<svg viewBox="0 0 24 24" width="40" height="40">
      <path fill="currentColor" d="M3,5H21V7H3V5M3,13H21V11H3V13M3,19H21V17H3V19Z"/>
    </svg>`,
    content: '<p class="text-gray-700 text-base">Your text content here...</p>'
  });
  */

  // ===== VÍ DỤ: Image Block =====
  /*
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
  */

  // ===== VÍ DỤ: Button Block =====
  /*
  editor.BlockManager.add('basic-button', {
    label: 'Button',
    category: 'Basic',
    media: `<svg viewBox="0 0 24 24" width="40" height="40">
      <path fill="currentColor" d="M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
    </svg>`,
    content: '<button class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition">Click Me</button>'
  });
  */

  console.log('✅ Basic Blocks loaded (currently empty - uncomment examples to use)');
}
