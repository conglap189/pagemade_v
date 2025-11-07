/**
 * Floating Toolbar Validation Script
 * Run this in the browser console when the editor is loaded
 * to check for common issues with the draggable floating toolbar
 */

console.log('🔍 Starting Floating Toolbar Validation...');

// Check 1: Duplicate Event Handlers
function checkDuplicateEventHandlers() {
    console.log('\n📋 Check 1: Duplicate Event Handlers');
    
    const previewBtn = document.getElementById('btn-preview');
    if (previewBtn) {
        const listeners = getEventListeners ? getEventListeners(previewBtn) : 'N/A';
        console.log('Preview button event listeners:', listeners);
        
        if (listeners && listeners.click && listeners.click.length > 1) {
            console.error('❌ ISSUE: Multiple click event listeners found on preview button');
            return false;
        } else {
            console.log('✅ OK: Single event listener on preview button');
            return true;
        }
    } else {
        console.error('❌ ERROR: Preview button not found');
        return false;
    }
}

// Check 2: Floating Toolbar Elements
function checkToolbarElements() {
    console.log('\n📋 Check 2: Floating Toolbar Elements');
    
    const toolbar = document.getElementById('floating-preview-toolbar');
    if (!toolbar) {
        console.error('❌ ERROR: Floating toolbar not found');
        return false;
    }
    
    const requiredElements = [
        'floating-close',
        'floating-save', 
        'floating-publish'
    ];
    
    let allFound = true;
    requiredElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            console.log(`✅ Found: ${id}`);
        } else {
            console.error(`❌ Missing: ${id}`);
            allFound = false;
        }
    });
    
    // Check device switcher buttons
    const deviceBtns = toolbar.querySelectorAll('.floating-device-btn');
    if (deviceBtns.length === 3) {
        console.log('✅ Found 3 device switcher buttons');
    } else {
        console.error(`❌ Expected 3 device buttons, found ${deviceBtns.length}`);
        allFound = false;
    }
    
    return allFound;
}

// Check 3: CSS Position Classes
function checkPositionClasses() {
    console.log('\n📋 Check 3: CSS Position Classes');
    
    const toolbar = document.getElementById('floating-preview-toolbar');
    if (!toolbar) return false;
    
    const positionClasses = ['position-top', 'position-left', 'position-right', 'position-bottom'];
    
    // Test each position class
    positionClasses.forEach(className => {
        toolbar.classList.add(className);
        const styles = window.getComputedStyle(toolbar);
        
        if (className === 'position-top') {
            const hasTopPosition = styles.top === '20px' && styles.left === '50%';
            console.log(hasTopPosition ? '✅ position-top works' : '❌ position-top issue');
        } else if (className === 'position-left') {
            const hasLeftPosition = styles.left === '20px' && styles.top === '50%';
            console.log(hasLeftPosition ? '✅ position-left works' : '❌ position-left issue');
        } else if (className === 'position-right') {
            const hasRightPosition = styles.right === '20px' && styles.top === '50%';
            console.log(hasRightPosition ? '✅ position-right works' : '❌ position-right issue');
        } else if (className === 'position-bottom') {
            const hasBottomPosition = styles.bottom === '20px' && styles.left === '50%';
            console.log(hasBottomPosition ? '✅ position-bottom works' : '❌ position-bottom issue');
        }
        
        toolbar.classList.remove(className);
    });
    
    return true;
}

// Check 4: localStorage Functionality
function checkLocalStorage() {
    console.log('\n📋 Check 4: localStorage Functionality');
    
    try {
        // Test write
        localStorage.setItem('testPosition', 'top');
        console.log('✅ localStorage write works');
        
        // Test read
        const position = localStorage.getItem('testPosition');
        if (position === 'top') {
            console.log('✅ localStorage read works');
        } else {
            console.error('❌ localStorage read failed');
            return false;
        }
        
        // Test remove
        localStorage.removeItem('testPosition');
        console.log('✅ localStorage remove works');
        
        // Check for existing toolbar position
        const savedPosition = localStorage.getItem('floatingToolbarPosition');
        console.log(`📍 Saved toolbar position: ${savedPosition || 'none'}`);
        
        return true;
    } catch (error) {
        console.error('❌ localStorage error:', error.message);
        return false;
    }
}

// Check 5: Drag Functionality
function checkDragFunctionality() {
    console.log('\n📋 Check 5: Drag Functionality');
    
    const toolbar = document.getElementById('floating-preview-toolbar');
    if (!toolbar) return false;
    
    // Check if toolbar has cursor: move style
    const styles = window.getComputedStyle(toolbar);
    if (styles.cursor === 'move') {
        console.log('✅ Toolbar has move cursor');
    } else {
        console.log('⚠️  Toolbar missing move cursor (not critical)');
    }
    
    // Check for user-select: none
    if (styles.userSelect === 'none') {
        console.log('✅ Toolbar has user-select: none');
    } else {
        console.log('⚠️  Toolbar missing user-select: none (not critical)');
    }
    
    // Test if drag variables exist (check global scope)
    if (typeof isDragging !== 'undefined') {
        console.log('✅ Drag variables are defined');
    } else {
        console.error('❌ Drag variables not found in global scope');
        return false;
    }
    
    return true;
}

