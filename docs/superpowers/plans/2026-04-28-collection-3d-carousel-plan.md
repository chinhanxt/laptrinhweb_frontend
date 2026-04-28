# 3D Collection Carousel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a horizontal 3D carousel strip below the showroom stage to browse additional car models that are not featured in the hero showroom.

**Architecture:** The carousel section sits inside `<main>` directly after the showroom stage. Each card contains a `<model-viewer>` element for 3D rendering (reusing the already-loaded web component). A dedicated JS module `collection-carousel.js` manages drag/swipe scrolling, active-card detection, lazy 3D loading (only active + 1 adjacent get real viewers), and progress tracking. The data comes from a new `COLLECTION_CARS` array defined inside the same file, separate from the hero `CAR_CATALOG`.

**Tech Stack:** HTML5, CSS3 (custom properties from `base.css`), vanilla JS, `<model-viewer>` web component (already in `<head>`), GSAP (already loaded)

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `index.html` | Add `collection-3d-section` HTML block after showroom stage |
| Modify | `assets/css/home.css` | All styles for the collection section |
| Create | `assets/js/collection-carousel.js` | Carousel data, interaction, lazy-load orchestration |
| Modify | `assets/js/home.js` | Wire up carousel initialization |

---

### Task 1: Add HTML skeleton for the collection section

**Files:**
- Modify: `index.html:213` (insert before `</main>`)

- [ ] **Step 1: Insert the collection section HTML after the showroom stage closing tag**

Inside `index.html`, locate line 213 (`</main>`) and insert the following block directly before it:

```html
      <!-- COLLECTION 3D CAROUSEL -->
      <section id="collection-3d" class="collection-3d-section">
        <div class="container-luxury">
          <div class="collection-3d__header reveal">
            <p class="section-kicker">Bộ Sưu Tập 3D</p>
            <h2 class="section-title">Khám Phá Thêm</h2>
          </div>
        </div>

        <div class="collection-3d__viewport">
          <button type="button" class="collection-3d__arrow collection-3d__arrow--prev" aria-label="Previous car">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="13,4 7,10 13,16"/>
            </svg>
          </button>

          <div class="collection-3d__track" id="collection-track">
            <!-- Cards injected by JS -->
          </div>

          <button type="button" class="collection-3d__arrow collection-3d__arrow--next" aria-label="Next car">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="7,4 13,10 7,16"/>
            </svg>
          </button>
        </div>

        <div class="collection-3d__progress">
          <span class="collection-3d__counter" id="collection-counter">1 / —</span>
          <div class="collection-3d__bar">
            <div class="collection-3d__bar-fill" id="collection-bar-fill"></div>
          </div>
        </div>
      </section>
```

- [ ] **Step 2: Add the script tag for collection-carousel.js**

In `index.html`, locate the script tags at the bottom (around line 271-274). Add the new script **before** `home.js` so it is available when home.js initializes:

```html
    <script src="assets/js/collection-carousel.js"></script>
    <script src="assets/js/home.js"></script>
```

Remove the existing `<script src="assets/js/home.js"></script>` line so it is not duplicated.

- [ ] **Step 3: Verify the page loads without errors**

Open `index.html` in a browser. The new section should appear as an empty area below the showroom. No JS errors in the console (the carousel JS file does not exist yet, but the browser should just 404 it silently or show a net error — no runtime crash).

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: add collection 3D carousel HTML skeleton"
```

---

### Task 2: Create collection carousel CSS

**Files:**
- Modify: `assets/css/home.css` (append at end, before the final closing)

- [ ] **Step 1: Add section wrapper and header styles**

Append the following to the end of `assets/css/home.css`:

```css
/* ----------------------------------------------------------
   COLLECTION 3D CAROUSEL
   ---------------------------------------------------------- */
.collection-3d-section {
  position: relative;
  padding: 5rem 0 4rem;
  background:
    radial-gradient(ellipse at 50% 20%, rgba(201, 168, 76, 0.04), transparent 50%),
    #030306;
  overflow: hidden;
}

