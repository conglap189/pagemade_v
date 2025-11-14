# 🎨 Assets Panel Styling Guide

## 📸 Tổng Quan

Assets Panel được style để có giao diện chuyên nghiệp, hiện đại với:
- Grid layout responsive
- Hover effects mượt mà
- Select buttons xuất hiện khi hover
- Delete buttons (trash icon)
- Search/filter input
- Upload button đẹp mắt

---

## 🎯 Key Features

### 1. **Grid Layout**
```css
#assets-panel .gjs-am-assets {
    display: grid !important;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
    padding: 12px;
}
```

✨ **Responsive**: Tự động điều chỉnh số cột dựa trên width
- Desktop: 3-4 cột
- Mobile (<400px): 2 cột

### 2. **Asset Cards**
```css
#assets-panel .gjs-am-asset {
    position: relative;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.2s;
    background: white;
}
```

**Hover Effects:**
- Border color → Purple (#8b5cf6)
- Transform: translateY(-2px) (nhô lên)
- Box shadow: Purple glow

### 3. **Select Button**
```css
#assets-panel .gjs-am-asset::after {
    content: 'Select';
    position: absolute;
    bottom: 35px;
    left: 50%;
    transform: translateX(-50%);
    background: #8b5cf6;
    color: white;
    padding: 6px 16px;
    border-radius: 6px;
    opacity: 0; /* Ẩn mặc định */
}

#assets-panel .gjs-am-asset:hover::after {
    opacity: 1; /* Hiện khi hover */
}
```

**Behavior:**
- Ẩn khi không hover
- Xuất hiện smooth với opacity transition
- Vị trí: Giữa card, phía dưới hình ảnh

### 4. **Delete Button**
```css
#assets-panel .gjs-am-close {
    position: absolute;
    top: 6px;
    right: 6px;
    width: 24px;
    height: 24px;
    background: rgba(239, 68, 68, 0.9);
    color: white;
    border-radius: 4px;
    opacity: 0; /* Ẩn mặc định */
}

#assets-panel .gjs-am-asset:hover .gjs-am-close {
    opacity: 1; /* Hiện khi hover */
}
```

**Features:**
- Icon: Trash can
- Position: Top right corner
- Color: Red (#ef4444)
- Darker red on hover (#dc2626)

### 5. **Upload Button**
```css
#assets-panel .gjs-am-add-asset,
#assets-panel .gjs-btn-prim {
    background: #8b5cf6;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    font-weight: 500;
}
```

**Hover Effect:**
- Background: Darker purple (#7c3aed)
- Transform: translateY(-1px)

### 6. **Search/Filter Input**
```css
#assets-panel .gjs-am-file-uploader input[type="text"] {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    font-size: 13px;
}
```

**Features:**
- Full width
- Light gray border
- Rounded corners
- Dark mode support

### 7. **Image Thumbnails**
```css
#assets-panel .gjs-am-asset-image {
    width: 100%;
    height: 120px;
    object-fit: cover;
    display: block;
}
```

**Specs:**
- Fixed height: 120px
- Object-fit: cover (crop to fit)
- Responsive width

### 8. **Asset Name/Meta**
```css
#assets-panel .gjs-am-meta {
    padding: 8px;
    font-size: 11px;
    color: #6b7280;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
```

**Features:**
- Centered text
- Small font (11px)
- Ellipsis for long names
- Gray color

---

## 🌓 Dark Mode Support

Tất cả elements đều có dark mode:

```css
.dark #assets-panel .gjs-am-asset {
    border-color: #374151;
    background: #1f2937;
}

.dark #assets-panel .gjs-am-meta {
    color: #9ca3af;
}

.dark #assets-panel .gjs-am-file-uploader input[type="text"] {
    background: #1f2937;
    border-color: #374151;
    color: #f9fafb;
}
```

---

## 📱 Responsive Behavior

### Desktop (>400px)
- Grid: 3-4 columns (minmax(140px, 1fr))
- Image height: 120px
- Full buttons and meta visible

### Mobile (<400px)
- Grid: 2 columns (minmax(100px, 1fr))
- Image height: 120px (maintained)
- Smaller gap between items

---

## 🎨 Color Palette

| Element | Light Mode | Dark Mode |
|---------|-----------|-----------|
| **Primary (Purple)** | #8b5cf6 | #8b5cf6 |
| **Primary Hover** | #7c3aed | #7c3aed |
| **Border** | #e5e7eb | #374151 |
| **Background** | #ffffff | #1f2937 |
| **Text** | #6b7280 | #9ca3af |
| **Danger (Red)** | #ef4444 | #ef4444 |
| **Danger Hover** | #dc2626 | #dc2626 |

---

## ⚡ Animation Timing

Tất cả transitions: `0.2s`

```css
transition: all 0.2s;
```

**Smooth effects:**
- Opacity: 0 → 1
- Transform: translateY(0) → translateY(-2px)
- Background color changes
- Border color changes

---

## 🔧 Configuration trong GrapeJS

```javascript
assetManager: {
    appendTo: '#assets-container',
    upload: `/api/pages/${PAGE_ID}/upload-asset`,
    uploadName: 'files',
    multiUpload: true,
    autoAdd: true,
    uploadText: 'Upload',
    addBtnText: 'Add Image',
    showUrlInput: true, // Enable search/filter
}
```

---

## 💡 Usage Tips

### Upload Assets
1. Click "Upload" button
2. Select multiple files (Ctrl/Cmd + Click)
3. Files auto-upload and appear in grid

### Use Assets
1. Hover over asset → "Select" button appears
2. Click asset to select
3. Drag to canvas to use

### Delete Assets
1. Hover over asset → Trash icon appears (top right)
2. Click trash icon to delete

### Search/Filter
1. Type in search box at top
2. Assets filter in real-time

---

## 🚀 Empty State

Khi chưa có assets:

```css
#assets-panel .gjs-am-assets:empty::before {
    content: 'No assets yet. Click Upload to add images.';
    display: block;
    text-align: center;
    padding: 40px 20px;
    color: #9ca3af;
}
```

Hiển thị message hướng dẫn user upload file.

---

## ✅ Checklist

Assets Panel Implementation:

- [x] Grid layout responsive
- [x] Hover effects (border, shadow, lift)
- [x] Select button on hover
- [x] Delete button on hover
- [x] Upload button styled
- [x] Search/filter input
- [x] Image thumbnails với object-fit
- [x] Asset name với ellipsis
- [x] Dark mode support
- [x] Mobile responsive
- [x] Empty state message
- [x] Smooth transitions (0.2s)
- [x] Purple accent color (#8b5cf6)

---

## 🎯 Result

Assets Panel giờ có giao diện giống professional design tools như:
- Figma Assets Panel
- Webflow Asset Manager
- Adobe XD Asset Library

Với:
- Clean, modern design
- Intuitive interactions
- Professional look & feel
- Smooth animations
