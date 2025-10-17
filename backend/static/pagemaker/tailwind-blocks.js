/**
 * PageMaker Professional Blocks Library - With Tailwind CSS
 * Custom blocks với Tailwind utility classes - Vietnamese content
 */

function initTailwindBlocks(editor) {
  const bm = editor.BlockManager;
  
  // ========== HERO SECTIONS với Tailwind ==========
  
  bm.add('hero-tailwind', {
    label: `
      <div style="text-align: center;">
        <i class="fa fa-rocket" style="font-size: 24px; display: block; margin-bottom: 5px;"></i>
        <div>Hero Tailwind</div>
      </div>
    `,
    category: 'Tailwind Sections',
    content: `
      <section class="bg-gradient-to-br from-blue-500 to-purple-600 text-white py-20 px-5 text-center">
        <div class="container mx-auto max-w-4xl">
          <h1 class="text-5xl font-bold mb-6 animate-fade-in-up">
            Xây dựng website chuyên nghiệp
          </h1>
          <p class="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Kéo thả đơn giản với Tailwind CSS, không cần code. Tạo website đẹp trong vài phút.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button class="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors shadow-lg">
              Bắt đầu ngay
            </button>
            <button class="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              Xem demo
            </button>
          </div>
        </div>
      </section>
    `
  });
  
  bm.add('hero-image-tailwind', {
    label: `
      <div style="text-align: center;">
        <i class="fa fa-image" style="font-size: 24px; display: block; margin-bottom: 5px;"></i>
        <div>Hero Image TW</div>
      </div>
    `,
    category: 'Tailwind Sections',
    content: `
      <section class="relative min-h-screen bg-cover bg-center bg-no-repeat" 
               style="background-image: url('https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920')">
        <div class="absolute inset-0 bg-black bg-opacity-50"></div>
        <div class="relative z-10 container mx-auto px-5 py-32 text-white">
          <div class="max-w-3xl">
            <h1 class="text-6xl font-bold mb-6 leading-tight">
              Thiết kế website hiện đại
            </h1>
            <p class="text-xl mb-8 max-w-2xl leading-relaxed">
              Công cụ kéo thả mạnh mẽ với Tailwind CSS, giúp bạn tạo website chuyên nghiệp không cần kỹ năng lập trình.
            </p>
            <button class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors shadow-lg">
              Tìm hiểu thêm →
            </button>
          </div>
        </div>
      </section>
    `
  });
  
  // ========== CARDS với Tailwind ==========
  
  bm.add('card-tailwind', {
    label: `
      <div style="text-align: center;">
        <i class="fa fa-id-card" style="font-size: 24px; display: block; margin-bottom: 5px;"></i>
        <div>Card Tailwind</div>
      </div>
    `,
    category: 'Tailwind Components',
    content: `
      <div class="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer">
        <img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400" 
             class="w-full h-48 object-cover rounded-xl mb-6">
        <h3 class="text-xl font-semibold mb-3 text-gray-900">
          Tiêu đề thẻ
        </h3>
        <p class="text-gray-600 leading-relaxed mb-6">
          Mô tả ngắn gọn về nội dung. Có thể là sản phẩm, dịch vụ hoặc bài viết.
        </p>
        <button class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
          Tìm hiểu thêm →
        </button>
      </div>
    `
  });
  
  // ========== FEATURES GRID với Tailwind ==========
  
  bm.add('features-tailwind', {
    label: `
      <div style="text-align: center;">
        <i class="fa fa-th" style="font-size: 24px; display: block; margin-bottom: 5px;"></i>
        <div>Features TW</div>
      </div>
    `,
    category: 'Tailwind Sections',
    content: `
      <section class="py-20 bg-gray-50">
        <div class="container mx-auto px-5">
          <div class="text-center mb-16">
            <h2 class="text-4xl font-bold mb-4 text-gray-900">
              Tính năng nổi bật
            </h2>
            <p class="text-xl text-gray-600 max-w-2xl mx-auto">
              Tất cả công cụ bạn cần để tạo website chuyên nghiệp với Tailwind CSS
            </p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <!-- Feature 1 -->
            <div class="text-center p-8 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-6 text-white text-3xl">
                🎨
              </div>
              <h3 class="text-xl font-semibold mb-3 text-gray-900">
                Tailwind CSS
              </h3>
              <p class="text-gray-600 leading-relaxed">
                Utility classes mạnh mẽ, tạo style nhanh chóng và responsive hoàn hảo.
              </p>
            </div>
            
            <!-- Feature 2 -->
            <div class="text-center p-8 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div class="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-6 text-white text-3xl">
                📱
              </div>
              <h3 class="text-xl font-semibold mb-3 text-gray-900">
                Responsive Design
              </h3>
              <p class="text-gray-600 leading-relaxed">
                Mobile-first approach, website hiển thị đẹp trên mọi thiết bị.
              </p>
            </div>
            
            <!-- Feature 3 -->
            <div class="text-center p-8 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div class="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-6 text-white text-3xl">
                ⚡
              </div>
              <h3 class="text-xl font-semibold mb-3 text-gray-900">
                Performance Cao
              </h3>
              <p class="text-gray-600 leading-relaxed">
                CSS được optimize, website tải cực nhanh và SEO friendly.
              </p>
            </div>
          </div>
        </div>
      </section>
    `
  });
  
  // ========== CTA với Tailwind ==========
  
  bm.add('cta-tailwind', {
    label: `
      <div style="text-align: center;">
        <i class="fa fa-bullhorn" style="font-size: 24px; display: block; margin-bottom: 5px;"></i>
        <div>CTA Tailwind</div>
      </div>
    `,
    category: 'Tailwind Sections',
    content: `
      <section class="bg-gradient-to-r from-blue-600 to-purple-600 py-20 px-5">
        <div class="container mx-auto max-w-4xl text-center text-white">
          <h2 class="text-4xl font-bold mb-4">
            Sẵn sàng bắt đầu với Tailwind?
          </h2>
          <p class="text-xl mb-8 opacity-90">
            Tham gia hàng ngàn developer đã chọn Tailwind CSS cho dự án của họ
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
            <input type="email" 
                   placeholder="Email của bạn..." 
                   class="flex-1 px-6 py-4 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50">
            <button class="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors shadow-lg whitespace-nowrap">
              Đăng ký miễn phí
            </button>
          </div>
          <p class="text-sm mt-4 opacity-75">
            ✓ Không cần thẻ tín dụng  ✓ Hủy bất cứ lúc nào
          </p>
        </div>
      </section>
    `
  });
  
  // ========== TESTIMONIAL với Tailwind ==========
  
  bm.add('testimonial-tailwind', {
    label: `
      <div style="text-align: center;">
        <i class="fa fa-quote-left" style="font-size: 24px; display: block; margin-bottom: 5px;"></i>
        <div>Testimonial TW</div>
      </div>
    `,
    category: 'Tailwind Components',
    content: `
      <div class="bg-white p-8 md:p-10 rounded-2xl shadow-lg max-w-2xl mx-auto">
        <div class="text-6xl text-blue-500 mb-6">"</div>
        <p class="text-lg leading-relaxed text-gray-700 mb-8 italic">
          Tailwind CSS trong PageMaker thật tuyệt vời! Tôi đã tạo website cho startup của mình chỉ trong vài giờ. 
          Utility classes giúp styling cực nhanh và responsive hoàn hảo.
        </p>
        <div class="flex items-center gap-4">
          <img src="https://i.pravatar.cc/80?img=1" 
               class="w-14 h-14 rounded-full object-cover">
          <div>
            <div class="font-semibold text-gray-900">Nguyễn Văn A</div>
            <div class="text-gray-500 text-sm">Frontend Developer</div>
          </div>
        </div>
      </div>
    `
  });
  
  // ========== PRICING với Tailwind ==========
  
  bm.add('pricing-tailwind', {
    label: `
      <div style="text-align: center;">
        <i class="fa fa-tag" style="font-size: 24px; display: block; margin-bottom: 5px;"></i>
        <div>Pricing TW</div>
      </div>
    `,
    category: 'Tailwind Components',
    content: `
      <div class="bg-white rounded-2xl p-8 shadow-lg border-2 border-blue-500 relative">
        <div class="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span class="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
            PHỔ BIẾN NHẤT
          </span>
        </div>
        <div class="text-center">
          <h3 class="text-2xl font-bold mb-4 text-gray-900">
            Gói Professional
          </h3>
          <div class="mb-6">
            <span class="text-5xl font-bold text-blue-600">499.000đ</span>
            <span class="text-gray-500">/tháng</span>
          </div>
          <ul class="space-y-4 mb-8 text-left">
            <li class="flex items-center gap-3">
              <span class="text-green-500 text-lg">✓</span>
              <span>Tailwind CSS unlimited</span>
            </li>
            <li class="flex items-center gap-3">
              <span class="text-green-500 text-lg">✓</span>
              <span>Custom domain miễn phí</span>
            </li>
            <li class="flex items-center gap-3">
              <span class="text-green-500 text-lg">✓</span>
              <span>Responsive components</span>
            </li>
            <li class="flex items-center gap-3">
              <span class="text-green-500 text-lg">✓</span>
              <span>Hỗ trợ 24/7</span>
            </li>
          </ul>
          <button class="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all">
            Chọn gói này
          </button>
        </div>
      </div>
    `
  });
  
  // ========== FORM với Tailwind ==========
  
  bm.add('form-tailwind', {
    label: `
      <div style="text-align: center;">
        <i class="fa fa-envelope" style="font-size: 24px; display: block; margin-bottom: 5px;"></i>
        <div>Form Tailwind</div>
      </div>
    `,
    category: 'Tailwind Components',
    content: `
      <form class="max-w-2xl mx-auto bg-white p-8 md:p-10 rounded-2xl shadow-lg">
        <h3 class="text-3xl font-bold mb-6 text-gray-900 text-center">
          Liên hệ với chúng tôi
        </h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Họ tên *</label>
            <input type="text" 
                   placeholder="Nguyễn Văn A" 
                   class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Email *</label>
            <input type="email" 
                   placeholder="email@example.com" 
                   class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all">
          </div>
        </div>
        
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">Chủ đề</label>
          <select class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all">
            <option>Hỗ trợ kỹ thuật</option>
            <option>Tư vấn dịch vụ</option>
            <option>Báo lỗi</option>
            <option>Khác</option>
          </select>
        </div>
        
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">Tin nhắn *</label>
          <textarea rows="4" 
                    placeholder="Nội dung tin nhắn..." 
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"></textarea>
        </div>
        
        <button type="submit" 
                class="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105">
          Gửi tin nhắn
        </button>
      </form>
    `
  });
  
  console.log('✅ Tailwind CSS blocks library loaded - Vietnamese content');
}

// Make available globally
window.initTailwindBlocks = initTailwindBlocks;