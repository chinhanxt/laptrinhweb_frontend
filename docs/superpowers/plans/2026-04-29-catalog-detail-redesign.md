# Catalog & Detail Pages Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign catalog.html (horizontal card strip with brand filter) and detail.html (sticky sidebar + scrollable sections with gallery, specs, 360° model-viewer, and side-by-side compare) — all rendered dynamically from an expanded multi-brand data.js.

**Architecture:** Expand the existing `CARS_DATA` array in `data.js` to include multi-brand entries with images, model3d, and richer specs. Catalog page renders a horizontal scroll strip from this data with brand tab filtering. Detail page uses a split layout (sticky sidebar + main scrollable area) with four tab-linked sections. Both pages use jQuery (already present) for DOM manipulation and GSAP/ScrollTrigger for animations.

**Tech Stack:** HTML5, Bootstrap 5.3, jQuery 3.7, GSAP + ScrollTrigger, `<model-viewer>` web component, CSS custom properties (existing theme in base.css).

---

## File Map

| Action | File | Responsibility |
|--------|------|---------------|
| Modify | `assets/js/data.js` | Expand to multi-brand with images, model3d, gallery, richer specs |
| Rewrite | `assets/html/catalog.html` | Minimal HTML skeleton — JS renders content |
| Rewrite | `assets/js/catalog.js` | Render cards from data, brand filter tabs, drag-scroll |
| Rewrite | `assets/css/catalog.css` | Horizontal strip layout, brand tabs, card styles, responsive |
| Rewrite | `assets/html/detail.html` | Sidebar + section containers skeleton |
| Rewrite | `assets/js/detail.js` | Render from data, tab navigation, gallery, compare, model-viewer |
| Rewrite | `assets/css/detail.css` | Sidebar layout, sticky tab bar, section styles, responsive |

---

## Task 1: Expand data.js to Multi-Brand

**Files:**
- Modify: `assets/js/data.js`

- [ ] **Step 1: Replace CARS_DATA with expanded multi-brand array**

Replace the entire contents of `assets/js/data.js` with:

```js
/* ============================================================
   SHARED CAR DATA — T.R.Y.P Multi-Brand
   Single source of truth for all views
   ============================================================ */
var CARS_DATA = [
  {
    id: "aventador-lp670",
    name: "Aventador LP 670",
    brand: "Lamborghini",
    series: "v12",
    tagline: "Biểu tượng tốc độ tuyệt đối với động cơ V12 tự nhiên, mang đến âm thanh và sức mạnh thuần khiết.",
    specs: {
      hp: 789,
      engine: "V12",
      acceleration: "3.2s",
      topSpeed: "355 km/h",
      price: "26 tỷ VND"
    },
    images: {
      hero: "assets/img/aventador-hero.webp",
      gallery: [
        "assets/img/aventador-exterior.webp",
        "assets/img/aventador-interior.webp",
        "assets/img/aventador-rear.webp",
        "assets/img/aventador-engine.webp"
      ]
    },
    model3d: "assets/model/lambo_lp670.glb",
    modelConfig: {
      cameraOrbit: "325deg 78deg 105%",
      cameraTarget: "0m 0.3m 0m",
      fieldOfView: "28deg"
    }
  },
  {
    id: "huracan-sto",
    name: "Huracán STO",
    brand: "Lamborghini",
    series: "track",
    tagline: "Siêu xe đường đua hợp pháp với khí động học lấy cảm hứng từ xe đua Super Trofeo.",
    specs: {
      hp: 640,
      engine: "V10",
      acceleration: "3.0s",
      topSpeed: "310 km/h",
      price: "21 tỷ VND"
    },
    images: {
      hero: "assets/img/huracan-hero.webp",
      gallery: [
        "assets/img/huracan-exterior.webp",
        "assets/img/huracan-interior.webp",
        "assets/img/huracan-rear.webp"
      ]
    },
    model3d: null,
    modelConfig: null
  },
  {
    id: "revuelto",
    name: "Revuelto",
    brand: "Lamborghini",
    series: "hybrid",
    tagline: "Thế hệ tiếp theo của Lamborghini — kết hợp động cơ V12 và 3 mô-tơ điện cho công suất kỷ lục.",
    specs: {
      hp: 1001,
      engine: "Hybrid V12",
      acceleration: "2.5s",
      topSpeed: "350 km/h",
      price: "19 tỷ VND"
    },
    images: {
      hero: "assets/img/revuelto-hero.webp",
      gallery: [
        "assets/img/revuelto-exterior.webp",
        "assets/img/revuelto-interior.webp",
        "assets/img/revuelto-rear.webp"
      ]
    },
    model3d: null,
    modelConfig: null
  },
  {
    id: "sf90-stradale",
    name: "SF90 Stradale",
    brand: "Ferrari",
    series: "hybrid",
    tagline: "Siêu xe hybrid mạnh nhất của Ferrari với hệ thống plug-in hybrid 3 mô-tơ điện.",
    specs: {
      hp: 986,
      engine: "Hybrid V8",
      acceleration: "2.5s",
      topSpeed: "340 km/h",
      price: "32 tỷ VND"
    },
    images: {
      hero: "assets/img/sf90-hero.webp",
      gallery: [
        "assets/img/sf90-exterior.webp",
        "assets/img/sf90-interior.webp",
        "assets/img/sf90-rear.webp"
      ]
    },
    model3d: "assets/model/2019_ferrari_488_pista_spider.glb",
    modelConfig: {
      cameraOrbit: "325deg 78deg 105%",
      cameraTarget: "0m 0.3m 0m",
      fieldOfView: "28deg"
    }
  },
  {
    id: "roma",
    name: "Roma",
    brand: "Ferrari",
    series: "gt",
    tagline: "Grand Touring đỉnh cao — sự kết hợp hoàn hảo giữa hiệu suất và phong cách La Dolce Vita.",
    specs: {
      hp: 620,
      engine: "V8 Twin-Turbo",
      acceleration: "3.4s",
      topSpeed: "320 km/h",
      price: "22 tỷ VND"
    },
    images: {
      hero: "assets/img/roma-hero.webp",
      gallery: [
        "assets/img/roma-exterior.webp",
        "assets/img/roma-interior.webp",
        "assets/img/roma-rear.webp"
      ]
    },
    model3d: "assets/model/2020_ferrari_roma.glb",
    modelConfig: {
      cameraOrbit: "325deg 78deg 105%",
      cameraTarget: "0m 0.3m 0m",
      fieldOfView: "28deg"
    }
  },
  {
    id: "750s",
    name: "750S",
    brand: "McLaren",
    series: "super",
    tagline: "Siêu phẩm siêu nhẹ với cấu trúc carbon và hiệu suất vượt trội trên mọi cung đường.",
    specs: {
      hp: 750,
      engine: "V8 Twin-Turbo",
      acceleration: "2.8s",
      topSpeed: "332 km/h",
      price: "24 tỷ VND"
    },
    images: {
      hero: "assets/img/750s-hero.webp",
      gallery: [
        "assets/img/750s-exterior.webp",
        "assets/img/750s-interior.webp",
        "assets/img/750s-rear.webp"
      ]
    },
    model3d: null,
    modelConfig: null
  },
  {
    id: "911-gt3-rs",
    name: "911 GT3 RS",
    brand: "Porsche",
    series: "track",
    tagline: "Cỗ máy đường đua thuần chủng mang đẳng cấp motorsport lên từng cung đường phố.",
    specs: {
      hp: 525,
      engine: "Flat-6",
      acceleration: "3.2s",
      topSpeed: "296 km/h",
      price: "18 tỷ VND"
    },
    images: {
      hero: "assets/img/gt3rs-hero.webp",
      gallery: [
        "assets/img/gt3rs-exterior.webp",
        "assets/img/gt3rs-interior.webp",
        "assets/img/gt3rs-rear.webp"
      ]
    },
    model3d: null,
    modelConfig: null
  }
];

/* Helper: find car by ID */
function getCarById(id) {
  for (var i = 0; i < CARS_DATA.length; i++) {
    if (CARS_DATA[i].id === id) return CARS_DATA[i];
  }
  return null;
}

/* Helper: get unique brand list */
function getBrands() {
  var seen = {};
  var brands = [];
  for (var i = 0; i < CARS_DATA.length; i++) {
    var b = CARS_DATA[i].brand;
    if (!seen[b]) {
      seen[b] = true;
      brands.push(b);
    }
  }
  return brands;
}
```

