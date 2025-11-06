/**
 * ADVANCED CTA BLOCKS
 * Các blocks Call-to-Action nâng cao, bổ sung thêm cho category CTA có sẵn từ grapesjs-tailwind
 * 
 * Category: 'CTA' (sẽ merge vào category CTA có sẵn)
 */

export default function(editor) {
  console.log('📦 Loading Advanced CTA Blocks...');
  
  // ===== VÍ DỤ: Gradient CTA =====
  // Uncomment để sử dụng:
  /*
  editor.BlockManager.add('cta-gradient-banner', {
    label: 'Gradient CTA',
    category: 'CTA',
    media: `<svg viewBox="0 0 24 24" width="40" height="40">
      <path fill="currentColor" d="M12,2L1,21H23M12,6L19.53,19H4.47M11,10V14H13V10M11,16V18H13V16"/>
    </svg>`,
    content: `
      <div class="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 p-12 text-center rounded-2xl shadow-2xl">
        <h2 class="text-5xl font-bold text-white mb-4">Ready to Get Started?</h2>
        <p class="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          Join thousands of satisfied customers and transform your business today
        </p>
        <div class="flex gap-4 justify-center">
          <button class="bg-white text-purple-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition">
            Start Free Trial
          </button>
          <button class="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/10 transition">
            Learn More
          </button>
        </div>
      </div>
    `
  });
  */

  // ===== VÍ DỤ: Split CTA with Image =====
  /*
  editor.BlockManager.add('cta-split-image', {
    label: 'Split CTA',
    category: 'CTA',
    media: `<svg viewBox="0 0 24 24" width="40" height="40">
      <path fill="currentColor" d="M3,3H11V11H3V3M13,3H21V11H13V3M3,13H11V21H3V13M13,13H21V21H13V13Z"/>
    </svg>`,
    content: `
      <div class="grid md:grid-cols-2 gap-8 bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
        <div class="p-12 flex flex-col justify-center">
          <h3 class="text-4xl font-bold text-white mb-4">Take Action Now</h3>
          <p class="text-gray-300 text-lg mb-6">
            Don't miss this limited opportunity to transform your business
          </p>
          <button class="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-lg font-bold self-start transition">
            Get Started Today
          </button>
        </div>
        <div class="bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <div class="text-white text-center p-8">
            <div class="text-6xl font-bold mb-2">50%</div>
            <div class="text-xl">Limited Time Offer</div>
          </div>
        </div>
      </div>
    `
  });
  */

  console.log('✅ Advanced CTA Blocks loaded (currently empty - uncomment examples to use)');
}
