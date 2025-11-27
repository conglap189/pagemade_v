/**
 * PageMade Editor Configuration
 * Complete GrapesJS configuration extracted from working old editor
 * This file was missing and causing editor initialization to fail
 */

export class PageMadeEditorConfig {
    constructor(options = {}) {
        this.pageData = options.pageData || {};
        this.siteId = this.pageData.site_id || window.SITE_ID;
        this.pageId = this.pageData.id || window.PAGE_ID;
    }

    getConfig() {
        return {
            container: '#gjs',
            
            // Enable storage (custom implementation in main.js)
            storageManager: false, // Disabled - we use custom save/load
            
            // Plugins
            plugins: ['grapesjs-tailwind'],
            pluginsOpts: {
                'grapesjs-tailwind': {}
            },
            
            // Block Manager Configuration
            blockManager: {
                appendTo: '#blocks-container',
            },
            
            // Style Manager Configuration with 8 Complete Sectors
            styleManager: {
                appendTo: '#styles-container',
                sectors: [
                    {
                        name: 'Layout',
                        open: false,
                        buildProps: ['display', 'flex-direction', 'flex-wrap', 'justify-content', 'align-items', 'align-content', 'gap', 'grid-template-columns', 'grid-template-rows', 'grid-gap'],
                        properties: [
                            {
                                type: 'select',
                                property: 'display',
                                default: 'block',
                                options: [
                                    { value: 'block', name: 'Block' },
                                    { value: 'inline-block', name: 'Inline Block' },
                                    { value: 'inline', name: 'Inline' },
                                    { value: 'flex', name: 'Flex' },
                                    { value: 'grid', name: 'Grid' },
                                    { value: 'none', name: 'None' },
                                ],
                            },
                            {
                                type: 'select',
                                property: 'flex-direction',
                                default: 'row',
                                options: [
                                    { value: 'row', name: 'Row' },
                                    { value: 'row-reverse', name: 'Row Reverse' },
                                    { value: 'column', name: 'Column' },
                                    { value: 'column-reverse', name: 'Column Reverse' },
                                ],
                                requires: { display: 'flex' },
                            },
                            {
                                type: 'select',
                                property: 'flex-wrap',
                                default: 'nowrap',
                                options: [
                                    { value: 'nowrap', name: 'No Wrap' },
                                    { value: 'wrap', name: 'Wrap' },
                                    { value: 'wrap-reverse', name: 'Wrap Reverse' },
                                ],
                                requires: { display: 'flex' },
                            },
                            {
                                type: 'select',
                                property: 'justify-content',
                                default: 'flex-start',
                                options: [
                                    { value: 'flex-start', name: 'Start' },
                                    { value: 'center', name: 'Center' },
                                    { value: 'flex-end', name: 'End' },
                                    { value: 'space-between', name: 'Space Between' },
                                    { value: 'space-around', name: 'Space Around' },
                                    { value: 'space-evenly', name: 'Space Evenly' },
                                ],
                                requires: { display: 'flex' },
                            },
                            {
                                type: 'select',
                                property: 'align-items',
                                default: 'stretch',
                                options: [
                                    { value: 'stretch', name: 'Stretch' },
                                    { value: 'flex-start', name: 'Start' },
                                    { value: 'center', name: 'Center' },
                                    { value: 'flex-end', name: 'End' },
                                    { value: 'baseline', name: 'Baseline' },
                                ],
                                requires: { display: 'flex' },
                            },
                            {
                                type: 'select',
                                property: 'align-content',
                                default: 'stretch',
                                options: [
                                    { value: 'stretch', name: 'Stretch' },
                                    { value: 'flex-start', name: 'Start' },
                                    { value: 'center', name: 'Center' },
                                    { value: 'flex-end', name: 'End' },
                                    { value: 'space-between', name: 'Space Between' },
                                    { value: 'space-around', name: 'Space Around' },
                                ],
                                requires: { display: 'flex' },
                            },
                            {
                                property: 'gap',
                                type: 'integer',
                                units: ['px', 'em', 'rem', '%'],
                                default: '0px',
                                requires: { display: 'flex' },
                            },
                        ]
                    },
                    {
                        name: 'Size',
                        open: false,
                        buildProps: ['width', 'height', 'max-width', 'max-height', 'min-width', 'min-height'],
                        properties: [
                            {
                                property: 'width',
                                type: 'integer',
                                units: ['px', '%', 'vw', 'em', 'rem', 'auto'],
                                default: 'auto',
                            },
                            {
                                property: 'height',
                                type: 'integer',
                                units: ['px', '%', 'vh', 'em', 'rem', 'auto'],
                                default: 'auto',
                            },
                            {
                                property: 'max-width',
                                type: 'integer',
                                units: ['px', '%', 'vw', 'em', 'rem', 'none'],
                                default: 'none',
                            },
                            {
                                property: 'max-height',
                                type: 'integer',
                                units: ['px', '%', 'vh', 'em', 'rem', 'none'],
                                default: 'none',
                            },
                            {
                                property: 'min-width',
                                type: 'integer',
                                units: ['px', '%', 'vw', 'em', 'rem'],
                                default: '0',
                            },
                            {
                                property: 'min-height',
                                type: 'integer',
                                units: ['px', '%', 'vh', 'em', 'rem'],
                                default: '0',
                            },
                        ]
                    },
                    {
                        name: 'Space',
                        open: false,
                        buildProps: ['margin-top', 'margin-right', 'margin-bottom', 'margin-left', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left'],
                        properties: [
                            {
                                property: 'margin-top',
                                type: 'integer',
                                units: ['px', 'em', 'rem', '%'],
                                default: '0',
                            },
                            {
                                property: 'margin-right',
                                type: 'integer',
                                units: ['px', 'em', 'rem', '%'],
                                default: '0',
                            },
                            {
                                property: 'margin-bottom',
                                type: 'integer',
                                units: ['px', 'em', 'rem', '%'],
                                default: '0',
                            },
                            {
                                property: 'margin-left',
                                type: 'integer',
                                units: ['px', 'em', 'rem', '%'],
                                default: '0',
                            },
                            {
                                property: 'padding-top',
                                type: 'integer',
                                units: ['px', 'em', 'rem', '%'],
                                default: '0',
                            },
                            {
                                property: 'padding-right',
                                type: 'integer',
                                units: ['px', 'em', 'rem', '%'],
                                default: '0',
                            },
                            {
                                property: 'padding-bottom',
                                type: 'integer',
                                units: ['px', 'em', 'rem', '%'],
                                default: '0',
                            },
                            {
                                property: 'padding-left',
                                type: 'integer',
                                units: ['px', 'em', 'rem', '%'],
                                default: '0',
                            },
                        ]
                    },
                    {
                        name: 'Position',
                        open: false,
                        buildProps: ['position', 'top', 'right', 'bottom', 'left', 'z-index'],
                        properties: [
                            {
                                type: 'select',
                                property: 'position',
                                default: 'static',
                                options: [
                                    { value: 'static', name: 'Static' },
                                    { value: 'relative', name: 'Relative' },
                                    { value: 'absolute', name: 'Absolute' },
                                    { value: 'fixed', name: 'Fixed' },
                                    { value: 'sticky', name: 'Sticky' },
                                ],
                            },
                            {
                                property: 'top',
                                type: 'integer',
                                units: ['px', '%', 'em', 'rem', 'auto'],
                                default: 'auto',
                            },
                            {
                                property: 'right',
                                type: 'integer',
                                units: ['px', '%', 'em', 'rem', 'auto'],
                                default: 'auto',
                            },
                            {
                                property: 'bottom',
                                type: 'integer',
                                units: ['px', '%', 'em', 'rem', 'auto'],
                                default: 'auto',
                            },
                            {
                                property: 'left',
                                type: 'integer',
                                units: ['px', '%', 'em', 'rem', 'auto'],
                                default: 'auto',
                            },
                            {
                                property: 'z-index',
                                type: 'integer',
                                default: 'auto',
                            },
                        ]
                    },
                    {
                        name: 'Typography',
                        open: false,
                        buildProps: ['font-family', 'font-size', 'font-weight', 'font-style', 'line-height', 'letter-spacing', 'text-align', 'text-decoration', 'text-transform', 'color', 'text-shadow'],
                        properties: [
                            {
                                type: 'select',
                                property: 'font-family',
                                default: 'Arial, sans-serif',
                                options: [
                                    { value: 'Arial, sans-serif', name: 'Arial' },
                                    { value: 'Helvetica, sans-serif', name: 'Helvetica' },
                                    { value: 'Georgia, serif', name: 'Georgia' },
                                    { value: '"Times New Roman", serif', name: 'Times New Roman' },
                                    { value: '"Courier New", monospace', name: 'Courier New' },
                                    { value: 'Verdana, sans-serif', name: 'Verdana' },
                                    { value: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', name: 'System Font' },
                                ],
                            },
                            {
                                property: 'font-size',
                                type: 'integer',
                                units: ['px', 'em', 'rem', '%', 'pt'],
                                default: '16px',
                            },
                            {
                                type: 'select',
                                property: 'font-weight',
                                default: '400',
                                options: [
                                    { value: '100', name: 'Thin (100)' },
                                    { value: '200', name: 'Extra Light (200)' },
                                    { value: '300', name: 'Light (300)' },
                                    { value: '400', name: 'Normal (400)' },
                                    { value: '500', name: 'Medium (500)' },
                                    { value: '600', name: 'Semi Bold (600)' },
                                    { value: '700', name: 'Bold (700)' },
                                    { value: '800', name: 'Extra Bold (800)' },
                                    { value: '900', name: 'Black (900)' },
                                ],
                            },
                            {
                                type: 'select',
                                property: 'font-style',
                                default: 'normal',
                                options: [
                                    { value: 'normal', name: 'Normal' },
                                    { value: 'italic', name: 'Italic' },
                                    { value: 'oblique', name: 'Oblique' },
                                ],
                            },
                            {
                                property: 'line-height',
                                type: 'integer',
                                units: ['', 'px', 'em', 'rem', '%'],
                                default: 'normal',
                            },
                            {
                                property: 'letter-spacing',
                                type: 'integer',
                                units: ['px', 'em', 'rem'],
                                default: 'normal',
                            },
                            {
                                type: 'select',
                                property: 'text-align',
                                default: 'left',
                                options: [
                                    { value: 'left', name: 'Left' },
                                    { value: 'center', name: 'Center' },
                                    { value: 'right', name: 'Right' },
                                    { value: 'justify', name: 'Justify' },
                                ],
                            },
                            {
                                type: 'select',
                                property: 'text-decoration',
                                default: 'none',
                                options: [
                                    { value: 'none', name: 'None' },
                                    { value: 'underline', name: 'Underline' },
                                    { value: 'overline', name: 'Overline' },
                                    { value: 'line-through', name: 'Line Through' },
                                ],
                            },
                            {
                                type: 'select',
                                property: 'text-transform',
                                default: 'none',
                                options: [
                                    { value: 'none', name: 'None' },
                                    { value: 'uppercase', name: 'UPPERCASE' },
                                    { value: 'lowercase', name: 'lowercase' },
                                    { value: 'capitalize', name: 'Capitalize' },
                                ],
                            },
                            {
                                property: 'color',
                                type: 'color',
                                default: '#000000',
                            },
                            {
                                property: 'text-shadow',
                                type: 'stack',
                                default: 'none',
                            },
                        ]
                    },
                    {
                        name: 'Background',
                        open: false,
                        buildProps: ['background-color', 'background-image', 'background-size', 'background-position', 'background-repeat', 'background-attachment'],
                        properties: [
                            {
                                property: 'background-color',
                                type: 'color',
                                default: 'transparent',
                            },
                            {
                                property: 'background-image',
                                type: 'file',
                                default: 'none',
                            },
                            {
                                type: 'select',
                                property: 'background-size',
                                default: 'auto',
                                options: [
                                    { value: 'auto', name: 'Auto' },
                                    { value: 'cover', name: 'Cover' },
                                    { value: 'contain', name: 'Contain' },
                                ],
                            },
                            {
                                type: 'select',
                                property: 'background-position',
                                default: 'left top',
                                options: [
                                    { value: 'left top', name: 'Left Top' },
                                    { value: 'center top', name: 'Center Top' },
                                    { value: 'right top', name: 'Right Top' },
                                    { value: 'left center', name: 'Left Center' },
                                    { value: 'center center', name: 'Center Center' },
                                    { value: 'right center', name: 'Right Center' },
                                    { value: 'left bottom', name: 'Left Bottom' },
                                    { value: 'center bottom', name: 'Center Bottom' },
                                    { value: 'right bottom', name: 'Right Bottom' },
                                ],
                            },
                            {
                                type: 'select',
                                property: 'background-repeat',
                                default: 'repeat',
                                options: [
                                    { value: 'repeat', name: 'Repeat' },
                                    { value: 'repeat-x', name: 'Repeat X' },
                                    { value: 'repeat-y', name: 'Repeat Y' },
                                    { value: 'no-repeat', name: 'No Repeat' },
                                ],
                            },
                            {
                                type: 'select',
                                property: 'background-attachment',
                                default: 'scroll',
                                options: [
                                    { value: 'scroll', name: 'Scroll' },
                                    { value: 'fixed', name: 'Fixed' },
                                    { value: 'local', name: 'Local' },
                                ],
                            },
                        ]
                    },
                    {
                        name: 'Borders',
                        open: false,
                        buildProps: ['border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width', 'border-style', 'border-color', 'border-top-left-radius', 'border-top-right-radius', 'border-bottom-right-radius', 'border-bottom-left-radius'],
                        properties: [
                            {
                                property: 'border-top-width',
                                type: 'integer',
                                units: ['px', 'em', 'rem'],
                                default: '0',
                            },
                            {
                                property: 'border-right-width',
                                type: 'integer',
                                units: ['px', 'em', 'rem'],
                                default: '0',
                            },
                            {
                                property: 'border-bottom-width',
                                type: 'integer',
                                units: ['px', 'em', 'rem'],
                                default: '0',
                            },
                            {
                                property: 'border-left-width',
                                type: 'integer',
                                units: ['px', 'em', 'rem'],
                                default: '0',
                            },
                            {
                                type: 'select',
                                property: 'border-style',
                                default: 'solid',
                                options: [
                                    { value: 'none', name: 'None' },
                                    { value: 'solid', name: 'Solid' },
                                    { value: 'dotted', name: 'Dotted' },
                                    { value: 'dashed', name: 'Dashed' },
                                    { value: 'double', name: 'Double' },
                                    { value: 'groove', name: 'Groove' },
                                    { value: 'ridge', name: 'Ridge' },
                                    { value: 'inset', name: 'Inset' },
                                    { value: 'outset', name: 'Outset' },
                                ],
                            },
                            {
                                property: 'border-color',
                                type: 'color',
                                default: '#000000',
                            },
                            {
                                property: 'border-top-left-radius',
                                type: 'integer',
                                units: ['px', '%', 'em', 'rem'],
                                default: '0',
                            },
                            {
                                property: 'border-top-right-radius',
                                type: 'integer',
                                units: ['px', '%', 'em', 'rem'],
                                default: '0',
                            },
                            {
                                property: 'border-bottom-right-radius',
                                type: 'integer',
                                units: ['px', '%', 'em', 'rem'],
                                default: '0',
                            },
                            {
                                property: 'border-bottom-left-radius',
                                type: 'integer',
                                units: ['px', '%', 'em', 'rem'],
                                default: '0',
                            },
                        ]
                    },
                    {
                        name: 'Effects',
                        open: false,
                        buildProps: ['opacity', 'box-shadow', 'transform', 'transition', 'cursor', 'filter'],
                        properties: [
                            {
                                property: 'opacity',
                                type: 'slider',
                                default: '1',
                                min: 0,
                                max: 1,
                                step: 0.01,
                            },
                            {
                                property: 'box-shadow',
                                type: 'stack',
                                default: 'none',
                            },
                            {
                                property: 'transform',
                                type: 'stack',
                                default: 'none',
                            },
                            {
                                property: 'transition',
                                type: 'stack',
                                default: 'none',
                            },
                            {
                                type: 'select',
                                property: 'cursor',
                                default: 'auto',
                                options: [
                                    { value: 'auto', name: 'Auto' },
                                    { value: 'default', name: 'Default' },
                                    { value: 'pointer', name: 'Pointer' },
                                    { value: 'text', name: 'Text' },
                                    { value: 'move', name: 'Move' },
                                    { value: 'not-allowed', name: 'Not Allowed' },
                                    { value: 'grab', name: 'Grab' },
                                    { value: 'grabbing', name: 'Grabbing' },
                                ],
                            },
                            {
                                property: 'filter',
                                type: 'stack',
                                default: 'none',
                            },
                        ]
                    }
                ],
            },
            
            // Layer Manager Configuration
            layerManager: {
                appendTo: '#layers-container',
            },
            
            // Trait Manager Configuration
            traitManager: {
                appendTo: '#traits-container',
            },
            
            // Asset Manager Configuration
            assetManager: {
                upload: '/api/assets/upload',
                uploadName: 'file',
                multiUpload: false,
                autoAdd: true,
                uploadText: 'Kéo thả file vào đây hoặc click để upload',
                addBtnText: '+ Thêm ảnh',
                showUrlInput: true,
                modalTitle: 'Chọn ảnh',
                noAssets: 'Chưa có ảnh nào',
                credentials: 'same-origin',
                custom: true,
                params: {
                    site_id: this.siteId
                }
            },
            
            // Canvas Settings
            canvas: {
                styles: [],
                scripts: [],
            },
            
            // Device Manager Configuration
            deviceManager: {
                devices: [
                    {
                        name: 'Desktop',
                        width: '',
                    },
                    {
                        name: 'Tablet',
                        width: '768px',
                        widthMedia: '992px',
                    },
                    {
                        name: 'Mobile',
                        width: '320px',
                        widthMedia: '480px',
                    }
                ]
            },
        };
    }
}
