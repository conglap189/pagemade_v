/**
 * FIX FOR BASIC BLOCKS FILTERING ISSUE
 * 
 * This script fixes the issue where Basic Blocks with string categories 
 * ('Basic', 'Form', 'Extra') are not being found in the PageMaker editor.
 * 
 * Issues identified:
 * 1. Duplicate filtering logic in renderBlocksByCategory function
 * 2. Inconsistent handling of string vs object categories
 * 3. Missing fallback for basic- prefixed block IDs
 * 
 * To apply this fix:
 * 1. Replace the existing renderBlocksByCategory function in editor_pagemaker_v2.html
 * 2. Test with the provided test script
 */

// FIXED renderBlocksByCategory function
function renderBlocksByCategory(category) {
    console.log('🎯 renderBlocksByCategory called with:', category);
    
    const blocksContainer = document.getElementById('blocks-container');
    const blockManager = window.editor.BlockManager;
    
    console.log('📦 BlockManager available:', !!blockManager);
    console.log('📦 Container available:', !!blocksContainer);
    
    if (!blocksContainer || !blockManager) {
        console.error('❌ Missing required elements');
        return;
    }
    
    // Clear current blocks
    blocksContainer.innerHTML = '';
    
    if (category === 'site-blocks') {
        // Render all existing blocks (site blocks) - use default rendering
        console.log('📋 Rendering site blocks...');
        const blocksEl = blockManager.render();
        if (blocksEl) {
            blocksContainer.appendChild(blocksEl);
            console.log('✅ Site blocks rendered');
        }
    } else if (category === 'basic-blocks') {
        // Render only basic blocks (Basic, Form, Extra categories)
        console.log('🔍 Filtering basic blocks...');
        
        const allBlocks = blockManager.getAll();
        console.log('🔍 Total blocks in editor:', allBlocks.length);
        
        // Enhanced filtering logic
        const basicBlocks = allBlocks.filter(block => {
            const blockCategory = block.get('category');
            const blockId = block.getId() || '';
            const blockLabel = block.get('label') || '';
            
            // Handle both string and object categories
            let categoryStr = blockCategory;
            let categoryType = typeof blockCategory;
            
            if (categoryType === 'object' && blockCategory !== null) {
                categoryStr = blockCategory.label || blockCategory.name || blockCategory.id || 'Unknown';
                console.log(`📦 Object category: ${blockId} -> ${categoryStr} (from ${JSON.stringify(blockCategory)})`);
            } else if (categoryType === 'string') {
                categoryStr = blockCategory;
                console.log(`📦 String category: ${blockId} -> ${categoryStr}`);
            } else {
                categoryStr = 'Unknown';
                console.log(`📦 Unknown category type: ${blockId} -> ${categoryType}`);
            }
            
            // Multiple filtering criteria
            const isBasicCategory = ['Basic', 'Form', 'Extra'].includes(categoryStr);
            const isBasicPrefix = blockId.startsWith('basic-');
            const isBasicLabel = blockLabel.includes('Basic') || blockLabel.includes('Input') || blockLabel.includes('Button');
            
            const isBasic = isBasicCategory || isBasicPrefix || isBasicLabel;
            
            console.log(`🔍 Block: ${blockId}, Category: "${categoryStr}" (${categoryType}), Basic: ${isBasic}`);
            console.log(`   - isBasicCategory: ${isBasicCategory}`);
            console.log(`   - isBasicPrefix: ${isBasicPrefix}`);
            console.log(`   - isBasicLabel: ${isBasicLabel}`);
            
            return isBasic;
        });
        
        console.log('🎯 Basic blocks found:', basicBlocks.length);
        console.log('🎯 Basic block IDs:', basicBlocks.map(b => b.getId()));
        
        if (basicBlocks.length > 0) {
            // Create custom rendering for basic blocks
            const basicBlocksContainer = document.createElement('div');
            basicBlocksContainer.className = 'gjs-blocks-cs-container';
            
            basicBlocks.forEach(block => {
                const blockEl = document.createElement('div');
                blockEl.className = 'gjs-block-cs';
                blockEl.setAttribute('data-block-id', block.getId());
                blockEl.setAttribute('title', `${block.get('label')} (${block.getId()})`);
                
                // Create block content
                const blockContent = document.createElement('div');
                blockContent.className = 'gjs-block-label';
                
                // Get media or create default icon
                let mediaHtml = block.get('media') || '';
                if (!mediaHtml) {
                    // Create default icon based on block type
                    const blockId = block.getId();
                    if (blockId.includes('heading')) {
                        mediaHtml = '<svg width="40" height="40" viewBox="0 0 24 24"><path fill="currentColor" d="M3,5H5V11H11V5H13V19H11V13H5V19H3V5Z"/></svg>';
                    } else if (blockId.includes('text')) {
                        mediaHtml = '<svg width="40" height="40" viewBox="0 0 24 24"><path fill="currentColor" d="M3,5H21V7H3V5M3,13H21V11H3V13M3,19H21V17H3V19Z"/></svg>';
                    } else if (blockId.includes('button')) {
                        mediaHtml = '<svg width="40" height="40" viewBox="0 0 24 24"><path fill="currentColor" d="M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/></svg>';
                    } else if (blockId.includes('input')) {
                        mediaHtml = '<svg width="40" height="40" viewBox="0 0 24 24"><path fill="currentColor" d="M20,6H4C2.89,6 2,6.89 2,8V16A2,2 0 0,0 4,18H20A2,2 0 0,0 22,16V8C22,6.89 21.1,6 20,6M20,16H4V8H20V16Z"/></svg>';
                    } else {
                        mediaHtml = '<svg width="40" height="40" viewBox="0 0 24 24"><path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/></svg>';
                    }
                }
                
                blockContent.innerHTML = `
                    <div class="block-media">${mediaHtml}</div>
                    <div class="block-name">${block.get('label')}</div>
                `;
                
                blockEl.appendChild(blockContent);
                
                // Add click handler to add block to canvas
                blockEl.addEventListener('click', () => {
                    console.log('🖱️  Adding block to canvas:', block.getId());
                    const selected = blockManager.get(block.getId());
                    if (selected) {
                        const blockComponent = selected.get('content');
                        window.editor.addComponents(blockComponent);
                        console.log('✅ Block added to canvas');
                    } else {
                        console.error('❌ Could not find block:', block.getId());
                    }
                });
                
                // Add hover effects
                blockEl.addEventListener('mouseenter', () => {
                    blockEl.style.transform = 'translateY(-2px)';
                    blockEl.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.15)';
                });
                
                blockEl.addEventListener('mouseleave', () => {
                    blockEl.style.transform = '';
                    blockEl.style.boxShadow = '';
                });
                
                basicBlocksContainer.appendChild(blockEl);
            });
            
            blocksContainer.appendChild(basicBlocksContainer);
            console.log('✅ Basic blocks rendered successfully');
        } else {
            console.warn('⚠️ No basic blocks found!');
            blocksContainer.innerHTML = `
                <div style="padding: 20px; text-align: center; color: #6b7280;">
                    <div style="margin-bottom: 10px;">📦</div>
                    <div style="font-weight: 500; margin-bottom: 5px;">No basic blocks available</div>
                    <div style="font-size: 12px;">Check if custom blocks are loaded correctly</div>
                </div>
            `;
        }
    } else {
        console.warn('⚠️ Unknown category:', category);
        blocksContainer.innerHTML = `<div style="padding: 20px; text-align: center; color: #6b7280;">Unknown category: ${category}</div>`;
    }
}

