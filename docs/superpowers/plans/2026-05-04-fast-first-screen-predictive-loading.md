# Fast First Screen Predictive Loading Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the homepage dismiss its first loading screen without waiting for the below-the-fold Lamborghini gallery, while starting that gallery early enough that it feels ready during normal scrolling.

**Architecture:** Separate first-screen boot readiness from below-the-fold gallery readiness in `assets/js/home.js`. Make `assets/js/lambo-gallery.js` safe for lazy one-time initialization, give the gallery its own local loading state, and schedule gallery initialization from idle time or scroll proximity.

**Tech Stack:** Static HTML, vanilla JavaScript, jQuery, GSAP/ScrollTrigger, Three.js, existing CSS in `assets/css/home.css`.

---

## File Structure

- Modify: `assets/js/home.js`
  - Remove `LamboGallery.whenReady()` from page-level `bootTasks`.
  - Add `scheduleLamboGalleryLoad()` with idle and proximity triggers.
  - Start the scheduler only after the page-level intro loading overlay dismisses.
- Modify: `assets/js/lambo-gallery.js`
  - Add idempotent init flags.
  - Add local loading-state helpers.
  - Resolve `whenReady()` only once.
  - Keep existing `init()` and `whenReady()` public APIs.
- Modify: `index.html`
  - Add a lightweight local loading element inside `#lamborghini-gallery`.
- Modify: `assets/css/home.css`
  - Style the local gallery loading affordance.

## Task 1: Capture Baseline and Confirm Blocking Path

**Files:**
- Read: `assets/js/home.js`
- Read: `assets/js/lambo-gallery.js`
- Read: `index.html`

- [ ] **Step 1: Confirm gallery is currently blocking page boot**

Run:

```bash
rg -n "LamboGallery\\.whenReady\\(\\)|LamboGallery\\.init\\(\\)|Promise\\.all\\(bootTasks\\)" assets/js/home.js
```

Expected:

```text
assets/js/home.js:93:      bootTasks.push(window.LamboGallery.whenReady());
assets/js/home.js:94:      window.LamboGallery.init();
assets/js/home.js:117:    Promise.all(bootTasks).finally(function () {
```

- [ ] **Step 2: Confirm gallery init currently loads models immediately**

Run:

```bash
rg -n "function init\\(|preloadAll\\(|showModel\\(0\\)|resolveReady\\(true\\)" assets/js/lambo-gallery.js
```

Expected:

```text
assets/js/lambo-gallery.js:366:  function preloadAll(callback) {
assets/js/lambo-gallery.js:898:  function init() {
assets/js/lambo-gallery.js:904:    preloadAll(function () {
assets/js/lambo-gallery.js:905:      showModel(0);
assets/js/lambo-gallery.js:913:      resolveReady(true);
```

- [ ] **Step 3: Record working tree before edits**

Run:

```bash
git status --short
```

Expected: existing unrelated deletions and modified package/index files may appear. Do not revert unrelated user work.

## Task 2: Add Local Gallery Loading Markup

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add the local loading element**

In `index.html`, inside `<section id="lamborghini-gallery" class="lambo-gallery">`, immediately after:

```html
        <!-- Three.js canvas mount -->
        <div class="lambo-gallery__canvas-wrap" id="lambo-gallery-canvas"></div>
```

insert:

```html
        <div class="lambo-gallery__loading" id="lambo-gallery-loading" aria-live="polite">
          <span class="lambo-gallery__loading-line"></span>
          <span>Đang chuẩn bị trải nghiệm Lamborghini</span>
        </div>
```

- [ ] **Step 2: Verify the element exists once**

Run:

```bash
rg -n "lambo-gallery-loading|Đang chuẩn bị trải nghiệm Lamborghini" index.html
```

Expected:

```text
index.html:244:        <div class="lambo-gallery__loading" id="lambo-gallery-loading" aria-live="polite">
index.html:246:          <span>Đang chuẩn bị trải nghiệm Lamborghini</span>
```

- [ ] **Step 3: Commit the markup change**

Run:

```bash
git diff -- index.html
git add index.html
git commit -m "feat: add gallery local loading state"
```

