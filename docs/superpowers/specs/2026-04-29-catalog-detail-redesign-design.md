# Catalog & Detail Pages — Redesign Spec

**Date:** 2026-04-29
**Brand:** T.R.Y.P (multi-brand luxury supercar showroom)
**Scope:** Redesign UI + hoàn thiện tính năng cho `catalog.html` và `detail.html`

---

## 1. Data Layer

Mở rộng `assets/js/data.js` thành multi-brand. Mỗi xe là một object:

```js
{
  id: "aventador-lp670",
  brand: "lamborghini",
  name: "Aventador LP 670",
  tagline: "Biểu tượng tốc độ tuyệt đối...",
  specs: {
    hp: 789,
    engine: "V12",
    acceleration: "3.2s",
    topSpeed: "355 km/h",
    price: "26 tỷ VND"
  },
  images: {
    hero: "aventador-hero.webp",
    gallery: ["exterior-front.webp", "interior.webp", "rear.webp", "engine.webp"]
  },
  model3d: "aventador.glb" // nullable — không phải xe nào cũng có
}
```

Brands ban đầu: Lamborghini, Ferrari, McLaren, Porsche. Thêm hãng mới chỉ cần thêm entry vào data.

---

## 2. Catalog Page (`catalog.html`)

### Layout: Horizontal Card Strip

**Hero section:**
- Tiêu đề "Bộ Sưu Tập Siêu Xe" + kicker "T.R.Y.P Collection"
- Giữ nguyên phong cách cinematic dark luxury

**Brand filter tabs:**
- Tab bar ngang: Tất cả | Lamborghini | Ferrari | McLaren | Porsche
- Tab active có underline vàng gold (#d4af37)
- Click tab filter danh sách xe bên dưới (animation fade)
- Tabs render động từ data (unique brands)

**Horizontal card strip:**
- Cards xếp ngang trong container `overflow-x: auto` + CSS snap
- Mỗi card gồm:
  - Ảnh xe lớn (aspect ratio ~16:10)
  - Badge hãng xe (góc trên trái, màu theo brand)
  - Tên xe
  - Specs cơ bản: HP, engine type, giá
  - Nút "Xem chi tiết →" link đến `detail.html?car={id}`
- Card cuối cùng nhô ra ở rìa phải (partial visibility) để gợi ý scroll
- Hỗ trợ cả drag-scroll (mouse) lẫn touch-swipe (mobile)
- Cards render động từ data — không hardcode HTML

**Responsive:**
- Desktop: 3-4 card hiển thị
- Tablet: 2 card hiển thị
- Mobile: 1.2 card hiển thị (card tiếp theo nhô ra)

---

## 3. Detail Page (`detail.html`)

### Layout: Sidebar cố định + Scroll dọc với tab bar

**Sidebar (bên trái, sticky):**
- Brand name (kicker)
- Tên xe (title, font serif)
- Quick specs: HP, 0-100, V-max, engine, giá
- CTA buttons: "Đặt Lịch Lái Thử" (mở modal) + "Quay lại BST" (link catalog)
- Desktop: width ~240px, position sticky
- Mobile: collapse thành header bar ngang phía trên

**Main content (bên phải, scrollable):**

#### Hero Section
- Ảnh xe lớn góc 3/4 (hoặc placeholder nếu chưa có ảnh)
- Full-width trong main content area

#### Sticky Tab Bar
- Tabs: Gallery | Thông Số | 360° View | So Sánh
- Sticky khi scroll past hero
- Click tab smooth-scroll đến section tương ứng
- Active tab highlight khi section trong viewport (ScrollTrigger)

#### Section 1: Gallery
- Layout: 1 ảnh lớn chính + 3-4 thumbnail bên cạnh
- Click thumbnail thay ảnh chính
- Lightbox fullscreen khi click ảnh chính
- Ảnh lấy từ `images.gallery` trong data

#### Section 2: Thông Số
- Grid tiles (2x2 hoặc 4 cột) hiển thị specs chi tiết
- Animation: count-up numbers khi scroll vào viewport (GSAP)
- Giữ style spec-tile hiện tại nhưng nâng cấp

#### Section 3: 360° View
- Dùng `<model-viewer>` component (đã có trên trang chủ)
- Load file .glb từ `model3d` trong data
- Camera-controls cho phép xoay tự do
- Fallback: hiển thị placeholder text nếu xe không có model 3D
- Disable zoom + pan (chỉ xoay)

#### Section 4: So Sánh (Compare)
- Dropdown chọn xe khác từ danh sách (render từ data)
- Hiển thị bảng so sánh side-by-side: 2 cột
- Rows: HP, 0-100, V-max, engine, giá
- Highlight specs nào tốt hơn (màu gold cho giá trị cao hơn)
- Ảnh 2 xe cạnh nhau phía trên bảng

**Responsive:**
- Desktop: sidebar cố định bên trái + main content bên phải
- Tablet: sidebar collapse thành horizontal bar
- Mobile: sidebar thành header, tab bar scroll ngang, content full-width

---

## 4. Shared Components

**Navbar:**
- Đã thống nhất: T.R.Y.P brand, tiếng Việt có dấu
- 3 tab: Trang Chủ | Bộ Sưu Tập | Chi Tiết Xe
- Nút "Đặt Lịch Lái Thử"

**Booking Modal:**
- Giữ nguyên modal hiện tại, đã cập nhật text tiếng Việt có dấu
- Dropdown mẫu xe render động từ data

**Footer:**
- Thống nhất: "T.R.Y.P — Phòng trưng bày siêu xe đẳng cấp."

---

## 5. Tech Stack

- HTML5 + Bootstrap 5.3 (grid, modal, navbar)
- CSS custom (base.css, components.css, catalog.css, detail.css)
- jQuery 3.7 (đã có)
- GSAP + ScrollTrigger (animations, scroll-linked effects)
- `<model-viewer>` web component (360° view)
- Vanilla JS render động từ data

---

## 6. File Structure

```
assets/
  js/
    data.js          ← mở rộng thành multi-brand
    catalog.js       ← rewrite: render cards từ data, filter, drag-scroll
    detail.js        ← rewrite: render từ data, tabs, gallery, compare, model-viewer
    main.js          ← shared utils (giữ nguyên)
  css/
    catalog.css      ← rewrite: horizontal strip, brand tabs, responsive
    detail.css       ← rewrite: sidebar layout, tab bar, sections, responsive
    base.css         ← shared (giữ nguyên)
    components.css   ← shared (giữ nguyên)
  html/
    catalog.html     ← simplify HTML, JS renders content
    detail.html      ← simplify HTML, add section containers
  model/             ← .glb files cho 360° view
  img/               ← ảnh xe (hoặc placeholder)
```

---

## 7. Không nằm trong scope

- Backend / API
- User authentication
- Thanh toán / đặt hàng thật
- CMS quản lý xe
- SEO optimization
- i18n (chỉ tiếng Việt)
