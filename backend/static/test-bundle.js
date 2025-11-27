/**
 * Simple test to verify the PageMade Editor bundle loads correctly
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing PageMade Editor Bundle...\n');

// Check if bundle file exists
const bundlePath = path.join(__dirname, 'dist', 'pagemaker-editor.bundle.js');
if (!fs.existsSync(bundlePath)) {
    console.error('❌ Bundle file not found:', bundlePath);
    process.exit(1);
}

// Read bundle content
const bundleContent = fs.readFileSync(bundlePath, 'utf8');
console.log('✅ Bundle file found and readable');

// Check bundle size
const stats = fs.statSync(bundlePath);
const sizeKB = Math.round(stats.size / 1024);
console.log(`📦 Bundle size: ${sizeKB} KB`);

// Check for key modules in bundle
const keyModules = [
    'PageMadeEditor',
    'StateManager',
    'EventBus', 
    'LifecycleManager',
    'Editor',
    'BlockManager',
    'PanelManager',
    'AssetManager',
    'Canvas',
    'Toolbar'
];

console.log('\n🔍 Checking for key modules...');
let foundModules = 0;
keyModules.forEach(module => {
    if (bundleContent.includes(module)) {
        console.log(`✅ ${module}`);
        foundModules++;
    } else {
        console.log(`❌ ${module} - NOT FOUND`);
    }
});

// Check for error patterns
const errorPatterns = [
    'Cannot resolve module',
    'Module not found',
    'import.*error',
    'require.*error'
];

console.log('\n🚨 Checking for error patterns...');
let foundErrors = 0;
errorPatterns.forEach(pattern => {
    const regex = new RegExp(pattern, 'i');
    if (regex.test(bundleContent)) {
        console.log(`❌ Found error pattern: ${pattern}`);
        foundErrors++;
    }
});

// Summary
console.log('\n📊 Test Summary:');
console.log(`- Modules found: ${foundModules}/${keyModules.length}`);
console.log(`- Error patterns: ${foundErrors}`);

if (foundModules === keyModules.length && foundErrors === 0) {
    console.log('\n🎉 Bundle test PASSED! All modules present, no errors detected.');
} else {
    console.log('\n⚠️ Bundle test FAILED! Some issues detected.');
}

// Check for webpack footer
if (bundleContent.includes('webpack')) {
    console.log('✅ Webpack bundle detected');
} else {
    console.log('❌ Not a webpack bundle');
}