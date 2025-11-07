# Basic Blocks Filtering Manual Test Plan

## 🎯 Objective
Test the Basic Blocks filtering functionality in PageMade Flask application to identify why blocks with string categories ('Basic', 'Form', 'Extra') are not being found.

## 🚀 Setup Instructions

### 1. Start the Flask Application
```bash
cd /home/helios/ver1.1/backend
python run_local.py
```

### 2. Access the Editor
1. Open browser to: http://localhost:5000/create-test-account
2. This will create and login with admin account
3. Navigate to: http://localhost:5000/dashboard
4. Create a new site or access existing site
5. Click on editor for any page: http://localhost:5000/editor/{page_id}

## 🧪 Test Steps

### Step 1: Initial Load Analysis
1. Open browser console (F12)
2. Go to Console tab
3. Clear console and refresh page
4. Look for these console messages:
   - `🚀 PageMaker Editor v2 initializing...`
   - `📦 Loading Basic Blocks...`
   - `✅ Basic Blocks loaded successfully!`
   - `✅ Custom blocks loaded successfully`

### Step 2: Block Analysis
Run this code in browser console:
```javascript
// Analyze all blocks in the editor
const blockManager = window.editor.BlockManager;
const allBlocks = blockManager.getAll();

console.log('📊 TOTAL BLOCKS ANALYSIS:');
console.log(`Total blocks: ${allBlocks.length}`);

// Analyze each block
const blockAnalysis = allBlocks.map(block => {
    const category = block.get('category');
    const id = block.getId();
    const label = block.get('label');
    
    return {
        id,
        label,
        category,
        categoryType: typeof category,
        isBasicString: ['Basic', 'Form', 'Extra'].includes(category),
        isBasicPrefix: id && id.startsWith('basic-')
    };
});

console.log('📦 Block Analysis:', blockAnalysis);

// Filter for Basic blocks
const basicBlocks = blockAnalysis.filter(block => {
    const category = block.category;
    let categoryStr = category;
    if (typeof category === 'object' && category !== null) {
        categoryStr = category.label || category.name || 'Unknown';
    }
    return ['Basic', 'Form', 'Extra'].includes(categoryStr);
});

console.log(`🎯 Basic blocks found: ${basicBlocks.length}`);
console.log('🎯 Basic blocks:', basicBlocks);
```

### Step 3: Tab Switching Test
1. Look at the left panel - you should see two tabs: "Site Blocks" and "Basic Blocks"
2. Click on "Site Blocks" tab
3. Observe what blocks are displayed
4. Click on "Basic Blocks" tab
5. Observe what blocks are displayed
6. Check console for any error messages

### Step 4: Manual Filtering Test
Run this code in browser console:
```javascript
// Test the filtering function directly
if (typeof renderBlocksByCategory === 'function') {
    console.log('🧪 Testing renderBlocksByCategory function...');
    
    // Test with basic-blocks
    console.log('🔄 Testing basic-blocks category...');
    renderBlocksByCategory('basic-blocks');
    
    // Wait and check results
    setTimeout(() => {
        const blocksContainer = document.getElementById('blocks-container');
        if (blocksContainer) {
            const visibleBlocks = blocksContainer.querySelectorAll('.gjs-block-cs, .gjs-block');
            console.log(`👁️  Visible blocks after basic-blocks filter: ${visibleBlocks.length}`);
            
            // Log each visible block
            visibleBlocks.forEach((block, index) => {
                const blockId = block.getAttribute('data-block-id');
                const blockLabel = block.querySelector('.block-name, .gjs-block-label');
                console.log(`  ${index + 1}. ID: ${blockId}, Label: ${blockLabel ? blockLabel.textContent : 'N/A'}`);
            });
        }
    }, 1000);
    
} else {
    console.error('❌ renderBlocksByCategory function not found');
}
```

### Step 5: Category Type Investigation
Run this code to understand category types:
```javascript
// Investigate category types in detail
const blockManager = window.editor.BlockManager;
const allBlocks = blockManager.getAll();

console.log('🔍 CATEGORY TYPE ANALYSIS:');

allBlocks.forEach((block, index) => {
    const category = block.get('category');
    const id = block.getId();
    const label = block.get('label');
    
    console.log(`Block ${index + 1}:`);
    console.log(`  ID: ${id}`);
    console.log(`  Label: ${label}`);
    console.log(`  Category: ${category}`);
    console.log(`  Category Type: ${typeof category}`);
    console.log(`  Category Keys: ${typeof category === 'object' ? Object.keys(category) : 'N/A'}`);
    console.log('---');
});
```

## 🐛 Expected Issues

Based on code analysis, you should encounter these issues:

### Issue 1: No Basic Blocks Displayed
- When clicking "Basic Blocks" tab, you may see "No basic blocks available" message
- Console may show that basic blocks are found but not rendered

