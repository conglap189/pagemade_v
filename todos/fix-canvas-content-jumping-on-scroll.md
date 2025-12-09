# Kế hoạch: Fix Canvas Content Jumping When Scrolling

## 1. Mục tiêu (Goal)
Sửa lỗi canvas bị chia đôi (nửa trắng có nội dung, nửa xám) và nội dung nhảy liên tục khi cuộn xuống sau khi kéo ~3 components vào canvas.

## 2. Nguyên nhân (Root Cause Analysis)
### Triệu chứng:
- Kéo ~3 components vào canvas → cuộn xuống → layout/nội dung nhảy liên tục
- Canvas bị chia đôi: nửa trắng (có nội dung) + nửa xám (như kéo lên cả canvas background)

### Root Cause:
1. **Canvas height không tự động cập nhật** khi thêm components mới
2. File `main.js` line 516: `setupCanvasHeightEvents()` đã bị **DISABLE**
3. CSS sử dụng `.gjs-frame { height: 100% !important }` (fixed height) thay vì `height: auto` (dynamic height)
4. Frame wrapper không theo dõi thay đổi nội dung → không recalculate chiều cao

### Giải pháp:
- **ENABLE lại** `setupCanvasHeightEvents()` để theo dõi component changes
- Hoặc chuyển sang sử dụng `height: auto` cho frame (như GrapesJS native behavior)

## 3. Các bước Thực hiện (Implementation Steps)

### Solution A: Enable Canvas Height Events (RECOMMENDED)
* [x] **Step 1**: Sửa `frontend/src/editor/scripts/main.js` line 516
  - ✅ Uncommented dòng `this.setupCanvasHeightEvents();`
  - ✅ Hàm `setupCanvasHeightEvents()` đã hoạt động với debounce logic (100ms)
  
* [ ] **Step 2**: Test kéo components vào canvas (AWAITING USER TESTING)
  - Kéo 1 component → kiểm tra canvas height
  - Kéo 3 components → kiểm tra canvas height
  - Cuộn xuống → kiểm tra không có hiện tượng "nửa trắng nửa xám"

### Solution B: Switch to Auto Height (ALTERNATIVE)
* [ ] **Step 3 (Alternative)**: Sửa `frontend/src/editor/styles/editor.css`
  - Thay `.gjs-frame { height: 100% !important }` → `height: auto !important`
  - Đảm bảo `min-height: 100%` để canvas không bị quá nhỏ

* [ ] **Step 4 (Alternative)**: Test behavior
  - Kiểm tra canvas tự động mở rộng khi thêm components
  - Kiểm tra scrollbar hiển thị đúng

### Final Step
* [ ] **Step 5**: Cross-browser testing
  - Test trên Chrome, Firefox, Safari
  - Test trên Desktop, Tablet, Mobile device modes

## 4. Các file bị ảnh hưởng (Files to be Touched)

### Solution A (Recommended):
* `frontend/src/editor/scripts/main.js` (line 516 - Uncomment setupCanvasHeightEvents)

### Solution B (Alternative):
* `frontend/src/editor/styles/editor.css` (lines 61-64 - Change frame height)

## 5. Kết quả Mong đợi (Expected Result)
- ✅ Kéo components vào canvas → canvas tự động mở rộng chiều cao
- ✅ Cuộn xuống → nội dung không nhảy, layout ổn định
- ✅ Không còn hiện tượng "nửa trắng nửa xám"
- ✅ Scrollbar hoạt động mượt mà

## 6. Rollback Plan
Nếu solution gây lỗi mới:
- Revert changes về commit trước
- Thử solution B nếu solution A fail
