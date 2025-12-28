# Checklist Bàn Giao Dự Án

**Dự án:** Timesheet Pro VN - Bạch Hổ Security
**Ngày bàn giao:** ____/____/2025
**Người bàn giao:** ________________
**Người nhận:** ________________

---

## 1. Source Code

| Item | Trạng thái | Ghi chú |
|------|------------|---------|
| [ ] Transfer GitHub repo ownership | | Email người nhận: |
| [ ] Hoặc: Add collaborator với quyền Admin | | |
| [ ] Xác nhận người nhận có thể clone repo | | |
| [ ] Xác nhận người nhận có thể push code | | |

**GitHub Repo:** https://github.com/NguyenQS504092s/bachhosecurity

---

## 2. Firebase Project

| Item | Trạng thái | Ghi chú |
|------|------------|---------|
| [ ] Add người nhận vào Firebase project (Owner) | | Email: |
| [ ] Xác nhận người nhận có thể access Console | | |
| [ ] Xác nhận người nhận thấy Realtime Database | | |
| [ ] Xác nhận người nhận thấy Hosting | | |

**Firebase Console:** https://console.firebase.google.com/project/bachho-timesheet-2025

### Cách thêm Owner:
1. Firebase Console → Project Settings (bánh răng)
2. Users and permissions
3. Add member → Nhập email → Role: Owner
4. Send invitation

---

## 3. Biến Môi Trường (Secrets)

| Item | Trạng thái | Ghi chú |
|------|------------|---------|
| [ ] GEMINI_API_KEY | | Gửi qua kênh bảo mật |
| [ ] Firebase config (nếu thay đổi) | | Có sẵn trong code |


**Gemini API Key:**
1. Người nhận tự tạo tại: https://aistudio.google.com/apikey
2. Tạo file `.env.local` với `GEMINI_API_KEY=...`

---

## 4. Tài Liệu Bàn Giao

| File | Mô tả | Trạng thái |
|------|-------|------------|
| [ ] `README.md` | Giới thiệu dự án | |
| [ ] `docs/deployment-guide.md` | Hướng dẫn deploy | |
| [ ] `docs/operation-guide.md` | Hướng dẫn vận hành | |
| [ ] `docs/project-overview-pdr.md` | Yêu cầu sản phẩm | |
| [ ] `docs/codebase-summary.md` | Cấu trúc code | |
| [ ] `docs/code-standards.md` | Quy chuẩn code | |
| [ ] `docs/system-architecture.md` | Kiến trúc hệ thống | |

---

## 5. Xác Nhận Hoạt Động

| Item | Trạng thái | Ghi chú |
|------|------------|---------|
| [ ] Người nhận có thể `npm install` | | |
| [ ] Người nhận có thể `npm run dev` | | |
| [ ] Người nhận có thể đăng nhập app | | Dùng 314/123 |
| [ ] Người nhận có thể `npm run build` | | |
| [ ] Người nhận có thể `firebase deploy` | | |
| [ ] App chạy được sau deploy | | |

---

## 6. Thông Tin Truy Cập

### Production URLs
| Service | URL |
|---------|-----|
| App | https://bachho-timesheet-2025.web.app |
| Firebase Console | https://console.firebase.google.com/project/bachho-timesheet-2025 |

### Tài Khoản Test
| Loại | Mã NV | Password | Quyền |
|------|-------|----------|-------|
| Admin | 314 | 123 | Full access |

---



## 7. Xác Nhận Bàn Giao

### Bên Bàn Giao

- Họ tên: ________________
- Ngày: ____/____/2025

### Bên Nhận

- Họ tên: ________________
- Ngày: ____/____/2025

---

## Ghi Chú Thêm

```

```

---

*Template version: 1.0 - 2025-12-28*