// Enhanced tab initialization
function initBlockTabs() {
    console.log('📋 Initializing enhanced block tabs...');
    
    const blockCategoryTabs = document.querySelectorAll('.block-tab');
    console.log('📋 Block tabs found:', blockCategoryTabs.length);
    
    if (blockCategoryTabs.length === 0) {
        console.warn('⚠️ No block tabs found, retrying...');
        setTimeout(initBlockTabs, 100);
        return;
    }
    
    blockCategoryTabs.forEach(tab => {
        // Remove existing listeners to avoid duplicates
        tab.replaceWith(tab.cloneNode(true));
    });
    
    // Re-select after cloning
    const freshTabs = document.querySelectorAll('.block-tab');
    
    freshTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const category = tab.getAttribute('data-category');
            console.log('🔄 Tab clicked:', category);
            
            // Remove active from all tabs
            freshTabs.forEach(t => t.classList.remove('active'));
            
            // Add active to clicked tab
            tab.classList.add('active');
            
            // Render blocks based on category
            if (window.editor) {
                setTimeout(() => {
                    console.log('🎯 About to render blocks for:', category);
                    renderBlocksByCategory(category);
                }, 50);
            } else {
                console.warn('⚠️ Editor not available');
            }
        });
    });
    
    console.log('✅ Enhanced block tabs initialized');
}

