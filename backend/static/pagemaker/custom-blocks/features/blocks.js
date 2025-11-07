/**
 * FEATURES BLOCKS
 * Các blocks hiển thị tính năng, đặc điểm sản phẩm/dịch vụ
 * Category: 'Features' (sẽ merge vào category Features có sẵn)
 */

export default function(editor) {
  console.log('📦 Loading Features Blocks...');
  
  // ===== GRID FEATURES =====
  editor.BlockManager.add('features-grid-3', {
    label: '3-Column Features',
    category: 'Features',
    media: `<svg viewBox="0 0 24 24" width="40" height="40">
      <path fill="currentColor" d="M4,4H10V10H4V4M20,4V10H14V4H20M14,15H16V13H14V11H16V13H18V11H20V13H18V15H20V18H18V20H16V18H13V20H11V16H14V15M16,15V18H18V15H16M4,20V14H10V20H4M6,6V8H8V6H6M16,6V8H18V6H16M6,16V18H8V16H6Z"/>
    </svg>`,
    content: `
      <div class="grid md:grid-cols-3 gap-8 py-12">
        <div class="text-center">
          <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16Z"/>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">Fast Performance</h3>
          <p class="text-gray-600">Lightning-fast speeds that keep your users engaged and satisfied.</p>
        </div>
        <div class="text-center">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11H16V16H8V11H9.2V10C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.4,8.7 10.4,10V11H13.6V10C13.6,8.7 12.8,8.2 12,8.2Z"/>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">Secure Platform</h3>
          <p class="text-gray-600">Enterprise-grade security to protect your data and privacy.</p>
        </div>
        <div class="text-center">
          <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M11,7H13V13H11V7M11,15H13V17H11V15Z"/>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">24/7 Support</h3>
          <p class="text-gray-600">Round-the-clock assistance whenever you need help.</p>
        </div>
      </div>
    `
  });

  editor.BlockManager.add('features-icon-list', {
    label: 'Icon List Features',
    category: 'Features',
    media: `<svg viewBox="0 0 24 24" width="40" height="40">
      <path fill="currentColor" d="M3,4H7V8H3V4M9,5V7H21V5H9M3,10H7V14H3V10M9,11V13H21V11H9M3,16H7V20H3V16M9,17V19H21V17H9Z"/>
    </svg>`,
    content: `
      <div class="bg-gray-50 p-8 rounded-xl">
        <h2 class="text-3xl font-bold text-gray-900 mb-8 text-center">Everything You Need</h2>
        <div class="space-y-6 max-w-3xl mx-auto">
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"/>
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900 mb-1">Advanced Analytics</h3>
              <p class="text-gray-600">Track performance with detailed insights and reports.</p>
            </div>
          </div>
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M11,16.5L6.5,12L7.91,10.59L11,13.67L16.59,8.09L18,9.5L11,16.5Z"/>
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900 mb-1">Easy Integration</h3>
              <p class="text-gray-600">Seamlessly connect with your favorite tools and services.</p>
            </div>
          </div>
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8M12,10A2,2 0 0,0 10,12A2,2 0 0,0 12,14A2,2 0 0,0 14,12A2,2 0 0,0 12,10M10,22C9.75,22 9.54,21.82 9.5,21.58L9.13,18.93C8.5,18.68 7.96,18.34 7.44,17.94L4.95,18.95C4.73,19.03 4.46,18.95 4.34,18.73L2.34,15.27C2.21,15.05 2.27,14.78 2.46,14.63L4.57,12.97L4.5,12L4.57,11.03L2.46,9.37C2.27,9.22 2.21,8.95 2.34,8.73L4.34,5.27C4.46,5.05 4.73,4.96 4.95,5.05L7.44,6.05C7.96,5.66 8.5,5.32 9.13,5.07L9.5,2.42C9.54,2.18 9.75,2 10,2H14C14.25,2 14.46,2.18 14.5,2.42L14.87,5.07C15.5,5.32 16.04,5.66 16.56,6.05L19.05,5.05C19.27,4.96 19.54,5.05 19.66,5.27L21.66,8.73C21.79,8.95 21.73,9.22 21.54,9.37L19.43,11.03L19.5,12L19.43,12.97L21.54,14.63C21.73,14.78 21.79,15.05 21.66,15.27L19.66,18.73C19.54,18.95 19.27,19.04 19.05,18.95L16.56,17.95C16.04,18.34 15.5,18.68 14.87,18.93L14.5,21.58C14.46,21.82 14.25,22 14,22H10M11.25,4L10.88,6.61C9.68,6.86 8.62,7.5 7.85,8.39L5.44,7.35L4.69,8.65L6.8,10.2C6.4,11.37 6.4,12.64 6.8,13.8L4.68,15.36L5.43,16.66L7.86,15.62C8.63,16.5 9.68,17.14 10.87,17.38L11.24,20H12.76L13.13,17.39C14.32,17.14 15.37,16.5 16.14,15.62L18.57,16.66L19.32,15.36L17.2,13.81C17.6,12.64 17.6,11.37 17.2,10.2L19.31,8.65L18.56,7.35L16.15,8.39C15.38,7.5 14.32,6.86 13.12,6.62L12.75,4H11.25Z"/>
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900 mb-1">Customizable</h3>
              <p class="text-gray-600">Tailor every aspect to match your brand and needs.</p>
            </div>
          </div>
        </div>
      </div>
    `
  });

  editor.BlockManager.add('features-tabs', {
    label: 'Tabbed Features',
    category: 'Features',
    media: `<svg viewBox="0 0 24 24" width="40" height="40">
      <path fill="currentColor" d="M3,3H21V21H3V3M5,5V19H19V5H5M7,7H9V9H7V7M11,7H13V9H11V7M15,7H17V9H15V7M7,11H9V13H7V11M11,11H13V13H11V11M15,11H17V13H15V11M7,15H9V17H7V15M11,15H13V17H11V15M15,15H17V17H15V15Z"/>
    </svg>`,
    content: `
      <div class="bg-white rounded-xl shadow-lg overflow-hidden">
        <div class="border-b">
          <div class="flex">
            <button class="px-6 py-3 bg-blue-600 text-white font-medium">Overview</button>
            <button class="px-6 py-3 text-gray-600 hover:bg-gray-50 font-medium">Features</button>
            <button class="px-6 py-3 text-gray-600 hover:bg-gray-50 font-medium">Pricing</button>
          </div>
        </div>
        <div class="p-8">
          <h3 class="text-2xl font-bold text-gray-900 mb-4">Powerful Features</h3>
          <p class="text-gray-600 mb-6">Discover everything our platform has to offer to help you succeed.</p>
          <div class="grid md:grid-cols-2 gap-6">
            <div class="flex items-start gap-3">
              <div class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"/>
                </svg>
              </div>
              <div>
                <h4 class="font-semibold text-gray-900">Cloud Storage</h4>
                <p class="text-sm text-gray-600">Unlimited secure storage for all your files</p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <div class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"/>
                </svg>
              </div>
              <div>
                <h4 class="font-semibold text-gray-900">API Access</h4>
                <p class="text-sm text-gray-600">Full REST API for custom integrations</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
  });

  console.log('✅ Features Blocks loaded with 3 new blocks');
}