# Car Showroom Single Index Tabbed Experience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a frontend-only car showroom that runs from a single `index.html` while still feeling like it has three pages by switching between homepage, car collection, and car detail views inside the same web entry point.

**Architecture:** Keep one HTML entry file and treat the site as a lightweight tabbed SPA without a framework. Use semantic sections inside `index.html` for the three main views, jQuery to switch active views and sync navigation state, Bootstrap 5 for layout/components, and GSAP for hero and scroll-based motion inside the homepage experience.

**Tech Stack:** `HTML5`, `CSS3`, `JavaScript`, `Bootstrap 5 CDN`, `jQuery CDN`, `GSAP CDN`, `Sketchfab iframe`

---

## Guardrails / Non-Negotiable Requirements

- [ ] Keep exactly one HTML entry file: `index.html`.
- [ ] Preserve clear asset folders: `/css`, `/js`, `/images`.
- [ ] Use semantic HTML tags including `header`, `nav`, `main`, `section`, and `footer`.
- [ ] Use Bootstrap 5 Grid and include these components in the final build:
  - [ ] `Navbar`
  - [ ] `Card`
  - [ ] `Modal`
  - [ ] `Carousel`
- [ ] Make the site responsive on desktop, tablet, and mobile.
- [ ] Make the UI feel custom and cinematic, not like default Bootstrap.
- [ ] Implement at least two real jQuery interactions.
- [ ] Represent three clear experience views inside `index.html`:
  - [ ] `Trang chu`
  - [ ] `Danh sach xe`
  - [ ] `Chi tiet xe`
- [ ] Keep the Lamborghini Sketchfab iframe as the homepage centerpiece.
- [ ] Use GSAP for entrance and scroll-based effects.
- [ ] Ensure web navigation can switch tabs/views without leaving `index.html`.

## File Structure Map

**Create**
- `index.html`
- `css/base.css`
- `css/components.css`
- `css/home.css`
- `css/catalog.css`
- `css/detail.css`
- `js/main.js`
- `js/home.js`
- `js/catalog.js`
- `js/detail.js`

**Reference only**
- `model_iframe`
- `mau_claude/carshowroom.html`
- `docs/superpowers/specs/2026-04-26-car-showroom-requirements-consolidated.md`

---

### Task 1: Scaffold the single-entry static project

**Files:**
- Create: `index.html`
- Create: `css/base.css`
- Create: `css/components.css`
- Create: `css/home.css`
- Create: `css/catalog.css`
- Create: `css/detail.css`
- Create: `js/main.js`
- Create: `js/home.js`
- Create: `js/catalog.js`
- Create: `js/detail.js`

- [ ] **Step 1: Create the asset folders and files**

Run:

```bash
mkdir -p css js images
touch index.html
touch css/base.css css/components.css css/home.css css/catalog.css css/detail.css
touch js/main.js js/home.js js/catalog.js js/detail.js
```

Expected: the project now has one HTML entry file and the required `/css`, `/js`, `/images` folders.

- [ ] **Step 2: Add the base shell to `index.html`**

Put this into `index.html`:

```html
<!DOCTYPE html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>APEX Motors | Cinematic Showroom</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cormorant+Garamond:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap"
      rel="stylesheet"
    />
    <link
      href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
      rel="stylesheet"
    />
    <link rel="stylesheet" href="css/base.css" />
    <link rel="stylesheet" href="css/components.css" />
    <link rel="stylesheet" href="css/home.css" />
    <link rel="stylesheet" href="css/catalog.css" />
    <link rel="stylesheet" href="css/detail.css" />
  </head>
  <body>
    <header></header>
    <main></main>
    <footer></footer>

    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js"></script>
    <script src="js/main.js"></script>
    <script src="js/home.js"></script>
    <script src="js/catalog.js"></script>
    <script src="js/detail.js"></script>
  </body>
</html>
```

- [ ] **Step 3: Add safe bootstraps for each JavaScript file**

Put this into `js/main.js`:

```javascript
$(function () {
  $("body").addClass("app-ready");
});
```

Put this into `js/home.js`:

```javascript
$(function () {
  console.log("home view ready");
});
```

Put this into `js/catalog.js`:

```javascript
$(function () {
  console.log("catalog view ready");
});
```

Put this into `js/detail.js`:

```javascript
$(function () {
  console.log("detail view ready");
});
```

- [ ] **Step 4: Verify the single-page scaffold loads**

Run:

```bash
xdg-open index.html
```

Expected: one page opens with no missing-file errors in the browser console or network panel.

---

### Task 2: Build the shared visual system and tab-shell layout

**Files:**
- Modify: `css/base.css`
- Modify: `css/components.css`
- Modify: `index.html`

