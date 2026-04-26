# Hero Cinematic Intro Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the homepage's first-screen interactive hero with a looping cinematic intro video, then move the existing Three.js showroom interaction into the next section below it.

**Architecture:** Keep the homepage split into two independent modules: a new `hero-cinematic` module that owns media playback, overlay, and fallback behavior, and the existing `hero-3d` module that continues to own the interactive showroom stage. The intro uses pre-rendered media files for visual quality, while the interactive section remains real-time Three.js.

**Tech Stack:** HTML5, CSS, JavaScript, jQuery, GSAP, Three.js, Bootstrap 5

---

## File Structure Map

**Create:**
- `assets/js/hero-cinematic.js`
- `assets/media/hero/.gitkeep`
- `assets/media/hero/README.md`
- `docs/superpowers/plans/2026-04-27-hero-cinematic-intro-implementation-plan.md`

**Modify:**
- `index.html`
- `assets/css/home.css`
- `assets/js/home.js`

**Reuse without logic changes:**
- `assets/js/hero-3d.js`
- `images/hero-fallback-poster.svg`
- `model/lambo_lp670.glb`
- `model/asian_themed_low_poly_night_city_buildings.glb`
- `model/low_poly_road_pack.glb`

**Expected final media contract:**
- `assets/media/hero/apex-intro-loop.mp4`
- `assets/media/hero/apex-intro-loop.webm`
- `assets/media/hero/apex-intro-poster.jpg`

---

### Task 1: Define the Hero Media Contract and Load Order

**Files:**
- Create: `assets/media/hero/.gitkeep`
- Create: `assets/media/hero/README.md`
- Modify: `index.html`

- [ ] **Step 1: Create the media directory placeholder**

Add an empty keep-file so the repo always contains the target media directory:

```text
assets/media/hero/.gitkeep
```

- [ ] **Step 2: Document the required exported assets**

Create `assets/media/hero/README.md` with the exact filenames, source models, and expectations:

```md
# Hero Cinematic Media Contract

Place the rendered homepage intro exports in this folder using these exact filenames:

- `apex-intro-loop.mp4`
- `apex-intro-loop.webm`
- `apex-intro-poster.jpg`

The rendered loop must:

- use `model/lambo_lp670.glb` as the hero car
- use `model/asian_themed_low_poly_night_city_buildings.glb` as the city world
- place `model/low_poly_road_pack.glb` inside the city as the driving route
- run for 15-20 seconds
- loop cleanly from final frame back to opening side-tracking shot
- contain no audio
```

- [ ] **Step 3: Add preload hints for the poster and video**

Insert these tags inside `<head>` in `index.html` after the CSS includes:

```html
<link rel="preload" as="image" href="assets/media/hero/apex-intro-poster.jpg" />
<link rel="preload" as="video" href="assets/media/hero/apex-intro-loop.webm" type="video/webm" />
<link rel="preload" as="video" href="assets/media/hero/apex-intro-loop.mp4" type="video/mp4" />
```

- [ ] **Step 4: Verify the HTML still parses cleanly**

Run: `python3 - <<'PY'\nfrom html.parser import HTMLParser\nHTMLParser().feed(open('index.html', encoding='utf-8').read())\nprint('HTML_OK')\nPY`

Expected: `HTML_OK`

- [ ] **Step 5: Commit**

```bash
git add assets/media/hero/.gitkeep assets/media/hero/README.md index.html
git commit -m "docs: define hero cinematic media contract"
```

---

### Task 2: Replace the First-Screen Hero Markup with a Cinematic Intro Section

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Replace the current hero body with a video-led structure**

Update the current `#hero` section so the first screen uses a dedicated cinematic shell instead of the split interactive layout:

```html
<section id="hero" class="hero-section hero-section--cinematic">
  <div class="hero-cinematic">
    <div class="hero-cinematic__media">
      <video
        id="hero-cinematic-video"
        class="hero-cinematic__video"
        autoplay
        muted
        playsinline
        loop
        preload="auto"
        poster="assets/media/hero/apex-intro-poster.jpg"
        aria-label="Cinematic Lamborghini intro video"
      >
        <source src="assets/media/hero/apex-intro-loop.webm" type="video/webm" />
        <source src="assets/media/hero/apex-intro-loop.mp4" type="video/mp4" />
      </video>
      <div id="hero-cinematic-fallback" class="hero-cinematic__fallback is-hidden">
        <img src="assets/media/hero/apex-intro-poster.jpg" alt="Cinematic Lamborghini intro poster" />
      </div>
      <div class="hero-cinematic__scrim"></div>
    </div>

    <div class="container-luxury hero-cinematic__content">
      <div class="hero-cinematic__text">
        <p class="hero-eyebrow">Lamborghini Showroom Experience</p>
        <h1 class="hero-title">Luxury<br />In Motion</h1>
        <p class="hero-desc">
          Kham pha bo suu tap sieu xe Lamborghini doc quyen.
          Trai nghiem dinh cao cua thiet ke, toc do va su sang trong
          tai APEX Motors.
        </p>
        <div class="hero-ctas">
          <a href="#" class="btn-luxury btn-luxury--arrow" data-view="catalog">Kham pha ngay</a>
          <a href="#showroom-stage" class="btn-luxury-outline">Tim hieu them</a>
        </div>
        <div class="hero-stats">
          <div class="hero-stat">
            <span class="stat-num">12+</span>
            <span class="stat-label">Mau xe</span>
          </div>
          <div class="hero-stat">
            <span class="stat-num">3.2s</span>
            <span class="stat-label">0-100 km/h</span>
          </div>
          <div class="hero-stat">
            <span class="stat-num">770</span>
            <span class="stat-label">Ma luc</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="scroll-hint">
    <span>Scroll</span>
    <div class="scroll-line"></div>
  </div>
</section>
```

- [ ] **Step 2: Reinsert the existing interactive scene as a new section directly below the hero**

Add a new section immediately after `#hero` and move the current `.model-stage` markup into it:

```html
<section id="showroom-stage" class="showroom-stage-section">
  <div class="container-luxury">
    <div class="showroom-stage__header reveal">
      <p class="section-kicker">Interactive Showroom</p>
      <h2 class="section-title">Explore The Machine After The Trailer</h2>
      <p class="showroom-stage__desc">
        Xoay xe, focus vao cac chi tiet va tiep tuc kham pha sau phan intro cinematic.
      </p>
    </div>

    <div class="model-stage">
      <div class="model-stage__meta">
        <span class="model-stage__label">Interactive 3D Preview</span>
      </div>
      <div class="model-stage__frame">
        <div id="hero-3d-shell" class="hero-3d-shell">
          <div id="hero-3d-canvas" class="hero-3d-canvas" aria-label="3D Lamborghini showroom scene"></div>
          <div id="hero-3d-overlay" class="hero-3d-overlay">
            <div class="hero-zone-nav">
              <button class="hero-zone-btn" data-zone="front" type="button">Dau xe</button>
              <button class="hero-zone-btn" data-zone="wheel" type="button">Mam / Banh</button>
              <button class="hero-zone-btn" data-zone="cabin" type="button">Cabin</button>
              <button class="hero-zone-btn" data-zone="rear" type="button">Duoi xe</button>
              <button id="hero-reset-focus" class="hero-zone-btn hero-zone-btn--reset" type="button">Reset</button>
            </div>
            <div id="hero-focus-caption" class="hero-focus-caption is-hidden" aria-live="polite">
              <p class="hero-focus-caption__eyebrow">Focus Zone</p>
              <h2 class="hero-focus-caption__title"></h2>
              <p class="hero-focus-caption__copy"></p>
            </div>
          </div>
          <div id="hero-fallback" class="hero-fallback is-hidden">
            <img src="images/hero-fallback-poster.svg" alt="Lamborghini 3D showroom fallback poster" />
          </div>
          <div id="hero-loading" class="hero-loading">
            <span class="hero-loading__label">Loading 3D showroom scene</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 3: Keep the remaining homepage sections in the current order**

After moving the interactive block, keep:

```html
<div class="marquee-strip" aria-hidden="true">...</div>
<section id="brand-intro" class="brand-intro">...</section>
<section id="featured" class="featured-section">...</section>
```

This preserves the existing storytelling flow after the new two-stage opening.

- [ ] **Step 4: Verify the updated DOM contains both hero modules**

Run: `rg -n "hero-cinematic-video|showroom-stage|hero-3d-shell" index.html`

Expected:
- one match for `hero-cinematic-video`
- one match for `showroom-stage`
- one match for `hero-3d-shell`

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: split homepage into cinematic hero and showroom stage"
```