### Issue 2: Category Type Mismatch
- Basic blocks have string categories ('Basic', 'Form', 'Extra')
- Tailwind blocks have object categories with label/name properties
- Filtering logic may not handle both types correctly

### Issue 3: Duplicate Filtering Logic
- Multiple filtering sections may cause inconsistent behavior
- Console may show multiple filtering attempts

## 📊 Test Results Template

Copy and paste this template to record your results:

```
## 🧪 TEST RESULTS

### Initial Load
- ✅/❌ PageMaker Editor initialized
- ✅/❌ Basic Blocks loaded successfully
- ✅/❌ Custom blocks loaded successfully
- Console messages: [paste relevant console messages]

### Block Analysis
- Total blocks: [number]
- Basic blocks found: [number]
- Basic block IDs: [list of IDs]
- Category types found: [list of types]

### Tab Switching
- Site Blocks tab: [number] blocks displayed
- Basic Blocks tab: [number] blocks displayed
- Error messages: [paste any errors]

### Manual Filtering
- renderBlocksByCategory function: ✅/❌ available
- Basic blocks filter result: [number] blocks
- Visible blocks after filter: [number]

### Category Types
- String categories: [list]
- Object categories: [list]
- Mixed handling: ✅/❌ working

## 🐛 Issues Found
1. [Issue description]
2. [Issue description]
3. [Issue description]

## 💡 Recommendations
1. [Recommendation]
2. [Recommendation]
3. [Recommendation]
```

## 🔧 Quick Fix Verification

After identifying issues, you can test this quick fix in browser console:

```javascript
// Quick fix for Basic Blocks filtering
const originalRenderBlocksByCategory = window.renderBlocksByCategory;

window.renderBlocksByCategory = function(category) {
    console.log('🔧 FIXED renderBlocksByCategory called with:', category);
    
    const blocksContainer = document.getElementById('blocks-container');
    const blockManager = window.editor.BlockManager;
    
    if (!blocksContainer || !blockManager) return;
    
    blocksContainer.innerHTML = '';
    
    if (category === 'basic-blocks') {
        const allBlocks = blockManager.getAll();
        console.log('🔍 Total blocks:', allBlocks.length);
        
        const basicBlocks = allBlocks.filter(block => {
            const blockCategory = block.get('category');
            const blockId = block.getId() || '';
            
            // Handle both string and object categories
            let categoryStr = blockCategory;
            if (typeof blockCategory === 'object' && blockCategory !== null) {
                categoryStr = blockCategory.label || blockCategory.name || 'Unknown';
            }
            
            const isBasicCategory = ['Basic', 'Form', 'Extra'].includes(categoryStr);
            const isBasicPrefix = blockId.startsWith('basic-');
            
            console.log(`📦 Block: ${blockId}, Category: ${categoryStr} (${typeof blockCategory}), Basic: ${isBasicCategory || isBasicPrefix}`);
            
            return isBasicCategory || isBasicPrefix;
        });
        
        console.log('🎯 Basic blocks found:', basicBlocks.length);
        
        if (basicBlocks.length > 0) {
            const basicBlocksContainer = document.createElement('div');
            basicBlocksContainer.className = 'gjs-blocks-cs-container';
            
            basicBlocks.forEach(block => {
                const blockEl = document.createElement('div');
                blockEl.className = 'gjs-block-cs';
                blockEl.setAttribute('data-block-id', block.getId());
                
                const blockContent = document.createElement('div');
                blockContent.className = 'gjs-block-label';
                blockContent.innerHTML = `
                    <div class="block-media">${block.get('media') || ''}</div>
                    <div class="block-name">${block.get('label')}</div>
                `;
                
                blockEl.appendChild(blockContent);
                
                blockEl.addEventListener('click', () => {
                    const selected = blockManager.get(block.getId());
                    if (selected) {
                        window.editor.addComponents(selected.get('content'));
                    }
                });
                
                basicBlocksContainer.appendChild(blockEl);
            });
            
            blocksContainer.appendChild(basicBlocksContainer);
        } else {
            blocksContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: #6b7280;">No basic blocks available</div>';
        }
    } else if (category === 'site-blocks') {
        const blocksEl = blockManager.render();
        if (blocksEl) {
            blocksContainer.appendChild(blocksEl);
        }
    }
};

// Test the fixed function
console.log('🧪 Testing fixed renderBlocksByCategory...');
window.renderBlocksByCategory('basic-blocks');
```

## 📝 Next Steps

1. Run the test plan
2. Record results
3. Identify specific issues
4. Apply fixes
5. Verify fixes work
6. Update production code

## 🆘 Troubleshooting

If the application doesn't start:
- Check if port 5000 is available
- Verify all dependencies are installed
- Check .env.local configuration

If the editor doesn't load:
- Check browser console for JavaScript errors
- Verify all static files are accessible
- Check if PageMaker library loads correctly

If blocks don't appear:
- Check BlockManager initialization
- Verify custom blocks are loaded
- Check DOM manipulation in filtering logic