- [ ] **Step 2: Verify data.js loads without errors**

Open `index.html` in browser, open DevTools console, type `CARS_DATA.length` — should return `7`. Type `getBrands()` — should return `["Lamborghini", "Ferrari", "McLaren", "Porsche"]`. Type `getCarById("sf90-stradale").specs.hp` — should return `986`.

- [ ] **Step 3: Commit**

```bash
git add assets/js/data.js
git commit -m "feat: expand data.js to multi-brand with images, model3d, and helpers"
```

---

## Task 2: Rewrite catalog.html — Minimal HTML Skeleton

**Files:**
- Rewrite: `assets/html/catalog.html`

- [ ] **Step 1: Replace catalog.html with minimal skeleton**

Replace the entire contents of `assets/html/catalog.html` with:

```html
<!DOCTYPE html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>T.R.Y.P | Bộ Sưu Tập</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cormorant+Garamond:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap"
      rel="stylesheet"
    />
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" />
    <link rel="stylesheet" href="../css/base.css" />
    <link rel="stylesheet" href="../css/components.css" />
    <link rel="stylesheet" href="../css/catalog.css" />
  </head>
  <body>
    <!-- HEADER -->
    <header>
      <nav class="navbar navbar-expand-lg site-header">
        <div class="container-luxury">
          <a class="navbar-brand" href="../../index.html">T.R.Y.P<span>.</span></a>
          <button class="navbar-toggler border-0 text-white" type="button" data-bs-toggle="collapse" data-bs-target="#siteNav" aria-controls="siteNav" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="siteNav">
            <ul class="navbar-nav mx-auto mb-2 mb-lg-0 gap-lg-4">
              <li class="nav-item"><a class="nav-link" href="../../index.html">Trang Chủ</a></li>
              <li class="nav-item"><a class="nav-link active" href="catalog.html">Bộ Sưu Tập</a></li>
              <li class="nav-item"><a class="nav-link" href="detail.html">Chi Tiết Xe</a></li>
            </ul>
            <a class="btn-luxury" href="#" data-bs-toggle="modal" data-bs-target="#bookingModal">Đặt Lịch Lái Thử</a>
          </div>
        </div>
      </nav>
    </header>

    <main>
      <!-- HERO -->
      <section class="catalog-hero">
        <div class="container-luxury text-center">
          <p class="section-kicker justify-content-center">T.R.Y.P Collection</p>
          <h1 class="section-title">Bộ Sưu Tập <em>Siêu Xe</em></h1>
          <p class="catalog-hero__sub">Khám phá những kiệt tác cơ khí được chế tác cho tốc độ và phong cách.</p>
        </div>
      </section>

      <!-- BRAND FILTER TABS — JS renders tab buttons -->
      <section class="catalog-filters">
        <div class="container-luxury">
          <div class="catalog-tabs" id="catalog-tabs"></div>
        </div>
      </section>

      <!-- HORIZONTAL CARD STRIP — JS renders cards -->
      <section class="catalog-strip-section">
        <div class="catalog-strip" id="catalog-strip"></div>
        <p class="catalog-empty" id="catalog-empty">Không tìm thấy xe phù hợp.</p>
      </section>
    </main>

    <!-- BOOKING MODAL -->
    <div class="modal fade" id="bookingModal" tabindex="-1" aria-labelledby="bookingModalTitle" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content showroom-modal">
          <div class="modal-header showroom-modal__header">
            <h5 class="modal-title showroom-modal__title" id="bookingModalTitle">Đặt Lịch Lái Thử</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body showroom-modal__body">
            <form id="bookingForm">
              <div class="mb-3">
                <label for="bookingName" class="form-label" style="font-family:'Space Mono',monospace;font-size:0.65rem;letter-spacing:0.15em;text-transform:uppercase;color:var(--color-silver);">Họ và tên</label>
                <input type="text" class="form-control" id="bookingName" style="background:rgba(15,15,20,0.92);border:1px solid var(--color-line);color:var(--color-text);border-radius:0;" placeholder="Nhập họ tên">
              </div>
              <div class="mb-3">
                <label for="bookingPhone" class="form-label" style="font-family:'Space Mono',monospace;font-size:0.65rem;letter-spacing:0.15em;text-transform:uppercase;color:var(--color-silver);">Số điện thoại</label>
                <input type="tel" class="form-control" id="bookingPhone" style="background:rgba(15,15,20,0.92);border:1px solid var(--color-line);color:var(--color-text);border-radius:0;" placeholder="Nhập số điện thoại">
              </div>
              <div class="mb-3">
                <label for="bookingCar" class="form-label" style="font-family:'Space Mono',monospace;font-size:0.65rem;letter-spacing:0.15em;text-transform:uppercase;color:var(--color-silver);">Mẫu xe quan tâm</label>
                <select class="form-select catalog-select" id="bookingCar"></select>
              </div>
            </form>
          </div>
          <div class="modal-footer showroom-modal__footer">
            <button type="button" class="btn-luxury-outline" data-bs-dismiss="modal">Đóng</button>
            <button type="button" class="btn-luxury" id="bookingSubmit">Gửi yêu cầu</button>
          </div>
        </div>
      </div>
    </div>

    <!-- FOOTER -->
    <footer>
      <div class="site-footer">
        <div class="container-luxury d-flex flex-column flex-lg-row justify-content-between gap-3">
          <p class="mb-0">T.R.Y.P — Phòng trưng bày siêu xe đẳng cấp.</p>
          <p class="mb-0">Multi-brand collection | Frontend-only experience</p>
        </div>
      </div>
    </footer>

    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="../js/data.js"></script>
    <script src="../js/main.js"></script>
    <script src="../js/catalog.js"></script>
  </body>
</html>
```

- [ ] **Step 2: Verify HTML renders without JS errors**

Open `catalog.html` in browser. Page should show header, hero section, and empty card area. No console errors.

- [ ] **Step 3: Commit**

