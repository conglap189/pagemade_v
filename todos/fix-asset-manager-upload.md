# Ke hoach: Fix Asset Manager Upload Issue

## 1. Muc tieu (Goal)
Debug va fix loi Asset Manager upload khong hoat dong trong PageMade Editor. User bao cao loi voi logs:
- "Asset Manager render blocked - not in assets panel context"
- Upload khong thuc hien duoc

## 2. Phan tich Van de

### Error Logs:
```
Right panel closed
Blocks already rendered, skipping re-render to preserve blocks
Asset Manager render blocked - not in assets panel context
Assets panel opened, setting up upload...
```

### Cac file lien quan:
- `frontend/src/editor/scripts/main.js` - setupAssetManagementOverrides()
- `frontend/src/editor/scripts/panels/AssetPanel.js` - Asset upload component

## 3. Cac buoc Thuc hien (Implementation Steps)

### Phase 1: Investigation
* [x] Kiem tra setupAssetManagementOverrides() trong main.js
* [x] Kiem tra AssetPanel.js - cach khoi tao va setEditor()
* [x] Kiem tra window.apiClient.uploadAsset co ton tai khong
* [x] Kiem tra backend upload endpoint

### Phase 2: Fix Issues
* [x] Fix logic blocking Asset Manager render - Add `window.assetsRenderedInCorrectPlace = true` before calling render()
* [x] Dam bao AssetPanel duoc khoi tao dung cach - Add setEditor() and init() calls
* [x] Fix uploadFile() to pass correct parameters (file, siteId) instead of FormData
* [x] Store siteId in PageMadeApp for component access

### Phase 3: Fix Asset Grid Display (2024-12-11)
* [x] Add missing `updateEmptyState()` method to AssetPanel.js
* [x] Fix `loadAssetsFromAPI()` to pass siteId parameter
* [x] Add Authorization header to uploadAsset() in api-client.js
* [x] Add CSS styles for `.asset-item` in editor.css

### Phase 4: Verification
* [ ] Test upload image trong editor
* [ ] Verify image hien thi trong Asset Manager

## 4. Cac file bi anh huong (Files to be Touched)
* `frontend/src/editor/scripts/main.js` (Chinh sua) ✅
* `frontend/src/editor/scripts/panels/AssetPanel.js` (Chinh sua) ✅
* `frontend/src/editor/scripts/api-client.js` (Chinh sua) ✅
* `frontend/src/editor/styles/editor.css` (Chinh sua) ✅

## 5. Changes Made

### main.js Changes:
1. Added `this.siteId = null` to constructor
2. Added `this.siteId = siteId` when extracting siteId from token/content data
3. Added `window.assetsRenderedInCorrectPlace = true` in `renderAssets()` before calling `assetManager.render()`
4. Added `this.assetPanel.setEditor(this.pm)` and `this.assetPanel.init()` after editor init

### AssetPanel.js Changes:
1. Updated constructor to accept `app` parameter for siteId access
2. Fixed `uploadFile()` to use `window.apiClient.uploadAsset(file, siteId)` instead of passing FormData
3. Added error handling for missing siteId
4. Added `updateEmptyState()` method to show/hide empty state
5. Fixed `loadAssetsFromAPI()` to pass siteId and handle loading states
6. Added `updateEmptyState()` call in `init()` method

### api-client.js Changes:
1. Added Authorization header to `uploadAsset()` method
2. Added better error handling with throw instead of return null

### editor.css Changes:
1. Added complete styles for `.asset-item` and related elements
2. Added hover effects, overlay, actions buttons
3. Added drag-over state for upload area
4. Added upload progress overlay styles

## 6. Ghi chu
- Flag `window.assetsRenderedInCorrectPlace` was never being set to `true`, only reset to `false`
- AssetPanel.setEditor() and init() were never called after creation
- uploadAsset API expected (file, siteId) but was receiving (FormData)
- getAssets() requires siteId parameter but was not being passed
- uploadAsset() was missing Authorization header
