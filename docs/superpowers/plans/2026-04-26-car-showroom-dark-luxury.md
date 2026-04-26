# Car Showroom Dark Luxury Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a frontend-only, cinematic dark-luxury car showroom by splitting the existing one-page demo into `index.html`, `cars.html`, and `car-detail.html`, integrating the Lamborghini Sketchfab iframe on the homepage, and meeting all Bootstrap, jQuery, GSAP, semantic HTML, and responsive requirements.

**Architecture:** Start by converting the current single-file demo into a shared static-site shell with common CSS and JS, then implement each page around a clear role: brand experience on the homepage, discovery on the catalog page, and decision support on the detail page. Keep Bootstrap 5 as the layout and component backbone, then layer custom CSS, GSAP motion, and jQuery interactions on top so the final UI feels bespoke rather than template-based.

**Tech Stack:** `HTML5`, `CSS3`, `JavaScript`, `Bootstrap 5 CDN`, `jQuery CDN`, `GSAP CDN`, `Sketchfab iframe`

---

## Guardrails / Non-Negotiable Requirements

- [ ] Keep a clear folder structure using `/css`, `/js`, and `/images`.
- [ ] Use semantic HTML tags including `header`, `nav`, `section`, and `footer`.
- [ ] Use Bootstrap 5 Grid plus these components somewhere in the final build:
  - [ ] `Navbar`
  - [ ] `Card`
  - [ ] `Modal`
  - [ ] `Carousel`
- [ ] Make all three pages responsive on desktop, tablet, and mobile.
- [ ] Override Bootstrap defaults enough that the visual identity reads as cinematic dark luxury.
- [ ] Implement at least two real jQuery interactions.
- [ ] Keep the site at three pages minimum:
  - [ ] `index.html`
  - [ ] `cars.html`
  - [ ] `car-detail.html`
- [ ] Preserve the Lamborghini Sketchfab iframe as the homepage centerpiece.
- [ ] Keep page-by-page component responsibilities aligned with the approved spec.

## File Structure Map

**Create**
- `index.html`
- `cars.html`
- `car-detail.html`
- `css/base.css`
- `css/components.css`
- `css/home.css`
- `css/catalog.css`
- `css/detail.css`
- `js/main.js`
- `js/home.js`
- `js/catalog.js`
- `js/detail.js`
- `images/` for supporting assets exported or captured from the demo direction

**Reference only**
- `mau_claude/carshowroom.html`
- `model_iframe`
- `docs/superpowers/specs/2026-04-26-car-showroom-dark-luxury-design.md`

---

### Task 1: Create the multi-page scaffold and shared asset folders

**Files:**
- Create: `index.html`
- Create: `cars.html`
- Create: `car-detail.html`
- Create: `css/base.css`
- Create: `css/components.css`
- Create: `css/home.css`
- Create: `css/catalog.css`
- Create: `css/detail.css`
- Create: `js/main.js`
- Create: `js/home.js`
- Create: `js/catalog.js`
- Create: `js/detail.js`

- [ ] **Step 1: Create the required folders and files**

Run:

```bash
mkdir -p css js images
touch index.html cars.html car-detail.html
touch css/base.css css/components.css css/home.css css/catalog.css css/detail.css
touch js/main.js js/home.js js/catalog.js js/detail.js
```

Expected: the root now contains three HTML files and the `/css`, `/js`, `/images` folders required by the project brief.

- [ ] **Step 2: Add the shared HTML shell to `index.html`**

Put this into `index.html`:

```html
<!DOCTYPE html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>APEX Motors | Luxury Performance</title>
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
  </body>
</html>
```

- [ ] **Step 3: Copy the same shell pattern to `cars.html` and `car-detail.html`**

Put this into `cars.html`:

```html
<!DOCTYPE html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>APEX Motors | Bộ Sưu Tập</title>
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
    <link rel="stylesheet" href="css/catalog.css" />
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
    <script src="js/catalog.js"></script>
  </body>
</html>
```

Put this into `car-detail.html`:

```html
<!DOCTYPE html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>APEX Motors | Chi Tiết Xe</title>
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
    <script src="js/detail.js"></script>
  </body>
</html>
```

- [ ] **Step 4: Add a safe JavaScript bootstrap to each page script**

Put this into `js/main.js`:

```javascript
$(function () {
  $("body").addClass("app-ready");
});
```

Put this into `js/home.js`:

```javascript
$(function () {
  console.log("home page ready");
});
```

Put this into `js/catalog.js`:

```javascript
$(function () {
  console.log("catalog page ready");
});
```

Put this into `js/detail.js`:

```javascript
$(function () {
  console.log("detail page ready");
});
```

- [ ] **Step 5: Verify the scaffold opens without missing-file errors**

Run:

```bash
xdg-open index.html
xdg-open cars.html
xdg-open car-detail.html
```

Expected: all three files open, the browser network panel shows the local CSS and JS files loading, and the console is free of 404 errors for project files.

---

### Task 2: Establish the shared visual system and reusable layout components

**Files:**
- Modify: `css/base.css`
- Modify: `css/components.css`
- Modify: `index.html`
- Modify: `cars.html`
- Modify: `car-detail.html`

- [ ] **Step 1: Add the shared base theme and resets**

Put this into `css/base.css`:

```css
:root {
  --color-bg: #050508;
  --color-bg-soft: #111118;
  --color-panel: rgba(17, 17, 24, 0.92);
  --color-line: rgba(255, 255, 255, 0.08);
  --color-gold: #c9a84c;
  --color-gold-soft: #ecd486;
  --color-text: #f4f1ea;
  --color-muted: #b5b1a8;
  --color-mono: #9f9aa0;
  --shadow-soft: 0 30px 80px rgba(0, 0, 0, 0.45);
  --radius-panel: 24px;
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
  color: var(--color-text);
  font-family: "Cormorant Garamond", serif;
  background:
    radial-gradient(circle at top, rgba(201, 168, 76, 0.09), transparent 30%),
    linear-gradient(180deg, #040406 0%, #09090e 45%, #040406 100%);
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

.page-shell {
  position: relative;
}

.container-luxury {
  width: min(100% - 32px, var(--container-max));
  margin-inline: auto;
}
```

- [ ] **Step 2: Add shared navbar, button, footer, and section-title skins**

Put this into `css/components.css`:

```css
.site-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  backdrop-filter: blur(18px);
  background: rgba(5, 5, 8, 0.78);
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.navbar-brand {
  font-family: "Bebas Neue", sans-serif;
  letter-spacing: 0.24em;
  font-size: 1.85rem;
}

.navbar-brand span {
  color: var(--color-gold);
}

.nav-link {
  font-family: "Space Mono", monospace;
  font-size: 0.72rem;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--color-muted);
}

.nav-link:hover,
.nav-link:focus,
.nav-link.active {
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
  letter-spacing: 0.32em;
  text-transform: uppercase;
}

.section-title {
  margin: 0;
  font-family: "Bebas Neue", sans-serif;
  font-size: clamp(2.6rem, 5vw, 5rem);
  letter-spacing: 0.06em;
  line-height: 0.95;
}

.site-footer {
  padding: 3rem 0;
  border-top: 1px solid var(--color-line);
  color: var(--color-muted);
}
```

- [ ] **Step 3: Add a shared semantic navbar to all three HTML files**

Insert this inside `<header>` in `index.html`, `cars.html`, and `car-detail.html`:

```html
<nav class="navbar navbar-expand-lg site-header">
  <div class="container-luxury">
    <a class="navbar-brand" href="index.html">APEX<span>.</span></a>
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
        <li class="nav-item"><a class="nav-link" href="index.html">Trang chủ</a></li>
        <li class="nav-item"><a class="nav-link" href="cars.html">Bộ sưu tập</a></li>
        <li class="nav-item"><a class="nav-link" href="car-detail.html">Chi tiết xe</a></li>
      </ul>
      <a class="btn-luxury" href="#booking-modal-anchor">Đặt lịch lái thử</a>
    </div>
  </div>
</nav>
```

- [ ] **Step 4: Add a shared footer to all three HTML files**

Insert this inside `<footer>` in `index.html`, `cars.html`, and `car-detail.html`:

```html
<div class="site-footer">
  <div class="container-luxury d-flex flex-column flex-lg-row justify-content-between gap-3">
    <p class="mb-0">APEX Motors showroom concept for cinematic luxury presentation.</p>
    <p class="mb-0">Lamborghini selection | Frontend-only experience</p>
  </div>
</div>
```

- [ ] **Step 5: Verify the shared shell is semantic and responsive**

Run:

```bash
xdg-open index.html
```

Expected: the page source now contains `header`, `nav`, `main`, `section`, and `footer` tags, the navbar collapses on narrow widths, and the overall palette already reads as dark luxury rather than stock Bootstrap.