```bash
git add assets/html/catalog.html
git commit -m "feat: rewrite catalog.html as minimal JS-driven skeleton"
```

---

## Task 3: Rewrite catalog.css — Horizontal Strip Layout

**Files:**
- Rewrite: `assets/css/catalog.css`

- [ ] **Step 1: Replace catalog.css with horizontal strip styles**

Replace the entire contents of `assets/css/catalog.css` with:

```css
/* ============================================================
   CATALOG PAGE — T.R.Y.P
   Horizontal card strip, brand filter tabs
   ============================================================ */

/* HERO */
.catalog-hero {
  padding: 8rem 0 2rem;
  text-align: center;
}
.catalog-hero__sub {
  font-family: "Cormorant Garamond", serif;
  font-size: 1.15rem;
  color: var(--color-muted);
  margin-top: 1rem;
  max-width: 520px;
  margin-inline: auto;
}

/* BRAND FILTER TABS */
.catalog-filters {
  padding: 1rem 0 2rem;
}
.catalog-tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid var(--color-line);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.catalog-tabs::-webkit-scrollbar {
  display: none;
}
.catalog-tab {
  flex-shrink: 0;
  padding: 0.75rem 1.5rem;
  font-family: "Space Mono", monospace;
  font-size: 0.6rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-silver);
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: color 0.3s ease, border-color 0.3s ease;
  white-space: nowrap;
}
.catalog-tab:hover {
  color: var(--color-text);
}
.catalog-tab.is-active {
  color: var(--color-gold);
  border-bottom-color: var(--color-gold);
}

/* HORIZONTAL CARD STRIP */
.catalog-strip-section {
  padding: 0 0 5rem;
  position: relative;
}
.catalog-strip {
  display: flex;
  gap: 1.5rem;
  padding: 1rem calc((100vw - var(--container-max)) / 2 + 16px);
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  cursor: grab;
  scrollbar-width: none;
}
.catalog-strip::-webkit-scrollbar {
  display: none;
}
.catalog-strip:active {
  cursor: grabbing;
}

/* CATALOG CARD */
.catalog-card {
  flex-shrink: 0;
  width: 340px;
  scroll-snap-align: start;
  background: rgba(15, 15, 20, 0.92);
  border: 1px solid var(--color-line);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.5s var(--ease-luxury), border-color 0.4s ease, box-shadow 0.4s ease;
}
.catalog-card:hover {
  transform: translateY(-6px);
  border-color: rgba(201, 168, 76, 0.35);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(201, 168, 76, 0.12);
}

/* Card image area */
.catalog-card__media {
  position: relative;
  height: 220px;
  background: linear-gradient(135deg, #0d0d14, #14141e, #0d0d14);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.catalog-card__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.catalog-card__media-placeholder {
  font-family: "Bebas Neue", sans-serif;
  font-size: 1.4rem;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.1);
}
.catalog-card__badge {
  position: absolute;
  top: 12px;
  left: 12px;
  font-family: "Space Mono", monospace;
  font-size: 0.5rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  padding: 3px 10px;
  background: rgba(201, 168, 76, 0.15);
  color: var(--color-gold);
}

/* Card body */
.catalog-card__body {
  padding: 1.25rem 1.5rem 1rem;
  flex: 1;
}
.catalog-card__name {
  font-family: "Bebas Neue", sans-serif;
  font-size: 1.6rem;
  letter-spacing: 0.04em;
  color: var(--color-text);
  line-height: 1.1;
  margin-bottom: 0.75rem;
}
.catalog-card__specs {
  display: flex;
  gap: 1rem;
  font-family: "Space Mono", monospace;
  font-size: 0.6rem;
  letter-spacing: 0.12em;
  color: var(--color-mono);
  text-transform: uppercase;
  padding-top: 0.75rem;
  border-top: 1px solid var(--color-line);
}

/* Card footer */
.catalog-card__footer {
  padding: 0.75rem 1.5rem 1.25rem;
}

/* Empty state */
.catalog-empty {
  display: none;
  text-align: center;
  font-family: "Space Mono", monospace;
  font-size: 0.8rem;
  letter-spacing: 0.1em;
  color: var(--color-silver);
  padding: 3rem 0;
}

/* BOOKING MODAL (shared) */
.showroom-modal {
  background: #0d0d12;
  border: 1px solid rgba(201, 168, 76, 0.25);
  border-radius: var(--radius-card);
  color: var(--color-text);
}
.showroom-modal__header {
  border-bottom: 1px solid var(--color-line);
  padding: 1.2rem 1.5rem;
}
.showroom-modal__title {
  font-family: "Bebas Neue", sans-serif;
  font-size: 1.8rem;
  letter-spacing: 0.06em;
  color: var(--color-text);
}
.showroom-modal__body {
  padding: 1.5rem;
  font-family: "Cormorant Garamond", serif;
  font-size: 1.05rem;
  color: var(--color-muted);
  line-height: 1.7;
}
.showroom-modal__footer {
  border-top: 1px solid var(--color-line);
  padding: 1rem 1.5rem;
}
.catalog-select {
  background-color: rgba(15, 15, 20, 0.92);
  color: var(--color-text);
  border: 1px solid var(--color-line);
  border-radius: 0;
  font-family: "Space Mono", monospace;
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  padding: 0.55rem 2.2rem 0.55rem 0.8rem;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23c9a84c' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.6rem center;
  background-size: 12px;
  appearance: none;
}
.catalog-select:focus {
  border-color: var(--color-gold);
  box-shadow: 0 0 0 2px rgba(201, 168, 76, 0.15);
  outline: none;
  background-color: rgba(15, 15, 20, 0.92);
  color: var(--color-text);
}
.catalog-select option {
  background: #0d0d12;
  color: var(--color-text);
}

/* RESPONSIVE */
@media (max-width: 991.98px) {
  .catalog-hero { padding-top: 7rem; }
  .catalog-card { width: 300px; }
  .catalog-strip {
    padding-left: 16px;
    padding-right: 16px;
  }
}
@media (max-width: 575.98px) {
  .catalog-hero { padding: 7rem 0 1.5rem; }
  .catalog-card { width: 280px; }
  .catalog-card__media { height: 180px; }
  .catalog-card__name { font-size: 1.3rem; }
}
```

- [ ] **Step 2: Verify styles load correctly**

Open `catalog.html` in browser. Hero section should display styled with dark luxury theme. No broken styles or console errors.

- [ ] **Step 3: Commit**

```bash
git add assets/css/catalog.css
git commit -m "feat: rewrite catalog.css for horizontal strip layout"
```

---

## Task 4: Rewrite catalog.js — Dynamic Rendering + Brand Filter + Drag Scroll

**Files:**
- Rewrite: `assets/js/catalog.js`

- [ ] **Step 1: Replace catalog.js with dynamic rendering logic**

Replace the entire contents of `assets/js/catalog.js` with:

```js
/* ============================================================
   CATALOG — Dynamic Card Rendering, Brand Tabs, Drag Scroll
   ============================================================ */
$(function () {
  var $tabs = $("#catalog-tabs");
  var $strip = $("#catalog-strip");
  var $empty = $("#catalog-empty");
  var $bookingCar = $("#bookingCar");
  var activeBrand = "all";

  function init() {
    renderTabs();
    renderCards(CARS_DATA);
    renderBookingOptions();
    initDragScroll();
  }

  function renderTabs() {
    var brands = getBrands();
    var html = '<button class="catalog-tab is-active" data-brand="all">Tất cả</button>';
    for (var i = 0; i < brands.length; i++) {
      html += '<button class="catalog-tab" data-brand="' + brands[i] + '">' + brands[i] + '</button>';
    }
    $tabs.html(html);

    $tabs.on("click", ".catalog-tab", function () {
      var $btn = $(this);
      activeBrand = $btn.data("brand");
      $tabs.find(".catalog-tab").removeClass("is-active");
      $btn.addClass("is-active");
      filterCards();
    });
  }

  function renderCards(cars) {
    var html = "";
    for (var i = 0; i < cars.length; i++) {
      var car = cars[i];
      var imgHtml = car.images && car.images.hero
        ? '<img src="' + car.images.hero + '" alt="' + car.name + '" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">' +
          '<span class="catalog-card__media-placeholder" style="display:none;position:absolute;inset:0;align-items:center;justify-content:center;">' + car.name + '</span>'
        : '<span class="catalog-card__media-placeholder">' + car.name + '</span>';

      html +=
        '<div class="catalog-card" data-brand="' + car.brand + '">' +
          '<div class="catalog-card__media">' +
            imgHtml +
            '<span class="catalog-card__badge">' + car.brand + '</span>' +
          '</div>' +
          '<div class="catalog-card__body">' +
            '<h3 class="catalog-card__name">' + car.name + '</h3>' +
            '<div class="catalog-card__specs">' +
              '<span>' + car.specs.hp + ' HP</span>' +
              '<span>' + car.specs.engine + '</span>' +
              '<span>' + car.specs.price + '</span>' +
            '</div>' +
          '</div>' +
          '<div class="catalog-card__footer">' +
            '<a href="detail.html?car=' + car.id + '" class="btn-luxury-outline btn-luxury--arrow">Xem chi tiết</a>' +
          '</div>' +
        '</div>';
    }
    $strip.html(html);
  }

  function filterCards() {
    var $cards = $strip.find(".catalog-card");
    var visible = 0;

    $cards.each(function () {
      var $card = $(this);
      var match = activeBrand === "all" || $card.data("brand") === activeBrand;
      if (match) {
        $card.css({ display: "flex", opacity: 1 });
        visible++;
      } else {
        $card.css({ display: "none", opacity: 0 });
      }
    });

    if (visible === 0) {
      $empty.css("display", "block");
    } else {
      $empty.css("display", "none");
    }

    $strip[0].scrollLeft = 0;
  }

  function renderBookingOptions() {
    var html = '<option value="">Chọn mẫu xe</option>';
    for (var i = 0; i < CARS_DATA.length; i++) {
      html += '<option value="' + CARS_DATA[i].id + '">' + CARS_DATA[i].brand + ' ' + CARS_DATA[i].name + '</option>';
    }
    $bookingCar.html(html);
  }

  function initDragScroll() {
    var el = $strip[0];
    var isDown = false;
    var startX, scrollLeft;

    el.addEventListener("mousedown", function (e) {
      if (e.target.closest("a, button")) return;
      isDown = true;
      el.style.cursor = "grabbing";
      startX = e.pageX - el.offsetLeft;
      scrollLeft = el.scrollLeft;
    });
    el.addEventListener("mouseleave", function () {
      isDown = false;
      el.style.cursor = "grab";
    });
    el.addEventListener("mouseup", function () {
      isDown = false;
      el.style.cursor = "grab";
    });
    el.addEventListener("mousemove", function (e) {
      if (!isDown) return;
      e.preventDefault();
      var x = e.pageX - el.offsetLeft;
      var walk = (x - startX) * 1.5;
      el.scrollLeft = scrollLeft - walk;
    });
  }

  init();
});
```

- [ ] **Step 2: Verify catalog page renders correctly**

Open `catalog.html` in browser:
1. Brand tabs should appear: "Tất cả", "Lamborghini", "Ferrari", "McLaren", "Porsche"
2. 7 cards should display in a horizontal scroll strip
3. Clicking "Ferrari" tab should show only 2 cards (SF90 Stradale, Roma)
4. Clicking "Tất cả" shows all 7 cards again
5. Drag-scroll with mouse should work on the strip
6. "Xem chi tiết" link should navigate to `detail.html?car={id}`
7. Booking modal dropdown should list all cars

- [ ] **Step 3: Commit**

```bash
git add assets/js/catalog.js
git commit -m "feat: rewrite catalog.js with dynamic rendering, brand filter, drag scroll"
```

---

## Task 5: Rewrite detail.html — Sidebar + Section Skeleton

**Files:**
- Rewrite: `assets/html/detail.html`

- [ ] **Step 1: Replace detail.html with sidebar + sections skeleton**

Replace the entire contents of `assets/html/detail.html` with:

