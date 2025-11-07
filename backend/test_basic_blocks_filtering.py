#!/usr/bin/env python3
"""
Test script to analyze Basic Blocks filtering functionality in PageMade Flask application.

This script analyzes the code to identify the issue with Basic Blocks filtering
where blocks with string categories ('Basic', 'Form', 'Extra') are not being found.
"""

import os
import re
import json

def analyze_editor_template():
    """Analyze the editor template for filtering logic"""
    print("🔍 ANALYZING EDITOR TEMPLATE")
    print("=" * 50)
    
    template_path = "/home/helios/ver1.1/backend/templates/editor_pagemaker_v2.html"
    
    with open(template_path, 'r') as f:
        content = f.read()
    
    # Find the renderBlocksByCategory function
    function_match = re.search(r'function renderBlocksByCategory\(category\).*?(?=function|\n\s*//|\n\s*$)', content, re.DOTALL)
    
    if function_match:
        print("✅ Found renderBlocksByCategory function")
        function_code = function_match.group(0)
        
        # Extract filtering logic
        if "basic-blocks" in function_code:
            print("✅ Found basic-blocks filtering logic")
            
            # Look for category filtering
            if "block.get('category')" in function_code:
                print("✅ Found block.get('category') calls")
                
                # Check for object vs string handling
                if "typeof blockCategory === 'object'" in function_code:
                    print("✅ Found object category handling logic")
                else:
                    print("❌ Missing object category handling logic")
                    
                # Check for string category comparison
                if "['Basic', 'Form', 'Extra']" in function_code:
                    print("✅ Found Basic, Form, Extra category filtering")
                else:
                    print("❌ Missing Basic, Form, Extra category filtering")
            else:
                print("❌ No block.get('category') calls found")
        else:
            print("❌ No basic-blocks filtering logic found")
    else:
        print("❌ renderBlocksByCategory function not found")
    
    return function_match.group(0) if function_match else None

def analyze_basic_blocks_definition():
    """Analyze the Basic Blocks definition"""
    print("\n🔍 ANALYZING BASIC BLOCKS DEFINITION")
    print("=" * 50)
    
    blocks_path = "/home/helios/ver1.1/backend/static/pagemaker/custom-blocks/basic-blocks.js"
    
    with open(blocks_path, 'r') as f:
        content = f.read()
    
    # Find all block definitions
    block_matches = re.findall(r"editor\.BlockManager\.add\('([^']+)',\s*{([^}]+)}", content, re.DOTALL)
    
    print(f"✅ Found {len(block_matches)} block definitions")
    
    categories_found = set()
    blocks_by_category = {}
    
    for block_id, block_content in block_matches:
        # Extract category
        category_match = re.search(r"category:\s*['\"]([^'\"]+)['\"]", block_content)
        if category_match:
            category = category_match.group(1)
            categories_found.add(category)
            
            if category not in blocks_by_category:
                blocks_by_category[category] = []
            blocks_by_category[category].append(block_id)
            
            print(f"  📦 Block '{block_id}' -> Category: '{category}' (string)")
    
    print(f"\n📊 Categories found: {sorted(categories_found)}")
    
    for category, blocks in blocks_by_category.items():
        print(f"  📂 {category}: {blocks}")
    
    return blocks_by_category

def analyze_tailwind_blocks():
    """Analyze Tailwind blocks to understand object categories"""
    print("\n🔍 ANALYZING TAILWIND BLOCKS (for comparison)")
    print("=" * 50)
    
    # Look for grapesjs-tailwind plugin usage
    template_path = "/home/helios/ver1.1/backend/templates/editor_pagemaker_v2.html"
    
    with open(template_path, 'r') as f:
        content = f.read()
    
    if "grapesjs-tailwind" in content:
        print("✅ Found grapesjs-tailwind plugin usage")
        
        # Check plugin options
        if "pluginsOpts" in content:
            print("✅ Found plugin configuration")
            
            # Look for openCategory setting
            if "openCategory" in content:
                print("✅ Found openCategory configuration")
            else:
                print("❌ No openCategory configuration found")
        else:
            print("❌ No plugin configuration found")
    else:
        print("❌ No grapesjs-tailwind plugin found")
    
    return True

def identify_issues():
    """Identify the specific issues with Basic Blocks filtering"""
    print("\n🐛 IDENTIFYING ISSUES")
    print("=" * 50)
    
    issues = []
    
    # Issue 1: Multiple duplicate filtering logic
    template_path = "/home/helios/ver1.1/backend/templates/editor_pagemaker_v2.html"
    with open(template_path, 'r') as f:
        content = f.read()
    
    # Count occurrences of basic-blocks filtering
    basic_blocks_count = content.count("category === 'basic-blocks'")
    if basic_blocks_count > 1:
        issues.append(f"❌ Duplicate basic-blocks filtering logic found ({basic_blocks_count} times)")
        print(f"❌ Issue: Duplicate basic-blocks filtering logic found ({basic_blocks_count} times)")
    
    # Issue 2: Inconsistent category handling
    if "typeof blockCategory === 'object'" in content:
        print("✅ Object category handling found")
    else:
        issues.append("❌ Missing object category handling logic")
        print("❌ Issue: Missing object category handling logic")
    
    # Issue 3: Incomplete filtering logic
    if "blockId.startsWith('basic-')" in content:
        print("✅ Found basic- prefix filtering")
    else:
        issues.append("❌ Missing basic- prefix filtering")
        print("❌ Issue: Missing basic- prefix filtering")
    
    return issues

