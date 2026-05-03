# Homepage Loading Balance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce the homepage waiting screen by blocking only on the intro model and first showroom model, while loading the remaining showroom models in the background.

**Architecture:** Keep the intro landing and current showroom data model intact. Remove secondary showroom preload hints from `index.html`, then change `hero-3d.js` so `loadInitialModel()` resolves readiness after the first car is active and starts a non-blocking background preload/warm queue for the rest.

**Tech Stack:** Static HTML, vanilla JavaScript, Three.js `GLTFLoader`, existing `model-viewer`, local static server.

---

## File Structure

- Modify: `index.html`
  - Keep preload hints for `assets/model/8000_followerstm.glb` and `assets/model/lambo_lp670.glb`.
  - Remove preload hints for the five secondary showroom models.
- Modify: `assets/js/hero-3d.js`
  - Add background loading helpers near the existing preload system.
  - Change `loadInitialModel()` to stop waiting for `preloadAllModels()` and `warmAllModelsSequentially()`.
  - Keep `switchCar()` using `preloadModel(nextIndex, ...)` so car switching still waits naturally for a not-yet-loaded model.
- Verify only: `docs/superpowers/specs/2026-05-04-homepage-loading-balance-design.md`
  - Confirm the implementation matches the approved spec.

## Task 1: Capture Current Loading Baseline

**Files:**
- Read: `index.html`
- Read: `assets/js/hero-3d.js`

- [ ] **Step 1: Confirm the current preload count**

Run:

```bash
rg -n '<link rel="preload" as="fetch" href="assets/model/.*\\.glb"' index.html
```

Expected: seven preload hints appear, including `8000_followerstm.glb`, `lambo_lp670.glb`, and five secondary showroom models.

- [ ] **Step 2: Confirm the blocking ready path**

Run:

```bash
rg -n "preloadAllModels|warmAllModelsSequentially|settleReady\\(true\\)|loadInitialModel" assets/js/hero-3d.js
```

Expected: `loadInitialModel()` calls `preloadAllModels()`, then `warmAllModelsSequentially()`, then resolves `settleReady(true)`.

- [ ] **Step 3: Record existing working tree before edits**

Run:

```bash
git status --short
```

Expected: note pre-existing deleted image/media/model files and the existing modified `index.html`. Do not revert any unrelated user changes.

## Task 2: Limit Initial HTML Preloads

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Remove secondary showroom preload hints**

In `index.html`, replace the current GLB preload block:

```html
    <link rel="preload" as="fetch" href="assets/model/8000_followerstm.glb" crossorigin />
    <link rel="preload" as="fetch" href="assets/model/lambo_lp670.glb" crossorigin />
    <link rel="preload" as="fetch" href="assets/model/2015_bmw_3.0_csl_hommage_concept.glb" crossorigin />
    <link rel="preload" as="fetch" href="assets/model/2019_ferrari_488_pista_spider.glb" crossorigin />
    <link rel="preload" as="fetch" href="assets/model/2020_ferrari_roma.glb" crossorigin />
    <link rel="preload" as="fetch" href="assets/model/lamborghini_centenario_roadster_sdc.glb" crossorigin />
    <link rel="preload" as="fetch" href="assets/model/lamborghini_centenario_lp-770_interior_sdc.glb" crossorigin />
```

with:

```html
    <link rel="preload" as="fetch" href="assets/model/8000_followerstm.glb" crossorigin />
    <link rel="preload" as="fetch" href="assets/model/lambo_lp670.glb" crossorigin />
```

- [ ] **Step 2: Verify only two model preload hints remain**

Run:

```bash
rg -n '<link rel="preload" as="fetch" href="assets/model/.*\\.glb"' index.html
```

Expected:

```text
20:    <link rel="preload" as="fetch" href="assets/model/8000_followerstm.glb" crossorigin />
21:    <link rel="preload" as="fetch" href="assets/model/lambo_lp670.glb" crossorigin />
```

- [ ] **Step 3: Commit the preload hint change**

Run:

```bash
git add index.html
git commit -m "perf: limit homepage model preloads"
```

Expected: a commit is created with only the intended `index.html` preload change plus any pre-existing staged `index.html` edits if they were already in the file. Confirm before committing if `git diff -- index.html` shows unrelated content changes.

## Task 3: Make Secondary Showroom Loading Non-Blocking

**Files:**
- Modify: `assets/js/hero-3d.js`

- [ ] **Step 1: Add a background preload helper**

In `assets/js/hero-3d.js`, after `warmAllModelsSequentially(callback)`, add:

```javascript
  function preloadRemainingModelsInBackground() {
    var queue = CAR_CATALOG.map(function (_, index) {
      return index;
    }).filter(function (index) {
      return index !== currentIndex;
    });

    function preloadNext() {
      if (!queue.length) return;

      var catalogIndex = queue.shift();
      preloadModel(catalogIndex, function (entry) {
        if (!entry) {
          window.setTimeout(preloadNext, 0);
          return;
        }

        warmModelCacheEntry(catalogIndex, function () {
          window.setTimeout(preloadNext, 0);
        });
      });
    }

    window.setTimeout(preloadNext, 0);
  }
```

Expected: secondary models load one-by-one after initial readiness. A failed background model does not call `showHeroFallback()`.

- [ ] **Step 2: Replace the blocking part of `loadInitialModel()`**

In `assets/js/hero-3d.js`, replace this block inside `loadInitialModel()`:

```javascript
      activateCachedModel(currentIndex);
      snapHeroCameraToDefault();
      showOverlayUI();
      setNavLoading(true);

      preloadAllModels(function (allLoaded) {
        if (!allLoaded) {
          setNavLoading(false);
          showHeroFallback();
          return;
        }

        warmAllModelsSequentially(function (allWarmed) {
          if (!allWarmed) {
            setNavLoading(false);
            showHeroFallback();
            return;
          }

          hideLoadingState();
          setNavLoading(false);
          window.__modelsLoaded = true;
          settleReady(true);
        });
      });
```

with:

```javascript
      activateCachedModel(currentIndex);
      snapHeroCameraToDefault();
      showOverlayUI();
      hideLoadingState();
      setNavLoading(false);
      window.__modelsLoaded = true;
      settleReady(true);
      preloadRemainingModelsInBackground();
```

Expected: the ready promise resolves as soon as the first showroom model is active.

- [ ] **Step 3: Keep first-model failure behavior unchanged**

Confirm this part of `loadInitialModel()` remains:

```javascript
      if (!entry) {
        showHeroFallback();
        return;
      }
```

Expected: if `lambo_lp670.glb` fails, the existing fallback appears.

- [ ] **Step 4: Verify the blocking all-model path is no longer used by initial load**

Run:

```bash
rg -n "preloadAllModels\\(|warmAllModelsSequentially\\(|preloadRemainingModelsInBackground|settleReady\\(true\\)" assets/js/hero-3d.js
```

Expected:

- `preloadRemainingModelsInBackground` appears.
- `settleReady(true)` appears in `loadInitialModel()`.
- `preloadAllModels()` and `warmAllModelsSequentially()` definitions may still exist, but `loadInitialModel()` no longer calls them.

- [ ] **Step 5: Run JavaScript syntax checks**

Run:

```bash
node --check assets/js/hero-3d.js
node --check assets/js/intro-landing.js
node --check assets/js/home.js
```

Expected: all commands exit with no syntax errors.

- [ ] **Step 6: Commit the non-blocking showroom load change**

Run:

```bash
git add assets/js/hero-3d.js
git commit -m "perf: load showroom models in background"
```

Expected: a commit is created for the `hero-3d.js` loading behavior change.

## Task 4: Browser Smoke Test

**Files:**
- Verify: `index.html`
- Verify: `assets/js/hero-3d.js`

- [ ] **Step 1: Start a local static server**

Run:

```bash
python3 -m http.server 5501
```

Expected: server starts at `http://127.0.0.1:5501/`. If port `5501` is already in use, use the existing server shown in the browser.

- [ ] **Step 2: Open the homepage**

Open:

```text
http://127.0.0.1:5501/index.html
```

Expected: the waiting screen fades after the intro model is ready. It should no longer wait for all six showroom cars.

- [ ] **Step 3: Verify first showroom render**

Scroll to `#showroom-stage`.

Expected: the Murciélago first car appears, with color controls and next/previous controls visible.

- [ ] **Step 4: Verify secondary car switching**

Click next through the five secondary cars:

```text
BMW 3.0 CSL Hommage
Ferrari 488 Pista Spider
Ferrari Roma
Centenario Roadster
Centenario LP-770
```

Expected: each car appears. If a car is still loading, the nav controls temporarily show the existing loading state, then recover.

- [ ] **Step 5: Check network preload behavior in DevTools**

In the Network tab, filter by `.glb` and reload.

Expected: initial high-priority preload requests include only:

```text
assets/model/8000_followerstm.glb
assets/model/lambo_lp670.glb
```

Expected: the remaining showroom models begin loading after the first showroom model is active, not all from `<head>`.

- [ ] **Step 6: Final status check**

Run:

```bash
git status --short
```

Expected: only pre-existing unrelated deletions/untracked files remain. The implementation changes should be committed.

## Self-Review

- Spec coverage: the plan removes secondary preloads, resolves homepage readiness after the first showroom model, starts non-blocking background loads, preserves filenames/mappings, and keeps first-model fallback behavior.
- Red-flag scan: no incomplete instructions remain.
- Type consistency: helper names are consistent: `preloadRemainingModelsInBackground()`, `preloadModel()`, `warmModelCacheEntry()`, `settleReady(true)`.