Expected: the commit contains only the `lambo-gallery__loading` markup change in `index.html`, plus any already-present user edits in that file if they were part of the current working version.

## Task 3: Style the Local Gallery Loading State

**Files:**
- Modify: `assets/css/home.css`

- [ ] **Step 1: Add loading styles**

In `assets/css/home.css`, after the `.lambo-gallery__particles` block and before `.lambo-gallery__panels`, insert:

```css
.lambo-gallery__loading {
  position: absolute;
  left: 50%;
  bottom: clamp(7rem, 12vh, 9rem);
  z-index: 4;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  max-width: calc(100% - 2rem);
  padding: 0.7rem 0.9rem;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(5, 5, 8, 0.68);
  color: var(--color-silver);
  font-family: "Space Mono", monospace;
  font-size: 0.58rem;
  letter-spacing: 0.16em;
  line-height: 1.35;
  text-transform: uppercase;
  transform: translateX(-50%);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
  backdrop-filter: blur(8px);
}

.lambo-gallery.is-loading .lambo-gallery__loading {
  opacity: 1;
}

.lambo-gallery.is-ready .lambo-gallery__loading {
  opacity: 0;
}

.lambo-gallery__loading-line {
  width: 26px;
  height: 1px;
  flex: 0 0 auto;
  overflow: hidden;
  background: rgba(201, 168, 76, 0.18);
}

.lambo-gallery__loading-line::after {
  content: "";
  display: block;
  width: 45%;
  height: 100%;
  background: var(--color-gold);
  animation: lamboGalleryLoadingLine 1.2s ease-in-out infinite;
}

@keyframes lamboGalleryLoadingLine {
  0% { transform: translateX(-120%); }
  100% { transform: translateX(260%); }
}
```

- [ ] **Step 2: Add mobile loading adjustment**

Inside the existing `@media (max-width: 767px)` block near the end of the Lamborghini gallery CSS, after the `.lambo-gallery__arrow` rule, add:

```css
  .lambo-gallery__loading {
    bottom: 6.5rem;
    width: calc(100% - 2rem);
    justify-content: center;
    text-align: center;
    letter-spacing: 0.1em;
  }
```

- [ ] **Step 3: Verify the loading CSS exists**

Run:

```bash
rg -n "lambo-gallery__loading|lamboGalleryLoadingLine|lambo-gallery\\.is-loading|lambo-gallery\\.is-ready" assets/css/home.css
```

Expected: matches for the loading element, ready/loading state selectors, and keyframes.

- [ ] **Step 4: Commit the CSS change**

Run:

```bash
git diff -- assets/css/home.css
git add assets/css/home.css
git commit -m "style: add gallery loading indicator"
```

Expected: the commit contains only the local gallery loading styles.

## Task 4: Make LamboGallery Lazy Init Safe

**Files:**
- Modify: `assets/js/lambo-gallery.js`

- [ ] **Step 1: Add init and ready flags**

In `assets/js/lambo-gallery.js`, replace:

```javascript
  // Ready promise
  var resolveReady;
  var readyPromise = new Promise(function (resolve) { resolveReady = resolve; });
```

with:

```javascript
  // Ready promise
  var resolveReady;
  var readySettled = false;
  var initStarted = false;
  var readyPromise = new Promise(function (resolve) { resolveReady = resolve; });

  function settleReady(value) {
    if (readySettled) return;
    readySettled = true;
    resolveReady(value);
  }
```

- [ ] **Step 2: Add local loading helpers**

After `getCameraPreset(index)`, insert:

```javascript
  function setLocalLoading(isLoading) {
    if (!section) return;
    section.classList.toggle("is-loading", isLoading);
    if (isLoading) {
      section.classList.remove("is-ready");
    }
  }

  function markGalleryReady() {
    if (!section) return;
    section.classList.remove("is-loading");
    section.classList.add("is-ready");
  }
```

- [ ] **Step 3: Replace direct ready resolution calls**

Replace:

```javascript
      resolveReady(false);
```

with:

```javascript
      settleReady(false);
```

Replace:

```javascript
      resolveReady(true);
```

with:

```javascript
      settleReady(true);
```

- [ ] **Step 4: Make `init()` idempotent and local-state aware**