- [ ] **Step 1: Add the base dark-luxury theme**

Put this into `css/base.css`:

```css
:root {
  --color-bg: #050508;
  --color-bg-soft: #101017;
  --color-panel: rgba(15, 15, 22, 0.92);
  --color-line: rgba(255, 255, 255, 0.08);
  --color-gold: #c9a84c;
  --color-gold-soft: #e7ca7f;
  --color-text: #f3efe7;
  --color-muted: #b6b0a8;
  --color-mono: #9c979d;
  --radius-panel: 24px;
  --shadow-soft: 0 30px 80px rgba(0, 0, 0, 0.4);
  --container-max: 1240px;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  min-height: 100vh;
  background:
    radial-gradient(circle at top, rgba(201, 168, 76, 0.08), transparent 28%),
    linear-gradient(180deg, #040406 0%, #0a0a10 50%, #040406 100%);
  color: var(--color-text);
  font-family: "Cormorant Garamond", serif;
  overflow-x: hidden;
}

a {
  color: inherit;
  text-decoration: none;
}

img,
iframe {
  display: block;
  max-width: 100%;
}

.container-luxury {
  width: min(100% - 32px, var(--container-max));
  margin-inline: auto;
}

.view-panel {
  display: none;
}

.view-panel.is-active {
  display: block;
}
```

- [ ] **Step 2: Add shared navbar, button, footer, and tab-state styles**

Put this into `css/components.css`:

```css
.site-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: rgba(5, 5, 8, 0.8);
  backdrop-filter: blur(18px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.site-header--scrolled {
  background: rgba(5, 5, 8, 0.94);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.28);
}

.navbar-brand {
  font-family: "Bebas Neue", sans-serif;
  font-size: 1.85rem;
  letter-spacing: 0.24em;
}

.navbar-brand span {
  color: var(--color-gold);
}

.nav-link {
  font-family: "Space Mono", monospace;
  font-size: 0.72rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--color-muted);
}

.nav-link.is-current,
.nav-link:hover,
.nav-link:focus {
  color: var(--color-text);
}

.btn-luxury,
.btn-luxury-outline {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.95rem 1.4rem;
  border-radius: 999px;
  font-family: "Space Mono", monospace;
  font-size: 0.72rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  transition: transform 0.25s ease, background-color 0.25s ease, border-color 0.25s ease;
}

.btn-luxury {
  background: var(--color-gold);
  color: #090909;
  border: 1px solid var(--color-gold);
}

.btn-luxury-outline {
  background: transparent;
  color: var(--color-text);
  border: 1px solid rgba(255, 255, 255, 0.16);
}

.btn-luxury:hover,
.btn-luxury-outline:hover {
  transform: translateY(-2px);
}

.section-kicker {
  margin-bottom: 1rem;
  color: var(--color-gold);
  font-family: "Space Mono", monospace;
  font-size: 0.7rem;
  letter-spacing: 0.3em;
  text-transform: uppercase;
}

.section-title {
  margin: 0;
  font-family: "Bebas Neue", sans-serif;
  font-size: clamp(2.8rem, 6vw, 5.6rem);
  letter-spacing: 0.06em;
  line-height: 0.95;
}

.site-footer {
  padding: 3rem 0;
  border-top: 1px solid var(--color-line);
  color: var(--color-muted);
}
```

- [ ] **Step 3: Add the semantic tab-shell to `index.html`**

Put this into `<header>` in `index.html`:

```html
<nav class="navbar navbar-expand-lg site-header">
  <div class="container-luxury">
    <a class="navbar-brand" href="#home-view">APEX<span>.</span></a>
    <button
      class="navbar-toggler border-0 text-white"
      type="button"
      data-bs-toggle="collapse"
      data-bs-target="#siteNav"
      aria-controls="siteNav"
      aria-expanded="false"
      aria-label="Toggle navigation"
    >
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="siteNav">
      <ul class="navbar-nav mx-auto mb-2 mb-lg-0 gap-lg-4">
        <li class="nav-item"><a class="nav-link is-current" data-view-target="home-view" href="#home-view">Trang chủ</a></li>
        <li class="nav-item"><a class="nav-link" data-view-target="catalog-view" href="#catalog-view">Bộ sưu tập</a></li>
        <li class="nav-item"><a class="nav-link" data-view-target="detail-view" href="#detail-view">Chi tiết xe</a></li>
      </ul>
      <a class="btn-luxury" data-view-target="detail-view" href="#detail-view">Đặt lịch lái thử</a>
    </div>
  </div>
</nav>
```

Put this into `<main>` in `index.html`:

```html
<main class="page-shell">
  <section id="home-view" class="view-panel is-active" data-view="home"></section>
  <section id="catalog-view" class="view-panel" data-view="catalog"></section>
  <section id="detail-view" class="view-panel" data-view="detail"></section>
</main>
```

Put this into `<footer>` in `index.html`:

```html
<div class="site-footer">
  <div class="container-luxury d-flex flex-column flex-lg-row justify-content-between gap-3">
    <p class="mb-0">APEX Motors showroom concept for cinematic luxury presentation.</p>
    <p class="mb-0">Single-index frontend experience with tabbed views.</p>
  </div>
</div>
```

- [ ] **Step 4: Verify the shell reflects one entry point and three internal views**

Run:

```bash
rg -n "view-panel|data-view-target|home-view|catalog-view|detail-view" index.html
```

Expected: `index.html` is the only HTML entry and contains the three required internal views.

---

### Task 3: Build the homepage cinematic view with the Lamborghini iframe hero

**Files:**
- Modify: `index.html`
- Modify: `css/home.css`

- [ ] **Step 1: Add the homepage content inside `#home-view`**

Replace the empty `#home-view` section in `index.html` with:

```html
<section id="home-view" class="view-panel is-active" data-view="home">
  <section class="hero-home">
    <div class="container-luxury">
      <div class="row align-items-center g-5">
        <div class="col-lg-5">
          <p class="section-kicker">2026 Lamborghini Selection</p>
          <h1 class="hero-home__title">Luxury In Motion</h1>
          <p class="hero-home__copy">
            Trải nghiệm showroom số mang ngôn ngữ điện ảnh, nơi thiết kế Ý, sức mạnh cơ khí,
            và cảm giác private viewing gặp nhau trong một màn giới thiệu sang trọng.
          </p>
          <div class="hero-home__actions">
            <a class="btn-luxury" data-view-target="catalog-view" href="#catalog-view">Khám phá bộ sưu tập</a>
            <a class="btn-luxury-outline" data-view-target="detail-view" href="#detail-view">Xem flagship</a>
          </div>
          <div class="hero-home__stats">
            <div>
              <span class="hero-home__stat-value">3.2s</span>
              <span class="hero-home__stat-label">0-100 km/h</span>
            </div>
            <div>
              <span class="hero-home__stat-value">789 hp</span>
              <span class="hero-home__stat-label">V12 Output</span>
            </div>
          </div>
        </div>
        <div class="col-lg-7">
          <div class="model-stage">
            <div class="model-stage__meta">
              <span>Interactive 3D Preview</span>
              <span>Drag to explore</span>
            </div>
            <div class="model-stage__frame">
              <div class="sketchfab-embed-wrapper">
                <iframe
                  title="Lambo lp670"
                  frameborder="0"
                  allowfullscreen
                  mozallowfullscreen="true"
                  webkitallowfullscreen="true"
                  allow="autoplay; fullscreen; xr-spatial-tracking"
                  xr-spatial-tracking
                  execution-while-out-of-viewport
                  execution-while-not-rendered
                  web-share
                  src="https://sketchfab.com/models/2bec29c3d06a4bf5b51a0b8b572e69ac/embed?autostart=1&ui_theme=dark">
                </iframe>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="marquee-strip">
    <div class="marquee-track">
      <span>APEX MOTORS</span>
      <span>LUXURY REDEFINED</span>
      <span>PERFORMANCE UNLEASHED</span>
      <span>APEX MOTORS</span>
      <span>LUXURY REDEFINED</span>
      <span>PERFORMANCE UNLEASHED</span>
    </div>
  </section>

  <section class="brand-intro">
    <div class="container-luxury row align-items-center g-5">
      <div class="col-lg-4">
        <p class="brand-intro__number">01</p>
      </div>
      <div class="col-lg-8">
        <p class="section-kicker">Showroom Philosophy</p>
        <h2 class="section-title">Dark luxury built around motion and silhouette.</h2>
        <p class="brand-intro__copy">
          Đây là lớp mở đầu để kể câu chuyện thương hiệu, trước khi người xem chuyển sang bộ sưu tập
          và đào sâu vào một cấu hình xe cụ thể.
        </p>
      </div>
    </div>
  </section>
</section>
```

- [ ] **Step 2: Add the homepage styles**

Put this into `css/home.css`:

