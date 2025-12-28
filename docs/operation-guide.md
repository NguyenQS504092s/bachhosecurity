# Hướng Dẫn Vận Hành

## Tổng Quan Hệ Thống

| Thành phần | URL/Vị trí |
|------------|------------|
| **App** | https://bachho-timesheet-2025.web.app |
| **Firebase Console** | https://console.firebase.google.com/project/bachho-timesheet-2025 |
| **Database** | Firebase Realtime Database |
| **Hosting** | Firebase Hosting |

---

## Tài Khoản Demo

| Loại | Mã NV | Mật khẩu | Quyền |
|------|-------|----------|-------|
| Admin | 314 | 123 | Xem tất cả tabs |
| Staff | (theo data) | 123 | Chỉ tab Chấm Công |

---

## Quản Lý Dữ Liệu

### 1. Backup Dữ Liệu

**Cách 1: Từ App**
- Đăng nhập với tài khoản Admin
- Tab "Chấm Công" → Nút "Backup"
- File JSON sẽ được tải về

**Cách 2: Từ Firebase Console**
1. Truy cập Firebase Console
2. Realtime Database → ⋮ → Export JSON
3. Lưu file backup

### 2. Restore Dữ Liệu

**Từ Firebase Console:**
1. Realtime Database → ⋮ → Import JSON
2. Chọn file backup
3. Xác nhận import

---

## Quản Lý Nhân Viên

### Thêm Nhân Viên Mới

1. Đăng nhập Admin (314 / 123)
2. Tab "Nhân Sự"
3. Click "Thêm Nhân Viên"
4. Điền thông tin:
   - Mã NV (bắt buộc)
   - Tên (bắt buộc)
   - Phòng ban
   - Ca làm việc
   - Mật khẩu (mặc định: 123)

### Xóa/Sửa Nhân Viên

1. Tab "Nhân Sự"
2. Click vào nhân viên cần sửa
3. Sửa thông tin hoặc click "Xóa"

---

## Quản Lý Mục Tiêu (Địa Điểm)

### Thêm Mục Tiêu

1. Tab "Mục Tiêu"
2. Click "+" ở góc
3. Điền tên địa điểm
4. Thêm nhân viên vào roster

### Quản Lý Ca Trực

1. Tab "Mục Tiêu" → "Quản Lý Ca Trực"
2. Thêm ca mới: Nhập giờ bắt đầu - kết thúc
3. Ca tùy chỉnh lưu vào Firebase

---

## Chấm Công

### Nhập Chấm Công Thủ Công

1. Tab "Chấm Công"
2. Chọn tháng/năm
3. Click vào ô ngày của nhân viên
4. Chọn trạng thái: X (đi làm), P (nghỉ phép), OFF, etc.

### Nhập Từ Excel

1. Click "Tải Mẫu" để lấy template
2. Điền dữ liệu vào Excel
3. Click "Nhập Excel" → Chọn file

### Xuất Dữ Liệu

- **Xuất Excel:** Xuất bảng chấm công
- **Xuất Lương:** Xuất bảng tính lương với thưởng/phạt

---

## Tính Năng AI (OCR)

### Nhập Từ Ảnh

1. Click "Chụp Ảnh & Nhập Dữ Liệu"
2. Chụp/tải ảnh bảng chấm công
3. AI sẽ tự động nhận dạng và nhập

**Yêu cầu:**
- Gemini API Key đã được cấu hình
- Ảnh rõ nét, có cấu trúc bảng

---

## Đồng Bộ Google Sheets

### Cấu Hình

1. Mở Settings (icon bánh răng)
2. Nhập Spreadsheet ID
3. Nhập Sheet Name (mặc định: "Sheet1")

### Đồng Bộ

- Click "Sync" để đồng bộ 2 chiều
- Dữ liệu từ Sheets → App
- Dữ liệu từ App → Sheets (nếu cấu hình)

---

## Monitoring

### Kiểm Tra Trạng Thái

1. **Firebase Console** → Realtime Database
   - Xem usage (reads/writes)
   - Xem data structure

2. **Firebase Console** → Hosting
   - Xem deployment history
   - Xem traffic

### Logs

- Browser Console (F12) → Console tab
- Các log có prefix `[App]`, `[TargetManagement]`, etc.

---

## Troubleshooting

### Không Đăng Nhập Được

1. Kiểm tra mã NV và mật khẩu
2. Kiểm tra Firebase Database có data không
3. Clear cache browser và thử lại

### Dữ Liệu Không Hiện

1. Kiểm tra tháng/năm đã chọn
2. Kiểm tra Firebase Database
3. Refresh page (Ctrl+Shift+R)

### Lỗi Khi Lưu

1. Kiểm tra kết nối internet
2. Kiểm tra Firebase Rules
3. Xem Console log để biết lỗi cụ thể

### OCR Không Hoạt Động

1. Kiểm tra Gemini API Key trong Settings
2. Kiểm tra ảnh có rõ không
3. Thử ảnh khác với format bảng rõ ràng hơn

---

## Liên Hệ Hỗ Trợ

- **Technical Support:** [Thông tin liên hệ developer]
- **Firebase Issues:** https://firebase.google.com/support
- **Gemini API Issues:** https://ai.google.dev/support

---

*Cập nhật: 2025-12-28*
