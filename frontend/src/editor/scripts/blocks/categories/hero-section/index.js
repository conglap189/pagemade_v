/**
 * Hero Section Blocks
 * 
 * Export tất cả hero blocks từ thư mục này.
 * Khi thêm hero mới, chỉ cần:
 * 1. Tạo file hero-X.js
 * 2. Import và thêm vào array bên dưới
 */

import { hero1 } from './hero-1.js'
// import { hero2 } from './hero-2.js'  // Uncomment khi thêm
// import { hero3 } from './hero-3.js'  // Uncomment khi thêm

// Export tất cả hero blocks
export const heroBlocks = [
    hero1,
    // hero2,  // Uncomment khi thêm
    // hero3,  // Uncomment khi thêm
]

// Category info
export const categoryInfo = {
    name: '1. Hero Section',
    order: 1,  // Thứ tự hiển thị trong Block Manager
}