```css
.hero-home {
  padding: 7rem 0 4rem;
  min-height: 100vh;
}

.hero-home__title {
  margin: 0 0 1.5rem;
  font-family: "Bebas Neue", sans-serif;
  font-size: clamp(4rem, 10vw, 8.5rem);
  line-height: 0.9;
  letter-spacing: 0.08em;
}

.hero-home__copy,
.brand-intro__copy {
  font-size: 1.12rem;
  line-height: 1.8;
  color: var(--color-muted);
}

.hero-home__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin: 2rem 0;
}

.hero-home__stats {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.hero-home__stat-value {
  display: block;
  font-family: "Bebas Neue", sans-serif;
  font-size: 2rem;
  color: var(--color-gold);
}

.hero-home__stat-label {
  font-family: "Space Mono", monospace;
  font-size: 0.6rem;
  letter-spacing: 0.2em;
  color: var(--color-mono);
  text-transform: uppercase;
}

.model-stage__meta {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
  font-family: "Space Mono", monospace;
  font-size: 0.62rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-mono);
}

.model-stage__frame {
  padding: 1rem;
  border-radius: var(--radius-panel);
  border: 1px solid rgba(201, 168, 76, 0.24);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.03), transparent),
    rgba(12, 12, 18, 0.96);
  box-shadow: var(--shadow-soft);
}

.model-stage iframe {
  width: 100%;
  aspect-ratio: 16 / 10;
  border-radius: 18px;
  background: #08080c;
}

.marquee-strip {
  overflow: hidden;
  padding: 0.85rem 0;
  background: var(--color-gold);
  color: #090909;
}

.marquee-track {
  display: flex;
  gap: 2rem;
  width: max-content;
  font-family: "Bebas Neue", sans-serif;
  letter-spacing: 0.2em;
  animation: marqueeMove 18s linear infinite;
}

@keyframes marqueeMove {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

.brand-intro {
  padding: 6rem 0;
}

.brand-intro__number {
  margin: 0;
  font-family: "Bebas Neue", sans-serif;
  font-size: clamp(6rem, 14vw, 11rem);
  color: rgba(201, 168, 76, 0.12);
}

@media (max-width: 991.98px) {
  .hero-home {
    padding-top: 5rem;
    min-height: auto;
  }
}
```

- [ ] **Step 3: Verify the Lamborghini iframe dominates the homepage**

Run:

```bash
xdg-open index.html
```

Expected: the homepage view shows a split layout with text on the left and the Sketchfab Lamborghini embedded on the right inside a dark luxury frame.

---

### Task 4: Build the internal catalog view using Bootstrap cards and a modal

**Files:**
- Modify: `index.html`
- Modify: `css/catalog.css`

- [ ] **Step 1: Add the catalog view inside `#catalog-view`**

Replace the empty `#catalog-view` section in `index.html` with:

```html
<section id="catalog-view" class="view-panel" data-view="catalog">
  <section class="catalog-hero">
    <div class="container-luxury">
      <p class="section-kicker">Curated Showroom</p>
      <h1 class="section-title">Bộ sưu tập siêu xe trong cùng một không gian số.</h1>
    </div>
  </section>

  <section class="catalog-controls">
    <div class="container-luxury">
      <div class="row g-3 align-items-end">
        <div class="col-md-4">
          <label class="form-label text-uppercase small text-secondary" for="filter-series">Dòng xe</label>
          <select id="filter-series" class="form-select">
            <option value="all">Tất cả</option>
            <option value="v12">V12</option>
            <option value="track">Track</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>
        <div class="col-md-4">
          <label class="form-label text-uppercase small text-secondary" for="filter-price">Mức giá</label>
          <select id="filter-price" class="form-select">
            <option value="all">Tất cả</option>
            <option value="high">Từ 20 tỷ</option>
            <option value="mid">Dưới 20 tỷ</option>
          </select>
        </div>
        <div class="col-md-4">
          <button id="reset-filters" class="btn-luxury-outline w-100">Đặt lại bộ lọc</button>
        </div>
      </div>
    </div>
  </section>

  <section class="catalog-grid-section">
    <div class="container-luxury">
      <div class="row g-4" id="catalog-grid">
        <div class="col-md-6 col-xl-4 car-item" data-series="v12" data-price="high" data-car-id="aventador-lp670">
          <article class="card showroom-card h-100">
            <div class="showroom-card__media"></div>
            <div class="card-body">
              <p class="showroom-card__brand">Lamborghini</p>
              <h2 class="showroom-card__title">Aventador LP 670</h2>
              <p class="showroom-card__copy">Flagship V12 coupe cho màn giới thiệu quyền lực và cơ khí thuần túy.</p>
              <div class="showroom-card__meta">
                <span>789 hp</span>
                <span>V12</span>
                <span>26 tỷ</span>
              </div>
            </div>
            <div class="card-footer d-flex gap-2">
              <button
                class="btn-luxury-outline flex-fill quick-view-btn"
                data-bs-toggle="modal"
                data-bs-target="#quickViewModal"
                data-title="Aventador LP 670"
                data-copy="Flagship coupe cho cinematic hero, private consultation, và showroom theater feel."
              >
                Quick view
              </button>
              <button class="btn-luxury flex-fill open-detail-btn" data-car-id="aventador-lp670">Chi tiết</button>
            </div>
          </article>
        </div>

        <div class="col-md-6 col-xl-4 car-item" data-series="track" data-price="high" data-car-id="huracan-sto">
          <article class="card showroom-card h-100">
            <div class="showroom-card__media"></div>
            <div class="card-body">
              <p class="showroom-card__brand">Lamborghini</p>
              <h2 class="showroom-card__title">Huracán STO</h2>
              <p class="showroom-card__copy">Track-focused silhouette cho người tìm cảm giác phản hồi lái sắc nét.</p>
              <div class="showroom-card__meta">
                <span>640 hp</span>
                <span>V10</span>
                <span>21 tỷ</span>
              </div>
            </div>
            <div class="card-footer d-flex gap-2">
              <button
                class="btn-luxury-outline flex-fill quick-view-btn"
                data-bs-toggle="modal"
                data-bs-target="#quickViewModal"
                data-title="Huracán STO"
                data-copy="Một cấu hình track-biased phù hợp với visual cứng, thấp, và giàu lực đẩy."
              >
                Quick view
              </button>
              <button class="btn-luxury flex-fill open-detail-btn" data-car-id="huracan-sto">Chi tiết</button>
            </div>
          </article>
        </div>

        <div class="col-md-6 col-xl-4 car-item" data-series="hybrid" data-price="mid" data-car-id="revuelto">
          <article class="card showroom-card h-100">
            <div class="showroom-card__media"></div>
            <div class="card-body">
              <p class="showroom-card__brand">Lamborghini</p>
              <h2 class="showroom-card__title">Revuelto</h2>
              <p class="showroom-card__copy">Hybrid supercar đại diện cho ngôn ngữ hiệu năng điện hóa cao cấp.</p>
              <div class="showroom-card__meta">
                <span>1001 hp</span>
                <span>Hybrid</span>
                <span>19 tỷ</span>
              </div>
            </div>
            <div class="card-footer d-flex gap-2">
              <button
                class="btn-luxury-outline flex-fill quick-view-btn"
                data-bs-toggle="modal"
                data-bs-target="#quickViewModal"
                data-title="Revuelto"
                data-copy="Mẫu xe cho narrative công nghệ, tương lai, và năng lượng bùng nổ."
              >
                Quick view
              </button>
              <button class="btn-luxury flex-fill open-detail-btn" data-car-id="revuelto">Chi tiết</button>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
</section>

<div class="modal fade" id="quickViewModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content showroom-modal">
      <div class="modal-header border-0">
        <h2 class="modal-title fs-4" id="quickViewTitle">Quick view</h2>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <p id="quickViewCopy" class="mb-0"></p>
      </div>
    </div>
  </div>
</div>
```

- [ ] **Step 2: Add the catalog styles**

Put this into `css/catalog.css`:

```css
.catalog-hero,
.catalog-controls,
.catalog-grid-section {
  padding: 4rem 0;
}

.showroom-card {
  border: 1px solid var(--color-line);
  border-radius: var(--radius-panel);
  overflow: hidden;
  background: rgba(15, 15, 20, 0.92);
  box-shadow: var(--shadow-soft);
}

.showroom-card__media {
  min-height: 220px;
  background:
    linear-gradient(135deg, rgba(201, 168, 76, 0.16), transparent),
    radial-gradient(circle at center, rgba(255, 255, 255, 0.05), transparent 70%),
    #0d0d12;
}

.showroom-card__brand {
  margin-bottom: 0.4rem;
  font-family: "Space Mono", monospace;
  font-size: 0.7rem;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--color-gold);
}

.showroom-card__title {
  font-family: "Bebas Neue", sans-serif;
  font-size: 2rem;
  letter-spacing: 0.05em;
}

.showroom-card__copy,
.showroom-modal .modal-body {
  color: var(--color-muted);
}

.showroom-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  font-family: "Space Mono", monospace;
  font-size: 0.7rem;
  color: var(--color-mono);
}

.showroom-card .card-footer {
  border-top: 1px solid var(--color-line);
  background: transparent;
}

.showroom-modal {
  border: 1px solid rgba(201, 168, 76, 0.24);
  border-radius: var(--radius-panel);
  background: #0d0d12;
  color: var(--color-text);
}
```

- [ ] **Step 3: Verify the catalog view contains Bootstrap card and modal usage**

Run:

```bash
rg -n "card|modal|quickViewModal|open-detail-btn" index.html
```

Expected: the catalog markup proves Bootstrap `Card` and `Modal` are present inside the single-page experience.

---

### Task 5: Build the internal detail view with a Bootstrap carousel and return flow

