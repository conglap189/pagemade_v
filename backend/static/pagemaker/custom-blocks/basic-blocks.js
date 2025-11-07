/**
 * BASIC BLOCKS - Simple Components
 * Chỉ 3 component đơn giản: Basic, Form, Extra
 */

export default function(editor) {
  console.log('📦 LOADING BASIC BLOCKS...');
  console.log('📦 Editor available:', !!editor);
  console.log('📦 BlockManager available:', !!editor.BlockManager);
  console.log('📦 BlockManager getAll before:', editor.BlockManager?.getAll()?.length || 'undefined');
  
  // ===== BASIC COMPONENTS =====
  
  // Heading Block
  editor.BlockManager.add('basic-heading', {
    label: 'Heading',
    category: 'Basic',
    media: `<svg viewBox="0 0 24 24" width="40" height="40">
      <path fill="currentColor" d="M3,5H5V11H11V5H13V19H11V13H5V19H3V5Z"/>
    </svg>`,
    content: '<h1 class="text-3xl font-bold text-gray-800">Your Heading Here</h1>',
    attributes: {
      'data-gjs-type': 'heading'
    }
  });
  
  // Text Block
  editor.BlockManager.add('basic-text', {
    label: 'Text Block',
    category: 'Basic',
    media: `<svg viewBox="0 0 24 24" width="40" height="40">
      <path fill="currentColor" d="M3,5H21V7H3V5M3,13H21V11H3V13M3,19H21V17H3V19Z"/>
    </svg>`,
    content: '<p class="text-gray-700 text-base">Your text content here...</p>',
    attributes: {
      'data-gjs-type': 'text'
    }
  });
  
  // Button Block
  editor.BlockManager.add('basic-button', {
    label: 'Button',
    category: 'Basic',
    media: `<svg viewBox="0 0 24 24" width="40" height="40">
      <path fill="currentColor" d="M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
    </svg>`,
    content: '<button class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition">Click Me</button>',
    attributes: {
      'data-gjs-type': 'button'
    }
  });
  
  // ===== FORM COMPONENTS =====
  
  // Input Field Block
  editor.BlockManager.add('basic-input', {
    label: 'Input Field',
    category: 'Form',
    media: `<svg viewBox="0 0 24 24" width="40" height="40">
      <path fill="currentColor" d="M20,6H4C2.89,6 2,6.89 2,8V16A2,2 0 0,0 4,18H20A2,2 0 0,0 22,16V8C22,6.89 21.1,6 20,6M20,16H4V8H20V16Z"/>
    </svg>`,
    content: `
      <div class="form-group" style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Label</label>
        <input type="text" placeholder="Enter text here" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px;">
      </div>
    `,
    attributes: {
      'data-gjs-type': 'input'
    }
  });
  
  // Textarea Block
  editor.BlockManager.add('basic-textarea', {
    label: 'Textarea',
    category: 'Form',
    media: `<svg viewBox="0 0 24 24" width="40" height="40">
      <path fill="currentColor" d="M3,3H21V19H19V5H5V19H3V3M7,7H17V9H7V7M7,11H17V13H7V11M7,15H13V17H7V15Z"/>
    </svg>`,
    content: `
      <div class="form-group" style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Message</label>
        <textarea placeholder="Enter your message here" rows="4" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; resize: vertical;"></textarea>
      </div>
    `,
    attributes: {
      'data-gjs-type': 'textarea'
    }
  });
  
  // ===== EXTRA COMPONENTS =====
  
  // Divider Block
  editor.BlockManager.add('basic-divider', {
    label: 'Divider',
    category: 'Extra',
    media: `<svg viewBox="0 0 24 24" width="40" height="40">
      <path fill="currentColor" d="M21,11H3V13H21V11Z"/>
    </svg>`,
    content: '<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">',
    attributes: {
      'data-gjs-type': 'divider'
    }
  });
  
  // Spacer Block
  editor.BlockManager.add('basic-spacer', {
    label: 'Spacer',
    category: 'Extra',
    media: `<svg viewBox="0 0 24 24" width="40" height="40">
      <path fill="currentColor" d="M3,11H21V13H3V11Z"/>
    </svg>`,
    content: '<div style="height: 50px;"></div>',
    attributes: {
      'data-gjs-type': 'spacer'
    }
  });

  console.log('✅ Basic Blocks loaded successfully!');
  console.log('📦 BlockManager getAll after:', editor.BlockManager?.getAll()?.length || 'undefined');
  console.log('📦 All block IDs after loading:', editor.BlockManager?.getAll()?.map(b => b.getId()) || []);
}