---

### Task 3: Style the Cinematic Hero as a Full-Bleed Luxury Opening

**Files:**
- Modify: `assets/css/home.css`

- [ ] **Step 1: Replace split-hero assumptions with full-bleed cinematic layout rules**

Add or update the hero rules so the first screen becomes a visual-led stage:

```css
.hero-section--cinematic {
  min-height: 100vh;
  padding: 0;
  overflow: clip;
  background: #05070b;
}

.hero-cinematic {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: stretch;
}

.hero-cinematic__media,
.hero-cinematic__video,
.hero-cinematic__fallback,
.hero-cinematic__fallback img,
.hero-cinematic__scrim {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.hero-cinematic__video,
.hero-cinematic__fallback img {
  object-fit: cover;
}

.hero-cinematic__scrim {
  background:
    linear-gradient(90deg, rgba(4, 5, 8, 0.82) 0%, rgba(4, 5, 8, 0.42) 42%, rgba(4, 5, 8, 0.6) 100%),
    radial-gradient(circle at 70% 40%, rgba(201, 168, 76, 0.12), transparent 28%);
  z-index: 1;
}

.hero-cinematic__content {
  position: relative;
  z-index: 2;
  min-height: 100vh;
  display: flex;
  align-items: center;
}

.hero-cinematic__text {
  max-width: 40rem;
  padding: 8rem 0 6rem;
}
```

- [ ] **Step 2: Add dedicated spacing and framing for the new showroom section**

Add a new block for the moved interactive stage:

```css
.showroom-stage-section {
  position: relative;
  padding: 7rem 0 4rem;
  background:
    radial-gradient(ellipse at top, rgba(201, 168, 76, 0.08), transparent 45%),
    var(--color-bg);
}

.showroom-stage__header {
  max-width: 42rem;
  margin-bottom: 2.5rem;
}

.showroom-stage__desc {
  color: var(--color-silver);
  line-height: 1.8;
  max-width: 36rem;
}
```

- [ ] **Step 3: Add responsive adjustments so the text remains readable on mobile**

Append a mobile-safe override:

```css
@media (max-width: 991.98px) {
  .hero-cinematic__content {
    align-items: flex-end;
  }

  .hero-cinematic__text {
    max-width: none;
    padding: 7rem 0 5rem;
  }

  .hero-desc {
    max-width: 34rem;
  }

  .hero-stats {
    gap: 1.5rem;
    flex-wrap: wrap;
  }
}
```

- [ ] **Step 4: Verify the stylesheet parses and includes the new selectors**

Run: `rg -n "hero-cinematic__video|showroom-stage-section|hero-section--cinematic" assets/css/home.css`

Expected:
- one or more matches for all three selectors

- [ ] **Step 5: Commit**

```bash
git add assets/css/home.css
git commit -m "feat: style cinematic homepage hero"
```

---

### Task 4: Add a Dedicated Cinematic Playback Module

**Files:**
- Create: `assets/js/hero-cinematic.js`
- Modify: `index.html`

- [ ] **Step 1: Load the new module before `home.js`**

