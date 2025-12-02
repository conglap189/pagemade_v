# Ke hoach: Implement Canvas Scrolling Feature

## 1. Muc tieu (Goal)
Them tinh nang scrolling cho canvas cua editor, tuong tu nhu GrapesJS native implementation. Nguoi dung co the scroll canvas khi noi dung trang vuot qua vung hien thi.

## 2. Cac buoc Thuc hien (Implementation Steps)
* [x] Them `scrollableCanvas: true` vao canvas configuration trong pagemade-config.js
* [x] Build lai frontend
* [x] Test tinh nang scrolling hoat dong dung
* [x] Kiem tra tuong thich voi device switching va cac tinh nang khac

## 3. Cac file bi anh huong (Files to be Touched)
* `frontend/src/editor/scripts/config/pagemade-config.js` (Chinh sua - them scrollableCanvas option)

## 4. Ghi chu ky thuat
GrapesJS ho tro san config option `scrollableCanvas: true` trong canvas configuration:
- Khi bat, canvas se co the scroll khi noi dung vuot qua viewport
- Day la tinh nang built-in cua GrapesJS, khong can them code moi
