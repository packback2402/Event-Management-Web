# 🎉 Event Management Web

Ứng dụng web quản lý sự kiện với đầy đủ tính năng đặt vé, quản lý sự kiện và theo dõi người tham gia.

## 🛠️ Tech Stack

| Layer | Công nghệ |
|-------|-----------|
| **Frontend** | React 19, TypeScript, Vite, TailwindCSS, Framer Motion |
| **Backend** | Node.js, Express 5, TypeScript, MongoDB (Mongoose) |
| **Auth** | JWT, bcryptjs |
| **Upload** | Cloudinary, Multer |
| **Deploy** | Docker, Docker Compose, GitHub Actions |

## ✨ Tính năng

- 🔐 **Xác thực**: Đăng ký, đăng nhập, quên/đặt lại mật khẩu
- 📅 **Quản lý sự kiện**: Tạo, sửa, xóa sự kiện
- 🎫 **Đặt vé**: Mua vé, thanh toán, nhận mã QR
- 👤 **Hồ sơ**: Quản lý thông tin cá nhân
- 📊 **Thống kê**: Dashboard phân tích dữ liệu
- 📱 **Responsive**: Tương thích mọi thiết bị

## 📁 Cấu trúc dự án

```
Event-Management-Web/
├── backend/                 # API Server
│   └── src/
│       ├── controllers/     # Xử lý logic
│       ├── models/          # User, Event, Ticket
│       ├── routes/          # Định tuyến API
│       ├── middleware/      # Auth, validation
│       └── utils/           # Helper functions
├── frontend/                # React App
│   └── src/
│       ├── pages/           # Các trang (Home, Events, Profile...)
│       ├── components/      # UI components
│       └── lib/             # Utilities
└── docker-compose.yml       # Deploy config
```