Add this script tag in `index.html` with the other local scripts:

```html
<script src="assets/js/hero-cinematic.js"></script>
```

Keep `assets/js/home.js` loading after it so the homepage orchestrator can call the module.

- [ ] **Step 2: Create the playback module with autoplay, resume, and fallback behavior**

Create `assets/js/hero-cinematic.js`:

```javascript
window.APEXCinematicHero = (function () {
  var videoEl;
  var fallbackEl;

  function showFallback() {
    if (fallbackEl) {
      fallbackEl.classList.remove("is-hidden");
    }
    if (videoEl) {
      videoEl.classList.add("is-hidden");
    }
  }

  function attemptPlay() {
    if (!videoEl) return;

    var playPromise = videoEl.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {
        showFallback();
      });
    }
  }

  function handleVisibilityChange() {
    if (!videoEl) return;
    if (!document.hidden && videoEl.paused) {
      attemptPlay();
    }
  }

  function bindVideoEvents() {
    if (!videoEl) return;

    videoEl.addEventListener("error", showFallback);
    videoEl.addEventListener("stalled", showFallback);
    videoEl.addEventListener("suspend", function () {
      if (!videoEl.currentTime) {
        showFallback();
      }
    });
  }

  function init() {
    videoEl = document.getElementById("hero-cinematic-video");
    fallbackEl = document.getElementById("hero-cinematic-fallback");

    if (!videoEl) return false;

    bindVideoEvents();
    attemptPlay();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return true;
  }

  return {
    init: init,
    showFallback: showFallback
  };
})();
```

- [ ] **Step 3: Syntax-check the new JavaScript module**

Run: `node --check assets/js/hero-cinematic.js`

Expected: no output and exit code `0`

- [ ] **Step 4: Verify the script is linked from the homepage**

Run: `rg -n "hero-cinematic\\.js|APEXCinematicHero" index.html assets/js/hero-cinematic.js`

Expected:
- one match in `index.html` for `hero-cinematic.js`
- one match in `assets/js/hero-cinematic.js` for `window.APEXCinematicHero`

- [ ] **Step 5: Commit**

```bash
git add index.html assets/js/hero-cinematic.js
git commit -m "feat: add cinematic hero playback module"
```

---

### Task 5: Rewire Homepage Initialization and Animations

**Files:**
- Modify: `assets/js/home.js`

- [ ] **Step 1: Replace the old first-load animation assumptions**

Update the first animation block so the cinematic hero drives the opening instead of `.model-stage`:

```javascript
if (!homeInitialized) {
  gsap.from(".hero-eyebrow, .hero-title, .hero-desc, .hero-ctas, .hero-stats", {
    y: 32,
    opacity: 0,
    duration: 0.9,
    stagger: 0.12,
    ease: "power3.out"
  });

  gsap.from(".hero-cinematic__media", {
    scale: 1.04,
    opacity: 0,
    duration: 1.4,
    ease: "power2.out"
  });

  gsap.from(".scroll-hint", {
    opacity: 0,
    duration: 0.6,
    delay: 1.4,
    ease: "power2.out"
  });

  homeInitialized = true;
}
```

- [ ] **Step 2: Initialize the cinematic hero before wiring the 3D showroom**

Replace the current `$(function () { ... })` body with this flow:

```javascript
$(function () {
  initHomeAnimations();

  if (window.APEXCinematicHero) {
    window.APEXCinematicHero.init();
  }

  if (window.APEXHero3D) {
    var prefersFallback = window.innerWidth < 576;

    if (prefersFallback) {
      window.APEXHero3D.showHeroFallback();
      $("#hero-loading").addClass("is-hidden");
    } else {
      var initialized = window.APEXHero3D.initHeroScene();
      if (initialized) {
        window.APEXHero3D.animate();
      }
    }

    $(".hero-zone-btn[data-zone]").on("click", function () {
      window.APEXHero3D.focusZone($(this).data("zone"));
    });

    $("#hero-reset-focus").on("click", function () {
      window.APEXHero3D.resetHeroCamera();
    });
  }
});
```