```html
<!DOCTYPE html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>T.R.Y.P | Chi Tiết Xe</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cormorant+Garamond:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap"
      rel="stylesheet"
    />
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" />
    <link rel="stylesheet" href="../css/base.css" />
    <link rel="stylesheet" href="../css/components.css" />
    <link rel="stylesheet" href="../css/detail.css" />
  </head>
  <body>
    <!-- HEADER -->
    <header>
      <nav class="navbar navbar-expand-lg site-header">
        <div class="container-luxury">
          <a class="navbar-brand" href="../../index.html">T.R.Y.P<span>.</span></a>
          <button class="navbar-toggler border-0 text-white" type="button" data-bs-toggle="collapse" data-bs-target="#siteNav" aria-controls="siteNav" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="siteNav">
            <ul class="navbar-nav mx-auto mb-2 mb-lg-0 gap-lg-4">
              <li class="nav-item"><a class="nav-link" href="../../index.html">Trang Chủ</a></li>
              <li class="nav-item"><a class="nav-link" href="catalog.html">Bộ Sưu Tập</a></li>
              <li class="nav-item"><a class="nav-link active" href="detail.html">Chi Tiết Xe</a></li>
            </ul>
            <a class="btn-luxury" href="#" data-bs-toggle="modal" data-bs-target="#bookingModal">Đặt Lịch Lái Thử</a>
          </div>
        </div>
      </nav>
    </header>

    <main class="detail-layout">
      <!-- SIDEBAR — JS populates -->
      <aside class="detail-sidebar" id="detail-sidebar"></aside>

      <!-- MAIN CONTENT -->
      <div class="detail-main">
        <!-- HERO — JS populates -->
        <section class="detail-hero" id="detail-hero"></section>

        <!-- STICKY TAB BAR -->
        <nav class="detail-tabs" id="detail-tabs">
          <button class="detail-tab is-active" data-target="section-gallery">Gallery</button>
          <button class="detail-tab" data-target="section-specs">Thông Số</button>
          <button class="detail-tab" data-target="section-360">360° View</button>
          <button class="detail-tab" data-target="section-compare">So Sánh</button>
        </nav>

        <!-- SECTIONS — JS populates content -->
        <section class="detail-section" id="section-gallery"></section>
        <section class="detail-section" id="section-specs"></section>
        <section class="detail-section" id="section-360"></section>
        <section class="detail-section" id="section-compare"></section>
      </div>
    </main>

    <!-- BOOKING MODAL -->
    <div class="modal fade" id="bookingModal" tabindex="-1" aria-labelledby="bookingModalTitle" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content showroom-modal">
          <div class="modal-header showroom-modal__header">
            <h5 class="modal-title showroom-modal__title" id="bookingModalTitle">Đặt Lịch Lái Thử</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body showroom-modal__body">
            <form id="bookingForm">
              <div class="mb-3">
                <label for="bookingName" class="form-label" style="font-family:'Space Mono',monospace;font-size:0.65rem;letter-spacing:0.15em;text-transform:uppercase;color:var(--color-silver);">Họ và tên</label>
                <input type="text" class="form-control" id="bookingName" style="background:rgba(15,15,20,0.92);border:1px solid var(--color-line);color:var(--color-text);border-radius:0;" placeholder="Nhập họ tên">
              </div>
              <div class="mb-3">
                <label for="bookingPhone" class="form-label" style="font-family:'Space Mono',monospace;font-size:0.65rem;letter-spacing:0.15em;text-transform:uppercase;color:var(--color-silver);">Số điện thoại</label>
                <input type="tel" class="form-control" id="bookingPhone" style="background:rgba(15,15,20,0.92);border:1px solid var(--color-line);color:var(--color-text);border-radius:0;" placeholder="Nhập số điện thoại">
              </div>
              <div class="mb-3">
                <label for="bookingCar" class="form-label" style="font-family:'Space Mono',monospace;font-size:0.65rem;letter-spacing:0.15em;text-transform:uppercase;color:var(--color-silver);">Mẫu xe quan tâm</label>
                <select class="form-select catalog-select" id="bookingCar"></select>
              </div>
            </form>
          </div>
          <div class="modal-footer showroom-modal__footer">
            <button type="button" class="btn-luxury-outline" data-bs-dismiss="modal">Đóng</button>
            <button type="button" class="btn-luxury" id="bookingSubmit">Gửi yêu cầu</button>
          </div>
        </div>
      </div>
    </div>

    <!-- FOOTER -->
    <footer>
      <div class="site-footer">
        <div class="container-luxury d-flex flex-column flex-lg-row justify-content-between gap-3">
          <p class="mb-0">T.R.Y.P — Phòng trưng bày siêu xe đẳng cấp.</p>
          <p class="mb-0">Multi-brand collection | Frontend-only experience</p>
        </div>
      </div>
    </footer>

    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js"></script>
    <script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js"></script>
    <script src="../js/data.js"></script>
    <script src="../js/main.js"></script>
    <script src="../js/detail.js"></script>
  </body>
</html>
```

- [ ] **Step 2: Verify HTML renders without errors**

Open `detail.html` in browser. Header, empty main area, and footer should display. No console errors.

- [ ] **Step 3: Commit**

```bash
git add assets/html/detail.html
git commit -m "feat: rewrite detail.html with sidebar + section skeleton"
```

---

## Task 6: Rewrite detail.css — Sidebar + Tabs + Sections

**Files:**
- Rewrite: `assets/css/detail.css`

- [ ] **Step 1: Replace detail.css with sidebar layout styles**

Replace the entire contents of `assets/css/detail.css` with:

```css
/* ============================================================
   DETAIL PAGE — T.R.Y.P
   Sidebar + scrollable sections with tab bar
   ============================================================ */

/* LAYOUT */
.detail-layout {
  display: flex;
  min-height: 100vh;
  padding-top: 70px;
}

/* SIDEBAR */
.detail-sidebar {
  width: 260px;
  flex-shrink: 0;
  position: sticky;
  top: 70px;
  height: calc(100vh - 70px);
  padding: 2.5rem 1.5rem;
  background: rgba(10, 10, 15, 0.98);
  border-right: 1px solid var(--color-line);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}
.sidebar__kicker {
  font-family: "Space Mono", monospace;
  font-size: 0.5rem;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--color-gold);
  margin-bottom: 0.25rem;
}
.sidebar__title {
  font-family: "Cormorant Garamond", serif;
  font-size: 1.6rem;
  font-weight: 500;
  color: var(--color-text);
  line-height: 1.2;
  margin-bottom: 1.5rem;
}
.sidebar__specs {
  font-family: "Space Mono", monospace;
  font-size: 0.6rem;
  letter-spacing: 0.08em;
  color: var(--color-silver);
  line-height: 2.2;
}
.sidebar__specs strong {
  color: var(--color-text);
  font-weight: 400;
}
.sidebar__price {
  font-family: "Bebas Neue", sans-serif;
  font-size: 1.4rem;
  color: var(--color-gold);
  margin-top: 1rem;
  margin-bottom: 1.5rem;
}
.sidebar__actions {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.sidebar__actions .btn-luxury,
.sidebar__actions .btn-luxury-outline {
  width: 100%;
  justify-content: center;
  font-size: 0.55rem;
  padding: 0.6rem 1rem;
}

/* MAIN CONTENT */
.detail-main {
  flex: 1;
  min-width: 0;
}

/* HERO */
.detail-hero {
  height: 50vh;
  min-height: 360px;
  background: linear-gradient(135deg, #0d0d14, #14141e, #0d0d14);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}
.detail-hero img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.detail-hero__placeholder {
  font-family: "Bebas Neue", sans-serif;
  font-size: 2rem;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.08);
}

/* STICKY TAB BAR */
.detail-tabs {
  position: sticky;
  top: 70px;
  z-index: 100;
  display: flex;
  background: rgba(10, 10, 15, 0.97);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--color-line);
  overflow-x: auto;
  scrollbar-width: none;
}
.detail-tabs::-webkit-scrollbar {
  display: none;
}
.detail-tab {
  flex-shrink: 0;
  padding: 0.85rem 1.5rem;
  font-family: "Space Mono", monospace;
  font-size: 0.6rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-silver);
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: color 0.3s ease, border-color 0.3s ease;
  white-space: nowrap;
}
.detail-tab:hover {
  color: var(--color-text);
}
.detail-tab.is-active {
  color: var(--color-gold);
  border-bottom-color: var(--color-gold);
}

/* SECTIONS */
.detail-section {
  padding: 4rem 2.5rem;
  min-height: 400px;
}
.detail-section + .detail-section {
  border-top: 1px solid var(--color-line);
}

/* SECTION: Gallery */
.gallery-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  grid-template-rows: auto;
  gap: 8px;
}
.gallery-main {
  grid-row: 1 / 4;
  min-height: 360px;
  background: rgba(201, 168, 76, 0.04);
  border: 1px solid var(--color-line);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  cursor: pointer;
  position: relative;
}
.gallery-main img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.gallery-thumb {
  min-height: 115px;
  background: rgba(201, 168, 76, 0.03);
  border: 1px solid var(--color-line);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.3s ease;
}
.gallery-thumb:hover,
.gallery-thumb.is-active {
  border-color: var(--color-gold);
}
.gallery-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.gallery-placeholder {
  font-family: "Space Mono", monospace;
  font-size: 0.6rem;
  letter-spacing: 0.15em;
  color: var(--color-silver);
  opacity: 0.4;
}

/* Lightbox */
.gallery-lightbox {
  display: none;
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(5, 5, 8, 0.95);
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.gallery-lightbox.is-open {
  display: flex;
}
.gallery-lightbox img {
  max-width: 90vw;
  max-height: 90vh;
  object-fit: contain;
}

/* SECTION: Specs */
.specs-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}
.spec-tile {
  background: var(--color-bg-alt);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-card);
  padding: 2rem 1.5rem;
  text-align: center;
  transition: border-color 0.3s ease, transform 0.4s var(--ease-luxury);
}
.spec-tile:hover {
  border-color: rgba(201, 168, 76, 0.25);
  transform: translateY(-4px);
}
.spec-tile__value {
  font-family: "Bebas Neue", sans-serif;
  font-size: 2.5rem;
  letter-spacing: 0.04em;
  color: var(--color-gold);
  line-height: 1;
  margin-bottom: 0.5rem;
}
.spec-tile__label {
  font-family: "Space Mono", monospace;
  font-size: 0.55rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-muted);
}

/* SECTION: 360 View */
.view360-container {
  width: 100%;
  height: 500px;
  background: linear-gradient(135deg, #0d0d14, #14141e);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-card);
  overflow: hidden;
  position: relative;
}
.view360-container model-viewer {
  width: 100%;
  height: 100%;
}
.view360-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-family: "Space Mono", monospace;
  font-size: 0.75rem;
  letter-spacing: 0.15em;
  color: var(--color-silver);
}

/* SECTION: Compare */
.compare-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}
.compare-header label {
  font-family: "Space Mono", monospace;
  font-size: 0.6rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--color-silver);
}
.compare-cars {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}
.compare-car-visual {
  height: 200px;
  background: rgba(201, 168, 76, 0.03);
  border: 1px solid var(--color-line);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.compare-car-visual img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.compare-car-name {
  font-family: "Bebas Neue", sans-serif;
  font-size: 1.3rem;
  color: var(--color-text);
  text-align: center;
  margin-top: 0.75rem;
}
.compare-table {
  width: 100%;
  border-collapse: collapse;
}
.compare-table th,
.compare-table td {
  padding: 0.85rem 1rem;
  border-bottom: 1px solid var(--color-line);
  font-family: "Space Mono", monospace;
  font-size: 0.65rem;
  letter-spacing: 0.08em;
}
.compare-table th {
  text-transform: uppercase;
  color: var(--color-silver);
  font-weight: 400;
  text-align: left;
  width: 30%;
}
.compare-table td {
  color: var(--color-text);
  text-align: center;
}
.compare-table td.is-better {
  color: var(--color-gold);
}
.compare-placeholder {
  text-align: center;
  font-family: "Space Mono", monospace;
  font-size: 0.75rem;
  color: var(--color-silver);
  padding: 3rem 0;
}

/* RESPONSIVE */
@media (max-width: 991.98px) {
  .detail-layout {
    flex-direction: column;
  }
  .detail-sidebar {
    width: 100%;
    position: relative;
    top: auto;
    height: auto;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem;
    border-right: none;
    border-bottom: 1px solid var(--color-line);
  }
  .sidebar__title { font-size: 1.3rem; margin-bottom: 0; }
  .sidebar__specs { display: flex; gap: 1.5rem; flex-wrap: wrap; line-height: 1.6; }
  .sidebar__price { margin: 0; font-size: 1.1rem; }
  .sidebar__actions {
    flex-direction: row;
    margin-top: 0;
  }
  .sidebar__actions .btn-luxury,
  .sidebar__actions .btn-luxury-outline {
    width: auto;
  }
  .detail-tabs { top: 0; }
  .detail-hero { height: 40vh; min-height: 280px; }
  .detail-section { padding: 3rem 1.5rem; }
  .specs-grid { grid-template-columns: repeat(2, 1fr); }
  .compare-cars { grid-template-columns: 1fr 1fr; gap: 1rem; }
}
@media (max-width: 575.98px) {
  .detail-sidebar { flex-direction: column; align-items: flex-start; }
  .sidebar__actions { flex-direction: column; width: 100%; }
  .sidebar__actions .btn-luxury,
  .sidebar__actions .btn-luxury-outline { width: 100%; }
  .detail-hero { height: 35vh; min-height: 220px; }
  .detail-section { padding: 2.5rem 1rem; }
  .gallery-grid { grid-template-columns: 1fr; }
  .gallery-main { min-height: 250px; grid-row: auto; }
  .gallery-thumb { min-height: 80px; }
  .specs-grid { grid-template-columns: 1fr 1fr; gap: 1rem; }
  .spec-tile__value { font-size: 2rem; }
  .view360-container { height: 350px; }
  .compare-cars { grid-template-columns: 1fr; }
  .compare-table th, .compare-table td { padding: 0.6rem 0.5rem; font-size: 0.55rem; }
}
```

- [ ] **Step 2: Verify styles load correctly**

Open `detail.html` in browser. Sidebar area and main content area should display in a side-by-side layout on desktop. Tab bar should be visible. No broken styles.

- [ ] **Step 3: Commit**

```bash
git add assets/css/detail.css
git commit -m "feat: rewrite detail.css with sidebar, tab bar, and section styles"
```

---

## Task 7: Rewrite detail.js — Full Dynamic Rendering

**Files:**
- Rewrite: `assets/js/detail.js`

- [ ] **Step 1: Replace detail.js with full dynamic rendering**

Replace the entire contents of `assets/js/detail.js` with:

```js
/* ============================================================
   DETAIL — Dynamic Rendering: Sidebar, Hero, Gallery, Specs,
   360° Model Viewer, Compare
   ============================================================ */
$(function () {
  var carId = new URLSearchParams(window.location.search).get("car");
  var car = getCarById(carId) || CARS_DATA[0];
  var basePath = window.location.pathname.indexOf("/assets/html/") !== -1 ? "" : "assets/html/";

  document.title = "T.R.Y.P | " + car.name;

  renderSidebar(car);
  renderHero(car);
  renderGallery(car);
  renderSpecs(car);
  render360(car);
  renderCompare(car);
  renderBookingOptions();
  initTabs();
  initAnimations();

  /* ---- SIDEBAR ---- */
  function renderSidebar(car) {
    var html =
      '<span class="sidebar__kicker">' + car.brand + '</span>' +
      '<h1 class="sidebar__title">' + car.name + '</h1>' +
      '<div class="sidebar__specs">' +
        'Công suất: <strong>' + car.specs.hp + ' HP</strong><br>' +
        '0-100 km/h: <strong>' + car.specs.acceleration + '</strong><br>' +
        'Tốc độ tối đa: <strong>' + car.specs.topSpeed + '</strong><br>' +
        'Động cơ: <strong>' + car.specs.engine + '</strong>' +
      '</div>' +
      '<div class="sidebar__price">' + car.specs.price + '</div>' +
      '<div class="sidebar__actions">' +
        '<a class="btn-luxury" href="#" data-bs-toggle="modal" data-bs-target="#bookingModal">Đặt Lịch Lái Thử</a>' +
        '<a class="btn-luxury-outline" href="catalog.html">← Quay lại BST</a>' +
      '</div>';
    $("#detail-sidebar").html(html);
  }

  /* ---- HERO ---- */
  function renderHero(car) {
    var imgSrc = car.images && car.images.hero;
    var html = imgSrc
      ? '<img src="' + imgSrc + '" alt="' + car.name + '" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">' +
        '<span class="detail-hero__placeholder" style="display:none;position:absolute;inset:0;align-items:center;justify-content:center;">' + car.name + '</span>'
      : '<span class="detail-hero__placeholder">' + car.name + '</span>';
    $("#detail-hero").html(html);
  }

  /* ---- GALLERY ---- */
  function renderGallery(car) {
    var gallery = (car.images && car.images.gallery) || [];
    var $section = $("#section-gallery");

    if (gallery.length === 0) {
      $section.html(
        '<p class="section-kicker">Gallery</p>' +
        '<div class="gallery-grid">' +
          '<div class="gallery-main"><span class="gallery-placeholder">Chưa có hình ảnh</span></div>' +
        '</div>'
      );
      return;
    }

    var thumbsHtml = "";
    for (var i = 0; i < gallery.length; i++) {
      var activeClass = i === 0 ? " is-active" : "";
      thumbsHtml +=
        '<div class="gallery-thumb' + activeClass + '" data-index="' + i + '">' +
          '<img src="' + gallery[i] + '" alt="' + car.name + ' ' + (i + 1) + '" onerror="this.style.display=\'none\'">' +
          '<span class="gallery-placeholder" style="display:none;">Ảnh ' + (i + 1) + '</span>' +
        '</div>';
    }

    var html =
      '<p class="section-kicker">Gallery</p>' +
      '<div class="gallery-grid">' +
        '<div class="gallery-main" id="gallery-main">' +
          '<img src="' + gallery[0] + '" alt="' + car.name + '" onerror="this.style.display=\'none\'">' +
          '<span class="gallery-placeholder" style="display:none;">' + car.name + '</span>' +
        '</div>' +
        thumbsHtml +
      '</div>' +
      '<div class="gallery-lightbox" id="gallery-lightbox">' +
        '<img src="" alt="Lightbox">' +
      '</div>';

    $section.html(html);

    $section.on("click", ".gallery-thumb", function () {
      var idx = $(this).data("index");
      var src = gallery[idx];
      $section.find(".gallery-thumb").removeClass("is-active");
      $(this).addClass("is-active");
      $("#gallery-main").find("img").attr("src", src);
    });

    $section.on("click", "#gallery-main", function () {
      var src = $(this).find("img").attr("src");
      if (src) {
        $("#gallery-lightbox").find("img").attr("src", src);
        $("#gallery-lightbox").addClass("is-open");
      }
    });

    $(document).on("click", "#gallery-lightbox", function () {
      $(this).removeClass("is-open");
    });
  }

  /* ---- SPECS ---- */
  function renderSpecs(car) {
    var specs = [
      { value: car.specs.hp + " HP", label: "Công suất cực đại" },
      { value: car.specs.acceleration, label: "0-100 km/h" },
      { value: car.specs.topSpeed, label: "Tốc độ tối đa" },
      { value: car.specs.engine, label: "Động cơ" }
    ];

    var tilesHtml = "";
    for (var i = 0; i < specs.length; i++) {
      tilesHtml +=
        '<div class="spec-tile">' +
          '<div class="spec-tile__value">' + specs[i].value + '</div>' +
          '<div class="spec-tile__label">' + specs[i].label + '</div>' +
        '</div>';
    }

    $("#section-specs").html(
      '<p class="section-kicker">Thông Số Kỹ Thuật</p>' +
      '<div class="specs-grid">' + tilesHtml + '</div>'
    );
  }

  /* ---- 360° VIEW ---- */
  function render360(car) {
    var $section = $("#section-360");

    if (!car.model3d) {
      $section.html(
        '<p class="section-kicker">360° View</p>' +
        '<div class="view360-container">' +
          '<div class="view360-fallback">Mô hình 3D chưa khả dụng cho ' + car.name + '</div>' +
        '</div>'
      );
      return;
    }

    var config = car.modelConfig || {};
    var orbit = config.cameraOrbit || "325deg 78deg 105%";
    var target = config.cameraTarget || "0m 0.3m 0m";
    var fov = config.fieldOfView || "28deg";

    $section.html(
      '<p class="section-kicker">360° View</p>' +
      '<div class="view360-container">' +
        '<model-viewer ' +
          'src="' + car.model3d + '" ' +
          'camera-controls ' +
          'disable-zoom ' +
          'disable-pan ' +
          'interaction-prompt="none" ' +
          'camera-orbit="' + orbit + '" ' +
          'camera-target="' + target + '" ' +
          'field-of-view="' + fov + '" ' +
          'exposure="1.5" ' +
          'shadow-intensity="0.2" ' +
          'environment-image="neutral" ' +
          'loading="lazy" ' +
          'style="width:100%;height:100%;background:transparent;">' +
        '</model-viewer>' +
      '</div>'
    );
  }

  /* ---- COMPARE ---- */
  function renderCompare(car) {
    var otherCars = [];
    for (var i = 0; i < CARS_DATA.length; i++) {
      if (CARS_DATA[i].id !== car.id) otherCars.push(CARS_DATA[i]);
    }

    var optionsHtml = '<option value="">Chọn xe để so sánh</option>';
    for (var i = 0; i < otherCars.length; i++) {
      optionsHtml += '<option value="' + otherCars[i].id + '">' + otherCars[i].brand + ' ' + otherCars[i].name + '</option>';
    }

    var html =
      '<p class="section-kicker">So Sánh</p>' +
      '<div class="compare-header">' +
        '<label for="compare-select">So sánh với:</label>' +
        '<select class="form-select catalog-select" id="compare-select" style="max-width:300px;">' + optionsHtml + '</select>' +
      '</div>' +
      '<div id="compare-result">' +
        '<p class="compare-placeholder">Chọn một xe khác để xem bảng so sánh.</p>' +
      '</div>';

    var $section = $("#section-compare");
    $section.html(html);

    $section.on("change", "#compare-select", function () {
      var otherId = $(this).val();
      if (!otherId) {
        $("#compare-result").html('<p class="compare-placeholder">Chọn một xe khác để xem bảng so sánh.</p>');
        return;
      }
      var other = getCarById(otherId);
      if (!other) return;
      renderCompareTable(car, other);
    });
  }

  function renderCompareTable(car, other) {
    function better(a, b) {
      var numA = parseFloat(String(a).replace(/[^\d.]/g, ""));
      var numB = parseFloat(String(b).replace(/[^\d.]/g, ""));
      if (isNaN(numA) || isNaN(numB)) return [false, false];
      return [numA > numB, numB > numA];
    }

    function betterLower(a, b) {
      var numA = parseFloat(String(a).replace(/[^\d.]/g, ""));
      var numB = parseFloat(String(b).replace(/[^\d.]/g, ""));
      if (isNaN(numA) || isNaN(numB)) return [false, false];
      return [numA < numB, numB < numA];
    }

    var rows = [
      { label: "Công suất", a: car.specs.hp + " HP", b: other.specs.hp + " HP", cmp: better },
      { label: "0-100 km/h", a: car.specs.acceleration, b: other.specs.acceleration, cmp: betterLower },
      { label: "Tốc độ tối đa", a: car.specs.topSpeed, b: other.specs.topSpeed, cmp: better },
      { label: "Động cơ", a: car.specs.engine, b: other.specs.engine, cmp: null },
      { label: "Giá", a: car.specs.price, b: other.specs.price, cmp: null }
    ];

    var imgA = (car.images && car.images.hero) || "";
    var imgB = (other.images && other.images.hero) || "";

    var visualHtml =
      '<div class="compare-cars">' +
        '<div>' +
          '<div class="compare-car-visual">' +
            (imgA ? '<img src="' + imgA + '" alt="' + car.name + '" onerror="this.style.display=\'none\'">' : '') +
            '<span class="gallery-placeholder">' + car.name + '</span>' +
          '</div>' +
          '<div class="compare-car-name">' + car.name + '</div>' +
        '</div>' +
        '<div>' +
          '<div class="compare-car-visual">' +
            (imgB ? '<img src="' + imgB + '" alt="' + other.name + '" onerror="this.style.display=\'none\'">' : '') +
            '<span class="gallery-placeholder">' + other.name + '</span>' +
          '</div>' +
          '<div class="compare-car-name">' + other.name + '</div>' +
        '</div>' +
      '</div>';

    var tableHtml = '<table class="compare-table"><tbody>';
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      var classA = "", classB = "";
      if (r.cmp) {
        var result = r.cmp(r.a, r.b);
        if (result[0]) classA = ' class="is-better"';
        if (result[1]) classB = ' class="is-better"';
      }
      tableHtml += '<tr><th>' + r.label + '</th><td' + classA + '>' + r.a + '</td><td' + classB + '>' + r.b + '</td></tr>';
    }
    tableHtml += '</tbody></table>';

    $("#compare-result").html(visualHtml + tableHtml);
  }

  /* ---- BOOKING OPTIONS ---- */
  function renderBookingOptions() {
    var html = '<option value="">Chọn mẫu xe</option>';
    for (var i = 0; i < CARS_DATA.length; i++) {
      var selected = CARS_DATA[i].id === car.id ? " selected" : "";
      html += '<option value="' + CARS_DATA[i].id + '"' + selected + '>' + CARS_DATA[i].brand + ' ' + CARS_DATA[i].name + '</option>';
    }
    $("#bookingCar").html(html);
  }

  /* ---- TABS ---- */
  function initTabs() {
    var $tabs = $(".detail-tab");
    var $sections = $(".detail-section");

    $tabs.on("click", function () {
      var targetId = $(this).data("target");
      $tabs.removeClass("is-active");
      $(this).addClass("is-active");

      var el = document.getElementById(targetId);
      if (el) {
        var offset = $(".detail-tabs").outerHeight() + 70;
        var top = el.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: top, behavior: "smooth" });
      }
    });

    if (typeof ScrollTrigger !== "undefined") {
      $sections.each(function () {
        var sectionId = this.id;
        ScrollTrigger.create({
          trigger: this,
          start: "top 40%",
          end: "bottom 40%",
          onEnter: function () { activateTab(sectionId); },
          onEnterBack: function () { activateTab(sectionId); }
        });
      });
    }

    function activateTab(sectionId) {
      $tabs.removeClass("is-active");
      $tabs.filter('[data-target="' + sectionId + '"]').addClass("is-active");
    }
  }

  /* ---- ANIMATIONS ---- */
  function initAnimations() {
    if (typeof gsap === "undefined") return;

    gsap.from(".detail-sidebar", {
      x: -30, opacity: 0, duration: 0.8, ease: "power2.out"
    });

    gsap.from(".detail-hero", {
      opacity: 0, duration: 1, ease: "power2.out", delay: 0.2
    });

    if (typeof ScrollTrigger !== "undefined") {
      gsap.utils.toArray(".detail-section").forEach(function (section) {
        gsap.from(section, {
          scrollTrigger: { trigger: section, start: "top 85%" },
          y: 40, opacity: 0, duration: 0.8, ease: "power2.out"
        });
      });

      gsap.utils.toArray(".spec-tile").forEach(function (tile, i) {
        gsap.from(tile, {
          scrollTrigger: { trigger: tile, start: "top 90%" },
          y: 30, opacity: 0, duration: 0.6, delay: i * 0.1, ease: "power2.out"
        });
      });
    }
  }
});
```

