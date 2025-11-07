/**
 * TESTIMONIALS BLOCKS
 * Các blocks hiển thị đánh giá, feedback từ khách hàng
 * Category: 'Testimonials' (sẽ merge vào category Testimonials có sẵn)
 */

export default function(editor) {
  console.log('📦 Loading Testimonials Blocks...');
  
  // ===== TESTIMONIALS GRID =====
  editor.BlockManager.add('testimonials-grid-3', {
    label: '3-Column Testimonials',
    category: 'Testimonials',
    media: `<svg viewBox="0 0 24 24" width="40" height="40">
      <path fill="currentColor" d="M14,17H17L19,13V7H13V13H16M6,17H9L11,13V7H5V13H8L6,17Z"/>
    </svg>`,
    content: `
      <div class="py-16 px-4 bg-gray-50">
        <div class="container mx-auto max-w-6xl">
          <h2 class="text-4xl font-bold text-center text-gray-900 mb-4">What Our Clients Say</h2>
          <p class="text-xl text-center text-gray-600 mb-12">Real feedback from real customers</p>
          <div class="grid md:grid-cols-3 gap-8">
            <div class="bg-white p-8 rounded-xl shadow-lg">
              <div class="flex mb-4">
                <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"/>
                </svg>
                <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"/>
                </svg>
                <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"/>
                </svg>
                <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"/>
                </svg>
                <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"/>
                </svg>
              </div>
              <blockquote class="text-gray-700 mb-6 italic">
                "This platform completely transformed how we manage our business. The results have been outstanding!"
              </blockquote>
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-blue-500 rounded-full"></div>
                <div>
                  <div class="font-semibold text-gray-900">Michael Brown</div>
                  <div class="text-sm text-gray-600">CEO, TechStart</div>
                </div>
              </div>
            </div>
            <div class="bg-white p-8 rounded-xl shadow-lg">
              <div class="flex mb-4">
                <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"/>
                </svg>
                <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"/>
                </svg>
                <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"/>
                </svg>
                <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"/>
                </svg>
                <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"/>
                </svg>
              </div>
              <blockquote class="text-gray-700 mb-6 italic">
                "Exceptional service and support. They went above and beyond to help us succeed."
              </blockquote>
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-purple-500 rounded-full"></div>
                <div>
                  <div class="font-semibold text-gray-900">Sarah Davis</div>
                  <div class="text-sm text-gray-600">Marketing Director, GrowthCo</div>
                </div>
              </div>
            </div>
            <div class="bg-white p-8 rounded-xl shadow-lg">
              <div class="flex mb-4">
                <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"/>
                </svg>
                <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"/>
                </svg>
                <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"/>
                </svg>
                <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"/>
                </svg>
                <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"/>
                </svg>
              </div>
              <blockquote class="text-gray-700 mb-6 italic">
                "The best investment we've made for our company. ROI exceeded all expectations."
              </blockquote>
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-green-500 rounded-full"></div>
                <div>
                  <div class="font-semibold text-gray-900">Tom Wilson</div>
                  <div class="text-sm text-gray-600">Founder, StartupHub</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
  });

  editor.BlockManager.add('testimonials-carousel', {
    label: 'Testimonial Carousel',
    category: 'Testimonials',
    media: `<svg viewBox="0 0 24 24" width="40" height="40">
      <path fill="currentColor" d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58M21,6L15,12L21,18L22.41,16.58L17.83,12L22.41,7.41L21,6Z"/>
    </svg>`,
    content: `
      <div class="py-16 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div class="container mx-auto max-w-4xl text-center text-white">
          <h2 class="text-4xl font-bold mb-12">Customer Success Stories</h2>
          <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-12">
            <svg class="w-16 h-16 mx-auto mb-6 text-white/50" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14,17H17L19,13V7H13V13H16M6,17H9L11,13V7H5V13H8L6,17Z"/>
            </svg>
            <blockquote class="text-2xl font-light mb-8 italic">
              "Working with this team has been an absolute game-changer for our business. Their expertise and dedication are unmatched."
            </blockquote>
            <div class="flex items-center justify-center gap-4">
              <div class="w-16 h-16 bg-white/30 rounded-full"></div>
              <div class="text-left">
                <div class="font-bold text-xl">Jennifer Lee</div>
                <div class="text-white/80">VP of Operations, Enterprise Corp</div>
              </div>
            </div>
            <div class="flex justify-center gap-2 mt-8">
              <div class="w-2 h-2 bg-white rounded-full"></div>
              <div class="w-2 h-2 bg-white/50 rounded-full"></div>
              <div class="w-2 h-2 bg-white/50 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    `
  });

  editor.BlockManager.add('testimonials-large', {
    label: 'Large Testimonial',
    category: 'Testimonials',
    media: `<svg viewBox="0 0 24 24" width="40" height="40">
      <path fill="currentColor" d="M14,17H17L19,13V7H13V13H16M6,17H9L11,13V7H5V13H8L6,17Z"/>
    </svg>`,
    content: `
      <div class="py-20 px-4">
        <div class="container mx-auto max-w-5xl">
          <div class="text-center">
            <svg class="w-20 h-20 mx-auto mb-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14,17H17L19,13V7H13V13H16M6,17H9L11,13V7H5V13H8L6,17Z"/>
            </svg>
            <blockquote class="text-4xl font-light text-gray-900 mb-8 leading-relaxed">
              "This is not just a service provider; they are true partners in success. Their innovative solutions and exceptional support have transformed our entire operation."
            </blockquote>
            <div class="flex items-center justify-center gap-6">
              <div class="w-20 h-20 bg-gray-300 rounded-full"></div>
              <div class="text-left">
                <div class="text-2xl font-bold text-gray-900">Amanda Foster</div>
                <div class="text-lg text-gray-600">Chief Innovation Officer</div>
                <div class="text-lg text-blue-600 font-medium">Fortune 500 Company</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
  });

  console.log('✅ Testimonials Blocks loaded with 3 new blocks');
}