// Check 6: Preview Mode Integration
function checkPreviewModeIntegration() {
    console.log('\n📋 Check 6: Preview Mode Integration');
    
    const previewBtn = document.getElementById('btn-preview');
    const toolbar = document.getElementById('floating-preview-toolbar');
    
    if (!previewBtn || !toolbar) return false;
    
    // Check initial state
    const isPreviewActive = previewBtn.classList.contains('active');
    const isToolbarVisible = toolbar.style.display !== 'none';
    
    console.log(`📊 Preview active: ${isPreviewActive}`);
    console.log(`📊 Toolbar visible: ${isToolbarVisible}`);
    
    if (isPreviewActive && !isToolbarVisible) {
        console.error('❌ ISSUE: Preview active but toolbar hidden');
        return false;
    }
    
    if (!isPreviewActive && isToolbarVisible) {
        console.error('❌ ISSUE: Preview inactive but toolbar visible');
        return false;
    }
    
    console.log('✅ Preview mode state is consistent');
    return true;
}

// Check 7: Z-index Hierarchy
function checkZIndex() {
    console.log('\n📋 Check 7: Z-index Hierarchy');
    
    const toolbar = document.getElementById('floating-preview-toolbar');
    const canvasArea = document.getElementById('canvas-area');
    
    if (!toolbar || !canvasArea) return false;
    
    const toolbarZ = window.getComputedStyle(toolbar).zIndex;
    const canvasZ = window.getComputedStyle(canvasArea).zIndex;
    
    console.log(`📊 Toolbar z-index: ${toolbarZ}`);
    console.log(`📊 Canvas z-index: ${canvasZ}`);
    
    if (parseInt(toolbarZ) > parseInt(canvasZ)) {
        console.log('✅ Toolbar z-index is higher than canvas');
        return true;
    } else {
        console.error('❌ Toolbar z-index may conflict with canvas');
        return false;
    }
}

// Check 8: Device Switcher Sync
function checkDeviceSwitcherSync() {
    console.log('\n📋 Check 8: Device Switcher Sync');
    
    const mainDeviceBtns = document.querySelectorAll('.device-btn[data-device]');
    const floatingDeviceBtns = document.querySelectorAll('.floating-device-btn[data-device]');
    
    if (mainDeviceBtns.length !== 3 || floatingDeviceBtns.length !== 3) {
        console.error('❌ Device switcher buttons not found');
        return false;
    }
    
    // Check if main device buttons have active states
    let mainActiveCount = 0;
    mainDeviceBtns.forEach(btn => {
        if (btn.classList.contains('active')) {
            mainActiveCount++;
            console.log(`📊 Main active device: ${btn.dataset.device}`);
        }
    });
    
    // Check if floating device buttons have active states
    let floatingActiveCount = 0;
    floatingDeviceBtns.forEach(btn => {
        if (btn.classList.contains('active')) {
            floatingActiveCount++;
            console.log(`📊 Floating active device: ${btn.dataset.device}`);
        }
    });
    
    if (mainActiveCount === 1 && floatingActiveCount === 1) {
        console.log('✅ Device switchers have proper active states');
        return true;
    } else {
        console.error('❌ Device switcher active state issue');
        return false;
    }
}

// Main validation function
function runValidation() {
    console.log('🚀 Starting comprehensive validation...\n');
    
    const results = {
        duplicateHandlers: checkDuplicateEventHandlers(),
        toolbarElements: checkToolbarElements(),
        positionClasses: checkPositionClasses(),
        localStorage: checkLocalStorage(),
        dragFunctionality: checkDragFunctionality(),
        previewIntegration: checkPreviewModeIntegration(),
        zIndex: checkZIndex(),
        deviceSync: checkDeviceSwitcherSync()
    };
    
    const passedTests = Object.values(results).filter(result => result).length;
    const totalTests = Object.keys(results).length;
    
    console.log('\n📊 VALIDATION SUMMARY');
    console.log('='.repeat(50));
    console.log(`Tests passed: ${passedTests}/${totalTests}`);
    console.log(`Success rate: ${Math.round((passedTests/totalTests) * 100)}%`);
    
    if (passedTests === totalTests) {
        console.log('🎉 All tests passed! Floating toolbar is working correctly.');
    } else {
        console.log('⚠️  Some issues found. Review the errors above.');
    }
    
    return results;
}

// Auto-run validation when script is loaded
if (typeof window !== 'undefined') {
    // Browser environment
    console.log('🌐 Browser environment detected');
    console.log('💡 Run runValidation() in console to start validation');
    
    // Make function available globally
    window.validateFloatingToolbar = runValidation;
    window.runValidation = runValidation;
} else {
    // Node.js environment
    console.log('🖥️  Node.js environment detected');
    console.log('💡 This script should be run in the browser console');
}

// Export for Node.js if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runValidation };
}