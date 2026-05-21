@AGENTS.md

<!-- BEGIN:language-rule -->
- **Luôn trả lời bằng tiếng Việt** — mọi câu trả lời, giải thích, ghi chú phải bằng tiếng Việt
<!-- END:language-rule -->

<!-- BEGIN:project-context -->

# Tiết Ú — Hệ Thống POS (tiet-u-pos)

## Tổng quan

Ứng dụng POS (Điểm bán hàng) tiếng Việt dành cho tiệm bánh/bánh ngọt tên **Tiết Ú**. Ứng dụng chạy trên màn hình cảm ứng lớn trong cửa hàng, cho phép nhân viên:
1. Quét sản phẩm qua camera (tương lai)
2. Xem lại và chỉnh sửa giỏ hàng trên màn hình thanh toán
3. Xử lý thanh toán

**Tech stack:** Next.js 16.2.6 · React 19 · TypeScript · Tailwind CSS v4 · motion/react · react-hot-toast

## Nhận diện thương hiệu

- **Đỏ chính:** `#CB2527` — giá, nút hành động chính, nút tăng số lượng
- **Đỏ phụ:** `#F25B5D` — nhấn mạnh, nút xóa
- **Đỏ nền:** `#F03D3F` → `#651213` gradient (trang chủ)
- **Tối:** `#111`, `#222`, `#0B0C0C`
- **Trung tính:** `#EEEEEE` (nền trang thanh toán), `#959DA9` (nút mờ)
- **Font:** `font-montserrat` cho thông báo nghiêng; `font-script` cho tiêu đề hero; mặc định sans

## Các trang & Định tuyến

| Route | Component | Mục đích |
|---|---|---|
| `/` | `src/features/home/index.tsx` | Trang chủ — banner xoay vòng với nút "Thanh toán ngay" |
| `/thanh-toan` | `src/features/checkout/index.tsx` | Thanh toán/giỏ hàng — danh sách sản phẩm, tăng giảm số lượng, vuốt để xóa, tổng cộng, thanh toán |

## Tính năng

### Trang chủ (`/`)
- Nền gradient toàn màn hình (`#F03D3F` → `#651213`)
- Banner 2 slides xoay thủ công (không tự động), có dots điều khiển
- Mỗi slide: tiêu đề tiếng Việt, mô tả, hình ảnh banner
- Nút CTA chuyển sang `/thanh-toan`
- Hình ảnh: `banner-1.webp`, `banner-2.webp`

### Trang thanh toán (`/thanh-toan`)
- **Header:** logo giữa, nút "Thoát" bên trái, đồng hồ thời gian thực bên phải
- **Danh sách sản phẩm:** thẻ sản phẩm vuốt trái để xóa dùng `motion/react` drag
  - Ngưỡng xóa: `x < -80px` hiện nền đỏ xóa
  - `react-hot-toast` thông báo thành công khi xóa
  - Nút ± số lượng với animation spring
  - Trạng thái trống với hình `no-card.webp`
  - Nút "Xóa tất cả"
- **Footer:** cố định — số sản phẩm, tổng tiền, nút "Hủy đơn" và "Thanh toán"
- Đồng hồ sống: cập nhật mỗi giây, định dạng `HH:mm:ss`, thứ tiếng Việt/ngày
- Sản phẩm mẫu hardcoded (5 sản phẩm, đều là `Sữa Tươi Vinamilk 1L`, cùng hình `product-3.webp`)

### Animation
- Toàn bộ animation qua `motion/react` — gói framer-motion đổi tên
- Import: `import { motion, useMotionValue, useTransform, animate, AnimatePresence } from "motion/react"`
- Không dùng `@gsap` hay thư viện animation khác

## Cấu trúc thư mục

```
app/
  layout.tsx          — Layout gốc, provider Toaster
  page.tsx            — Redirect sang / hoặc render HomePage
  globals.css         — Import Tailwind, CSS variables
  thanh-toan/page.tsx — Wrapper đơn giản cho Checkout

src/features/
  home/index.tsx      — Component HomePage
  checkout/index.tsx  — Component Checkout + ProductCard

public/
  logo.webp           — Logo giữa header thanh toán
  banner-1.webp      — Hình slide 1 trang chủ
  banner-2.webp      — Hình slide 2 trang chủ
  product-1.webp     — Hình sản phẩm demo (thanh toán)
  product-2.webp     — Hình sản phẩm demo (thanh toán)
  product-3.webp     — Hình sản phẩm demo (thanh toán, dùng nhiều nhất)
  no-card.webp       — Hình minh họa giỏ hàng trống
```

## Quy ước code

- `"use client"` trên mọi component (không cần SSR, app kiosk)
- Ngôn ngữ tiếng Việt cho toàn bộ UI
- Định dạng giá: `price.toLocaleString("vi-VN") + " ₫"`
- Mobile-first responsive: pattern `text-base md:text-2xl`
- Không dùng giá trị màu tùy ý trong Tailwind — dùng hex brand có sẵn
- Hình ảnh qua `next/image` với `width`/`height` tường minh (không dùng `fill`)
- `AnimatePresence` bao ngoài danh sách mapped cho exit animation
- `useMotionValue` + `useTransform` + `animate` cho thao tác vuốt
- `react-hot-toast` — style thông báo thành công: `{ background: "#22C55E", color: "#fff", fontWeight: "bold" }`

## Ghi chú Next.js 16

- Dự án dùng **Next.js 16** (không phải 14/15). Có thể có breaking changes.
- Đọc docs liên quan trong `node_modules/next/dist/docs/` trước khi viết code config/routing.
- Tailwind v4 (không phải v3) — cấu hình qua CSS `@theme`, không qua `tailwind.config.ts`.
- ESLint v9 với `eslint-config-next` 16.2.6.

## Các gói phụ thuộc

| Gói | Phiên bản | Mục đích |
|---|---|---|
| `next` | 16.2.6 | Framework |
| `react` | 19.2.4 | UI |
| `react-dom` | 19.2.4 | Render DOM |
| `motion` | ^12.39.0 | Animation (framer-motion đổi tên) |
| `react-hot-toast` | ^2.6.0 | Thông báo toast |
| `tailwindcss` | ^4 | Styling |
| `@tailwindcss/postcss` | ^4 | Plugin PostCSS cho Tailwind v4 |

<!-- END:project-context -->
