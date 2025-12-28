# Hướng Dẫn Deploy

## Yêu Cầu Hệ Thống

- Node.js >= 18.x
- npm >= 9.x
- Firebase CLI: `npm install -g firebase-tools`

---

## Biến Môi Trường

Tạo file `.env.local` với nội dung:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

**Lấy Gemini API Key:**
1. Truy cập https://aistudio.google.com/apikey
2. Tạo API key mới
3. Copy và paste vào file `.env.local`

---

## Deploy Lên Firebase Hosting

### Bước 1: Đăng nhập Firebase

```bash
firebase login
```

### Bước 2: Build Production

```bash
npm run build
```

### Bước 3: Deploy

```bash
firebase deploy --only hosting
```

### URL Sau Deploy

- **Production:** https://bachho-timesheet-2025.web.app
- **Firebase Console:** https://console.firebase.google.com/project/bachho-timesheet-2025

---

## Deploy Nhanh (1 lệnh)

```bash
npm run build && firebase deploy --only hosting
```

---

## Cấu Hình Firebase

### File: `firebase.json`

```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{ "source": "**", "destination": "/index.html" }]
  },
  "database": {
    "rules": "database.rules.json"
  }
}
```

### File: `.firebaserc`

```json
{
  "projects": {
    "default": "bachho-timesheet-2025"
  }
}
```

---

## Đổi Project Firebase

Nếu cần deploy sang project khác:

```bash
# Liệt kê projects
firebase projects:list

# Chọn project
firebase use <project-id>

# Hoặc thêm project mới
firebase use --add
```

---

## Cập Nhật Database Rules

```bash
firebase deploy --only database
```

---

## Troubleshooting

### Lỗi "Not logged in"

```bash
firebase login --reauth
```

### Lỗi "Project not found"

```bash
firebase use bachho-timesheet-2025
```

### Lỗi Build

```bash
# Xóa cache và build lại
rm -rf node_modules dist
npm install
npm run build
```

---

## CI/CD (Tùy chọn)

### GitHub Actions

Tạo file `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Firebase
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: bachho-timesheet-2025
```

**Secrets cần thiết:**
- `FIREBASE_SERVICE_ACCOUNT`: JSON key từ Firebase Console

---

*Cập nhật: 2025-12-28*
