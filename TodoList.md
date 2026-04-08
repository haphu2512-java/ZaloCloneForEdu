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
- [ ] Tạo file `.env` và `.env.example`
- [ ] Cài đặt & chạy MongoDB + Redis locally (hoặc dùng Docker)
- [ ] Viết script `npm run dev` (sử dụng nodemon)

#### **Phase 1: Authentication & Security (3-4 ngày) – Ưu tiên cao**
- [ ] Tạo User Model (Mongoose Schema)
- [ ] Implement Register (`POST /auth/register`)
- [ ] Implement Login (`POST /auth/login`) + hash password (bcrypt)
- [ ] Tạo Access Token + Refresh Token (JWT)
- [ ] Implement Refresh Token endpoint
- [ ] Implement Logout & Logout All (Redis blacklist)
- [ ] Viết Auth Middleware (verify JWT)
- [ ] Thêm Rate limiting cho login/register
- [ ] Áp dụng Helmet, CORS, global error handler

#### **Phase 2: User & Friend Service (3-4 ngày)**
- [ ] Hoàn thiện User endpoints (`GET/PUT /users/:id`)
- [ ] Tạo Friend Request Model
- [ ] Implement gửi lời mời kết bạn
- [ ] Implement accept / reject request
- [ ] Implement danh sách bạn bè (`GET /friends/list`)
- [ ] Implement Block / Unblock user
- [ ] Thêm soft delete cho user (nếu có thời gian)

#### **Phase 3: Conversation & Message Core (5-7 ngày) – Phần quan trọng nhất**
- [ ] Tạo Conversation Model (1-1 và group)
- [ ] Tạo Message Model với indexing (`conversation_id + timestamp`)
- [ ] Implement lấy danh sách conversation (`GET /conversations`)
- [ ] Implement gửi tin nhắn (`POST /messages/send`)
- [ ] Implement lấy tin nhắn theo conversation (cursor-based pagination)
- [ ] Implement đánh dấu đã đọc (`PUT /messages/:id/read`)
- [ ] Thêm reply / forward (nếu có thời gian)
- [ ] Xử lý Delivered & Seen status

#### **Phase 4: Realtime với Socket.IO (4-6 ngày)**
- [ ] Setup Socket.IO server + integrate với Express
- [ ] Authentication trên Socket handshake (verify JWT)
- [ ] Implement join room theo `conversation_id`
- [ ] Event: `send_message` → broadcast đến room
- [ ] Event: Typing indicator (`typing` + `stop_typing`)
- [ ] Event: Online / Offline status + Last seen (dùng Redis)
- [ ] Event: `message_delivered`, `message_seen`
- [ ] Xử lý reconnect & disconnect
- [ ] Test realtime trên nhiều tab trình duyệt

#### **Phase 5: Media & Notification (2-4 ngày – Tùy thời gian)**
- [ ] Implement upload media (`POST /media/upload`) → Cloudinary hoặc local
- [ ] Lưu metadata media vào MongoDB
- [ ] In-app notification (`GET /notifications`)
- [ ] Đánh dấu notification đã đọc

#### **Phase 6: Tối ưu & Polish (3-5 ngày)**
- [ ] Thêm Input validation (Joi/Zod) cho tất cả endpoints
- [ ] Centralized error handling + logging (Pino)
- [ ] Cursor pagination hoàn chỉnh cho tin nhắn
- [ ] Rate limiting cho gửi tin nhắn (anti-spam)
- [ ] Kiểm tra và fix security issues
- [ ] Viết Swagger/OpenAPI documentation (nếu có thời gian)
- [ ] Test toàn bộ flow chính (Postman + Socket.IO tester)

#### **Phase 7: Documentation & Hoàn thiện (2 ngày)**
- [ ] Cập nhật README.md (dùng phiên bản tôi đã đưa trước đó)
- [ ] Viết file `.env.example` đầy đủ
- [ ] Viết hướng dẫn chạy local chi tiết
- [ ] Chuẩn bị slide/demo (flow gửi tin nhắn, realtime, auth…)
- [ ] Deploy thử lên Render / Railway / Vercel (nếu yêu cầu)

### ✅ Checklist Tổng quát (đánh dấu khi hoàn thành)

- [ ] Project chạy được locally mà không lỗi
- [ ] Đăng ký / Đăng nhập hoạt động tốt
- [ ] Gửi và nhận tin nhắn realtime ổn định
- [ ] Typing indicator & Online status hoạt động
- [ ] Pagination tin nhắn không bị lỗi
- [ ] Code có comment rõ ràng + cấu trúc sạch
- [ ] Không có console.log thừa
- [ ] README chuyên nghiệp

---

**Gợi ý cách dùng TODO này**:
- Copy vào file `TODO.md` hoặc Notion / Trello.
- Làm theo thứ tự Phase (đừng nhảy cóng Phase 4 trước khi xong Phase 1-3).
- Ưu tiên mạnh: **Auth → Message CRUD → Realtime Socket** (đây là 3 phần thầy cô hay chấm điểm cao nhất).

Bạn muốn tôi chỉnh TODO list này theo hướng nào không?
- Rút gọn hơn (chỉ phần tối thiểu để đạt điểm 7-8)?
- Chi tiết hơn với task con + thời gian ước tính?
- Thêm cột Priority (Must have / Should have / Nice to have)?

Cứ nói rõ mình sẽ chỉnh ngay cho phù hợp với thời gian đồ án của bạn!