.collection-3d__header {
  text-align: center;
  margin-bottom: 2.5rem;
}
```

- [ ] **Step 2: Add viewport, track, and arrow styles**

Continue appending:

```css
.collection-3d__viewport {
  position: relative;
  width: 100%;
  padding: 0 3.5rem;
}

.collection-3d__track {
  display: flex;
  gap: 1.5rem;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding: 1rem 0;
}

.collection-3d__track::-webkit-scrollbar {
  display: none;
}

.collection-3d__arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 50%;
  background: rgba(5, 5, 8, 0.7);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  box-shadow: inset 0 0 0 1px rgba(201, 168, 76, 0.06),
              0 4px 20px rgba(0, 0, 0, 0.4);
  color: var(--color-silver);
  cursor: pointer;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.25s ease, box-shadow 0.25s ease;
}

.collection-3d__arrow--prev { left: 0.5rem; }
.collection-3d__arrow--next { right: 0.5rem; }

.collection-3d__arrow:hover {
  color: var(--color-gold);
  box-shadow: inset 0 0 0 1px rgba(201, 168, 76, 0.25),
              0 4px 24px rgba(0, 0, 0, 0.5);
}

.collection-3d__arrow:disabled {
  opacity: 0.25;
  pointer-events: none;
}
```

- [ ] **Step 3: Add card styles**

Continue appending:

```css
/* --- Card --- */
.collection-3d-card {
  flex: 0 0 calc(45% - 0.75rem);
  min-width: 320px;
  max-width: 540px;
  scroll-snap-align: center;
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 16px;
  background: rgba(13, 13, 20, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  overflow: hidden;
  transition: border-color 0.4s ease, box-shadow 0.4s ease, transform 0.4s ease, opacity 0.4s ease;
  opacity: 0.55;
  transform: scale(0.96);
}

.collection-3d-card.is-active {
  border-color: rgba(201, 168, 76, 0.15);
  box-shadow: 0 8px 48px rgba(0, 0, 0, 0.5),
              0 0 0 1px rgba(201, 168, 76, 0.06);
  opacity: 1;
  transform: scale(1);
}

.collection-3d-card__viewer {
  position: relative;
  width: 100%;
  height: 240px;
  background:
    radial-gradient(circle at 50% 60%, rgba(201, 168, 76, 0.06), transparent 55%),
    #08080c;
  overflow: hidden;
}

.collection-3d-card__viewer model-viewer {
  width: 100%;
  height: 100%;
  --poster-color: transparent;
}

.collection-3d-card__viewer .collection-3d-card__poster {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "Bebas Neue", sans-serif;
  font-size: 2.5rem;
  letter-spacing: 0.08em;
  color: rgba(201, 168, 76, 0.12);
  pointer-events: none;
}

.collection-3d-card__glow {
  position: absolute;
  bottom: 0;
  left: 10%;
  right: 10%;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(201, 168, 76, 0.25), transparent);
  opacity: 0;
  transition: opacity 0.4s ease;
}

.collection-3d-card.is-active .collection-3d-card__glow {
  opacity: 1;
}
```

- [ ] **Step 4: Add card body, meta, and action styles**

Continue appending:

```css
.collection-3d-card__body {
  padding: 1.2rem 1.4rem 1.4rem;
}

.collection-3d-card__meta {
  margin-bottom: 1rem;
}

.collection-3d-card__brand {
  font-family: "Space Mono", monospace;
  font-size: 0.5rem;
  letter-spacing: 0.35em;
  text-transform: uppercase;
  color: var(--color-gold);
  margin: 0 0 0.2rem;
}

.collection-3d-card__name {
  font-family: "Bebas Neue", sans-serif;
  font-size: 1.6rem;
  letter-spacing: 0.04em;
  line-height: 1;
  color: var(--color-text);
  margin: 0 0 0.3rem;
}

.collection-3d-card__sub {
  font-family: "Cormorant Garamond", serif;
  font-size: 0.78rem;
  font-weight: 300;
  font-style: italic;
  color: rgba(168, 168, 184, 0.5);
  margin: 0;
}

