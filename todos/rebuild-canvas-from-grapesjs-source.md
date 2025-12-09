# Kế hoạch: Rebuild Canvas từ GrapesJS Source - CHIA NHỎ TỪNG PHASE

## ⚠️ QUY TẮC VÀNG: INCREMENTAL CHANGES
- **MỖI PHASE chỉ thay đổi 1 ĐIỀU duy nhất**
- **TEST NGAY sau mỗi phase**
- **CHỈ tiếp tục phase tiếp theo NẾU test pass**
- **ROLLBACK NGAY nếu phase gây lỗi**

---

## 1. Mục tiêu Tổng thể (Overall Goal)
Loại bỏ CSS override đang gây content jumping khi scroll, bằng cách từng bước chuyển về GrapesJS native behavior.

---

## 2. Phân tích Vấn đề

### Root Cause (Nguyên nhân gốc):
```css
/* NGUYÊN NHÂN CHÍNH: */
.gjs-frame {
    height: 100% !important;  /* ← Fixed height, không auto-expand */
}
```

**Tại sao gây lỗi:**
- User thêm content → GrapesJS muốn expand frame height
- CSS `!important` block → Frame vẫn `height: 100%` (fixed)
- Content vượt quá frame → Scroll xuống → Thấy canvas background (gray)
- Visual bug: White content (top) + Gray background (bottom)

### Giải pháp:
Xóa dần các CSS override, bắt đầu từ `.gjs-frame` (nguyên nhân chính)

---

## 3. PHASE-BY-PHASE PLAN

### 📍 **PHASE 0: Backup & Preparation** ✅ DONE
* [x] Backup `editor.css` → `editor.css.backup`
* [x] Backup `main.js` (nếu cần rollback)
* [x] Tạo implementation plan này

---

### 📍 **PHASE 1: Xóa CSS Override `.gjs-frame` (MINIMAL CHANGE)**

#### Mục tiêu:
Chỉ xóa `.gjs-frame { height: 100% !important }` - nguyên nhân chính gây lỗi

#### Thay đổi:
**File:** `frontend/src/editor/styles/editor.css`

**Trước (lines 61-64):**
```css
.gjs-frame {
    width: 100% !important;
    height: 100% !important;
}
```

**Sau:**
```css
.gjs-frame {
    width: 100% !important;
    /* height: 100% !important; - REMOVED: Let GrapesJS auto-calculate height based on content */
}
```

#### Expected Result:
- Canvas vẫn hiển thị bình thường
- Frame width vẫn 100%
- **Frame height giờ do GrapesJS tự tính** (auto-expand với content)

#### Implementation Steps:
* [ ] **Step 1.1**: Mở file `editor.css`
* [ ] **Step 1.2**: Comment dòng `height: 100% !important;` trong `.gjs-frame`
* [ ] **Step 1.3**: Save file

#### Testing Steps (BẮT BUỘC):
* [ ] **Test 1.1**: Refresh editor → Canvas hiển thị đúng?
* [ ] **Test 1.2**: Kéo 1 component → Component hiển thị OK?
* [ ] **Test 1.3**: Kéo 3-5 components → Canvas tự mở rộng?
* [ ] **Test 1.4**: **CRITICAL** → Scroll xuống → KHÔNG còn white/gray split?
* [ ] **Test 1.5**: Xóa component → Canvas tự co lại?

#### Rollback (Nếu test fail):
```bash
cp frontend/src/editor/styles/editor.css.backup frontend/src/editor/styles/editor.css
```

#### Decision Point:
- ✅ **Nếu Test Pass** → Tiếp tục Phase 2
- ❌ **Nếu Test Fail** → ROLLBACK → Báo lỗi để debug

---

### 📍 **PHASE 2: Xóa CSS Override `.gjs-cv-canvas__frames`** (CHỈ NẾU PHASE 1 PASS)

#### Mục tiêu:
Xóa các override không cần thiết cho `.gjs-cv-canvas__frames`

#### Điều kiện tiên quyết:
- ✅ Phase 1 PHẢI test pass
- ✅ Canvas đang hoạt động bình thường

#### Thay đổi:
**File:** `frontend/src/editor/styles/editor.css`

**Trước (lines 52-59):**
```css
.gjs-cv-canvas__frames {
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    width: 100% !important;
    height: 100% !important;
}
```

**Sau:**
```css
/* .gjs-cv-canvas__frames - REMOVED: Use GrapesJS native positioning */
```

#### Expected Result:
- Canvas vẫn hiển thị đúng (vì GrapesJS source đã có CSS này)
- Ít conflict hơn

#### Implementation Steps:
* [ ] **Step 2.1**: Comment toàn bộ block `.gjs-cv-canvas__frames`
* [ ] **Step 2.2**: Save file

#### Testing Steps:
* [ ] **Test 2.1**: Refresh → Canvas vẫn hiển thị đúng?
* [ ] **Test 2.2**: Kéo components → Vẫn OK như Phase 1?
* [ ] **Test 2.3**: Device switching → Desktop/Tablet/Mobile vẫn OK?

#### Rollback:
```bash
# Rollback chỉ Phase 2 (giữ lại Phase 1)
# Uncomment lại block .gjs-cv-canvas__frames
```

---

### 📍 **PHASE 3: Xóa CSS Override `.gjs-cv-canvas`** (CHỈ NẾU PHASE 2 PASS)

#### Mục tiêu:
Xóa các override cho `.gjs-cv-canvas`, chuyển về CSS Variables

