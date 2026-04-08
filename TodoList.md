Dưới đây là **TODO List chi tiết** dành cho **AI Agent Codex** (tôi sẽ giả sử đây là tên project hoặc agent hỗ trợ bạn code đồ án). 

Tôi đã sắp xếp theo **giai đoạn rõ ràng**, ưu tiên những phần quan trọng nhất cho đồ án môn học, dễ theo dõi và kiểm soát tiến độ.

### 📋 TODO List – OTT Messaging Platform Backend (Đồ án Môn học)

#### **Phase 0: Chuẩn bị dự án (1-2 ngày)**
- [x] Tạo repository GitHub + clone về máy
- [x] Khởi tạo project Node.js (`npm init -y`)
- [x] Cài đặt các package chính:
  ```bash
  express mongoose dotenv cors helmet joi zod pino socket.io jsonwebtoken bcryptjs
  ```
- [x] Tạo cấu trúc thư mục theo README (config, controllers, models, routes, services, middlewares, utils…)
- [x] Tạo file `.env` và `.env.example`
- [ ] Cài đặt & chạy MongoDB + Redis locally (hoặc dùng Docker)
- [x] Viết script `npm run dev` (sử dụng nodemon)

#### **Phase 1: Authentication & Security (3-4 ngày) – Ưu tiên cao**
- [x] Tạo User Model (Mongoose Schema)
- [x] Implement Register (`POST /auth/register`)
- [x] Implement Login (`POST /auth/login`) + hash password (bcrypt)
- [x] Tạo Access Token + Refresh Token (JWT)
- [x] Implement Refresh Token endpoint
- [x] Implement Logout & Logout All (blacklist in-memory, có thể thay Redis)
- [x] Viết Auth Middleware (verify JWT)
- [x] Thêm Rate limiting cho login/register
- [x] Áp dụng Helmet, CORS, global error handler

#### **Phase 2: User & Friend Service (3-4 ngày)**
- [x] Hoàn thiện User endpoints (`GET/PUT /users/:id`)
- [x] Tạo Friend Request Model
- [x] Implement gửi lời mời kết bạn
- [x] Implement accept / reject request
- [x] Implement danh sách bạn bè (`GET /friends/list`)
- [x] Implement Block / Unblock user
- [x] Thêm soft delete cho user (nếu có thời gian)

#### **Phase 3: Conversation & Message Core (5-7 ngày) – Phần quan trọng nhất**
- [x] Tạo Conversation Model (1-1 và group)
- [x] Tạo Message Model với indexing (`conversation_id + timestamp`)
- [x] Implement lấy danh sách conversation (`GET /conversations`)
- [x] Implement gửi tin nhắn (`POST /messages/send`)
- [x] Implement lấy tin nhắn theo conversation (cursor-based pagination)
- [x] Implement đánh dấu đã đọc (`PUT /messages/:id/read`)
- [x] Thêm reply / forward (nếu có thời gian)
- [x] Xử lý Delivered & Seen status

#### **Phase 4: Realtime với Socket.IO (4-6 ngày)**
- [x] Setup Socket.IO server + integrate với Express
- [x] Authentication trên Socket handshake (verify JWT)
- [x] Implement join room theo `conversation_id`
- [x] Event: `send_message` → broadcast đến room
- [x] Event: Typing indicator (`typing` + `stop_typing`)
- [x] Event: Online / Offline status + Last seen (đang dùng Mongo/in-memory, có thể thay Redis)
- [x] Event: `message_delivered`, `message_seen`
- [x] Xử lý reconnect & disconnect
- [ ] Test realtime trên nhiều tab trình duyệt

#### **Phase 5: Media & Notification (2-4 ngày – Tùy thời gian)**
- [x] Implement upload media (`POST /media/upload`) → Cloudinary hoặc local
- [x] Lưu metadata media vào MongoDB
- [x] In-app notification (`GET /notifications`)
- [x] Đánh dấu notification đã đọc

#### **Phase 6: Tối ưu & Polish (3-5 ngày)**
- [x] Thêm Input validation (Joi/Zod) cho tất cả endpoints
- [x] Centralized error handling + logging (Pino)
- [x] Cursor pagination hoàn chỉnh cho tin nhắn
- [x] Rate limiting cho gửi tin nhắn (anti-spam)
- [ ] Kiểm tra và fix security issues
- [x] Viết Swagger/OpenAPI documentation (nếu có thời gian)
- [x] Test toàn bộ flow chính (Jest/Supertest cho auth + message flow)

#### **Phase 7: Documentation & Hoàn thiện (2 ngày)**
- [x] Cập nhật README.md (dùng phiên bản tôi đã đưa trước đó)
- [x] Viết file `.env.example` đầy đủ
- [x] Viết hướng dẫn chạy local chi tiết
- [ ] Chuẩn bị slide/demo (flow gửi tin nhắn, realtime, auth…)
- [ ] Deploy thử lên Render / Railway / Vercel (nếu yêu cầu)

### ✅ Checklist Tổng quát (đánh dấu khi hoàn thành)

- [x] Project chạy được locally mà không lỗi
- [x] Đăng ký / Đăng nhập hoạt động tốt
- [ ] Gửi và nhận tin nhắn realtime ổn định
- [ ] Typing indicator & Online status hoạt động
- [x] Pagination tin nhắn không bị lỗi
- [ ] Code có comment rõ ràng + cấu trúc sạch
- [x] Không có console.log thừa
- [x] README chuyên nghiệp

---

**Gợi ý cách dùng TODO này**:
- Copy vào file `TODO.md` hoặc Notion / Trello.
- Làm theo thứ tự Phase (đừng nhảy cóng Phase 4 trước khi xong Phase 1-3).
- Ưu tiên mạnh: **Auth → Message CRUD → Realtime Socket** (đây là 3 phần thầy cô hay chấm điểm cao nhất).