Replace the full `init()` function:

```javascript
  function init() {
    if (!initScene()) {
      resolveReady(false);
      return;
    }

    preloadAll(function () {
      showModel(0);
      if (!isMobile) {
        initParticles();
        initCustomCursor();
      }
      bindHoverEvents();
      bindNavigation();
      animate();
      resolveReady(true);
    });
  }
```

with:

```javascript
  function init() {
    if (initStarted) return readyPromise;
    initStarted = true;

    if (!initScene()) {
      settleReady(false);
      return readyPromise;
    }

    setLocalLoading(true);

    preloadAll(function () {
      showModel(0);
      if (!isMobile) {
        initParticles();
        initCustomCursor();
      }
      bindHoverEvents();
      bindNavigation();
      animate();
      markGalleryReady();
      settleReady(true);
    });

    return readyPromise;
  }
```

- [ ] **Step 5: Verify no direct `resolveReady` calls remain outside setup**

Run:

```bash
rg -n "resolveReady\\(|settleReady\\(|initStarted|readySettled|setLocalLoading|markGalleryReady" assets/js/lambo-gallery.js
```

Expected:

- `resolveReady` appears only in the variable declaration and promise constructor.
- `settleReady(false)` appears in `init()`.
- `settleReady(true)` appears after gallery setup completes.
- `initStarted`, `readySettled`, `setLocalLoading`, and `markGalleryReady` appear.

- [ ] **Step 6: Syntax-check gallery script**

Run:

```bash
node --check assets/js/lambo-gallery.js
```

Expected: no syntax errors.

- [ ] **Step 7: Commit lazy-safe gallery init**

Run:

```bash
git diff -- assets/js/lambo-gallery.js
git add assets/js/lambo-gallery.js
git commit -m "perf: make gallery lazy initialization safe"
```

Expected: the commit contains only the gallery init safety and local loading state code.

## Task 5: Schedule Gallery Loading After First Screen

**Files:**
- Modify: `assets/js/home.js`

- [ ] **Step 1: Add the scheduler helper**

In `assets/js/home.js`, after `renderHomepageBookingOptions()`, insert:

```javascript
  var lamboGalleryScheduled = false;
  var lamboGalleryStarted = false;

  function startLamboGalleryLoad() {
    if (lamboGalleryStarted || !window.LamboGallery || typeof window.LamboGallery.init !== "function") {
      return;
    }
    lamboGalleryStarted = true;
    window.LamboGallery.init();
  }

  function scheduleLamboGalleryLoad() {
    if (lamboGalleryScheduled || !window.LamboGallery) {
      return;
    }
    lamboGalleryScheduled = true;

    var gallery = document.getElementById("lamborghini-gallery");
    if (!gallery) {
      return;
    }

    if ("IntersectionObserver" in window) {
      var galleryObserver = new IntersectionObserver(function (entries) {
        if (entries[0] && entries[0].isIntersecting) {
          galleryObserver.disconnect();
          startLamboGalleryLoad();
        }
      }, { rootMargin: "1200px 0px", threshold: 0 });
      galleryObserver.observe(gallery);
    } else {
      window.setTimeout(startLamboGalleryLoad, 900);
    }

    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(startLamboGalleryLoad, { timeout: 2200 });
    } else {
      window.setTimeout(startLamboGalleryLoad, 1400);
    }
  }
```

- [ ] **Step 2: Remove gallery from page-level boot tasks**

Replace:

```javascript
    if (window.LamboGallery) {
      bootTasks.push(window.LamboGallery.whenReady());
      window.LamboGallery.init();
    }
```

with:

```javascript
    if (window.LamboGallery && typeof window.LamboGallery.whenReady === "function") {
      window.LamboGallery.whenReady().catch(function () {});
    }
```

This preserves the existing promise API without adding it to the page-level blocker list.

- [ ] **Step 3: Start the scheduler after boot overlay dismissal when boot tasks exist**

Inside `Promise.all(bootTasks).finally(function () { ... })`, after the hash-scroll block:

```javascript
      if (window.location.hash) {
        window.requestAnimationFrame(function () {
          var target = document.querySelector(window.location.hash);
          if (target) target.scrollIntoView();
        });
      }
```

