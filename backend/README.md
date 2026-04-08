# OTT Messaging Backend (MVP)

Backend API cho hệ thống nhắn tin realtime theo chuẩn `/api/v1`.

## 1) Yêu cầu

- Node.js 18+
- MongoDB local (mặc định: `mongodb://127.0.0.1:27017/ott_messaging`)
- Redis local (mặc định: `redis://127.0.0.1:6379`)

## 2) Cấu hình môi trường

1. Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

2. Kiểm tra các biến quan trọng:

- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `PORT`

## 3) Chạy local

```bash
cd backend
npm install
npm run dev
```

Health check:

```bash
GET http://localhost:5000/health
```

Swagger docs:

```bash
GET http://localhost:5000/api-docs
GET http://localhost:5000/api-docs/openapi.json
```

## 3.1) Chạy test

```bash
cd backend
npm test
```

Test suite hiện có:

- `tests/auth.e2e.test.js`
- `tests/message.e2e.test.js`

## 4) API đã implement

### Auth

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh-token`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/logout-all`

### User/Friend

- `GET /api/v1/users/:id`
- `PUT /api/v1/users/:id`
- `DELETE /api/v1/users/:id` (soft delete)
- `POST /api/v1/users/block/:id`
- `POST /api/v1/friends/request`
- `PUT /api/v1/friends/request/:id/accept`
- `PUT /api/v1/friends/request/:id/reject`
- `DELETE /api/v1/friends/:friendId`
- `GET /api/v1/friends/list`

### Conversation/Message

- `GET /api/v1/conversations`
- `POST /api/v1/conversations`
- `POST /api/v1/messages/send`
- `GET /api/v1/messages/conversation/:id?limit=20&cursor=...`
- `PUT /api/v1/messages/:id/read`
- `DELETE /api/v1/messages/:id`

### Media/Notification

- `POST /api/v1/media/upload` (base64 payload, lưu local)
- `GET /api/v1/media/:id`
- `DELETE /api/v1/media/:id`
- `GET /api/v1/notifications`
- `PUT /api/v1/notifications/:id/read`

## 5) Socket.IO events

- Client -> Server: `join_conversation`, `send_message`, `typing`, `stop_typing`, `message_delivered`, `message_seen`
- Server -> Client: `new_message`, `typing`, `stop_typing`, `message_delivered`, `message_seen`, `user_online`, `user_offline`

## 6) Ghi chú hiện tại

- Redis blacklist/presence đã tích hợp thật khi Redis available.
- Nếu Redis down, hệ thống tự fallback sang in-memory để không làm sập API local.
- Upload media đang dùng local storage (`backend/uploads`).