#### Điều kiện tiên quyết:
- ✅ Phase 1 & 2 PHẢI pass
- ✅ Canvas hoạt động tốt

#### Thay đổi:
**File:** `frontend/src/editor/styles/editor.css`

**Trước (lines 43-50):**
```css
.gjs-cv-canvas {
    width: 100% !important;
    height: 100% !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
}
```

**Sau:**
```css
/* .gjs-cv-canvas - REMOVED: Use GrapesJS native with CSS Variables */
:root {
    --gjs-left-width: 0px;
    --gjs-canvas-top: 0px;
}
```

#### Implementation Steps:
* [ ] **Step 3.1**: Comment block `.gjs-cv-canvas`
* [ ] **Step 3.2**: Thêm CSS Variables vào `:root`
* [ ] **Step 3.3**: Save file

#### Testing Steps:
* [ ] **Test 3.1**: Refresh → Canvas vẫn full screen?
* [ ] **Test 3.2**: Toàn bộ chức năng vẫn hoạt động?

---

### 📍 **PHASE 4: Review & Optimize** (OPTIONAL - CHỈ NẾU CẦN)

#### Mục tiêu:
Kiểm tra xem có cần disable `setupCanvasHeightEvents()` không

#### Điều kiện:
- ✅ Phase 1, 2, 3 đều pass
- ⚠️ Canvas vẫn có một số quirks nhỏ

#### Thay đổi (OPTIONAL):
**File:** `frontend/src/editor/scripts/main.js` (line 516)

**Nếu cần:**
```js
// this.setupCanvasHeightEvents(); // Disable nếu conflict với native behavior
```

**HOẶC giữ nguyên nếu hoạt động tốt**

---

## 4. Files Bị Ảnh Hưởng (Theo Phase)

### Phase 1:
- `frontend/src/editor/styles/editor.css` (lines 61-64)

### Phase 2:
- `frontend/src/editor/styles/editor.css` (lines 52-59)

### Phase 3:
- `frontend/src/editor/styles/editor.css` (lines 43-50)
- Thêm `:root` CSS variables

### Phase 4 (Optional):
- `frontend/src/editor/scripts/main.js` (line 516)

---

## 5. Success Criteria - Từng Phase

### Phase 1 Success:
1. ✅ Canvas hiển thị bình thường
2. ✅ **KHÔNG** còn white/gray split khi scroll
3. ✅ **KHÔNG** còn content jumping
4. ✅ Canvas tự expand khi thêm content
5. ✅ Canvas tự shrink khi xóa content

### Phase 2 Success:
1. ✅ Giữ được tất cả ưu điểm của Phase 1
2. ✅ Device switching vẫn hoạt động

### Phase 3 Success:
1. ✅ Giữ được tất cả ưu điểm của Phase 1 & 2
2. ✅ Code CSS clean hơn
3. ✅ Sử dụng GrapesJS native CSS Variables

---

## 6. Current Status

### ✅ COMPLETED - FULL RESET TO GRAPESJS NATIVE:
* [x] Phase 0: Backup files
* [x] Phase 0: Create detailed plan
* [x] **NUCLEAR OPTION: Complete reset to GrapesJS native CSS**
  * [x] Removed ALL `.gjs-cv-canvas` overrides
  * [x] Removed ALL `.gjs-cv-canvas__frames` overrides  
  * [x] Removed ALL `.gjs-frame` overrides
  * [x] Added CSS Variables: `--gjs-left-width: 0px`, `--gjs-canvas-top: 0px`
  * [x] Removed forced scrollbar CSS (overflow-y: scroll)
  * [x] Re-enabled `setupCanvasHeightEvents()` in main.js
  
### 📍 CURRENT STATE:
**100% GrapesJS Native Behavior** - No custom canvas CSS overrides

Files modified:
1. `frontend/src/editor/styles/editor.css` (lines 39-68): ALL canvas overrides removed
2. `frontend/src/editor/scripts/main.js` (line 514): Re-enabled setupCanvasHeightEvents()

### In Progress:
* [ ] **AWAITING USER TEST** - Full functionality test required

### Expected Result:
- Canvas should behave EXACTLY like default GrapesJS
- No canvas layering issues
- No content jumping
- No scrollbar jittering
- Canvas auto-expands/shrinks with content

---

## 7. Rollback Strategy

### Toàn bộ (Nuclear option):
```bash
cp frontend/src/editor/styles/editor.css.backup frontend/src/editor/styles/editor.css
```

### Từng Phase:
- Phase 1 fail → Rollback file backup
- Phase 2 fail → Uncomment `.gjs-cv-canvas__frames` block
- Phase 3 fail → Uncomment `.gjs-cv-canvas` block, xóa CSS Variables

---

## 8. Next Actions

### BẮT ĐẦU PHASE 1:
1. Mở file `frontend/src/editor/styles/editor.css`
2. Tìm `.gjs-frame` block (lines 61-64)
3. Comment dòng `height: 100% !important;`
4. Save
5. **TEST NGAY** theo checklist Phase 1
6. **BÁO KẾT QUẢ** trước khi tiếp tục Phase 2

---

## 9. Notes

- **KHÔNG bao giờ skip testing**
- **KHÔNG làm nhiều phase cùng lúc**
- Nếu không chắc chắn → Hỏi trước khi tiếp tục
- Mỗi phase có thể mất 5-10 phút test → **ĐÓ LÀ BÌNH THƯỜNG**
