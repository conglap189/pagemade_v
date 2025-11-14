# 🎨 Hướng Dẫn: Layers và Assets Panel

## 📋 Tổng Quan

Tài liệu này hướng dẫn cách thêm **Layers Panel** (quản lý cấu trúc components) và **Assets Panel** (quản lý media/hình ảnh) vào left sidebar của PageMaker Editor.

---

## ✅ Tính Năng Đã Thêm

### 1. **Layers Panel** 
- Hiển thị cây cấu trúc components (Component Tree View)
- Sử dụng GrapeJS Layer Manager
- Cho phép xem và quản lý hierarchy của page
- Kéo thả để sắp xếp lại components

### 2. **Assets Panel**
- Upload và quản lý hình ảnh/media
- Sử dụng GrapeJS Asset Manager
- Upload nhiều files cùng lúc (multi-upload)
- Tự động thêm vào assets library

---

## 🏗️ Kiến Trúc

### HTML Structure

```html
<!-- Left Sidebar Buttons -->
<button data-panel="blocks">Blocks</button>
<button data-panel="layers">Layers</button>
<button data-panel="assets">Assets</button>

<!-- Left Panel Sections -->
<div id="blocks-panel" class="panel-section active">
    <!-- Blocks tabs và container -->
</div>

<div id="layers-panel" class="panel-section">
    <div class="panel-header">
        <div class="panel-title">Layers</div>
        <div class="panel-subtitle">Component hierarchy</div>
    </div>
    <div class="panel-content">
        <div id="layers-container"></div>
    </div>
</div>

<div id="assets-panel" class="panel-section">
    <div class="panel-header">
        <div class="panel-title">Assets</div>
        <div class="panel-subtitle">Media library</div>
    </div>
    <div class="panel-content">
        <div id="assets-container"></div>
    </div>
</div>
```

### CSS Architecture

```css
/* Panel sections - ẩn tất cả mặc định */
.panel-section {
    display: none;
    flex-direction: column;
    flex: 1;
    overflow: hidden;
}

/* Chỉ panel có class .active mới hiển thị */
.panel-section.active {
    display: flex;
}

/* Container cho mỗi manager */
#blocks-container,
#layers-container,
#assets-container {
    display: block !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
}
```

---

## 🔧 JavaScript Logic

### Panel Switching System

```javascript
// State management
let currentActiveTab = 'site-blocks';
let blocksRendered = false;
let layersRendered = false;
let assetsRendered = false;

sidebarButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
        const panelName = btn.getAttribute('data-panel');
        const isActive = btn.classList.contains('active');
        
        if (isActive) {
            // Deactivate - đóng panel
            btn.classList.remove('active');
            leftPanel.classList.remove('active');
        } else {
            // Activate - chuyển panel
            // 1. Remove active từ tất cả
            sidebarButtons.forEach(b => b.classList.remove('active'));
            panelSections.forEach(p => p.classList.remove('active'));
            
            // 2. Add active cho selected
            btn.classList.add('active');
            leftPanel.classList.add('active');
            
            const targetPanel = document.getElementById(`${panelName}-panel`);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
            
            // 3. Render managers (chỉ 1 lần duy nhất)
            if (panelName === 'layers' && !layersRendered) {
                // Render Layer Manager
                const layerManager = window.editor.LayerManager;
                const layersEl = layerManager.render();
                layersContainer.appendChild(layersEl);
                layersRendered = true;
            }
            
            if (panelName === 'assets' && !assetsRendered) {
                // Render Asset Manager
                const assetManager = window.editor.AssetManager;
                const assetsEl = assetManager.render();
                assetsContainer.appendChild(assetsEl);
                assetsRendered = true;
            }
        }
    });
});
```

### Nguyên Tắc Quan Trọng

**✅ ĐÚNG:**
- Render mỗi manager chỉ 1 lần duy nhất (first open)
- Sử dụng flags (`layersRendered`, `assetsRendered`) để theo dõi
- Chuyển panel bằng CSS (add/remove `.active`)
- Không bao giờ re-render sau khi đã render

**❌ SAI:**
- Re-render mỗi lần click
- Clear và append lại container
- Không có flag tracking
- Manipulate DOM của GrapeJS

---

## ⚙️ GrapeJS Configuration

### Layer Manager

```javascript
layerManager: {
    appendTo: '#layers-container',
}
```

### Asset Manager

