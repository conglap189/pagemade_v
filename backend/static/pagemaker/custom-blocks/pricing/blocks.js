/**
 * PRICING BLOCKS
 * Các blocks hiển thị bảng giá, gói dịch vụ
 * Category: 'Pricing' (sẽ merge vào category Pricing có sẵn)
 */

export default function(editor) {
  console.log('📦 Loading Pricing Blocks...');
  
  // ===== PRICING CARDS =====
  editor.BlockManager.add('pricing-cards-3', {
    label: '3-Column Pricing',
    category: 'Pricing',
    media: `<svg viewBox="0 0 24 24" width="40" height="40">
      <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16Z"/>
    </svg>`,
    content: `
      <div class="py-16 px-4 bg-gray-50">
        <div class="container mx-auto max-w-6xl">
          <h2 class="text-4xl font-bold text-center text-gray-900 mb-4">Choose Your Plan</h2>
          <p class="text-xl text-center text-gray-600 mb-12">Flexible pricing for businesses of all sizes</p>
          <div class="grid md:grid-cols-3 gap-8">
            <div class="bg-white rounded-xl shadow-lg p-8">
              <h3 class="text-2xl font-bold text-gray-900 mb-2">Starter</h3>
              <p class="text-gray-600 mb-6">Perfect for small teams</p>
              <div class="text-4xl font-bold text-gray-900 mb-6">$29<span class="text-lg text-gray-600">/month</span></div>
              <ul class="space-y-3 mb-8">
                <li class="flex items-center gap-2">
                  <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"/>
                  </svg>
                  <span class="text-gray-700">Up to 10 users</span>
                </li>
                <li class="flex items-center gap-2">
                  <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"/>
                  </svg>
                  <span class="text-gray-700">10GB storage</span>
                </li>
                <li class="flex items-center gap-2">
                  <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"/>
                  </svg>
                  <span class="text-gray-700">Basic support</span>
                </li>
              </ul>
              <button class="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition">
                Get Started
              </button>
            </div>
            <div class="bg-blue-600 text-white rounded-xl shadow-xl p-8 transform scale-105">
              <div class="bg-yellow-400 text-blue-900 text-sm font-bold px-3 py-1 rounded-full inline-block mb-4">POPULAR</div>
              <h3 class="text-2xl font-bold mb-2">Professional</h3>
              <p class="text-blue-100 mb-6">Best for growing businesses</p>
              <div class="text-4xl font-bold mb-6">$99<span class="text-lg text-blue-100">/month</span></div>
              <ul class="space-y-3 mb-8">
                <li class="flex items-center gap-2">
                  <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"/>
                  </svg>
                  <span>Up to 50 users</span>
                </li>
                <li class="flex items-center gap-2">
                  <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"/>
                  </svg>
                  <span>100GB storage</span>
                </li>
                <li class="flex items-center gap-2">
                  <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"/>
                  </svg>
                  <span>Priority support</span>
                </li>
                <li class="flex items-center gap-2">
                  <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"/>
                  </svg>
                  <span>Advanced features</span>
                </li>
              </ul>
              <button class="w-full bg-white text-blue-600 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
                Start Free Trial
              </button>
            </div>
            <div class="bg-white rounded-xl shadow-lg p-8">
              <h3 class="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
              <p class="text-gray-600 mb-6">For large organizations</p>
              <div class="text-4xl font-bold text-gray-900 mb-6">Custom</div>
              <ul class="space-y-3 mb-8">
                <li class="flex items-center gap-2">
                  <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"/>
                  </svg>
                  <span class="text-gray-700">Unlimited users</span>
                </li>
                <li class="flex items-center gap-2">
                  <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"/>
                  </svg>
                  <span class="text-gray-700">Unlimited storage</span>
                </li>
                <li class="flex items-center gap-2">
                  <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"/>
                  </svg>
                  <span class="text-gray-700">24/7 dedicated support</span>
                </li>
                <li class="flex items-center gap-2">
                  <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"/>
                  </svg>
                  <span class="text-gray-700">Custom integrations</span>
                </li>
              </ul>
              <button class="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </div>
    `
  });

  editor.BlockManager.add('pricing-simple', {
    label: 'Simple Pricing',
    category: 'Pricing',
    media: `<svg viewBox="0 0 24 24" width="40" height="40">
      <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16Z"/>
    </svg>`,
    content: `
      <div class="py-16 px-4">
        <div class="container mx-auto max-w-4xl text-center">
          <h2 class="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
          <p class="text-xl text-gray-600 mb-12">No hidden fees. Cancel anytime.</p>
          <div class="bg-white rounded-2xl shadow-xl p-12 max-w-2xl mx-auto">
            <h3 class="text-3xl font-bold text-gray-900 mb-4">Pro Plan</h3>
            <div class="text-6xl font-bold text-gray-900 mb-6">$49<span class="text-2xl text-gray-600">/month</span></div>
            <p class="text-lg text-gray-600 mb-8">Everything you need to grow your business</p>
            <ul class="text-left space-y-3 mb-8 max-w-md mx-auto">
              <li class="flex items-center gap-3">
                <svg class="w-6 h-6 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"/>
                </svg>
                <span class="text-gray-700">Unlimited projects</span>
              </li>
              <li class="flex items-center gap-3">
                <svg class="w-6 h-6 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"/>
                </svg>
                <span class="text-gray-700">Advanced analytics</span>
              </li>
              <li class="flex items-center gap-3">
                <svg class="w-6 h-6 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"/>
                </svg>
                <span class="text-gray-700">Priority support</span>
              </li>
              <li class="flex items-center gap-3">
                <svg class="w-6 h-6 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"/>
                </svg>
                <span class="text-gray-700">Custom integrations</span>
              </li>
            </ul>
            <button class="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition">
              Start 14-Day Free Trial
            </button>
            <p class="text-sm text-gray-500 mt-4">No credit card required</p>
          </div>
        </div>
      </div>
    `
  });

  editor.BlockManager.add('pricing-comparison', {
    label: 'Pricing Comparison',
    category: 'Pricing',
    media: `<svg viewBox="0 0 24 24" width="40" height="40">
      <path fill="currentColor" d="M3,3H21V21H3V3M5,5V19H19V5H5M7,7H9V9H7V7M11,7H13V9H11V7M15,7H17V9H15V7M7,11H9V13H7V11M11,11H13V13H11V11M15,11H17V13H15V11M7,15H9V17H7V15M11,15H13V17H11V15M15,15H17V17H15V15Z"/>
    </svg>`,
    content: `
      <div class="py-16 px-4 bg-gray-50">
        <div class="container mx-auto max-w-6xl">
          <h2 class="text-4xl font-bold text-center text-gray-900 mb-12">Compare Plans</h2>
          <div class="bg-white rounded-xl shadow-lg overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-4 text-left text-sm font-medium text-gray-900">Features</th>
                    <th class="px-6 py-4 text-center text-sm font-medium text-gray-900">Starter</th>
                    <th class="px-6 py-4 text-center text-sm font-medium text-blue-600">Professional</th>
                    <th class="px-6 py-4 text-center text-sm font-medium text-gray-900">Enterprise</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr>
                    <td class="px-6 py-4 text-sm text-gray-900">Price</td>
                    <td class="px-6 py-4 text-center text-sm font-medium">$29/mo</td>
                    <td class="px-6 py-4 text-center text-sm font-medium text-blue-600">$99/mo</td>
                    <td class="px-6 py-4 text-center text-sm font-medium">Custom</td>
                  </tr>
                  <tr>
                    <td class="px-6 py-4 text-sm text-gray-900">Users</td>
                    <td class="px-6 py-4 text-center">Up to 10</td>
                    <td class="px-6 py-4 text-center">Up to 50</td>
                    <td class="px-6 py-4 text-center">Unlimited</td>
                  </tr>
                  <tr>
                    <td class="px-6 py-4 text-sm text-gray-900">Storage</td>
                    <td class="px-6 py-4 text-center">10GB</td>
                    <td class="px-6 py-4 text-center">100GB</td>
                    <td class="px-6 py-4 text-center">Unlimited</td>
                  </tr>
                  <tr>
                    <td class="px-6 py-4 text-sm text-gray-900">API Access</td>
                    <td class="px-6 py-4 text-center">
                      <svg class="w-5 h-5 text-red-500 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
                      </svg>
                    </td>
                    <td class="px-6 py-4 text-center">
                      <svg class="w-5 h-5 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"/>
                      </svg>
                    </td>
                    <td class="px-6 py-4 text-center">
                      <svg class="w-5 h-5 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"/>
                      </svg>
                    </td>
                  </tr>
                  <tr>
                    <td class="px-6 py-4 text-sm text-gray-900">24/7 Support</td>
                    <td class="px-6 py-4 text-center">
                      <svg class="w-5 h-5 text-red-500 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
                      </svg>
                    </td>
                    <td class="px-6 py-4 text-center">
                      <svg class="w-5 h-5 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"/>
                      </svg>
                    </td>
                    <td class="px-6 py-4 text-center">
                      <svg class="w-5 h-5 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"/>
                      </svg>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `
  });

  console.log('✅ Pricing Blocks loaded with 3 new blocks');
}