.collection-3d-card__chips {
  display: flex;
  gap: 0.4rem;
  margin-bottom: 1rem;
}

.collection-3d-card__chip {
  font-family: "Space Mono", monospace;
  font-size: 0.45rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  padding: 0.25rem 0.55rem;
  border: 1px solid rgba(201, 168, 76, 0.12);
  border-radius: 4px;
  color: var(--color-silver);
}

.collection-3d-card__actions {
  padding-top: 0.8rem;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
}

.collection-3d-card__cta {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-family: "Space Mono", monospace;
  font-size: 0.55rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-silver);
  text-decoration: none;
  padding: 0.4rem 0;
  border: none;
  background: none;
  cursor: pointer;
  transition: color 0.3s ease;
}

.collection-3d-card__cta:hover {
  color: var(--color-gold);
}

.collection-3d-card__cta::after {
  content: "\2192";
  transition: transform 0.3s ease;
}

.collection-3d-card__cta:hover::after {
  transform: translateX(4px);
}
```

- [ ] **Step 5: Add progress bar styles**

Continue appending:

```css
/* --- Progress --- */
.collection-3d__progress {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.8rem;
  padding: 0 2rem;
}

.collection-3d__counter {
  font-family: "Space Mono", monospace;
  font-size: 0.55rem;
  letter-spacing: 0.2em;
  color: var(--color-silver);
  white-space: nowrap;
  min-width: 3.5rem;
}

.collection-3d__bar {
  width: 120px;
  height: 2px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 1px;
  overflow: hidden;
}

.collection-3d__bar-fill {
  height: 100%;
  width: 0%;
  background: var(--color-gold);
  border-radius: 1px;
  transition: width 0.35s ease;
}
```

- [ ] **Step 6: Add responsive styles**

Continue appending:

```css
/* --- Responsive --- */
@media (max-width: 991.98px) {
  .collection-3d-section { padding: 4rem 0 3rem; }
  .collection-3d__viewport { padding: 0 2.5rem; }
  .collection-3d-card {
    flex: 0 0 calc(65% - 0.75rem);
    min-width: 280px;
  }
  .collection-3d-card__viewer { height: 200px; }
}

@media (max-width: 575.98px) {
  .collection-3d-section { padding: 3rem 0 2.5rem; }
  .collection-3d__viewport { padding: 0 0.5rem; }
  .collection-3d__arrow { display: none; }
  .collection-3d-card {
    flex: 0 0 calc(88% - 0.75rem);
    min-width: 260px;
  }
  .collection-3d-card__viewer { height: 180px; }
  .collection-3d-card__name { font-size: 1.3rem; }
}