**Files:**
- Modify: `index.html`
- Modify: `css/detail.css`

- [ ] **Step 1: Add the detail view inside `#detail-view`**

Replace the empty `#detail-view` section in `index.html` with:

```html
<section id="detail-view" class="view-panel" data-view="detail">
  <section class="detail-hero">
    <div class="container-luxury row align-items-center g-5">
      <div class="col-lg-6">
        <p class="section-kicker">Flagship Detail</p>
        <h1 class="section-title" id="detailTitle">Lamborghini Aventador LP 670</h1>
        <p class="detail-hero__copy" id="detailCopy">
          Một cấu hình showroom được xây để cân bằng hiệu năng cực đoan với cảm giác private viewing tinh xảo.
        </p>
        <div class="detail-hero__meta">
          <span id="detailPrice">26 tỷ VNĐ</span>
          <span id="detailEngine">V12</span>
          <span id="detailPower">789 hp</span>
        </div>
        <div class="d-flex flex-wrap gap-3 mt-4">
          <a class="btn-luxury" href="#detail-gallery">Xem gallery</a>
          <button class="btn-luxury-outline" data-view-target="catalog-view">Quay lại bộ sưu tập</button>
        </div>
      </div>
      <div class="col-lg-6">
        <div class="detail-hero__visual"></div>
      </div>
    </div>
  </section>

  <section class="detail-gallery" id="detail-gallery">
    <div class="container-luxury">
      <div id="detailCarousel" class="carousel slide" data-bs-ride="carousel">
        <div class="carousel-inner">
          <div class="carousel-item active"><div class="detail-slide"></div></div>
          <div class="carousel-item"><div class="detail-slide"></div></div>
          <div class="carousel-item"><div class="detail-slide"></div></div>
        </div>
        <button class="carousel-control-prev" type="button" data-bs-target="#detailCarousel" data-bs-slide="prev">
          <span class="carousel-control-prev-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Previous</span>
        </button>
        <button class="carousel-control-next" type="button" data-bs-target="#detailCarousel" data-bs-slide="next">
          <span class="carousel-control-next-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Next</span>
        </button>
      </div>
    </div>
  </section>

  <section class="detail-specs">
    <div class="container-luxury">
      <div class="row g-4">
        <div class="col-md-6 col-xl-3"><article class="spec-tile"><h2 id="specPower">789 hp</h2><p>Công suất cực đại</p></article></div>
        <div class="col-md-6 col-xl-3"><article class="spec-tile"><h2 id="specSprint">3.2s</h2><p>0-100 km/h</p></article></div>
        <div class="col-md-6 col-xl-3"><article class="spec-tile"><h2 id="specTopSpeed">355 km/h</h2><p>Tốc độ tối đa</p></article></div>
        <div class="col-md-6 col-xl-3"><article class="spec-tile"><h2 id="specEngine">V12</h2><p>Powertrain</p></article></div>
      </div>
    </div>
  </section>

  <section class="detail-review">
    <div class="container-luxury">
      <blockquote class="detail-review__quote" id="detailQuote">
        “Một cỗ máy phù hợp để đẩy câu chuyện về quyền lực, thủ công, và khí chất showroom điện ảnh lên cao nhất.”
      </blockquote>
    </div>
  </section>
</section>
```

- [ ] **Step 2: Add the detail-view styles**

Put this into `css/detail.css`:

```css
.detail-hero,
.detail-gallery,
.detail-specs,
.detail-review {
  padding: 5rem 0;
}

.detail-hero__copy,
.detail-review__quote {
  color: var(--color-muted);
  font-size: 1.08rem;
  line-height: 1.8;
}

.detail-hero__visual,
.detail-slide {
  min-height: 440px;
  border-radius: var(--radius-panel);
  border: 1px solid rgba(201, 168, 76, 0.22);
  background:
    linear-gradient(135deg, rgba(201, 168, 76, 0.16), transparent),
    radial-gradient(circle at center, rgba(255, 255, 255, 0.05), transparent 65%),
    #0d0d12;
  box-shadow: var(--shadow-soft);
}

.detail-hero__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-family: "Space Mono", monospace;
  font-size: 0.72rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-gold);
}

.spec-tile {
  height: 100%;
  padding: 1.5rem;
  border-radius: var(--radius-panel);
  border: 1px solid var(--color-line);
  background: rgba(14, 14, 20, 0.92);
}

.spec-tile h2 {
  margin: 0 0 0.5rem;
  font-family: "Bebas Neue", sans-serif;
  font-size: 2.5rem;
  color: var(--color-gold);
}

.spec-tile p {
  margin: 0;
  color: var(--color-muted);
}

.detail-review__quote {
  max-width: 720px;
  margin: 0;
  font-style: italic;
}
```

