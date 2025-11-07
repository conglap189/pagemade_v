/**
 * CONTENT BLOCKS
 * Các blocks nội dung đa dạng: blog posts, articles, galleries...
 * Category: 'Content' (sẽ merge vào category Content có sẵn)
 */

export default function(editor) {
  console.log('📦 Loading Content Blocks...');
  
  // ===== BLOG POST =====
  editor.BlockManager.add('content-blog-post', {
    label: 'Blog Post',
    category: 'Content',
    media: `<svg viewBox="0 0 24 24" width="40" height="40">
      <path fill="currentColor" d="M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M19,5V19H5V5H19M17,17H7V15H17V17M17,13H7V11H17V13M17,9H7V7H17V9Z"/>
    </svg>`,
    content: `
      <article class="max-w-4xl mx-auto py-12 px-4">
        <header class="mb-8">
          <div class="text-blue-600 text-sm font-medium mb-2">Technology</div>
          <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">The Future of Web Development</h1>
          <div class="flex items-center gap-4 text-gray-600">
            <div class="flex items-center gap-2">
              <div class="w-10 h-10 bg-gray-300 rounded-full"></div>
              <span>John Doe</span>
            </div>
            <span>•</span>
            <span>March 15, 2024</span>
            <span>•</span>
            <span>5 min read</span>
          </div>
        </header>
        <div class="prose prose-lg max-w-none">
          <p class="text-xl text-gray-600 leading-relaxed mb-6">
            Web development is evolving at an unprecedented pace. New technologies and frameworks are emerging every day, promising to make our lives as developers easier and more productive.
          </p>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">The Rise of Modern Frameworks</h2>
          <p class="text-gray-700 mb-6">
            Modern JavaScript frameworks have revolutionized how we build web applications. They provide powerful tools for creating interactive, responsive user experiences that work seamlessly across all devices.
          </p>
          <blockquote class="border-l-4 border-blue-500 pl-4 py-2 my-6 bg-blue-50 rounded-r-lg">
            <p class="text-lg italic text-gray-700">"The best way to predict the future is to invent it."</p>
            <footer class="text-sm text-gray-600 mt-2">— Alan Kay</footer>
          </blockquote>
        </div>
      </article>
    `
  });

  editor.BlockManager.add('content-image-gallery', {
    label: 'Image Gallery',
    category: 'Content',
    media: `<svg viewBox="0 0 24 24" width="40" height="40">
      <path fill="currentColor" d="M21,3H3C2,3 1,4 1,5V19A2,2 0 0,0 3,21H21C22,21 23,20 23,19V5C23,4 22,3 21,3M5,17L8.5,12.5L11,15.5L14.5,11L19,17H5Z"/>
    </svg>`,
    content: `
      <div class="py-12 px-4">
        <div class="container mx-auto max-w-6xl">
          <h2 class="text-4xl font-bold text-center text-gray-900 mb-12">Our Gallery</h2>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="col-span-2 row-span-2">
              <div class="h-full bg-gray-300 rounded-lg overflow-hidden">
                <img src="https://via.placeholder.com/600x600/3b82f6/ffffff?text=Large+Image" alt="Gallery" class="w-full h-full object-cover">
              </div>
            </div>
            <div class="bg-gray-300 rounded-lg overflow-hidden">
              <img src="https://via.placeholder.com/300x300/10b981/ffffff?text=Image+1" alt="Gallery" class="w-full h-full object-cover">
            </div>
            <div class="bg-gray-300 rounded-lg overflow-hidden">
              <img src="https://via.placeholder.com/300x300/f59e0b/ffffff?text=Image+2" alt="Gallery" class="w-full h-full object-cover">
            </div>
            <div class="bg-gray-300 rounded-lg overflow-hidden">
              <img src="https://via.placeholder.com/300x300/ef4444/ffffff?text=Image+3" alt="Gallery" class="w-full h-full object-cover">
            </div>
            <div class="bg-gray-300 rounded-lg overflow-hidden">
              <img src="https://via.placeholder.com/300x300/8b5cf6/ffffff?text=Image+4" alt="Gallery" class="w-full h-full object-cover">
            </div>
          </div>
        </div>
      </div>
    `
  });

  editor.BlockManager.add('content-stats', {
    label: 'Statistics',
    category: 'Content',
    media: `<svg viewBox="0 0 24 24" width="40" height="40">
      <path fill="currentColor" d="M22,21H2V3H4V19H6V10H10V19H12V6H16V19H18V14H22V21Z"/>
    </svg>`,
    content: `
      <div class="py-16 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div class="container mx-auto max-w-6xl">
          <div class="grid md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div class="text-5xl font-bold mb-2">10K+</div>
              <div class="text-xl text-blue-100">Happy Customers</div>
            </div>
            <div>
              <div class="text-5xl font-bold mb-2">500+</div>
              <div class="text-xl text-blue-100">Projects Completed</div>
            </div>
            <div>
              <div class="text-5xl font-bold mb-2">99.9%</div>
              <div class="text-xl text-blue-100">Uptime</div>
            </div>
            <div>
              <div class="text-5xl font-bold mb-2">24/7</div>
              <div class="text-xl text-blue-100">Support</div>
            </div>
          </div>
        </div>
      </div>
    `
  });

  editor.BlockManager.add('content-faq', {
    label: 'FAQ Section',
    category: 'Content',
    media: `<svg viewBox="0 0 24 24" width="40" height="40">
      <path fill="currentColor" d="M11,18H13V16H11V18M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,6A4,4 0 0,0 8,10H10A2,2 0 0,1 12,8A2,2 0 0,1 14,10C14,12 11,11.75 11,15H13C13,12.75 16,12.5 16,10A4,4 0 0,0 12,6Z"/>
    </svg>`,
    content: `
      <div class="py-16 px-4">
        <div class="container mx-auto max-w-4xl">
          <h2 class="text-4xl font-bold text-center text-gray-900 mb-4">Frequently Asked Questions</h2>
          <p class="text-xl text-center text-gray-600 mb-12">Got questions? We've got answers</p>
          <div class="space-y-6">
            <div class="bg-white rounded-lg shadow-md p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-2">How do I get started?</h3>
              <p class="text-gray-600">Getting started is easy! Simply sign up for a free account and follow our step-by-step onboarding process.</p>
            </div>
            <div class="bg-white rounded-lg shadow-md p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-2">What payment methods do you accept?</h3>
              <p class="text-gray-600">We accept all major credit cards, PayPal, and bank transfers for enterprise customers.</p>
            </div>
            <div class="bg-white rounded-lg shadow-md p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-2">Can I cancel my subscription anytime?</h3>
              <p class="text-gray-600">Yes, you can cancel your subscription at any time. No questions asked.</p>
            </div>
            <div class="bg-white rounded-lg shadow-md p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-2">Do you offer customer support?</h3>
              <p class="text-gray-600">We offer 24/7 customer support via email, chat, and phone for all paid plans.</p>
            </div>
          </div>
        </div>
      </div>
    `
  });

  console.log('✅ Content Blocks loaded with 4 new blocks');
}