- [ ] **Step 3: Syntax-check the homepage script**

Run: `node --check assets/js/home.js`

Expected: no output and exit code `0`

- [ ] **Step 4: Smoke-check the page behavior in a browser**

Run the local site, open the homepage, and verify all of the following manually:

- the first viewport shows the cinematic video instead of the split 3D frame
- the hero text and CTA remain readable on top of the video
- scrolling down reveals the interactive 3D showroom section
- clicking `Dau xe`, `Mam / Banh`, `Cabin`, `Duoi xe`, and `Reset` still works in the moved section
- refreshing the page restarts the cinematic hero without console errors

- [ ] **Step 5: Commit**

```bash
git add assets/js/home.js
git commit -m "feat: initialize cinematic hero before interactive showroom"
```

---

### Task 6: Final Asset Swap and Acceptance Pass

**Files:**
- Create or replace: `assets/media/hero/apex-intro-loop.mp4`
- Create or replace: `assets/media/hero/apex-intro-loop.webm`
- Create or replace: `assets/media/hero/apex-intro-poster.jpg`
- Modify: `assets/media/hero/README.md`

- [ ] **Step 1: Place the final rendered exports using the agreed filenames**

The folder must end this task with these exact files:

```text
assets/media/hero/apex-intro-loop.mp4
assets/media/hero/apex-intro-loop.webm
assets/media/hero/apex-intro-poster.jpg
```

- [ ] **Step 2: Update the README with the final export status**

Append this checklist to `assets/media/hero/README.md` after the media contract section:

```md
## Delivery Checklist

- [x] `apex-intro-loop.mp4` exported
- [x] `apex-intro-loop.webm` exported
- [x] `apex-intro-poster.jpg` exported
- [x] Uses `lambo_lp670.glb`
- [x] Uses `asian_themed_low_poly_night_city_buildings.glb`
- [x] Places `low_poly_road_pack.glb` inside the city route
- [x] Runs 15-20 seconds
- [x] Loops cleanly
- [x] Contains no audio
```

- [ ] **Step 3: Verify the browser selects a valid source**

Run: `rg -n "apex-intro-loop|apex-intro-poster" index.html assets/media/hero/README.md`

Expected:
- `index.html` references `apex-intro-loop.webm`, `apex-intro-loop.mp4`, and `apex-intro-poster.jpg`
- `README.md` references the same three filenames

- [ ] **Step 4: Perform the final manual acceptance pass**

Verify manually on desktop:

- opening hero autoplays muted
- the loop reconnects smoothly from end to start
- scrolling away from the hero does not break the rest of the page
- returning to the top does not show a broken or reset-looking state
- disconnecting or renaming the video files forces the poster fallback instead of a blank hero

- [ ] **Step 5: Commit**

```bash
git add assets/media/hero/README.md assets/media/hero/apex-intro-loop.mp4 assets/media/hero/apex-intro-loop.webm assets/media/hero/apex-intro-poster.jpg
git commit -m "feat: add final cinematic hero media exports"
```

---

## Self-Review Checklist

Spec coverage:
- Hero as section one: covered by Task 2
- Interactive showroom moved below: covered by Task 2 and Task 5
- Looping cinematic media with no audio: covered by Task 1, Task 4, and Task 6
- Road + city + car asset contract: covered by Task 1 and Task 6
- Fallback behavior: covered by Task 4 and Task 6
- Luxury visual direction on the web layer: covered by Task 3

Placeholder scan:
- No `TODO`, `TBD`, or "implement later" markers remain.
- Asset filenames, selectors, and commands are explicit.

Type consistency:
- `window.APEXCinematicHero.init()` is defined in Task 4 and called in Task 5.
- `hero-cinematic-video` and `hero-cinematic-fallback` IDs are defined in Task 2 and used in Task 4.

