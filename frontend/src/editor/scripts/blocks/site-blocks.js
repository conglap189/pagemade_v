/**
 * SITE BLOCKS LOADER
 * 
 * This module was used to load custom blocks from backend's static folder.
 * Custom blocks feature has been removed - all blocks are now loaded from
 * frontend/src/editor/scripts/blocks/basic-blocks.js
 * 
 * This file is kept as a stub for backward compatibility.
 */

export default async function loadSiteBlocks(editor) {
    console.log('📦 Site Blocks: Feature disabled (using basic-blocks only)')
    
    // No-op: Custom blocks loading has been removed
    // All blocks are now managed in basic-blocks.js
    
    const totalBlocks = editor.BlockManager.getAll().length
    console.log(`📊 Total blocks available: ${totalBlocks}`)
}
