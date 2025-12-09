/**
 * Block Categories Index
 * 
 * Export tất cả categories từ thư mục này.
 * Khi thêm category mới (vd: Feature Section, CTA Section), chỉ cần:
 * 1. Tạo thư mục mới (vd: feature-section/)
 * 2. Import và thêm vào array bên dưới
 */

import { heroBlocks, categoryInfo as heroCategory } from './hero-section/index.js'
import { footerBlocks, categoryInfo as footerCategory} from './footer-section/index.js'
// import { featureBlocks, categoryInfo as featureCategory } from './feature-section/index.js'
// import { ctaBlocks, categoryInfo as ctaCategory } from './cta-section/index.js'

// Export tất cả categories
export const categories = [
    {
        ...heroCategory,
        blocks: heroBlocks,
    },


    {
        ...footerCategory,
        blocks: footerBlocks,
    },
    // {
    //     ...featureCategory,
    //     blocks: featureBlocks,
    // },
    // {
    //     ...ctaCategory,
    //     blocks: ctaBlocks,
    // },
]

/**
 * Register tất cả blocks vào editor
 * @param {Object} editor - GrapesJS editor instance
 */
export function registerAllBlocks(editor) {
    const bm = editor.BlockManager
    
    // Sort categories theo order (số nhỏ hiện trước)
    const sortedCategories = [...categories].sort((a, b) => (a.order || 999) - (b.order || 999))
    
    sortedCategories.forEach(category => {
        console.log(`📦 Loading category: ${category.name} (order: ${category.order})`)
        
        category.blocks.forEach(block => {
            bm.add(block.id, {
                label: block.label,
                category: block.category || category.name,
                media: block.media,
                content: block.content,
                attributes: block.attributes || { class: `${block.id}-block` }
            })
        })
    })
    
    console.log(`✅ All categories loaded (sorted by order)`)
}