- [ ] **Step 2: Verify detail page renders correctly**

Open `detail.html?car=aventador-lp670` in browser:
1. Sidebar should show: brand "Lamborghini", name "Aventador LP 670", specs, price, CTA buttons
2. Hero section should display (placeholder if no image)
3. Tab bar should be sticky: Gallery / Thông Số / 360° View / So Sánh
4. Gallery section should show image grid (placeholders if no images)
5. Specs section should show 4 tiles: 789 HP, 3.2s, 355 km/h, V12
6. 360° section should show model-viewer with lambo_lp670.glb (interactive rotation)
7. Compare section should show dropdown; selecting another car shows side-by-side table with highlight

Also test:
- `detail.html?car=sf90-stradale` — should show Ferrari SF90 with 3D model
- `detail.html?car=750s` — should show McLaren 750S with "Mô hình 3D chưa khả dụng" fallback
- `detail.html` (no param) — should default to first car (Aventador)
- Tab clicks should smooth-scroll to sections
- Scrolling should update active tab
- On tablet width (<992px): sidebar should collapse to horizontal bar

- [ ] **Step 3: Commit**

```bash
git add assets/js/detail.js
git commit -m "feat: rewrite detail.js with sidebar, gallery, specs, 360 view, compare"
```

---

## Task 8: Final Integration & Cleanup

**Files:**
- Verify: all modified files
- Verify: `index.html` navbar links still work

- [ ] **Step 1: Verify index.html → catalog.html navigation**

Open `index.html`, click "Bộ Sưu Tập" in navbar — should navigate to catalog page with all 7 cars displayed.

- [ ] **Step 2: Verify catalog.html → detail.html navigation**

On catalog page, click "Xem chi tiết" on any card — should navigate to detail page for that specific car.

- [ ] **Step 3: Verify detail.html → catalog.html back navigation**

On detail page, click "← Quay lại BST" in sidebar — should navigate back to catalog page.

- [ ] **Step 4: Verify mobile responsive (all 3 pages)**

Use browser DevTools responsive mode:
- 375px (mobile): catalog cards single-column-ish, detail sidebar collapses to header
- 768px (tablet): catalog 2 visible cards, detail sidebar horizontal bar
- 1440px (desktop): full layout as designed

- [ ] **Step 5: Verify booking modal works on both pages**

Click "Đặt Lịch Lái Thử" on both catalog and detail pages. Modal should open with dropdown listing all cars. On detail page, current car should be pre-selected.

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "feat: complete catalog & detail redesign — multi-brand horizontal strip + sidebar detail with 360° view and compare"
```
