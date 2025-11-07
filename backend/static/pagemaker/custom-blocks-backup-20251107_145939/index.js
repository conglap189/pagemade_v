/**
 * CUSTOM BLOCKS - MAIN INDEX
 * 
 * File này load tất cả custom blocks từ các modules riêng biệt.
 * Để thêm blocks mới:
 * 1. Tạo file mới trong thư mục này (ví dụ: custom-footer.js)
 * 2. Import vào đây
 * 3. Gọi function trong hàm init()
 * 
 * Lưu ý: Các blocks từ plugin grapesjs-tailwind vẫn hoạt động bình thường.
 * Custom blocks ở đây sẽ MERGE vào các categories có sẵn hoặc tạo category mới.
 */

import basicBlocks from './basic/blocks.js';
import advancedCTA from './cta/blocks.js';
import customHeader from './header/blocks.js';
import featuresBlocks from './features/blocks.js';
import heroBlocks from './hero/blocks.js';
import teamBlocks from './team/blocks.js';
import testimonialsBlocks from './testimonials/blocks.js';
import pricingBlocks from './pricing/blocks.js';
import contactBlocks from './contact/blocks.js';
import footerBlocks from './footer/blocks.js';
import contentBlocks from './content/blocks.js';

export default function init(editor, opts = {}) {
  console.log('🚀 Initializing Custom Blocks System...');
  
  // Load các module blocks
  basicBlocks(editor);
  advancedCTA(editor);
  customHeader(editor);
  featuresBlocks(editor);
  heroBlocks(editor);
  teamBlocks(editor);
  testimonialsBlocks(editor);
  pricingBlocks(editor);
  contactBlocks(editor);
  footerBlocks(editor);
  contentBlocks(editor);
  
  console.log('✅ Custom Blocks System ready!');
  console.log('🎉 Added 30+ new Tailwind CSS blocks across 10 categories');
}
