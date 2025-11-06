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

import basicBlocks from './basic-blocks.js';
import advancedCTA from './advanced-cta.js';
import customHeader from './custom-header.js';

export default function init(editor, opts = {}) {
  console.log('🚀 Initializing Custom Blocks System...');
  
  // Load các module blocks
  basicBlocks(editor);
  advancedCTA(editor);
  customHeader(editor);
  
  // Thêm modules khác ở đây khi cần:
  // customFooter(editor);
  // customForms(editor);
  // customGallery(editor);
  
  console.log('✅ Custom Blocks System ready!');
  console.log('ℹ️  To add new blocks: uncomment examples in /static/pagemaker/custom-blocks/*.js files');
}
