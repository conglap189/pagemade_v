/**
 * CUSTOM HEADER BLOCKS
 * Các blocks Header custom, bổ sung thêm cho category Header có sẵn từ grapesjs-tailwind
 * 
 * Category: 'Header' (sẽ merge vào category Header có sẵn)
 */

export default function(editor) {
  console.log('📦 Loading Custom Header Blocks...');
  
  // ===== STICKY NAVIGATION =====
  editor.BlockManager.add('header-sticky-nav', {
    label: 'Sticky Header',
    category: 'Header',
    media: `<svg viewBox="0 0 24 24" width="40" height="40">
      <path fill="currentColor" d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z"/>
    </svg>`,
    content: `
      <header class="sticky top-0 bg-white shadow-md z-50">
        <nav class="container mx-auto px-6 py-4">
          <div class="flex justify-between items-center">
            <div class="text-2xl font-bold text-gray-800">Your Logo</div>
            <ul class="hidden md:flex space-x-8">
              <li><a href="#" class="text-gray-700 hover:text-blue-600 transition">Home</a></li>
              <li><a href="#" class="text-gray-700 hover:text-blue-600 transition">About</a></li>
              <li><a href="#" class="text-gray-700 hover:text-blue-600 transition">Services</a></li>
              <li><a href="#" class="text-gray-700 hover:text-blue-600 transition">Contact</a></li>
            </ul>
            <button class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
              Get Started
            </button>
          </div>
        </nav>
      </header>
    `
  });

  // ===== TRANSPARENT HEADER =====
  editor.BlockManager.add('header-transparent', {
    label: 'Transparent Header',
    category: 'Header',
    media: `<svg viewBox="0 0 24 24" width="40" height="40">
      <path fill="currentColor" d="M3,4H21V6H3V4M3,11H21V13H3V11M3,18H21V20H3V18Z"/>
    </svg>`,
    content: `
      <header class="absolute top-0 left-0 right-0 z-50 bg-transparent">
        <nav class="container mx-auto px-6 py-6">
          <div class="flex justify-between items-center">
            <div class="text-2xl font-bold text-white">Logo</div>
            <ul class="hidden md:flex space-x-8">
              <li><a href="#" class="text-white hover:text-gray-300 transition">Home</a></li>
              <li><a href="#" class="text-white hover:text-gray-300 transition">Features</a></li>
              <li><a href="#" class="text-white hover:text-gray-300 transition">Pricing</a></li>
            </ul>
            <button class="bg-white text-gray-900 px-6 py-2 rounded-lg hover:bg-gray-100 transition">
              Sign In
            </button>
          </div>
        </nav>
      </header>
    `
  });

  console.log('✅ Custom Header Blocks loaded with 2 new blocks');
}