---

### Task 3: Build the homepage cinematic structure and embed the 3D Lamborghini hero

**Files:**
- Modify: `index.html`
- Modify: `css/home.css`
- Reference: `model_iframe`

- [ ] **Step 1: Replace the homepage `<main>` with semantic sections**

Put this into `<main class="page-shell">` in `index.html`:

```html
<main class="page-shell home-page">
  <section class="hero-home">
    <div class="container-luxury">
      <div class="row align-items-center g-5 hero-home__grid">
        <div class="col-lg-5">
          <p class="section-kicker">2026 Lamborghini Selection</p>
          <h1 class="hero-home__title">Luxury In Motion</h1>
          <p class="hero-home__copy">
            Trải nghiệm showroom số mang ngôn ngữ điện ảnh, nơi sức mạnh cơ khí,
            thiết kế Ý và không gian trưng bày cao cấp gặp nhau trong một nhịp cuộn trang.
          </p>
          <div class="hero-home__actions">
            <a class="btn-luxury" href="cars.html">Khám phá bộ sưu tập</a>
            <a class="btn-luxury-outline" href="car-detail.html">Xem flagship</a>
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
        <h2 class="section-title">Dark luxury, crafted around motion and precision.</h2>
        <p class="brand-intro__copy">
          Từ cấu trúc ánh sáng đến typography, mọi layer đều phục vụ cảm giác như
          bước vào một private viewing lounge cho siêu xe hiệu năng cao.
        </p>
      </div>
    </div>
  </section>

  <section class="featured-collection">
    <div class="container-luxury">
      <div class="d-flex flex-column flex-lg-row justify-content-between align-items-lg-end gap-4 mb-5">
        <div>
          <p class="section-kicker">Curated Collection</p>
          <h2 class="section-title">Ba cấu hình mở đầu cho hành trình khám phá.</h2>
        </div>
        <a class="btn-luxury-outline" href="cars.html">Xem tất cả xe</a>
      </div>
      <div class="row g-4">
        <div class="col-lg-5">
          <article class="car-teaser car-teaser--featured"></article>
        </div>
        <div class="col-lg-7">
          <div class="row g-4">
            <div class="col-md-6"><article class="car-teaser"></article></div>
            <div class="col-md-6"><article class="car-teaser"></article></div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="experience-panel">
    <div class="container-luxury row align-items-center g-5">
      <div class="col-lg-6">
        <p class="section-kicker">Ownership Experience</p>
        <h2 class="section-title">Private consultation, performance curation, and aftercare.</h2>
      </div>
      <div class="col-lg-6">
        <ul class="experience-panel__list">
          <li>Cá nhân hóa cấu hình ngoại thất và khoang lái</li>
          <li>Tư vấn trải nghiệm lái thử theo lịch hẹn riêng</li>
          <li>Không gian trưng bày số cho khách hàng cao cấp</li>
        </ul>
      </div>
    </div>
  </section>

  <section class="testimonial-band">
    <div class="container-luxury">
      <div class="row g-4">
        <div class="col-md-6 col-xl-4"><article class="quote-card"></article></div>
        <div class="col-md-6 col-xl-4"><article class="quote-card"></article></div>
        <div class="col-md-6 col-xl-4"><article class="quote-card"></article></div>
      </div>
    </div>
  </section>
</main>
```

- [ ] **Step 2: Add the homepage styling, including the luxury iframe frame**

Put this into `css/home.css`:

```css
.hero-home {
  position: relative;
  padding: 7rem 0 4rem;
  min-height: 100vh;
}

.hero-home__title {
  font-family: "Bebas Neue", sans-serif;
  font-size: clamp(4rem, 10vw, 8.5rem);
  line-height: 0.9;
  letter-spacing: 0.08em;
  margin: 0 0 1.5rem;
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
  flex-wrap: wrap;
  gap: 2rem;
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
  text-transform: uppercase;
  color: var(--color-mono);
}

.model-stage {
  position: relative;
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
  position: relative;
  padding: 1rem;
  border-radius: var(--radius-panel);
  border: 1px solid rgba(201, 168, 76, 0.24);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.03), transparent),
    rgba(12, 12, 18, 0.96);
  box-shadow: var(--shadow-soft);
}

.model-stage__frame::before {
  content: "";
  position: absolute;
  inset: 10% 8%;
  background: radial-gradient(circle, rgba(201, 168, 76, 0.16), transparent 65%);
  filter: blur(30px);
  pointer-events: none;
}

.model-stage iframe {
  width: 100%;
  aspect-ratio: 16 / 10;
  border-radius: calc(var(--radius-panel) - 10px);
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

.brand-intro,
.featured-collection,
.experience-panel,
.testimonial-band {
  padding: 6rem 0;
}

.brand-intro__number {
  margin: 0;
  font-family: "Bebas Neue", sans-serif;
  font-size: clamp(6rem, 14vw, 11rem);
  color: rgba(201, 168, 76, 0.12);
}

.car-teaser,
.quote-card,
.experience-panel__list li {
  border: 1px solid var(--color-line);
  border-radius: var(--radius-panel);
  background: rgba(14, 14, 20, 0.82);
  box-shadow: var(--shadow-soft);
}

.car-teaser {
  min-height: 240px;
}

.car-teaser--featured {
  min-height: 504px;
}

.experience-panel__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 1rem;
}

.experience-panel__list li,
.quote-card {
  padding: 1.5rem;
  color: var(--color-muted);
}

@media (max-width: 991.98px) {
  .hero-home {
    padding-top: 5rem;
    min-height: auto;
  }
}
```

- [ ] **Step 3: Verify the 3D embed is the clear homepage centerpiece**

Run:

```bash
xdg-open index.html
```

Expected: the page opens with text on the left and the Sketchfab Lamborghini on the right, the iframe sits inside a framed dark-gold stage, and the layout stacks cleanly on smaller widths.

---

### Task 4: Build the catalog page with Bootstrap cards and jQuery-driven filtering

**Files:**
- Modify: `cars.html`
- Modify: `css/catalog.css`
- Modify: `js/catalog.js`

- [ ] **Step 1: Add the catalog page structure with a filter bar, card grid, and modal**

Put this into `<main class="page-shell">` in `cars.html`:

```html
<main class="page-shell catalog-page">
  <section class="catalog-hero">
    <div class="container-luxury">
      <p class="section-kicker">Curated Showroom</p>
      <h1 class="section-title">Bộ sưu tập siêu xe dành cho trải nghiệm private viewing.</h1>
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
        <div class="col-md-6 col-xl-4 car-item" data-series="v12" data-price="high">
          <article class="card showroom-card h-100">
            <div class="showroom-card__media"></div>
            <div class="card-body">
              <p class="showroom-card__brand">Lamborghini</p>
              <h2 class="showroom-card__title">Aventador LP 670</h2>
              <p class="showroom-card__copy">Flagship V12 coupe với chất cơ khí thuần túy và sân khấu thị giác mạnh.</p>
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
                data-copy="Flagship coupe, cấu hình theater-spec dành cho hero và private track session."
              >
                Quick view
              </button>
              <a class="btn-luxury flex-fill" href="car-detail.html?id=aventador-lp670">Chi tiết</a>
            </div>
          </article>
        </div>

        <div class="col-md-6 col-xl-4 car-item" data-series="track" data-price="high">
          <article class="card showroom-card h-100">
            <div class="showroom-card__media"></div>
            <div class="card-body">
              <p class="showroom-card__brand">Lamborghini</p>
              <h2 class="showroom-card__title">Huracán STO</h2>
              <p class="showroom-card__copy">Track-focused silhouette cho người cần phản hồi lái sắc và giàu cảm xúc.</p>
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
                data-copy="Thiết kế track-biased với cabin tối giản và khí động học mạnh."
              >
                Quick view
              </button>
              <a class="btn-luxury flex-fill" href="car-detail.html?id=huracan-sto">Chi tiết</a>
            </div>
          </article>
        </div>

        <div class="col-md-6 col-xl-4 car-item" data-series="hybrid" data-price="mid">
          <article class="card showroom-card h-100">
            <div class="showroom-card__media"></div>
            <div class="card-body">
              <p class="showroom-card__brand">Lamborghini</p>
              <h2 class="showroom-card__title">Revuelto</h2>
              <p class="showroom-card__copy">Hybrid supercar đại diện cho bước chuyển sang hiệu năng điện hóa cao cấp.</p>
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
                data-copy="Powertrain hybrid hiệu năng cao, phù hợp narrative công nghệ tương lai."
              >
                Quick view
              </button>
              <a class="btn-luxury flex-fill" href="car-detail.html?id=revuelto">Chi tiết</a>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
</main>

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

- [ ] **Step 2: Add the catalog page styling**

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

- [ ] **Step 3: Add the jQuery filter and quick-view logic**

Put this into `js/catalog.js`:

```javascript
$(function () {
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
});
```

- [ ] **Step 4: Verify both jQuery interactions work**

Run:

```bash
xdg-open cars.html
```

Expected:
- changing the select fields shows and hides cards without reloading the page
- clicking `Quick view` opens the Bootstrap modal and fills it with the clicked car data

---

### Task 5: Build the detail page with hero, Bootstrap carousel, and structured specs

**Files:**
- Modify: `car-detail.html`
- Modify: `css/detail.css`
- Modify: `js/detail.js`

- [ ] **Step 1: Add the semantic detail-page structure**

Put this into `<main class="page-shell">` in `car-detail.html`:

```html
<main class="page-shell detail-page">
  <section class="detail-hero">
    <div class="container-luxury row align-items-center g-5">
      <div class="col-lg-6">
        <p class="section-kicker">Flagship Detail</p>
        <h1 class="section-title">Lamborghini Aventador LP 670</h1>
        <p class="detail-hero__copy">
          Một cấu hình showroom được xây để cân bằng sự dữ dội của hiệu năng với
          bề mặt hoàn thiện, ánh sáng và chất liệu mang cảm giác private viewing.
        </p>
        <div class="detail-hero__meta">
          <span>26 tỷ VNĐ</span>
          <span>V12</span>
          <span>789 hp</span>
        </div>
        <div class="d-flex flex-wrap gap-3 mt-4">
          <a class="btn-luxury" href="#detail-gallery">Xem gallery</a>
          <a class="btn-luxury-outline" href="cars.html">Quay lại bộ sưu tập</a>
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
        <div class="col-md-6 col-xl-3"><article class="spec-tile"><h2>789 hp</h2><p>Công suất cực đại</p></article></div>
        <div class="col-md-6 col-xl-3"><article class="spec-tile"><h2>3.2s</h2><p>0-100 km/h</p></article></div>
        <div class="col-md-6 col-xl-3"><article class="spec-tile"><h2>355 km/h</h2><p>Tốc độ tối đa</p></article></div>
        <div class="col-md-6 col-xl-3"><article class="spec-tile"><h2>V12</h2><p>Powertrain</p></article></div>
      </div>
    </div>
  </section>

  <section class="detail-review">
    <div class="container-luxury">
      <blockquote class="detail-review__quote">
        “Đây là cấu hình phù hợp nhất để website kể được câu chuyện về quyền lực,
        thủ công, và trải nghiệm sở hữu theo phong cách cinematic.”
      </blockquote>
    </div>
  </section>
</main>
```

- [ ] **Step 2: Add the detail page styles**

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

- [ ] **Step 3: Add a minimal detail-page script for future data binding**

Put this into `js/detail.js`:

```javascript
$(function () {
  const params = new URLSearchParams(window.location.search);
  const currentId = params.get("id") || "aventador-lp670";
  $("body").attr("data-current-car", currentId);
});
```

- [ ] **Step 4: Verify the Bootstrap carousel and CTA flow work**

Run:

```bash
xdg-open "car-detail.html?id=aventador-lp670"
```

Expected: the detail page loads, the carousel arrows work, the hero and spec tiles hold together at mobile widths, and the page honors the query string without JavaScript errors.

---

### Task 6: Add GSAP entrance and scroll-based motion across the experience

**Files:**
- Modify: `js/home.js`
- Modify: `js/detail.js`
- Modify: `css/home.css`

- [ ] **Step 1: Add homepage GSAP animations**

Replace `js/home.js` with:

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

  gsap.utils.toArray(".brand-intro, .featured-collection, .experience-panel, .testimonial-band").forEach((section) => {
    gsap.from(section, {
      scrollTrigger: {
        trigger: section,
        start: "top 80%"
      },
      y: 60,
      opacity: 0,
      duration: 0.9,
      ease: "power2.out"
    });
  });
});
```

- [ ] **Step 2: Add a subtle detail-page reveal**

Replace `js/detail.js` with:

```javascript
$(function () {
  const params = new URLSearchParams(window.location.search);
  const currentId = params.get("id") || "aventador-lp670";
  $("body").attr("data-current-car", currentId);

  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  gsap.from(".detail-hero .section-title, .detail-hero__copy, .detail-hero__meta", {
    y: 24,
    opacity: 0,
    duration: 0.8,
    stagger: 0.1,
    ease: "power2.out"
  });

  gsap.utils.toArray(".detail-gallery, .detail-specs, .detail-review").forEach((section) => {
    gsap.from(section, {
      scrollTrigger: {
        trigger: section,
        start: "top 82%"
      },
      y: 48,
      opacity: 0,
      duration: 0.8,
      ease: "power2.out"
    });
  });
});
```

- [ ] **Step 3: Add reduced-motion safety for the homepage**

Append this to `css/home.css`:

```css
@media (prefers-reduced-motion: reduce) {
  .marquee-track {
    animation: none;
  }
}
```

- [ ] **Step 4: Verify GSAP motion is visible but restrained**

Run:

```bash
xdg-open index.html
xdg-open "car-detail.html?id=aventador-lp670"
```

Expected: hero elements animate on load, sections reveal on scroll, and the motion supports the luxury tone instead of competing with the iframe.

---

### Task 7: Add shared jQuery polish for navigation state and CTA visibility

**Files:**
- Modify: `js/main.js`
- Modify: `css/components.css`

- [ ] **Step 1: Replace the shared script with scroll-state behavior**

Replace `js/main.js` with:

```javascript
$(function () {
  const $header = $(".site-header");

  function syncHeaderState() {
    $header.toggleClass("site-header--scrolled", $(window).scrollTop() > 24);
  }

  $(window).on("scroll", syncHeaderState);
  syncHeaderState();
});
```

- [ ] **Step 2: Add the scrolled header state styling**

Append this to `css/components.css`:

```css
.site-header--scrolled {
  background: rgba(5, 5, 8, 0.92);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.28);
}
```

- [ ] **Step 3: Verify the third jQuery interaction works**

Run:

```bash
xdg-open index.html
```

Expected: scrolling the page changes the header appearance, confirming that the project now has more than the required two jQuery interactions.

---

### Task 8: Run responsive QA and requirement-by-requirement acceptance review

**Files:**
- Review only: `index.html`
- Review only: `cars.html`
- Review only: `car-detail.html`
- Review only: `css/*.css`
- Review only: `js/*.js`

- [ ] **Step 1: Check semantic structure manually**

Run:

```bash
rg -n "<header|<nav|<main|<section|<footer" index.html cars.html car-detail.html
```

Expected: each page contains the semantic tags required by the brief.

- [ ] **Step 2: Check Bootstrap component coverage**

Run:

```bash
rg -n "navbar|card|modal|carousel" index.html cars.html car-detail.html
```

Expected: the search confirms usage of `Navbar`, `Card`, `Modal`, and `Carousel`.

- [ ] **Step 3: Check the project structure requirement**

Run:

```bash
find . -maxdepth 2 \( -path "./css" -o -path "./js" -o -path "./images" \) -print
```

Expected: all three required folders are present.

- [ ] **Step 4: Perform viewport QA in browser devtools**

Run:

```bash
xdg-open index.html
xdg-open cars.html
xdg-open "car-detail.html?id=aventador-lp670"
```

Expected:
- desktop: hero split layout and cards breathe properly
- tablet: grids collapse without broken spacing
- mobile: navbar collapses, buttons remain tappable, iframe and carousel stay within the viewport

- [ ] **Step 5: Do a final requirement checklist pass**

Use this checklist:

```text
[ ] /css, /js, /images structure exists
[ ] semantic HTML present
[ ] Bootstrap Navbar used
[ ] Bootstrap Card used
[ ] Bootstrap Modal used
[ ] Bootstrap Carousel used
[ ] 3 pages exist
[ ] homepage contains Sketchfab Lamborghini iframe
[ ] at least 2 jQuery interactions work
[ ] GSAP motion is present
[ ] desktop, tablet, mobile checked
[ ] visual styling no longer feels like default Bootstrap
```

- [ ] **Step 6: Commit the completed static showroom**

Run:

```bash
git add index.html cars.html car-detail.html css js images docs/superpowers/specs/2026-04-26-car-showroom-dark-luxury-design.md docs/superpowers/plans/2026-04-26-car-showroom-dark-luxury.md
git commit -m "feat: build cinematic dark luxury showroom"
```

Expected: one commit captures the completed implementation. If the project directory is still not a git repository, skip the commit and note that constraint in the handoff.
