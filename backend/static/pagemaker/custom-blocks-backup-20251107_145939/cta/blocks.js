/**
 * ADVANCED CTA BLOCKS
 * Các blocks Call-to-Action nâng cao, bổ sung thêm cho category CTA có sẵn từ grapesjs-tailwind
 * 
 * Category: 'CTA' (sẽ merge vào category CTA có sẵn)
 */

export default function(editor) {
  console.log('📦 Loading Advanced CTA Blocks...');
  
  // ===== GRADIENT CTA BLOCKS =====
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

  editor.BlockManager.add('cta-minimal', {
    label: 'Minimal CTA',
    category: 'CTA',
    media: `<svg viewBox="0 0 24 24" width="40" height="40">
      <path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
    </svg>`,
    content: `
      <div class="bg-gray-50 p-8 text-center rounded-lg">
        <h3 class="text-2xl font-light text-gray-900 mb-4">Simple and Clean</h3>
        <p class="text-gray-600 mb-6">Get started with our minimal approach</p>
        <button class="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition">
          Get Started
        </button>
      </div>
    `
  });

  editor.BlockManager.add('cta-countdown', {
    label: 'Countdown CTA',
    category: 'CTA',
    media: `<svg viewBox="0 0 24 24" width="40" height="40">
      <path fill="currentColor" d="M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z"/>
    </svg>`,
    content: `
      <div class="bg-red-600 text-white p-8 rounded-xl text-center">
        <h3 class="text-3xl font-bold mb-2">Limited Time Offer!</h3>
        <div class="flex justify-center gap-4 mb-6">
          <div class="bg-white/20 rounded-lg p-3">
            <div class="text-2xl font-bold">24</div>
            <div class="text-sm">Hours</div>
          </div>
          <div class="bg-white/20 rounded-lg p-3">
            <div class="text-2xl font-bold">00</div>
            <div class="text-sm">Minutes</div>
          </div>
          <div class="bg-white/20 rounded-lg p-3">
            <div class="text-2xl font-bold">00</div>
            <div class="text-sm">Seconds</div>
          </div>
        </div>
        <button class="bg-white text-red-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition">
          Claim Your Discount
        </button>
      </div>
    `
  });

  // ===== SPLIT CTA BLOCKS =====
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

  editor.BlockManager.add('cta-testimonial', {
    label: 'Testimonial CTA',
    category: 'CTA',
    media: `<svg viewBox="0 0 24 24" width="40" height="40">
      <path fill="currentColor" d="M14,17H17L19,13V7H13V13H16M6,17H9L11,13V7H5V13H8L6,17Z"/>
    </svg>`,
    content: `
      <div class="bg-blue-50 p-8 rounded-xl">
        <blockquote class="text-lg text-gray-700 mb-6 italic">
          "This service completely transformed our business. The results were beyond our expectations!"
        </blockquote>
        <div class="flex items-center justify-between">
          <div>
            <div class="font-semibold text-gray-900">Sarah Johnson</div>
            <div class="text-sm text-gray-600">CEO, TechCorp</div>
          </div>
          <button class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
            Start Your Journey
          </button>
        </div>
      </div>
    `
  });

  editor.BlockManager.add('cta-video', {
    label: 'Video CTA',
    category: 'CTA',
    media: `<svg viewBox="0 0 24 24" width="40" height="40">
      <path fill="currentColor" d="M17,10.5V7A1,1 0 0,0 16,6H4A1,1 0 0,0 3,7V17A1,1 0 0,0 4,18H16A1,1 0 0,0 17,17V13.5L21,17.5V6.5L17,10.5Z"/>
    </svg>`,
    content: `
      <div class="relative bg-black rounded-xl overflow-hidden">
        <div class="aspect-video flex items-center justify-center">
          <div class="text-center text-white">
            <div class="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 hover:bg-white/30 transition cursor-pointer">
              <svg class="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8,5.14V19.14L19,12.14L8,5.14Z"/>
              </svg>
            </div>
            <h3 class="text-2xl font-bold mb-2">Watch How It Works</h3>
            <p class="text-gray-300 mb-6">See our platform in action</p>
            <button class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
              Try It Free
            </button>
          </div>
        </div>
      </div>
    `
  });

  console.log('✅ Advanced CTA Blocks loaded with 6 new blocks');
}
