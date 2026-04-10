# Skill: Mobile UI Designer (Zalo-style)

## 🎯 Goal
Thiết kế giao diện mobile app theo phong cách giống Zalo:
- Clean
- Hiện đại
- Tối giản
- Ưu tiên trải nghiệm người dùng (UX-first)
- Hỗ trợ Dark Mode chuẩn (không bị “dark nửa mùa”)

---

## 🧠 Design Principles

1. Consistency (Nhất quán)
- Màu sắc, spacing, font phải đồng bộ
- Không mix light + dark trong cùng màn hình

2. Hierarchy (Phân cấp)
- Title > Subtitle > Meta rõ ràng
- Dùng màu + font-weight để phân biệt

3. Accessibility
- Contrast đủ cao (WCAG)
- Dark mode không dùng trắng tinh (#fff)

4. Minimalism
- Tránh clutter
- Ưu tiên whitespace

---

## 🎨 Color System (Dark Theme)

### Background
- Primary: #0f172a
- Secondary: #020617

### Surface (Card / Item)
- #1e293b

### Primary Color
- #3b82f6

### Text
- Main: #e2e8f0
- Secondary: #94a3b8
- Disabled: #64748b

### Divider / Border
- #334155

---

## 🧱 Component Rules

### 1. App Bar
- Background: #1d4ed8 hoặc #0f172a
- Text: trắng nhẹ (#e2e8f0)
- Icon: cùng màu text
- Không dùng trắng tinh

---

### 2. Chat List Item
- Background: #1e293b
- Border radius: 12px
- Padding: 12–16px

**Structure:**
[Avatar] [Name + Message preview] [Time]

- Name: bold, #e2e8f0
- Message: #94a3b8
- Time: nhỏ, #64748b

---

### 3. Bottom Navigation
- Background: #0f172a
- Active icon: #3b82f6
- Inactive: #64748b

---

### 4. Avatar
- Shape: tròn
- Màu random nhưng giảm saturation
- Ví dụ:
  - #6d28d9
  - #0ea5e9
  - #22c55e

---

### 5. Floating Action Button (FAB)
- Màu: #3b82f6
- Icon: trắng
- Shadow nhẹ

---

## 📐 Spacing System
- 4px base grid
- Common:
  - 8px
  - 12px
  - 16px
  - 24px

---

## 🔥 UX Rules (Quan trọng)

- Không dùng nền trắng trong dark mode ❌
- Không dùng text #000 trên nền tối ❌
- Không dùng quá nhiều màu ❌
- Luôn có trạng thái:
  - Active
  - Hover
  - Disabled

---

## 🧪 Behavior Rules

- Click item → có ripple nhẹ
- Scroll → header có thể shrink
- New message → highlight nhẹ

---

## 📱 Output Expectation

Khi được yêu cầu:
- Phải trả về:
  - Layout rõ ràng
  - Mô tả component
  - Màu sắc cụ thể (hex)
  - Có thể convert sang code (Flutter / React Native)

---

## 🚀 Advanced (Optional)

- Skeleton loading
- Empty state
- Error state
- Dark/Light toggle

---

## ❌ Anti-patterns

- Dùng trắng (#ffffff) trong dark mode
- Màu quá chói (neon)
- Text quá nhỏ (<12px)
- Không có padding

---

## 🧩 Example Prompt Usage

"Thiết kế màn hình chat list giống Zalo, dark mode, hiện đại"

→ AI phải:
- Dùng đúng color system
- Tạo layout chuẩn mobile
- Không dùng nền trắng