add:

```javascript

      scheduleLamboGalleryLoad();
```

- [ ] **Step 4: Start the scheduler when there are no boot tasks**

Replace:

```javascript
    if (!bootTasks.length) {
      document.body.classList.remove("app-is-booting");
      return;
    }
```

with:

```javascript
    if (!bootTasks.length) {
      document.body.classList.remove("app-is-booting");
      scheduleLamboGalleryLoad();
      return;
    }
```

- [ ] **Step 5: Verify gallery readiness is no longer a boot blocker**

Run:

```bash
rg -n "bootTasks\\.push\\(window\\.LamboGallery|LamboGallery\\.init\\(\\)|scheduleLamboGalleryLoad|requestIdleCallback|rootMargin: \"1200px 0px\"" assets/js/home.js
```

Expected:

- No `bootTasks.push(window.LamboGallery.whenReady())` match.
- `window.LamboGallery.init()` appears only inside `startLamboGalleryLoad()`.
- `scheduleLamboGalleryLoad`, `requestIdleCallback`, and `rootMargin: "1200px 0px"` appear.

- [ ] **Step 6: Syntax-check homepage script**

Run:

```bash
node --check assets/js/home.js
```

Expected: no syntax errors.

- [ ] **Step 7: Commit the scheduler change**

Run:

```bash
git diff -- assets/js/home.js
git add assets/js/home.js
git commit -m "perf: schedule gallery after first screen"
```

Expected: the commit contains only the homepage scheduler and boot-task changes.

## Task 6: Verify End-to-End Behavior

**Files:**
- Verify: `index.html`
- Verify: `assets/js/home.js`
- Verify: `assets/js/lambo-gallery.js`
- Verify: `assets/css/home.css`

- [ ] **Step 1: Run syntax checks for changed JavaScript**

Run:

```bash
node --check assets/js/home.js
node --check assets/js/lambo-gallery.js
node --check assets/js/intro-landing.js
node --check assets/js/hero-3d.js
```

Expected: all commands exit with no syntax errors.

- [ ] **Step 2: Verify static references**

Run:

```bash
rg -n "lambo-gallery-loading|lambo-gallery__loading|is-loading|is-ready|scheduleLamboGalleryLoad|startLamboGalleryLoad|initStarted|settleReady" index.html assets/css/home.css assets/js/home.js assets/js/lambo-gallery.js
```

Expected: each new identifier appears in the file where it is used.

- [ ] **Step 3: Start local server**

Run:

```bash
python3 -m http.server 5501
```

Expected: server starts at `http://0.0.0.0:5501/`. Keep it running for manual browser verification.

- [ ] **Step 4: Manual browser verification**

Open:

```text
http://127.0.0.1:5501/
```

Expected:

- The intro loading overlay dismisses without waiting for the Lamborghini gallery.
- The intro landing still displays normally.
- The first showroom car still displays normally on desktop.
- On a normal scroll, the Lamborghini gallery begins loading before it enters the viewport.
- If scrolled quickly to the Lamborghini gallery, only the local gallery loading message appears.
- The local gallery loading message disappears after the gallery model renders.
- Gallery arrows and dots still work after lazy initialization.

- [ ] **Step 5: Stop local server**

Stop the server with `Ctrl-C` in the terminal session that is running `python3 -m http.server 5501`.

- [ ] **Step 6: Record final status**

Run:

```bash
git status --short
git log --oneline -5
```

Expected: changed files are committed, unrelated pre-existing user changes remain untouched, and recent commits include the four implementation commits from Tasks 2, 3, 4, and 5.

## Self-Review Notes

- Spec coverage: first-screen boot separation is covered by Task 5; predictive loading is covered by Task 5; local gallery loading is covered by Tasks 2-4; existing visual/model mappings are preserved because no model paths or catalog data are changed.
- Placeholder scan: this plan contains no placeholder markers, no deferred implementation steps, and no unspecified test commands.
- Type consistency: `scheduleLamboGalleryLoad()`, `startLamboGalleryLoad()`, `initStarted`, `readySettled`, `settleReady()`, `setLocalLoading()`, and `markGalleryReady()` are named consistently across their definition and verification steps.
