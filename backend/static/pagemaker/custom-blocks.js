/**
 * PageMaker Professional Blocks Library
 * Custom blocks giống Tempi Builder - Vietnamese content
 */

function initCustomBlocks(editor) {
  const bm = editor.BlockManager;
  
  // ========== HERO SECTIONS ==========
  
  bm.add('hero-gradient', {
    label: `
      <div style="text-align: center;">
        <i class="fa fa-rocket" style="font-size: 24px; display: block; margin-bottom: 5px;"></i>
        <div>Hero Gradient</div>
      </div>
    `,
    category: 'Sections',
    content: `
      <section class="hero-gradient" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 120px 20px; text-align: center;">
        <div class="container" style="max-width: 1200px; margin: 0 auto;">
          <h1 style="font-size: 48px; font-weight: 700; margin-bottom: 24px; animation: fadeInUp 1s;">
            Xây dựng website chuyên nghiệp
          </h1>
          <p style="font-size: 20px; margin-bottom: 32px; opacity: 0.9; animation: fadeInUp 1s 0.2s both;">
            Kéo thả đơn giản, không cần code. Tạo website đẹp trong vài phút.
          </p>
          <div style="display: flex; gap: 16px; justify-content: center; animation: fadeInUp 1s 0.4s both;">
            <button style="background: white; color: #667eea; padding: 16px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; border: none; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
              Bắt đầu ngay
            </button>
            <button style="background: rgba(255,255,255,0.2); color: white; padding: 16px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; border: 1px solid rgba(255,255,255,0.3); cursor: pointer;">
              Xem demo
            </button>
          </div>
        </div>
      </section>
      
      <style>
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      </style>
    `
  });
  
  bm.add('hero-image', {
    label: `
      <div style="text-align: center;">
        <i class="fa fa-image" style="font-size: 24px; display: block; margin-bottom: 5px;"></i>
        <div>Hero với ảnh</div>
      </div>
    `,
    category: 'Sections',
    content: `
      <section style="min-height: 600px; display: flex; align-items: center; background: url('https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920') center/cover; position: relative;">
        <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5);"></div>
        <div class="container" style="max-width: 1200px; margin: 0 auto; padding: 0 20px; position: relative; z-index: 1; color: white;">
          <h1 style="font-size: 56px; font-weight: 700; margin-bottom: 24px;">
            Thiết kế website hiện đại
          </h1>
          <p style="font-size: 20px; margin-bottom: 32px; max-width: 600px;">
            Công cụ kéo thả mạnh mẽ, giúp bạn tạo website chuyên nghiệp không cần kỹ năng lập trình.
          </p>
          <button style="background: #667eea; color: white; padding: 16px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; border: none; cursor: pointer;">
            Tìm hiểu thêm →
          </button>
        </div>
      </section>
    `
  });
  
  // ========== CTA SECTIONS ==========
  
  bm.add('cta-centered', {
    label: `
      <div style="text-align: center;">
        <i class="fa fa-bullhorn" style="font-size: 24px; display: block; margin-bottom: 5px;"></i>
        <div>CTA Center</div>
      </div>
    `,
    category: 'Sections',
    content: `
      <section style="background: #f3f4f6; padding: 80px 20px; text-align: center;">
        <div class="container" style="max-width: 800px; margin: 0 auto;">
          <h2 style="font-size: 36px; font-weight: 700; margin-bottom: 16px; color: #1f2937;">
            Sẵn sàng bắt đầu?
          </h2>
          <p style="font-size: 18px; color: #6b7280; margin-bottom: 32px;">
            Tham gia hàng ngàn doanh nghiệp đã tin dùng nền tảng của chúng tôi
          </p>
          <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
            <input type="email" placeholder="Email của bạn..." style="padding: 14px 20px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 16px; min-width: 300px;">
            <button style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; border: none; cursor: pointer;">
              Đăng ký miễn phí
            </button>
          </div>
          <p style="font-size: 14px; color: #9ca3af; margin-top: 16px;">
            ✓ Không cần thẻ tín dụng  ✓ Hủy bất cứ lúc nào
          </p>
        </div>
      </section>
    `
  });
  
  // ========== FEATURE SECTIONS ==========
  
  bm.add('features-3col', {
    label: `
      <div style="text-align: center;">
        <i class="fa fa-th" style="font-size: 24px; display: block; margin-bottom: 5px;"></i>
        <div>Tính năng 3 cột</div>
      </div>
    `,
    category: 'Sections',
    content: `
      <section style="padding: 80px 20px; background: white;">
        <div class="container" style="max-width: 1200px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 60px;">
            <h2 style="font-size: 36px; font-weight: 700; margin-bottom: 16px; color: #1f2937;">
              Tính năng nổi bật
            </h2>
            <p style="font-size: 18px; color: #6b7280; max-width: 600px; margin: 0 auto;">
              Tất cả công cụ bạn cần để tạo website chuyên nghiệp
            </p>
          </div>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 40px;">
            <!-- Feature 1 -->
            <div style="text-align: center; padding: 32px;">
              <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; color: white; font-size: 28px;">
                🎨
              </div>
              <h3 style="font-size: 20px; font-weight: 600; margin-bottom: 12px; color: #1f2937;">
                Kéo thả dễ dàng
              </h3>
              <p style="color: #6b7280; line-height: 1.6;">
                Tạo trang web chỉ bằng cách kéo và thả các thành phần. Không cần code.
              </p>
            </div>
            
            <!-- Feature 2 -->
            <div style="text-align: center; padding: 32px;">
              <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; color: white; font-size: 28px;">
                📱
              </div>
              <h3 style="font-size: 20px; font-weight: 600; margin-bottom: 12px; color: #1f2937;">
                Responsive hoàn hảo
              </h3>
              <p style="color: #6b7280; line-height: 1.6;">
                Website của bạn sẽ hiển thị đẹp trên mọi thiết bị - desktop, tablet, mobile.
              </p>
            </div>
            
            <!-- Feature 3 -->
            <div style="text-align: center; padding: 32px;">
              <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; color: white; font-size: 28px;">
                ⚡
              </div>
              <h3 style="font-size: 20px; font-weight: 600; margin-bottom: 12px; color: #1f2937;">
                Tốc độ nhanh
              </h3>
              <p style="color: #6b7280; line-height: 1.6;">
                Được tối ưu hóa cho hiệu suất cao. Website của bạn tải cực nhanh.
              </p>
            </div>
          </div>
        </div>
      </section>
    `
  });
  
  // ========== CARDS ==========
  
  bm.add('card-hover', {
    label: `
      <div style="text-align: center;">
        <i class="fa fa-id-card" style="font-size: 24px; display: block; margin-bottom: 5px;"></i>
        <div>Card Hover</div>
      </div>
    `,
    category: 'Components',
    content: `
      <div style="background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: all 0.3s; cursor: pointer;" 
           onmouseover="this.style.transform='translateY(-8px)'; this.style.boxShadow='0 12px 24px rgba(102,126,234,0.2)';"
           onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 6px rgba(0,0,0,0.1)';">
        <img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400" 
             style="width: 100%; height: 200px; object-fit: cover; border-radius: 12px; margin-bottom: 20px;">
        <h3 style="font-size: 20px; font-weight: 600; margin-bottom: 12px; color: #1f2937;">
          Tiêu đề thẻ
        </h3>
        <p style="color: #6b7280; line-height: 1.6; margin-bottom: 20px;">
          Mô tả ngắn gọn về nội dung. Có thể là sản phẩm, dịch vụ hoặc bài viết.
        </p>
        <button style="background: #667eea; color: white; padding: 10px 20px; border-radius: 6px; border: none; cursor: pointer; font-weight: 500;">
          Tìm hiểu thêm →
        </button>
      </div>
    `
  });
  
  // ========== TESTIMONIALS ==========
  
  bm.add('testimonial', {
    label: `
      <div style="text-align: center;">
        <i class="fa fa-quote-left" style="font-size: 24px; display: block; margin-bottom: 5px;"></i>
        <div>Testimonial</div>
      </div>
    `,
    category: 'Components',
    content: `
      <div style="background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 600px; margin: 0 auto;">
        <div style="font-size: 48px; color: #667eea; margin-bottom: 20px;">"</div>
        <p style="font-size: 18px; line-height: 1.8; color: #1f2937; margin-bottom: 24px; font-style: italic;">
          Công cụ tuyệt vời! Tôi đã tạo website cho doanh nghiệp của mình chỉ trong vài giờ. 
          Giao diện đẹp, dễ sử dụng, và không cần biết code.
        </p>
        <div style="display: flex; align-items: center; gap: 16px;">
          <img src="https://i.pravatar.cc/80?img=1" 
               style="width: 56px; height: 56px; border-radius: 50%; object-fit: cover;">
          <div>
            <div style="font-weight: 600; color: #1f2937;">Nguyễn Văn A</div>
            <div style="color: #6b7280; font-size: 14px;">CEO, Công ty ABC</div>
          </div>
        </div>
      </div>
    `
  });
  
  // ========== PRICING TABLES ==========
  
  bm.add('pricing-card', {
    label: `
      <div style="text-align: center;">
        <i class="fa fa-tag" style="font-size: 24px; display: block; margin-bottom: 5px;"></i>
        <div>Bảng giá</div>
      </div>
    `,
    category: 'Components',
    content: `
      <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); text-align: center; border: 2px solid #667eea;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; display: inline-block; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 20px;">
          PHỔ BIẾN NHẤT
        </div>
        <h3 style="font-size: 24px; font-weight: 700; margin-bottom: 16px; color: #1f2937;">
          Gói Professional
        </h3>
        <div style="margin-bottom: 24px;">
          <span style="font-size: 48px; font-weight: 700; color: #667eea;">499.000đ</span>
          <span style="color: #6b7280;">/tháng</span>
        </div>
        <ul style="list-style: none; padding: 0; margin-bottom: 32px; text-align: left;">
          <li style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; display: flex; align-items: center; gap: 12px;">
            <span style="color: #10b981; font-size: 18px;">✓</span>
            <span>Không giới hạn pages</span>
          </li>
          <li style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; display: flex; align-items: center; gap: 12px;">
            <span style="color: #10b981; font-size: 18px;">✓</span>
            <span>Custom domain miễn phí</span>
          </li>
          <li style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; display: flex; align-items: center; gap: 12px;">
            <span style="color: #10b981; font-size: 18px;">✓</span>
            <span>Hỗ trợ 24/7</span>
          </li>
          <li style="padding: 12px 0; display: flex; align-items: center; gap: 12px;">
            <span style="color: #10b981; font-size: 18px;">✓</span>
            <span>SSL miễn phí</span>
          </li>
        </ul>
        <button style="width: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px; border-radius: 8px; font-size: 16px; font-weight: 600; border: none; cursor: pointer;">
          Chọn gói này
        </button>
      </div>
    `
  });
  
  // ========== FORMS ==========
  
  bm.add('contact-form', {
    label: `
      <div style="text-align: center;">
        <i class="fa fa-envelope" style="font-size: 24px; display: block; margin-bottom: 5px;"></i>
        <div>Form liên hệ</div>
      </div>
    `,
    category: 'Components',
    content: `
      <form style="max-width: 600px; margin: 0 auto; padding: 40px; background: white; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        <h3 style="font-size: 28px; font-weight: 700; margin-bottom: 24px; color: #1f2937; text-align: center;">
          Liên hệ với chúng tôi
        </h3>
        
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Họ tên</label>
          <input type="text" placeholder="Nguyễn Văn A" 
                 style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 16px;">
        </div>
        
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Email</label>
          <input type="email" placeholder="email@example.com" 
                 style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 16px;">
        </div>
        
        <div style="margin-bottom: 24px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Tin nhắn</label>
          <textarea placeholder="Nội dung tin nhắn..." rows="4"
                    style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 16px; resize: vertical;"></textarea>
        </div>
        
        <button type="submit" 
                style="width: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px; border-radius: 8px; font-size: 16px; font-weight: 600; border: none; cursor: pointer;">
          Gửi tin nhắn
        </button>
      </form>
    `
  });
  
  console.log('✅ Custom blocks library loaded - Vietnamese content');
}

// Make available globally
window.initCustomBlocks = initCustomBlocks;
