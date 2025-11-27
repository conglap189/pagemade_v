/**
 * SITE BLOCKS LOADER
 * 
 * This module loads custom blocks from backend's static folder
 * and registers them with the PageMade editor.
 * 
 * STRATEGY: Merge blocks from backend WITHOUT resetting existing blocks
 * 
 * Fixed Race Condition:
 * - Basic blocks load first (frontend/src/editor/scripts/blocks/basic-blocks.js)
 * - Site blocks load second and MERGE (not replace) via this file
 * - Guard clause: Skip empty/failed fetches to preserve existing blocks
 */

export default async function loadSiteBlocks(editor) {
    console.log('🚀 Loading Site Blocks from backend...')
    
    // Count blocks BEFORE loading site blocks (to verify merge works)
    const blocksBefore = editor.BlockManager.getAll().length
    console.log(`📊 Blocks before site-blocks load: ${blocksBefore}`)
    
    // ALL block modules to load from backend
    // CRITICAL: DO NOT load 'basic-blocks.js' here!
    // It's already loaded from frontend/src/editor/scripts/blocks/basic-blocks.js
    // The backend version has fewer blocks and will overwrite the frontend version
    const blockModules = [
        // Legacy files (backward compatibility)
        // 'basic-blocks.js', // REMOVED: Conflicts with frontend version
        'advanced-cta.js',
        'custom-header.js',
        
        // Category folders (new structure)
        'hero/index.js',
        'footer/index.js',
        'gallery/index.js',
        // 'header/index.js', // Skip: Using custom-header.js instead (has blocks.js, not index.js)
        'testimonials/index.js',
        // 'cta/index.js', // Skip: Using advanced-cta.js instead (has blocks.js, not index.js)
        'features/index.js',
        'contact/index.js',
        'commerce/index.js',
        'pricing/index.js',
        'team/index.js',
        'content/index.js'
        // Note: header/ and cta/ folders have blocks.js (loaded via custom-header.js and advanced-cta.js)
        // Note: basic/ folder doesn't have index.js (has blocks.js instead)
    ]
    
    const baseUrl = '/static/pagemaker/custom-blocks'
    let successCount = 0
    let skipCount = 0
    
    try {
        for (const moduleName of blockModules) {
            try {
                const response = await fetch(`${baseUrl}/${moduleName}`)
                
                // Guard Clause #1: Skip if fetch failed
                if (!response.ok) {
                    console.warn(`⚠️ Failed to load ${moduleName}: ${response.status}`)
                    skipCount++
                    continue
                }
                
                let scriptContent = await response.text()
                
                // Guard Clause #2: Skip if content is empty
                if (!scriptContent || scriptContent.trim().length === 0) {
                    console.warn(`⚠️ Empty content for ${moduleName}`)
                    skipCount++
                    continue
                }
                
                // Handle ES6 module syntax: convert "export default function(editor)" to IIFE
                // Pattern 1: export default function(editor) { ... }
                // Pattern 2: export default function name(editor) { ... }
                scriptContent = scriptContent.replace(/export\s+default\s+function\s*\w*\s*\(editor\)\s*{/, '(function(editor) {')
                
                // Add closing IIFE and immediate invocation
                // Find the last closing brace and add })(editor); after it
                const lastBraceIndex = scriptContent.lastIndexOf('}')
                if (lastBraceIndex !== -1) {
                    scriptContent = scriptContent.substring(0, lastBraceIndex + 1) + ')(editor);'
                }
                
                try {
                    // Count blocks BEFORE executing this module
                    const blocksBeforeModule = editor.BlockManager.getAll().length
                    
                    // Execute the transformed script
                    // CRITICAL: Scripts use editor.BlockManager.add() which MERGES blocks
                    const scriptFunc = new Function('editor', scriptContent)
                    scriptFunc(editor)
                    
                    // Count blocks AFTER executing this module
                    const blocksAfterModule = editor.BlockManager.getAll().length
                    const blocksAdded = blocksAfterModule - blocksBeforeModule
                    
                    console.log(`✅ Loaded: ${moduleName} (+${blocksAdded} blocks)`)
                    successCount++
                } catch (execErr) {
                    console.warn(`⚠️ Error executing ${moduleName}:`, execErr)
                    skipCount++
                }
                
            } catch (err) {
                console.warn(`⚠️ Failed to fetch ${moduleName}:`, err)
                skipCount++
            }
        }
        
        // Count blocks AFTER loading all site blocks
        const blocksAfter = editor.BlockManager.getAll().length
        const totalAdded = blocksAfter - blocksBefore
        
        console.log(`✅ Site Blocks System ready!`)
        console.log(`📊 Summary: ${successCount} loaded, ${skipCount} skipped`)
        console.log(`📊 Blocks after site-blocks load: ${blocksAfter} (${totalAdded >= 0 ? '+' : ''}${totalAdded} total)`)
        console.log(`📦 Final block IDs:`, editor.BlockManager.getAll().map(b => b.getId()))
        
    } catch (error) {
        console.error('❌ Failed to load Site Blocks:', error)
    }
}