```javascript
assetManager: {
    appendTo: '#assets-container',
    upload: `/api/pages/${PAGE_ID}/upload-asset`,
    uploadName: 'files',
    multiUpload: true,
    autoAdd: true,
}
```

---

## 🚀 Backend Upload Endpoint

### Route: `/api/pages/<page_id>/upload-asset`

```python
@api_bp.route('/pages/<int:page_id>/upload-asset', methods=['POST'])
@login_required
def upload_asset(page_id):
    """Upload asset (image, video, etc.) for PageMaker"""
    page = Page.query.get_or_404(page_id)
    
    if page.site.user_id != current_user.id:
        abort(403)
    
    try:
        files = request.files.getlist('files')
        uploaded_assets = []
        
        # Create upload directory
        upload_dir = os.path.join(
            os.path.dirname(current_app.root_path), 
            'static', 'uploads', 'assets'
        )
        os.makedirs(upload_dir, exist_ok=True)
        
        for file in files:
            if file and file.filename:
                # Secure filename + unique prefix
                filename = secure_filename(file.filename)
                unique_filename = f"{uuid.uuid4().hex}_{filename}"
                file_path = os.path.join(upload_dir, unique_filename)
                
                # Save file
                file.save(file_path)
                
                # Generate URL
                asset_url = url_for(
                    'static', 
                    filename=f'uploads/assets/{unique_filename}', 
                    _external=True
                )
                
                uploaded_assets.append({
                    'src': asset_url,
                    'name': filename,
                    'type': 'image' if file.content_type.startswith('image/') else 'file'
                })
        
        return jsonify({'data': uploaded_assets})
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error uploading assets: {str(e)}'
        }), 500
```

### Response Format

GrapeJS Asset Manager expects response format:

```json
{
    "data": [
        {
            "src": "https://example.com/static/uploads/assets/abc123_image.jpg",
            "name": "image.jpg",
            "type": "image"
        }
    ]
}
```

---

## 📊 Flow Diagram

```
User clicks "Layers" button
    ↓
Check if panel active
    ↓
NO → Activate panel
    ↓
Check if layersRendered === false
    ↓
YES → Render Layer Manager once
    ↓
Set layersRendered = true
    ↓
Show #layers-panel (CSS)
    ↓
Layer Manager ready to use
```

---

## 🔍 Testing Checklist

- [ ] Click Blocks button → Shows blocks panel with tabs
- [ ] Click Layers button → Shows layers panel with component tree
- [ ] Click Assets button → Shows assets panel with upload area
- [ ] Switch between panels → No re-rendering, state preserved
- [ ] Upload image in Assets → File uploads successfully
- [ ] Upload multiple images → All files upload correctly
- [ ] Drag image from Assets to canvas → Image appears on page
- [ ] Expand/collapse layers → Layer tree works correctly
- [ ] Click same button twice → Panel closes (toggle behavior)

---

## 🎯 Key Benefits

1. **Single Render Architecture**: Mỗi manager chỉ render 1 lần → Performance tốt
2. **CSS-Based Switching**: Không re-render, chỉ show/hide → Không bug
3. **State Preservation**: Khi chuyển panel, trạng thái được giữ nguyên
4. **Clean Separation**: Mỗi panel có container riêng, độc lập
5. **Extensible**: Dễ thêm panels mới (follow same pattern)

---

## 🚨 Common Issues

### Issue 1: Layer Manager không hiển thị
**Nguyên nhân**: Container chưa được append vào DOM
**Giải pháp**: Kiểm tra `layerManager.appendTo` config và `#layers-container` tồn tại

### Issue 2: Upload không hoạt động
**Nguyên nhân**: Backend endpoint chưa có hoặc response format sai
**Giải pháp**: 
- Check route `/api/pages/<page_id>/upload-asset` exists
- Response phải có format: `{ "data": [...] }`

### Issue 3: Panel không switch
**Nguyên nhân**: JavaScript panel switching logic có bug
**Giải pháp**: Check console logs, verify `data-panel` attributes match panel IDs

---

## 📝 Summary

Layers và Assets panels được implement theo cùng pattern với Blocks panel:
- **HTML**: Panel sections với unique containers
- **CSS**: Display toggle với `.active` class
- **JavaScript**: Render once, switch with CSS, track state
- **Backend**: Upload endpoint với secure file handling

Pattern này có thể extend cho thêm panels khác trong tương lai.
