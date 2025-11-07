/**
 * FOOTER BLOCKS
 * Các blocks footer cho trang web
 * Category: 'Footer' (sẽ merge vào category Footer có sẵn)
 */

export default function(editor) {
  console.log('📦 Loading Footer Blocks...');
  
  // ===== STANDARD FOOTER =====
  editor.BlockManager.add('footer-standard', {
    label: 'Standard Footer',
    category: 'Footer',
    media: `<svg viewBox="0 0 24 24" width="40" height="40">
      <path fill="currentColor" d="M4,4H7V7H4V4M9,4H12V7H9V4M14,4H17V7H14V4M19,4H22V7H19V4M4,9H7V12H4V9M19,9H22V12H19V9M4,14H7V17H4V14M19,14H22V17H19V14M4,19H7V22H4V19M9,19H12V22H9V19M14,19H17V22H14V19M19,19H22V22H19V19Z"/>
    </svg>`,
    content: `
      <footer class="bg-gray-900 text-white py-12 px-4">
        <div class="container mx-auto max-w-6xl">
          <div class="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 class="text-2xl font-bold mb-4">YourBrand</h3>
              <p class="text-gray-400">Creating amazing digital experiences for businesses worldwide.</p>
            </div>
            <div>
              <h4 class="text-lg font-semibold mb-4">Product</h4>
              <ul class="space-y-2">
                <li><a href="#" class="text-gray-400 hover:text-white transition">Features</a></li>
                <li><a href="#" class="text-gray-400 hover:text-white transition">Pricing</a></li>
                <li><a href="#" class="text-gray-400 hover:text-white transition">Use Cases</a></li>
                <li><a href="#" class="text-gray-400 hover:text-white transition">API</a></li>
              </ul>
            </div>
            <div>
              <h4 class="text-lg font-semibold mb-4">Company</h4>
              <ul class="space-y-2">
                <li><a href="#" class="text-gray-400 hover:text-white transition">About</a></li>
                <li><a href="#" class="text-gray-400 hover:text-white transition">Blog</a></li>
                <li><a href="#" class="text-gray-400 hover:text-white transition">Careers</a></li>
                <li><a href="#" class="text-gray-400 hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 class="text-lg font-semibold mb-4">Legal</h4>
              <ul class="space-y-2">
                <li><a href="#" class="text-gray-400 hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" class="text-gray-400 hover:text-white transition">Terms of Service</a></li>
                <li><a href="#" class="text-gray-400 hover:text-white transition">Cookie Policy</a></li>
                <li><a href="#" class="text-gray-400 hover:text-white transition">GDPR</a></li>
              </ul>
            </div>
          </div>
          <div class="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p class="text-gray-400 mb-4 md:mb-0">© 2024 YourBrand. All rights reserved.</p>
            <div class="flex gap-4">
              <div class="w-8 h-8 bg-gray-700 rounded-full hover:bg-gray-600 transition cursor-pointer"></div>
              <div class="w-8 h-8 bg-gray-700 rounded-full hover:bg-gray-600 transition cursor-pointer"></div>
              <div class="w-8 h-8 bg-gray-700 rounded-full hover:bg-gray-600 transition cursor-pointer"></div>
              <div class="w-8 h-8 bg-gray-700 rounded-full hover:bg-gray-600 transition cursor-pointer"></div>
            </div>
          </div>
        </div>
      </footer>
    `
  });

  editor.BlockManager.add('footer-minimal', {
    label: 'Minimal Footer',
    category: 'Footer',
    media: `<svg viewBox="0 0 24 24" width="40" height="40">
      <path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
    </svg>`,
    content: `
      <footer class="bg-white border-t border-gray-200 py-8 px-4">
        <div class="container mx-auto max-w-6xl flex flex-col md:flex-row justify-between items-center">
          <div class="text-2xl font-bold text-gray-900 mb-4 md:mb-0">YourBrand</div>
          <div class="flex gap-8 text-sm">
            <a href="#" class="text-gray-600 hover:text-gray-900 transition">About</a>
            <a href="#" class="text-gray-600 hover:text-gray-900 transition">Services</a>
            <a href="#" class="text-gray-600 hover:text-gray-900 transition">Contact</a>
            <a href="#" class="text-gray-600 hover:text-gray-900 transition">Privacy</a>
          </div>
          <div class="text-sm text-gray-500 mt-4 md:mt-0">© 2024 All rights reserved</div>
        </div>
      </footer>
    `
  });

  editor.BlockManager.add('footer-cta', {
    label: 'CTA Footer',
    category: 'Footer',
    media: `<svg viewBox="0 0 24 24" width="40" height="40">
      <path fill="currentColor" d="M12,2L1,21H23M12,6L19.53,19H4.47M11,10V14H13V10M11,16V18H13V16"/>
    </svg>`,
    content: `
      <footer class="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16 px-4">
        <div class="container mx-auto max-w-4xl text-center">
          <h2 class="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p class="text-xl mb-8 text-blue-100">Join thousands of satisfied customers today</p>
          <div class="flex gap-4 justify-center mb-12">
            <button class="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition">
              Start Free Trial
            </button>
            <button class="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/10 transition">
              Schedule Demo
            </button>
          </div>
          <div class="border-t border-white/20 pt-8">
            <div class="flex flex-col md:flex-row justify-between items-center">
              <div class="text-2xl font-bold mb-4 md:mb-0">YourBrand</div>
              <div class="flex gap-6 text-sm">
                <a href="#" class="text-blue-100 hover:text-white transition">Privacy</a>
                <a href="#" class="text-blue-100 hover:text-white transition">Terms</a>
                <a href="#" class="text-blue-100 hover:text-white transition">Support</a>
              </div>
            </div>
            <div class="text-center text-blue-100 text-sm mt-6">© 2024 YourBrand. All rights reserved.</div>
          </div>
        </div>
      </footer>
    `
  });

  editor.BlockManager.add('footer-dark', {
    label: 'Dark Footer',
    category: 'Footer',
    media: `<svg viewBox="0 0 24 24" width="40" height="40">
      <path fill="currentColor" d="M17.75,4.09L15.22,6.03L16.13,9.09L13.5,7.28L10.87,9.09L11.78,6.03L9.25,4.09L12.44,4L13.5,1L14.56,4L17.75,4.09M21.25,11L19.61,12.25L20.2,14.23L18.5,13.06L16.8,14.23L17.39,12.25L15.75,11L17.81,10.95L18.5,9L19.19,10.95L21.25,11M18.97,15.95C19.8,15.87 20.69,17.05 20.16,17.8C19.84,18.25 19.5,18.67 19.08,19.07C15.17,23 8.84,23 4.94,19.07C3.12,17.26 1.88,15.06 1.44,12.81C1.31,12.13 2.25,11.53 2.87,11.82C3.44,12.08 3.95,12.39 4.4,12.76C7.6,15.45 11.89,16.74 16.21,15.75C18.1,15.36 19.74,14.14 19.95,12.26C19.97,12.16 19.97,12.05 19.97,11.95M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2Z"/>
    </svg>`,
    content: `
      <footer class="bg-black text-white py-16 px-4">
        <div class="container mx-auto max-w-6xl">
          <div class="grid md:grid-cols-5 gap-8 mb-12">
            <div class="md:col-span-2">
              <h3 class="text-3xl font-bold mb-4">YourBrand</h3>
              <p class="text-gray-400 mb-6">Empowering businesses with cutting-edge technology solutions.</p>
              <div class="flex gap-4">
                <div class="w-10 h-10 bg-gray-800 rounded-full hover:bg-gray-700 transition cursor-pointer"></div>
                <div class="w-10 h-10 bg-gray-800 rounded-full hover:bg-gray-700 transition cursor-pointer"></div>
                <div class="w-10 h-10 bg-gray-800 rounded-full hover:bg-gray-700 transition cursor-pointer"></div>
                <div class="w-10 h-10 bg-gray-800 rounded-full hover:bg-gray-700 transition cursor-pointer"></div>
              </div>
            </div>
            <div>
              <h4 class="text-lg font-semibold mb-4">Product</h4>
              <ul class="space-y-2">
                <li><a href="#" class="text-gray-400 hover:text-white transition">Features</a></li>
                <li><a href="#" class="text-gray-400 hover:text-white transition">Pricing</a></li>
                <li><a href="#" class="text-gray-400 hover:text-white transition">Security</a></li>
                <li><a href="#" class="text-gray-400 hover:text-white transition">Roadmap</a></li>
              </ul>
            </div>
            <div>
              <h4 class="text-lg font-semibold mb-4">Resources</h4>
              <ul class="space-y-2">
                <li><a href="#" class="text-gray-400 hover:text-white transition">Documentation</a></li>
                <li><a href="#" class="text-gray-400 hover:text-white transition">API Reference</a></li>
                <li><a href="#" class="text-gray-400 hover:text-white transition">Guides</a></li>
                <li><a href="#" class="text-gray-400 hover:text-white transition">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 class="text-lg font-semibold mb-4">Company</h4>
              <ul class="space-y-2">
                <li><a href="#" class="text-gray-400 hover:text-white transition">About</a></li>
                <li><a href="#" class="text-gray-400 hover:text-white transition">Blog</a></li>
                <li><a href="#" class="text-gray-400 hover:text-white transition">Careers</a></li>
                <li><a href="#" class="text-gray-400 hover:text-white transition">Press</a></li>
              </ul>
            </div>
          </div>
          <div class="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p class="text-gray-400 mb-4 md:mb-0">© 2024 YourBrand. All rights reserved.</p>
            <div class="flex gap-6 text-sm">
              <a href="#" class="text-gray-400 hover:text-white transition">Privacy Policy</a>
              <a href="#" class="text-gray-400 hover:text-white transition">Terms of Service</a>
              <a href="#" class="text-gray-400 hover:text-white transition">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    `
  });

  console.log('✅ Footer Blocks loaded with 4 new blocks');
}