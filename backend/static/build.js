#!/usr/bin/env node

/**
 * Simple build script for PageMade Editor
 * Can be used without webpack for simple bundling
 */

const fs = require('fs');
const path = require('path');

// Simple file bundler for development
function bundleFiles() {
    console.log('🔨 Building PageMade Editor...');
    
    const srcDir = path.join(__dirname, 'src');
    const distDir = path.join(__dirname, 'dist');
    
    // Create dist directory if it doesn't exist
    if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir, { recursive: true });
    }
    
    // Read and concatenate all JS files in order
    const files = [
        'core/EventBus.js',
        'core/StateManager.js',
        'core/LifecycleManager.js',
        'core/Editor.js',
        'modules/panels/PanelManager.js',
        'modules/assets/AssetManager.js',
        'modules/blocks/BlockManager.js',
        'modules/canvas/Canvas.js',
        'modules/toolbar/Toolbar.js',
        'index.js'
    ];
    
    let bundledContent = '';
    
    // Add header
    bundledContent += `/**
 * PageMade Editor v2.0.0 - Bundled Version
 * Generated on: ${new Date().toISOString()}
 * 
 * This is a bundled version for development/testing.
 * For production, use webpack build.
 */

`;
    
    // Add each file
    files.forEach(file => {
        const filePath = path.join(srcDir, file);
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            bundledContent += `\n// === ${file} ===\n\n`;
            bundledContent += content;
            bundledContent += '\n\n';
        } else {
            console.warn(`⚠️ File not found: ${file}`);
        }
    });
    
    // Write bundled file
    const outputPath = path.join(distDir, 'pagemaker-editor.bundle.js');
    fs.writeFileSync(outputPath, bundledContent);
    
    console.log(`✅ Bundle created: ${outputPath}`);
    console.log(`📊 Bundle size: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);
    
    // Copy CSS files
    const cssFiles = ['editor.css', 'components.css', 'themes.css'];
    cssFiles.forEach(cssFile => {
        const cssPath = path.join(srcDir, 'styles', cssFile);
        if (fs.existsSync(cssPath)) {
            const cssOutputPath = path.join(distDir, cssFile);
            fs.copyFileSync(cssPath, cssOutputPath);
            console.log(`📄 CSS copied: ${cssFile}`);
        }
    });
    
    console.log('✅ Build complete!');
}

// Run the build
if (require.main === module) {
    bundleFiles();
}

module.exports = { bundleFiles };