- [ ] **Step 3: Verify the single-page detail view contains a working carousel shell**

Run:

```bash
rg -n "detailCarousel|carousel-item|spec-tile|detailTitle" index.html
```

Expected: the detail view proves Bootstrap `Carousel` and the structured spec area exist inside `index.html`.

---

### Task 6: Implement tab switching and data-driven detail updates with jQuery

**Files:**
- Modify: `js/main.js`
- Modify: `js/catalog.js`
- Modify: `js/detail.js`

- [ ] **Step 1: Replace `js/main.js` with shared view-switching and header scroll logic**

Put this into `js/main.js`:

```javascript
$(function () {
  const $header = $(".site-header");
  const $views = $(".view-panel");
  const $navLinks = $(".nav-link[data-view-target]");

  function setActiveView(viewId) {
    $views.removeClass("is-active");
    $("#" + viewId).addClass("is-active");

    $navLinks.removeClass("is-current");
    $navLinks.filter("[data-view-target='" + viewId + "']").addClass("is-current");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function syncHeaderState() {
    $header.toggleClass("site-header--scrolled", $(window).scrollTop() > 24);
  }

  $(document).on("click", "[data-view-target]", function (event) {
    const viewId = $(this).data("view-target");
    if (viewId) {
      event.preventDefault();
      setActiveView(viewId);
    }
  });

  $(window).on("scroll", syncHeaderState);
  syncHeaderState();

  window.APEXShowroom = window.APEXShowroom || {};
  window.APEXShowroom.setActiveView = setActiveView;
});
```

- [ ] **Step 2: Add the catalog jQuery interactions and car dataset**

Put this into `js/catalog.js`:

```javascript
$(function () {
  const cars = {
    "aventador-lp670": {
      title: "Lamborghini Aventador LP 670",
      copy: "Một cấu hình showroom được xây để cân bằng hiệu năng cực đoan với cảm giác private viewing tinh xảo.",
      price: "26 tỷ VNĐ",
      engine: "V12",
      power: "789 hp",
      sprint: "3.2s",
      topSpeed: "355 km/h",
      quote: "Một cỗ máy phù hợp để đẩy câu chuyện về quyền lực, thủ công, và khí chất showroom điện ảnh lên cao nhất."
    },
    "huracan-sto": {
      title: "Lamborghini Huracán STO",
      copy: "Cấu hình tập trung vào chất track-day, thân xe sắc, thấp, và phản hồi lái giàu năng lượng.",
      price: "21 tỷ VNĐ",
      engine: "V10",
      power: "640 hp",
      sprint: "3.0s",
      topSpeed: "310 km/h",
      quote: "Một lựa chọn dành cho người muốn website phát ra năng lượng sắc gọn và thiên về tốc độ."
    },
    "revuelto": {
      title: "Lamborghini Revuelto",
      copy: "Hybrid flagship cho câu chuyện công nghệ, tăng tốc, và tương lai điện hóa cao cấp.",
      price: "19 tỷ VNĐ",
      engine: "Hybrid",
      power: "1001 hp",
      sprint: "2.5s",
      topSpeed: "350 km/h",
      quote: "Mẫu xe phù hợp để kết nối dark luxury với tinh thần công nghệ thế hệ mới."
    }
  };

  function applyFilters() {
    const series = $("#filter-series").val();
    const price = $("#filter-price").val();

    $(".car-item").each(function () {
      const matchesSeries = series === "all" || $(this).data("series") === series;
      const matchesPrice = price === "all" || $(this).data("price") === price;
      $(this).toggle(matchesSeries && matchesPrice);
    });
  }

  $("#filter-series, #filter-price").on("change", applyFilters);

  $("#reset-filters").on("click", function () {
    $("#filter-series").val("all");
    $("#filter-price").val("all");
    applyFilters();
  });

  $(".quick-view-btn").on("click", function () {
    $("#quickViewTitle").text($(this).data("title"));
    $("#quickViewCopy").text($(this).data("copy"));
  });

  $(".open-detail-btn").on("click", function () {
    const carId = $(this).data("car-id");
    window.APEXShowroom = window.APEXShowroom || {};
    window.APEXShowroom.currentCar = cars[carId];
    $(document).trigger("apex:car-selected", [cars[carId]]);
    window.APEXShowroom.setActiveView("detail-view");
  });
});
```

- [ ] **Step 3: Add the detail data-binding listener**

Put this into `js/detail.js`:

```javascript
$(function () {
  function renderDetail(car) {
    if (!car) {
      return;
    }

    $("#detailTitle").text(car.title);
    $("#detailCopy").text(car.copy);
    $("#detailPrice").text(car.price);
    $("#detailEngine").text(car.engine);
    $("#detailPower").text(car.power);
    $("#specPower").text(car.power);
    $("#specSprint").text(car.sprint);
    $("#specTopSpeed").text(car.topSpeed);
    $("#specEngine").text(car.engine);
    $("#detailQuote").text("“" + car.quote + "”");
  }

  $(document).on("apex:car-selected", function (_event, car) {
    renderDetail(car);
  });
});
```

- [ ] **Step 4: Verify the required jQuery interactions work inside one page**

Run:

```bash
xdg-open index.html
```

Expected:
- navbar buttons switch between home, catalog, and detail views without leaving `index.html`
- filter controls show and hide cards
- quick view buttons populate the modal
- detail buttons switch to the detail tab and update the detail content

---

### Task 7: Add GSAP motion for the homepage and safe reveal behavior

**Files:**
- Modify: `js/home.js`
- Modify: `css/home.css`

- [ ] **Step 1: Replace `js/home.js` with homepage GSAP animation**

Put this into `js/home.js`:

```javascript
$(function () {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  gsap.from(".hero-home__title, .hero-home__copy, .hero-home__actions, .hero-home__stats", {
    y: 32,
    opacity: 0,
    duration: 0.9,
    stagger: 0.12,
    ease: "power3.out"
  });

  gsap.from(".model-stage", {
    x: 48,
    opacity: 0,
    duration: 1.1,
    ease: "power3.out"
  });

  gsap.from(".brand-intro", {
    scrollTrigger: {
      trigger: ".brand-intro",
      start: "top 82%"
    },
    y: 56,
    opacity: 0,
    duration: 0.9,
    ease: "power2.out"
  });
});
```

- [ ] **Step 2: Add reduced-motion protection**

Append this to `css/home.css`:

```css
@media (prefers-reduced-motion: reduce) {
  .marquee-track {
    animation: none;
  }
}
```

- [ ] **Step 3: Verify the motion supports the homepage without overwhelming the iframe**

Run:

```bash
xdg-open index.html
```

Expected: the homepage animates on load, the hero and brand-intro reveal smoothly, and the 3D iframe remains the dominant focal point.

---

### Task 8: Run acceptance QA against the consolidated spec

**Files:**
- Review only: `index.html`
- Review only: `css/*.css`
- Review only: `js/*.js`
- Review only: `docs/superpowers/specs/2026-04-26-car-showroom-requirements-consolidated.md`

- [ ] **Step 1: Confirm only one HTML entry file is used**

Run:

```bash
find . -maxdepth 1 -name "*.html" -print
```

Expected: only `./index.html` appears in the final deliverable area.

- [ ] **Step 2: Confirm semantic HTML is present**

Run:

```bash
rg -n "<header|<nav|<main|<section|<footer" index.html
```

Expected: the required semantic tags appear in `index.html`.

- [ ] **Step 3: Confirm Bootstrap component coverage**

Run:

```bash
rg -n "navbar|card|modal|carousel" index.html
```

Expected: Bootstrap `Navbar`, `Card`, `Modal`, and `Carousel` are all present.

- [ ] **Step 4: Confirm the required structure exists**

Run:

```bash
find . -maxdepth 2 \( -path "./css" -o -path "./js" -o -path "./images" \) -print
```

Expected: `/css`, `/js`, and `/images` are present.

- [ ] **Step 5: Perform viewport QA in browser devtools**

Run:

```bash
xdg-open index.html
```

Expected:
- desktop: split hero and tab transitions feel premium
- tablet: grids collapse cleanly
- mobile: navbar collapses, iframe stays inside viewport, modal and carousel remain usable

- [ ] **Step 6: Run the final checklist**

Use this checklist:

```text
[ ] only one index.html is used
[ ] /css, /js, /images structure exists
[ ] semantic HTML present
[ ] Bootstrap Navbar used
[ ] Bootstrap Card used
[ ] Bootstrap Modal used
[ ] Bootstrap Carousel used
[ ] 3 internal views exist
[ ] homepage contains Sketchfab Lamborghini iframe
[ ] at least 2 jQuery interactions work
[ ] GSAP motion is present
[ ] desktop, tablet, mobile checked
[ ] styling no longer feels like default Bootstrap
[ ] tab/view switching works without leaving index.html
```

- [ ] **Step 7: Commit the completed single-index showroom**

Run:

```bash
git add index.html css js images docs/superpowers/specs/2026-04-26-car-showroom-requirements-consolidated.md docs/superpowers/plans/2026-04-26-car-showroom-single-index-tabbed-plan.md
git commit -m "feat: build single-index cinematic showroom"
```

Expected: one commit captures the single-index implementation and its supporting docs.