@media (prefers-reduced-motion: reduce) {
  .collection-3d__track { scroll-behavior: auto; }
  .collection-3d-card { transition: none; }
}
```

- [ ] **Step 7: Verify CSS loads and section renders visually**

Reload the page. The collection section should be visible below the showroom as a dark band with the header text "Khám Phá Thêm" centered. No cards yet (they will be injected by JS).

- [ ] **Step 8: Commit**

```bash
git add assets/css/home.css
git commit -m "feat: add collection 3D carousel styles"
```

---

### Task 3: Create the collection carousel JS module

**Files:**
- Create: `assets/js/collection-carousel.js`

- [ ] **Step 1: Create the file with the data array and module wrapper**

Create `assets/js/collection-carousel.js` with:

```javascript
window.CollectionCarousel = (function () {
  var COLLECTION_CARS = [
    {
      id: "terzo-millennio",
      model: "assets/model/free__lamborghini_terzo_millennio_wind_tunnel.glb",
      brand: "Lamborghini",
      name: "Terzo Millennio",
      sub: "Electric Concept",
      chips: ["Electric", "Concept"],
      cameraOrbit: "45deg 75deg 105%",
      cameraTarget: "0m 0.4m 0m",
      fieldOfView: "30deg"
    },
    {
      id: "revuelto",
      model: "assets/model/revuelto_3.0tm.glb",
      brand: "Lamborghini",
      name: "Revuelto",
      sub: "Hybrid V12",
      chips: ["Hybrid", "V12"],
      cameraOrbit: "45deg 75deg 105%",
      cameraTarget: "0m 0.4m 0m",
      fieldOfView: "30deg"
    }
  ];

  var trackEl, counterEl, barFillEl, prevBtn, nextBtn;
  var cards = [];
  var activeIndex = 0;
  var initialized = false;

  return {
    COLLECTION_CARS: COLLECTION_CARS,
    init: init
  };

  function init() {
    if (initialized) return;
    trackEl = document.getElementById("collection-track");
    counterEl = document.getElementById("collection-counter");
    barFillEl = document.getElementById("collection-bar-fill");
    prevBtn = document.querySelector(".collection-3d__arrow--prev");
    nextBtn = document.querySelector(".collection-3d__arrow--next");

    if (!trackEl || !COLLECTION_CARS.length) return;

    buildCards();
    bindEvents();
    updateActiveCard(0);
    initialized = true;
  }

  function buildCards() {
    var fragment = document.createDocumentFragment();

    COLLECTION_CARS.forEach(function (car, index) {
      var card = document.createElement("div");
      card.className = "collection-3d-card";
      card.dataset.index = index;

      var chipsHtml = "";
      if (car.chips && car.chips.length) {
        chipsHtml = '<div class="collection-3d-card__chips">' +
          car.chips.map(function (chip) {
            return '<span class="collection-3d-card__chip">' + chip + '</span>';
          }).join("") +
          '</div>';
      }

      card.innerHTML =
        '<div class="collection-3d-card__viewer">' +
          '<div class="collection-3d-card__poster">' + car.brand + '</div>' +
          '<div class="collection-3d-card__glow"></div>' +
        '</div>' +
        '<div class="collection-3d-card__body">' +
          '<div class="collection-3d-card__meta">' +
            '<p class="collection-3d-card__brand">' + car.brand + '</p>' +
            '<h3 class="collection-3d-card__name">' + car.name + '</h3>' +
            '<p class="collection-3d-card__sub">' + car.sub + '</p>' +
          '</div>' +
          chipsHtml +
          '<div class="collection-3d-card__actions">' +
            '<a href="assets/html/detail.html?car=' + car.id + '" class="collection-3d-card__cta">Xem chi ti\u1EBFt</a>' +
          '</div>' +
        '</div>';

      fragment.appendChild(card);
      cards.push(card);
    });

    trackEl.appendChild(fragment);
  }

  function bindEvents() {
    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        scrollToIndex(activeIndex - 1);
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        scrollToIndex(activeIndex + 1);
      });
    }

    var scrollTimeout;
    trackEl.addEventListener("scroll", function () {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(onScrollEnd, 80);
    }, { passive: true });
  }

  function onScrollEnd() {
    var trackRect = trackEl.getBoundingClientRect();
    var trackCenter = trackRect.left + trackRect.width / 2;
    var closest = 0;
    var closestDist = Infinity;

    cards.forEach(function (card, index) {
      var cardRect = card.getBoundingClientRect();
      var cardCenter = cardRect.left + cardRect.width / 2;
      var dist = Math.abs(cardCenter - trackCenter);
      if (dist < closestDist) {
        closestDist = dist;
        closest = index;
      }
    });

    updateActiveCard(closest);
  }

  function scrollToIndex(index) {
    if (index < 0 || index >= cards.length) return;
    cards[index].scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center"
    });
    updateActiveCard(index);
  }

  function updateActiveCard(index) {
    activeIndex = index;

    cards.forEach(function (card, i) {
      card.classList.toggle("is-active", i === index);
    });

    if (counterEl) {
      counterEl.textContent = (index + 1) + " / " + cards.length;
    }
    if (barFillEl) {
      var pct = cards.length > 1 ? ((index) / (cards.length - 1)) * 100 : 100;
      barFillEl.style.width = pct + "%";
    }

    if (prevBtn) prevBtn.disabled = index === 0;
    if (nextBtn) nextBtn.disabled = index === cards.length - 1;

    loadViewerForCard(index);
    if (index > 0) loadViewerForCard(index - 1);
    if (index < cards.length - 1) loadViewerForCard(index + 1);
  }

  function loadViewerForCard(index) {
    var card = cards[index];
    if (!card || card.dataset.loaded === "true") return;

    var car = COLLECTION_CARS[index];
    var viewerArea = card.querySelector(".collection-3d-card__viewer");
    var poster = viewerArea.querySelector(".collection-3d-card__poster");
    if (!viewerArea || !car.model) return;

    var mv = document.createElement("model-viewer");
    mv.setAttribute("src", car.model);
    mv.setAttribute("camera-controls", "");
    mv.setAttribute("disable-zoom", "");
    mv.setAttribute("disable-pan", "");
    mv.setAttribute("interaction-prompt", "none");
    mv.setAttribute("auto-rotate", "");
    mv.setAttribute("auto-rotate-delay", "0");
    mv.setAttribute("rotation-per-second", "18deg");
    mv.setAttribute("camera-orbit", car.cameraOrbit || "45deg 75deg 105%");
    mv.setAttribute("camera-target", car.cameraTarget || "0m 0.4m 0m");
    mv.setAttribute("field-of-view", car.fieldOfView || "30deg");
    mv.setAttribute("exposure", "0.8");
    mv.setAttribute("shadow-intensity", "0");
    mv.setAttribute("environment-image", "neutral");
    mv.setAttribute("loading", "lazy");
    mv.style.width = "100%";
    mv.style.height = "100%";
    mv.style.cssText = "width:100%;height:100%;background:transparent;";

    var progressSlot = document.createElement("div");
    progressSlot.setAttribute("slot", "progress-bar");
    mv.appendChild(progressSlot);

    mv.addEventListener("load", function () {
      if (poster) poster.style.display = "none";
    });

    viewerArea.insertBefore(mv, poster);
    card.dataset.loaded = "true";
  }
})();
```

- [ ] **Step 2: Verify the file is syntactically valid**

Open the browser, ensure no syntax errors appear in the console related to `collection-carousel.js`.

- [ ] **Step 3: Commit**

```bash
git add assets/js/collection-carousel.js
git commit -m "feat: add collection carousel JS module with data and lazy loading"
```

---

### Task 4: Wire up carousel initialization in home.js

**Files:**
- Modify: `assets/js/home.js:25-26`

- [ ] **Step 1: Add the collection section to the GSAP scroll reveal list**

In `assets/js/home.js`, find line 25 where the section selectors are listed:

```javascript
    gsap.utils.toArray(".showroom-stage-section, .brand-intro, .featured-section, .experience-section, .testimonials-section").forEach(function (section) {
```

Replace it with:

```javascript
    gsap.utils.toArray(".showroom-stage-section, .collection-3d-section, .brand-intro, .featured-section, .experience-section, .testimonials-section").forEach(function (section) {
```

- [ ] **Step 2: Initialize the carousel after boot tasks resolve**

In `assets/js/home.js`, find the `Promise.all(bootTasks).finally` block (around line 101). Inside the `.finally` callback, after the `APEXIntro.dismissLoading` block and before the hash-scroll block, add:

```javascript
      if (window.CollectionCarousel) {
        window.CollectionCarousel.init();
      }
```

The full `.finally` block should look like:

```javascript
    Promise.all(bootTasks).finally(function () {
      if (window.APEXIntro && typeof window.APEXIntro.dismissLoading === "function") {
        window.APEXIntro.dismissLoading();
      } else {
        document.body.classList.remove("app-is-booting");
      }

      if (window.CollectionCarousel) {
        window.CollectionCarousel.init();
      }

      if (window.location.hash) {
        window.requestAnimationFrame(function () {
          var target = document.querySelector(window.location.hash);
          if (target) target.scrollIntoView();
        });
      }
    });
```

- [ ] **Step 3: Test full integration**

Reload the page. Scroll past the showroom stage. The collection section should appear with:
- Two cards visible (Terzo Millennio, Revuelto)
- The first card marked as active (brighter, full size)
- The second card dimmed and slightly smaller
- Progress counter showing "1 / 2"
- Arrow navigation working
- 3D model loading on the active card with auto-rotation

- [ ] **Step 4: Test responsive behavior**

Resize the browser:
- Desktop: ~2.2 cards visible, both arrows present
- Tablet (~768px): ~1.3-1.5 cards visible
- Mobile (~375px): one card at a time, arrows hidden, swipe works

- [ ] **Step 5: Commit**

```bash
git add assets/js/home.js
git commit -m "feat: wire collection carousel initialization into home boot sequence"
```

---

### Task 5: Tune 3D viewer camera angles per model

**Files:**
- Modify: `assets/js/collection-carousel.js:3-22` (the `COLLECTION_CARS` array)

- [ ] **Step 1: Open the page and inspect each model's default camera angle**

Load the page and scroll to the collection carousel. For each car, note whether the default `camera-orbit`, `camera-target`, and `field-of-view` produce a good silhouette. The model should be centered and clearly readable.

- [ ] **Step 2: Adjust camera parameters based on visual inspection**

Update the `COLLECTION_CARS` entries in `assets/js/collection-carousel.js` with tuned values. Example adjustments (actual values depend on visual testing):

For Terzo Millennio:
```javascript
    {
      id: "terzo-millennio",
      model: "assets/model/free__lamborghini_terzo_millennio_wind_tunnel.glb",
      brand: "Lamborghini",
      name: "Terzo Millennio",
      sub: "Electric Concept",
      chips: ["Electric", "Concept"],
      cameraOrbit: "40deg 72deg 110%",
      cameraTarget: "0m 0.35m 0m",
      fieldOfView: "28deg"
    },
```

For Revuelto:
```javascript
    {
      id: "revuelto",
      model: "assets/model/revuelto_3.0tm.glb",
      brand: "Lamborghini",
      name: "Revuelto",
      sub: "Hybrid V12",
      chips: ["Hybrid", "V12"],
      cameraOrbit: "50deg 78deg 100%",
      cameraTarget: "0m 0.45m 0m",
      fieldOfView: "32deg"
    }
```

Iterate visually: adjust values, reload, check the silhouette reads well in the card viewport.

- [ ] **Step 3: Verify auto-rotation is smooth and models don't clip**

Ensure the auto-rotate looks natural at the configured distance. No parts of the car should clip out of the card viewport during rotation.

- [ ] **Step 4: Commit**

```bash
git add assets/js/collection-carousel.js
git commit -m "fix: tune collection carousel camera angles per model"
```

---

### Task 6: Final visual polish and cross-browser check

**Files:**
- Possibly modify: `assets/css/home.css`, `assets/js/collection-carousel.js`

- [ ] **Step 1: Check the visual transition between showroom and collection**

Scroll from the showroom stage into the collection section. The background should transition smoothly (showroom = `var(--color-bg)` / collection = `#030306`). If the jump is too harsh, soften it by adjusting the collection section's top padding or adding a gradient transition.

- [ ] **Step 2: Test drag/swipe on touch devices or emulation**

Open Chrome DevTools, enable device toolbar, and test swipe gestures on the track. Cards should snap to center via `scroll-snap-type: x mandatory`.

- [ ] **Step 3: Test prefers-reduced-motion**

In DevTools, emulate `prefers-reduced-motion: reduce`. Verify:
- No scroll-behavior smooth animation
- No card transition animation
- Auto-rotate on model-viewer should still work (it's not CSS-controlled)

- [ ] **Step 4: Commit any polish changes**

```bash
git add assets/css/home.css assets/js/collection-carousel.js
git commit -m "fix: visual polish for collection 3D carousel"
```

---

## Summary

| Task | Description | Estimated Time |
|------|-------------|----------------|
| 1 | HTML skeleton | 5 min |
| 2 | CSS styles | 15 min |
| 3 | JS carousel module | 20 min |
| 4 | Wire up in home.js | 5 min |
| 5 | Tune camera angles | 10 min |
| 6 | Polish & cross-browser | 10 min |
| **Total** | | **~65 min** |
