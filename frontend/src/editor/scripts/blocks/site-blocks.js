/**
 * SITE BLOCKS LOADER
 * 
 * Main loader for all site block categories.
 * Blocks are organized in categories/ folder for easy management.
 * 
 * Structure:
 *   categories/
 *     ├── index.js              # Export all categories
 *     ├── hero-section/         # Hero blocks (hero-1, hero-2, ...)
 *     ├── feature-section/      # Feature blocks (future)
 *     └── cta-section/          # CTA blocks (future)
 */

import { registerAllBlocks } from './categories/index.js'

export default async function loadSiteBlocks(editor) {
    console.log('📦 Loading Site Blocks...')
    
    try {
        // Register all blocks from categories
        registerAllBlocks(editor)
        
        const totalBlocks = editor.BlockManager.getAll().length
        console.log(`✅ Site Blocks loaded. Total blocks: ${totalBlocks}`)
    } catch (error) {
        console.error('❌ Error loading Site Blocks:', error)
    }
}
