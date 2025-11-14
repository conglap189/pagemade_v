/**
 * Basic Blocks System
 * Simple, fundamental blocks for page building
 */

export default (editor) => {
    const bm = editor.BlockManager;
    
    console.log('🎯 Loading Basic Blocks...');
    
    // ===== BASIC CATEGORY =====
    
    // Heading
    bm.add('basic-heading', {
        label: 'Heading',
        category: 'Basic',
        media: '<i class="fas fa-heading"></i>',
        content: '<h1>Heading Text</h1>',
    });
    
    // Text
    bm.add('basic-text', {
        label: 'Text',
        category: 'Basic',
        media: '<i class="fas fa-paragraph"></i>',
        content: '<p>Your text content here...</p>',
    });
    
    // Button
    bm.add('basic-button', {
        label: 'Button',
        category: 'Basic',
        media: '<i class="fas fa-square"></i>',
        content: '<button class="btn">Click me</button>',
    });
    
    // Image
    bm.add('basic-image', {
        label: 'Image',
        category: 'Basic',
        media: '<i class="fas fa-image"></i>',
        content: '<img src="https://via.placeholder.com/350x200" alt="Image" />',
    });
    
    // Container
    bm.add('basic-container', {
        label: 'Container',
        category: 'Basic',
        media: '<i class="fas fa-square-full"></i>',
        content: '<div class="container"></div>',
    });

    // ===== LAYOUT COLUMNS =====
    
    // 1 Column
    bm.add('layout-1-column', {
        label: '1 Column',
        category: 'Basic',
        media: '<div style="display: flex; gap: 2px;"><div style="flex: 1; height: 10px; background: #667eea;"></div></div>',
        content: `
            <div style="display: flex; flex-direction: column; gap: 20px; padding: 20px; min-height: 200px; border: 1px dashed #e5e7eb;">
                <div style="flex: 1; padding: 15px; background: #f8fafc; border: 1px dashed #d1d5db; text-align: center; color: #6b7280;">
                    Drop content here
                </div>
            </div>
        `,
    });
    
    // 2 Columns
    bm.add('layout-2-columns', {
        label: '2 Columns',
        category: 'Basic',
        media: '<div style="display: flex; gap: 2px;"><div style="flex: 1; height: 10px; background: #667eea;"></div><div style="flex: 1; height: 10px; background: #667eea;"></div></div>',
        content: `
            <div style="display: flex; gap: 20px; padding: 20px; min-height: 200px; border: 1px dashed #e5e7eb;">
                <div style="flex: 1; padding: 15px; background: #f8fafc; border: 1px dashed #d1d5db; text-align: center; color: #6b7280;">
                    Column 1
                </div>
                <div style="flex: 1; padding: 15px; background: #f8fafc; border: 1px dashed #d1d5db; text-align: center; color: #6b7280;">
                    Column 2
                </div>
            </div>
        `,
    });
    
    // 3 Columns
    bm.add('layout-3-columns', {
        label: '3 Columns',
        category: 'Basic',
        media: '<div style="display: flex; gap: 2px;"><div style="flex: 1; height: 10px; background: #667eea;"></div><div style="flex: 1; height: 10px; background: #667eea;"></div><div style="flex: 1; height: 10px; background: #667eea;"></div></div>',
        content: `
            <div style="display: flex; gap: 15px; padding: 20px; min-height: 200px; border: 1px dashed #e5e7eb;">
                <div style="flex: 1; padding: 15px; background: #f8fafc; border: 1px dashed #d1d5db; text-align: center; color: #6b7280; font-size: 14px;">
                    Column 1
                </div>
                <div style="flex: 1; padding: 15px; background: #f8fafc; border: 1px dashed #d1d5db; text-align: center; color: #6b7280; font-size: 14px;">
                    Column 2
                </div>
                <div style="flex: 1; padding: 15px; background: #f8fafc; border: 1px dashed #d1d5db; text-align: center; color: #6b7280; font-size: 14px;">
                    Column 3
                </div>
            </div>
        `,
    });
    
    // 2 Columns (1:2 ratio)
    bm.add('layout-2-columns-1-2', {
        label: '1:2 Columns',
        category: 'Basic',
        media: '<div style="display: flex; gap: 2px;"><div style="flex: 1; height: 10px; background: #667eea;"></div><div style="flex: 2; height: 10px; background: #667eea;"></div></div>',
        content: `
            <div style="display: flex; gap: 20px; padding: 20px; min-height: 200px; border: 1px dashed #e5e7eb;">
                <div style="flex: 1; padding: 15px; background: #f8fafc; border: 1px dashed #d1d5db; text-align: center; color: #6b7280;">
                    Sidebar
                </div>
                <div style="flex: 2; padding: 15px; background: #f8fafc; border: 1px dashed #d1d5db; text-align: center; color: #6b7280;">
                    Main Content
                </div>
            </div>
        `,
    });
    
    // 2 Columns (2:1 ratio)
    bm.add('layout-2-columns-2-1', {
        label: '2:1 Columns',
        category: 'Basic',
        media: '<div style="display: flex; gap: 2px;"><div style="flex: 2; height: 10px; background: #667eea;"></div><div style="flex: 1; height: 10px; background: #667eea;"></div></div>',
        content: `
            <div style="display: flex; gap: 20px; padding: 20px; min-height: 200px; border: 1px dashed #e5e7eb;">
                <div style="flex: 2; padding: 15px; background: #f8fafc; border: 1px dashed #d1d5db; text-align: center; color: #6b7280;">
                    Main Content
                </div>
                <div style="flex: 1; padding: 15px; background: #f8fafc; border: 1px dashed #d1d5db; text-align: center; color: #6b7280;">
                    Sidebar
                </div>
            </div>
        `,
    });
    
    // ===== FORM CATEGORY =====
    
    // Input
    bm.add('form-input', {
        label: 'Input',
        category: 'Form',
        media: '<i class="fas fa-text-width"></i>',
        content: '<input type="text" placeholder="Enter text..." />',
    });
    
    // Textarea
    bm.add('form-textarea', {
        label: 'Textarea',
        category: 'Form',
        media: '<i class="fas fa-align-left"></i>',
        content: '<textarea placeholder="Enter text..."></textarea>',
    });
    
    // Select
    bm.add('form-select', {
        label: 'Select',
        category: 'Form',
        media: '<i class="fas fa-caret-square-down"></i>',
        content: `
            <select>
                <option>Option 1</option>
                <option>Option 2</option>
                <option>Option 3</option>
            </select>
        `,
    });
    
    // Checkbox
    bm.add('form-checkbox', {
        label: 'Checkbox',
        category: 'Form',
        media: '<i class="fas fa-check-square"></i>',
        content: '<label><input type="checkbox" /> Check me</label>',
    });
    
    // ===== EXTRA CATEGORY =====
    
    // Divider
    bm.add('extra-divider', {
        label: 'Divider',
        category: 'Extra',
        media: '<i class="fas fa-minus"></i>',
        content: '<hr />',
    });
    
    // Spacer
    bm.add('extra-spacer', {
        label: 'Spacer',
        category: 'Extra',
        media: '<i class="fas fa-arrows-alt-v"></i>',
        content: '<div style="height: 50px;"></div>',
    });
    
    // Icon
    bm.add('extra-icon', {
        label: 'Icon',
        category: 'Extra',
        media: '<i class="fas fa-star"></i>',
        content: '<i class="fas fa-star fa-2x"></i>',
    });
    
    console.log('✅ Basic Blocks loaded!');
};
