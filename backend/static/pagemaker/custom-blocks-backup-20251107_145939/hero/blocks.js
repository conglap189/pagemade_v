/**
 * HERO BLOCKS
 * Các blocks hero section cho trang chủ
 * Category: 'Hero' (sẽ merge vào category Hero có sẵn)
 */

export default function(editor) {
  console.log('📦 Loading Hero Blocks...');
  
  // ===== CLASSIC HERO =====
  editor.BlockManager.add('hero-classic', {
    label: 'Classic Hero',
    category: 'Hero',
    media: `<svg viewBox="0 0 24 24" width="40" height="40">
      <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16Z"/>
    </svg>`,
    content: `
      <section class="bg-gradient-to-br from-blue-600 to-purple-700 text-white py-20 px-4">
        <div class="container mx-auto max-w-6xl text-center">
          <h1 class="text-5xl md:text-6xl font-bold mb-6">Welcome to Our Platform</h1>
          <p class="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
            Transform your business with our innovative solutions designed for success
          </p>
          <div class="flex gap-4 justify-center">
            <button class="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition">
              Get Started Free
            </button>
            <button class="border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/10 transition">
              Watch Demo
            </button>
          </div>
        </div>
      </section>
    `
  });

  editor.BlockManager.add('hero-minimal', {
    label: 'Minimal Hero',
    category: 'Hero',
    media: `<svg viewBox="0 0 24 24" width="40" height="40">
      <path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
    </svg>`,
    content: `
      <section class="bg-white py-32 px-4">
        <div class="container mx-auto max-w-4xl text-center">
          <h1 class="text-4xl md:text-5xl font-light text-gray-900 mb-6">
            Simple. Clean. Effective.
          </h1>
          <p class="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Experience the power of minimal design with maximum impact
          </p>
          <button class="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition">
            Start Your Journey
          </button>
        </div>
      </section>
    `
  });

  editor.BlockManager.add('hero-split', {
    label: 'Split Hero',
    category: 'Hero',
    media: `<svg viewBox="0 0 24 24" width="40" height="40">
      <path fill="currentColor" d="M3,3H11V11H3V3M13,3H21V11H13V3M3,13H11V21H3V13M13,13H21V21H13V13Z"/>
    </svg>`,
    content: `
      <section class="grid md:grid-cols-2 min-h-screen">
        <div class="bg-gray-900 text-white p-12 flex flex-col justify-center">
          <h1 class="text-4xl md:text-5xl font-bold mb-6">Build Something Amazing</h1>
          <p class="text-xl text-gray-300 mb-8">
            Join thousands of creators who are already changing the world
          </p>
          <div class="flex gap-4">
            <button class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition">
              Start Building
            </button>
            <button class="border-2 border-gray-600 text-gray-300 px-6 py-3 rounded-lg font-semibold hover:border-white transition">
              Learn More
            </button>
          </div>
        </div>
        <div class="bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <div class="text-white text-center p-8">
            <div class="text-8xl font-bold mb-4">10K+</div>
            <div class="text-2xl">Active Users</div>
          </div>
        </div>
      </section>
    `
  });

  editor.BlockManager.add('hero-video', {
    label: 'Video Hero',
    category: 'Hero',
    media: `<svg viewBox="0 0 24 24" width="40" height="40">
      <path fill="currentColor" d="M17,10.5V7A1,1 0 0,0 16,6H4A1,1 0 0,0 3,7V17A1,1 0 0,0 4,18H16A1,1 0 0,0 17,17V13.5L21,17.5V6.5L17,10.5Z"/>
    </svg>`,
    content: `
      <section class="relative h-screen flex items-center justify-center overflow-hidden">
        <div class="absolute inset-0 bg-black/50 z-10"></div>
        <div class="absolute inset-0">
          <div class="w-full h-full bg-gradient-to-br from-gray-900 to-gray-700"></div>
        </div>
        <div class="relative z-20 text-center text-white px-4">
          <div class="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-8 hover:bg-white/30 transition cursor-pointer">
            <svg class="w-12 h-12 ml-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8,5.14V19.14L19,12.14L8,5.14Z"/>
            </svg>
          </div>
          <h1 class="text-4xl md:text-6xl font-bold mb-6">Watch Our Story</h1>
          <p class="text-xl md:text-2xl mb-8 text-gray-200 max-w-3xl mx-auto">
            See how we're revolutionizing the industry one step at a time
          </p>
          <button class="bg-white text-gray-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition">
            Play Video
          </button>
        </div>
      </section>
    `
  });

  editor.BlockManager.add('hero-pattern', {
    label: 'Pattern Hero',
    category: 'Hero',
    media: `<svg viewBox="0 0 24 24" width="40" height="40">
      <path fill="currentColor" d="M12,2L13.09,8.26L19,7L15.45,11.82L19,16.64L13.09,15.38L12,22L10.91,15.38L5,16.64L8.55,11.82L5,7L10.91,8.26L12,2Z"/>
    </svg>`,
    content: `
      <section class="relative bg-gradient-to-r from-indigo-600 to-purple-600 py-20 px-4 overflow-hidden">
        <div class="absolute inset-0 opacity-10">
          <div class="absolute inset-0" style="background-image: url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');"></div>
        </div>
        <div class="relative z-10 container mx-auto max-w-6xl text-center text-white">
          <h1 class="text-5xl md:text-6xl font-bold mb-6">Stand Out from the Crowd</h1>
          <p class="text-xl md:text-2xl mb-8 text-indigo-100 max-w-3xl mx-auto">
            Unique patterns and designs that make your brand unforgettable
          </p>
          <div class="flex gap-4 justify-center">
            <button class="bg-white text-indigo-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition">
              Get Started
            </button>
            <button class="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/10 transition">
              View Portfolio
            </button>
          </div>
        </div>
      </section>
    `
  });

  console.log('✅ Hero Blocks loaded with 5 new blocks');
}