// Auto-fix function - run this in browser console
function autoFixBasicBlocks() {
    console.log('🔧 Applying auto-fix for Basic Blocks filtering...');
    
    // Replace the renderBlocksByCategory function
    window.renderBlocksByCategory = renderBlocksByCategory;
    
    // Re-initialize tabs
    initBlockTabs();
    
    // Test with basic-blocks
    setTimeout(() => {
        console.log('🧪 Testing fixed function...');
        renderBlocksByCategory('basic-blocks');
    }, 500);
    
    console.log('✅ Auto-fix applied!');
}

// Export for use in browser console
if (typeof window !== 'undefined') {
    window.fixBasicBlocks = autoFixBasicBlocks;
    window.renderBlocksByCategoryFixed = renderBlocksByCategory;
    console.log('🔧 Basic Blocks fix loaded. Run fixBasicBlocks() to apply.');
}

// Test script
function testBasicBlocksFix() {
    console.log('🧪 Testing Basic Blocks fix...');
    
    // Test 1: Check if function exists
    if (typeof renderBlocksByCategory === 'function') {
        console.log('✅ renderBlocksByCategory function exists');
    } else {
        console.error('❌ renderBlocksByCategory function not found');
        return;
    }
    
    // Test 2: Check if editor exists
    if (window.editor && window.editor.BlockManager) {
        console.log('✅ Editor and BlockManager exist');
        
        const allBlocks = window.editor.BlockManager.getAll();
        console.log(`📊 Total blocks: ${allBlocks.length}`);
        
        // Test 3: Check for basic blocks
        const basicBlocks = allBlocks.filter(block => {
            const category = block.get('category');
            const id = block.getId() || '';
            
            let categoryStr = category;
            if (typeof category === 'object' && category !== null) {
                categoryStr = category.label || category.name || 'Unknown';
            }
            
            return ['Basic', 'Form', 'Extra'].includes(categoryStr) || id.startsWith('basic-');
        });
        
        console.log(`🎯 Basic blocks found: ${basicBlocks.length}`);
        console.log('🎯 Basic blocks:', basicBlocks.map(b => ({ id: b.getId(), label: b.get('label'), category: b.get('category') })));
        
        // Test 4: Test tab switching
        const basicBlocksTab = document.querySelector('[data-category="basic-blocks"]');
        if (basicBlocksTab) {
            console.log('✅ Basic Blocks tab found');
            console.log('🖱️  Click the Basic Blocks tab to test filtering');
        } else {
            console.error('❌ Basic Blocks tab not found');
        }
        
    } else {
        console.error('❌ Editor or BlockManager not found');
    }
}

// Export test function
if (typeof window !== 'undefined') {
    window.testBasicBlocks = testBasicBlocksFix;
    console.log('🧪 Test function loaded. Run testBasicBlocks() to test.');
}