def generate_fix_recommendations():
    """Generate fix recommendations"""
    print("\n💡 FIX RECOMMENDATIONS")
    print("=" * 50)
    
    recommendations = [
        "1. CONSOLIDATE FILTERING LOGIC:",
        "   - Remove duplicate basic-blocks filtering sections",
        "   - Keep only one comprehensive filtering implementation",
        "",
        "2. IMPROVE CATEGORY HANDLING:",
        "   - Handle both string and object categories properly",
        "   - Use consistent category comparison logic",
        "",
        "3. ENHANCE FILTERING CRITERIA:",
        "   - Filter by category strings: ['Basic', 'Form', 'Extra']",
        "   - Also filter by block ID prefix: 'basic-'",
        "   - Handle Tailwind object categories gracefully",
        "",
        "4. DEBUGGING IMPROVEMENTS:",
        "   - Add comprehensive console logging",
        "   - Log block categories and types",
        "   - Log filtering results",
        "",
        "5. CODE STRUCTURE:",
        "   - Extract filtering logic to separate function",
        "   - Make category matching case-insensitive",
        "   - Add fallback for undefined categories"
    ]
    
    for rec in recommendations:
        print(rec)

def create_test_script():
    """Create a browser console test script"""
    print("\n🧪 CREATING BROWSER TEST SCRIPT")
    print("=" * 50)
    
    test_script = """
// Browser Console Test Script for Basic Blocks Filtering
// Run this in the browser console when editor is loaded

console.log('🧪 TESTING BASIC BLOCKS FILTERING');

// 1. Check if editor is available
if (!window.editor) {
    console.error('❌ Editor not found');
} else {
    console.log('✅ Editor found');
    
    // 2. Get BlockManager
    const blockManager = window.editor.BlockManager;
    if (!blockManager) {
        console.error('❌ BlockManager not found');
    } else {
        console.log('✅ BlockManager found');
        
        // 3. Get all blocks
        const allBlocks = blockManager.getAll();
        console.log(`📦 Total blocks: ${allBlocks.length}`);
        
        // 4. Analyze block categories
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
        
        console.log('📊 Block Analysis:', blockAnalysis);
        
        // 5. Filter for Basic blocks (current logic)
        const basicBlocksCurrent = blockAnalysis.filter(block => {
            const category = block.category;
            let categoryStr = category;
            if (typeof category === 'object' && category !== null) {
                categoryStr = category.label || category.name || 'Unknown';
            }
            return ['Basic', 'Form', 'Extra'].includes(categoryStr);
        });
        
        console.log(`🎯 Basic blocks found (current logic): ${basicBlocksCurrent.length}`);
        console.log('🎯 Basic blocks:', basicBlocksCurrent);
        
        // 6. Test tab switching
        console.log('🔄 Testing tab switching...');
        
        const basicBlocksTab = document.querySelector('[data-category="basic-blocks"]');
        if (basicBlocksTab) {
            console.log('✅ Basic Blocks tab found');
            console.log('🖱️  Click Basic Blocks tab to test filtering');
            
            // Simulate click
            basicBlocksTab.click();
            
            setTimeout(() => {
                const blocksContainer = document.getElementById('blocks-container');
                if (blocksContainer) {
                    const visibleBlocks = blocksContainer.querySelectorAll('.gjs-block-cs, .gjs-block');
                    console.log(`👁️  Visible blocks after tab click: ${visibleBlocks.length}`);
                }
            }, 1000);
        } else {
            console.error('❌ Basic Blocks tab not found');
        }
        
        // 7. Test renderBlocksByCategory function
        if (typeof renderBlocksByCategory === 'function') {
            console.log('✅ renderBlocksByCategory function found');
            
            // Test with basic-blocks
            console.log('🧪 Testing renderBlocksByCategory("basic-blocks")');
            renderBlocksByCategory('basic-blocks');
        } else {
            console.error('❌ renderBlocksByCategory function not found');
        }
    }
}
"""
    
    # Save test script
    with open('/home/helios/ver1.1/backend/test_basic_blocks_console.js', 'w') as f:
        f.write(test_script)
    
    print("✅ Browser test script created: test_basic_blocks_console.js")
    print("📝 Copy this script and run it in browser console")

def main():
    """Main analysis function"""
    print("🔍 BASIC BLOCKS FILTERING ANALYSIS")
    print("=" * 60)
    print("Analyzing PageMade Flask application for Basic Blocks filtering issues...")
    print()
    
    # Analyze components
    function_code = analyze_editor_template()
    blocks_by_category = analyze_basic_blocks_definition()
    analyze_tailwind_blocks()
    issues = identify_issues()
    generate_fix_recommendations()
    create_test_script()
    
    # Summary
    print("\n📋 ANALYSIS SUMMARY")
    print("=" * 50)
    
    if issues:
        print(f"❌ Found {len(issues)} issues:")
        for issue in issues:
            print(f"  {issue}")
    else:
        print("✅ No critical issues found")
    
    print(f"\n📊 Basic Blocks defined: {sum(len(blocks) for blocks in blocks_by_category.values())}")
    print(f"📂 Categories: {list(blocks_by_category.keys())}")
    
    print("\n🎯 NEXT STEPS")
    print("=" * 50)
    print("1. Run the Flask application: python run_local.py")
    print("2. Navigate to editor page")
    print("3. Open browser console and run the test script")
    print("4. Test tab switching between 'Site Blocks' and 'Basic Blocks'")
    print("5. Apply the recommended fixes")

if __name__ == "__main__":
    main()