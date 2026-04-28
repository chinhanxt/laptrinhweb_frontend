# Showroom Car Navigation Arrows — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add left/right arrow buttons to the 3D showroom so users can cycle through 4 car models with slide animation.

**Architecture:** Single-scene swap — only 1 GLB model loaded at a time. Arrows trigger dispose → load → slide animation. A `CAR_CATALOG` array holds car metadata. GSAP handles slide tweens. Navigation loops (last → first, first → last).

**Tech Stack:** Three.js (existing), GSAP (existing), vanilla JS (IIFE pattern matching `hero-3d.js`), CSS glassmorphism.

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `assets/js/hero-3d.js` | Modify | Add CAR_CATALOG, currentIndex, switchCar(), disposeCar(), updateInfoPanel() |
| `index.html` | Modify | Add 2 nav arrow buttons inside `.hero-3d-overlay` |
| `assets/css/home.css` | Modify | Arrow styles, disabled state, responsive |

---

### Task 1: Add navigation arrow buttons to HTML

**Files:**
- Modify: `index.html:183-184` (just before closing `</div>` of `.hero-3d-overlay`)

- [ ] **Step 1: Add prev/next arrow buttons inside the overlay**

In `index.html`, find the closing `</div>` of `.hero-3d-overlay` (line 184). Insert the two arrow buttons just before it, after the `hero-focus-label` div:

```html
                <!-- NAV: Car switching arrows -->
                <button type="button" class="hero-nav-arrow hero-nav-arrow--prev" id="hero-nav-prev" aria-label="Previous car">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="13,4 7,10 13,16"/>
                  </svg>
                </button>
                <button type="button" class="hero-nav-arrow hero-nav-arrow--next" id="hero-nav-next" aria-label="Next car">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="7,4 13,10 7,16"/>
                  </svg>
                </button>
```

- [ ] **Step 2: Verify HTML is valid**

Open `http://127.0.0.1:5500/index.html` in browser. Check browser console for zero HTML parsing errors. The buttons won't be visible yet (no CSS).

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add navigation arrow buttons to showroom overlay HTML"
```

---

### Task 2: Style the navigation arrows with CSS

**Files:**
- Modify: `assets/css/home.css` (append after the existing `.hero-focus-label` styles, around line 1398)

- [ ] **Step 1: Add arrow base styles and states**

Append the following CSS to `assets/css/home.css`, after the `.hero-focus-label` block (after line ~1398):

```css
/* ----------------------------------------------------------
   NAV ARROWS — Car switching
   ---------------------------------------------------------- */
.hero-nav-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 50%;
  background: rgba(5, 5, 8, 0.65);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  box-shadow: inset 0 0 0 1px rgba(201, 168, 76, 0.06),
              0 4px 20px rgba(0, 0, 0, 0.4);
  color: var(--color-silver);
  cursor: pointer;
  pointer-events: auto;
  z-index: 4;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.5s ease,
              transform 0.5s ease,
              color 0.25s ease,
              box-shadow 0.25s ease,
              border-color 0.25s ease;
}

.hero-nav-arrow.is-visible {
  opacity: 1;
}

.hero-nav-arrow--prev {
  left: 1.2rem;
}

.hero-nav-arrow--next {
  right: 1.2rem;
}

.hero-nav-arrow:hover {
  color: var(--color-gold);
  box-shadow: inset 0 0 0 1px rgba(201, 168, 76, 0.25),
              0 4px 24px rgba(0, 0, 0, 0.5);
}

.hero-nav-arrow:active {
  transform: translateY(-50%) scale(0.92);
}

.hero-nav-arrow:disabled,
.hero-nav-arrow.is-loading {
  opacity: 0.3;
  pointer-events: none;
  cursor: wait;
}
```

- [ ] **Step 2: Add responsive rules for mobile**

Append immediately after the above block:

```css
@media (max-width: 991.98px) {
  .hero-nav-arrow {
    width: 40px;
    height: 40px;
  }
  .hero-nav-arrow--prev { left: 0.8rem; }
  .hero-nav-arrow--next { right: 0.8rem; }
}

@media (max-width: 575.98px) {
  .hero-nav-arrow {
    width: 36px;
    height: 36px;
  }
  .hero-nav-arrow--prev { left: 0.5rem; }
  .hero-nav-arrow--next { right: 0.5rem; }
  .hero-nav-arrow svg {
    width: 16px;
    height: 16px;
  }
}
```

- [ ] **Step 3: Verify in browser**

Open `http://127.0.0.1:5500/index.html`. The arrow buttons will not be visible yet because they need the `is-visible` class (added by JS in Task 3). Temporarily add `is-visible` class to the buttons in DevTools to confirm they render correctly: glassmorphism circles, centered vertically, chevron icons visible.

- [ ] **Step 4: Commit**

```bash
git add assets/css/home.css
git commit -m "feat: add navigation arrow styles with glassmorphism and responsive"
```

---

### Task 3: Add CAR_CATALOG data and disposeCar() to hero-3d.js

**Files:**
- Modify: `assets/js/hero-3d.js`

- [ ] **Step 1: Add CAR_CATALOG array and currentIndex**

In `assets/js/hero-3d.js`, replace the single `MODEL_URL` constant (line 24) with the catalog array and related state:

Find:
```js
  var MODEL_URL = "assets/model/lambo_lp670.glb";
```

Replace with:
```js
  var CAR_CATALOG = [
    {
      model: "assets/model/lambo_lp670.glb",
      brand: "Lamborghini",
      name: "Murciélago",
      sub: "LP 670-4 SuperVeloce",
      year: "2010",
      engine: "6.5L V12",
      defaultColorName: "Bianco Isis",
      hp: "670",
      accel: "3.2",
      topSpeed: "342"
    },
    {
      model: "assets/model/2015_bmw_3.0_csl_hommage_concept.glb",
      brand: "BMW",
      name: "3.0 CSL Hommage",
      sub: "Concept 2015",
      year: "2015",
      engine: "3.0L I6 Twin-Turbo",
      defaultColorName: "Bianco Isis",
      hp: "365",
      accel: "4.3",
      topSpeed: "250"
    },
    {
      model: "assets/model/2019_ferrari_488_pista_spider.glb",
      brand: "Ferrari",
      name: "488 Pista Spider",
      sub: "V8 Twin-Turbo",
      year: "2019",
      engine: "3.9L V8",
      defaultColorName: "Bianco Isis",
      hp: "711",
      accel: "2.85",
      topSpeed: "340"
    },
    {
      model: "assets/model/2020_ferrari_roma.glb",
      brand: "Ferrari",
      name: "Roma",
      sub: "Grand Touring",
      year: "2020",
      engine: "3.9L V8",
      defaultColorName: "Bianco Isis",
      hp: "612",
      accel: "3.4",
      topSpeed: "320"
    }
  ];
  var currentIndex = 0;
  var isSwitching = false;
  var navPrevEl, navNextEl;
```

- [ ] **Step 2: Add disposeCar() function**

Insert the `disposeCar` function after the `collectPaintMeshes` function (after line ~97) and before `setActiveSwatch`:

```js
  function disposeCar() {
    if (!carRoot) return;
    carRoot.traverse(function (node) {
      if (node.isMesh) {
        if (node.geometry) node.geometry.dispose();
        var materials = Array.isArray(node.material) ? node.material : [node.material];
        materials.forEach(function (mat) {
          if (mat) {
            if (mat.map) mat.map.dispose();
            if (mat.normalMap) mat.normalMap.dispose();
            if (mat.roughnessMap) mat.roughnessMap.dispose();
            if (mat.metalnessMap) mat.metalnessMap.dispose();
            if (mat.aoMap) mat.aoMap.dispose();
            if (mat.emissiveMap) mat.emissiveMap.dispose();
            mat.dispose();
          }
        });
      }
    });
    scene.remove(carRoot);
    carRoot = null;
    paintMeshes = [];
  }
```

- [ ] **Step 3: Modify loadModel() to accept a URL parameter**

Find the `loadModel` function (line ~131) and modify it to accept a `modelUrl` parameter:

Find:
```js
  function loadModel() {
    var loader = new THREE.GLTFLoader();
    var timeoutId = window.setTimeout(showHeroFallback, LOAD_TIMEOUT_MS);

    loader.load(
      MODEL_URL,
```

Replace with:
```js
  function loadModel(modelUrl) {
    var url = modelUrl || CAR_CATALOG[currentIndex].model;
    var loader = new THREE.GLTFLoader();
    var timeoutId = window.setTimeout(showHeroFallback, LOAD_TIMEOUT_MS);

    loader.load(
      url,
```

- [ ] **Step 4: Verify page still loads Lambo correctly**

Open `http://127.0.0.1:5500/index.html`. The Lamborghini should still load and render exactly as before. Check console for zero errors.

- [ ] **Step 5: Commit**

```bash
git add assets/js/hero-3d.js
git commit -m "feat: add CAR_CATALOG data, disposeCar(), and parameterize loadModel()"
```

---

### Task 4: Implement switchCar() and updateInfoPanel()

**Files:**
- Modify: `assets/js/hero-3d.js`

- [ ] **Step 1: Add updateInfoPanel() function**

Insert after the `disposeCar` function:

```js
  function updateInfoPanel(carData) {
    var kickerEl = document.querySelector(".hero-car-info__kicker");
    var nameEl = document.querySelector(".hero-car-info__name");
    var subEl = document.querySelector(".hero-car-info__sub");
    var metaValues = document.querySelectorAll(".hero-car-info__value");
    var specNums = document.querySelectorAll(".hero-car-info__spec-num");

    if (kickerEl) kickerEl.textContent = carData.brand;
    if (nameEl) nameEl.textContent = carData.name;
    if (subEl) subEl.textContent = carData.sub;

    if (metaValues.length >= 3) {
      metaValues[0].textContent = carData.year;
      metaValues[1].textContent = carData.engine;
      metaValues[2].textContent = carData.defaultColorName;
      metaValues[2].id = "hero-car-color-name";
    }

    if (specNums.length >= 3) {
      specNums[0].textContent = carData.hp;
      specNums[1].innerHTML = carData.accel + "<small>s</small>";
      specNums[2].textContent = carData.topSpeed;
    }
  }
```

- [ ] **Step 2: Add setNavLoading() helper**

Insert after `updateInfoPanel`:

```js
  function setNavLoading(loading) {
    isSwitching = loading;
    if (navPrevEl) {
      navPrevEl.disabled = loading;
      navPrevEl.classList.toggle("is-loading", loading);
    }
    if (navNextEl) {
      navNextEl.disabled = loading;
      navNextEl.classList.toggle("is-loading", loading);
    }
  }
```

- [ ] **Step 3: Add switchCar() function**

Insert after `setNavLoading`:

```js
  function switchCar(direction) {
    if (isSwitching || !carRoot) return;
    setNavLoading(true);

    var slideOutX = direction === 1 ? -8 : 8;
    var slideInX = direction === 1 ? 8 : -8;
    var nextIndex = (currentIndex + direction + CAR_CATALOG.length) % CAR_CATALOG.length;
    var nextCar = CAR_CATALOG[nextIndex];

    resetHeroCamera();

    gsap.to(carInfoEl, {
      opacity: 0,
      x: direction === 1 ? -20 : 20,
      duration: 0.3,
      ease: "power2.in"
    });

    gsap.to(carRoot.position, {
      x: slideOutX,
      duration: 0.6,
      ease: "power2.in",
      onComplete: function () {
        disposeCar();
        currentIndex = nextIndex;

        loadModel(nextCar.model);

        var checkLoaded = setInterval(function () {
          if (!carRoot) return;
          clearInterval(checkLoaded);

          carRoot.position.x = slideInX;

          updateInfoPanel(nextCar);

          gsap.to(carRoot.position, {
            x: 0,
            duration: 0.6,
            ease: "power2.out"
          });

          gsap.to(carInfoEl, {
            opacity: 1,
            x: 0,
            duration: 0.3,
            delay: 0.3,
            ease: "power2.out",
            onComplete: function () {
              setNavLoading(false);
            }
          });
        }, 50);
      }
    });
  }
```

- [ ] **Step 4: Wire up arrow buttons in initHeroScene()**

In the `initHeroScene` function, find this line (around line 248):

```js
    focusTextEl = document.getElementById("hero-focus-text");
```

Insert after it:

```js
    navPrevEl = document.getElementById("hero-nav-prev");
    navNextEl = document.getElementById("hero-nav-next");
```

- [ ] **Step 5: Add click handlers and show arrows in initHeroScene()**

In `initHeroScene`, find the `bindColorControls()` call (around line 281). Insert after it:

```js
    if (navPrevEl) {
      navPrevEl.addEventListener("click", function () { switchCar(-1); });
      navPrevEl.classList.add("is-visible");
    }
    if (navNextEl) {
      navNextEl.addEventListener("click", function () { switchCar(1); });
      navNextEl.classList.add("is-visible");
    }
```

- [ ] **Step 6: Expose switchCar in the public API**

In the return statement at the bottom of the IIFE (around line 296), add `switchCar`:

Find:
```js
  return {
    initHeroScene: initHeroScene,
    animate: animate,
    showHeroFallback: showHeroFallback
  };
```

Replace with:
```js
  return {
    initHeroScene: initHeroScene,
    animate: animate,
    showHeroFallback: showHeroFallback,
    switchCar: switchCar
  };
```

- [ ] **Step 7: Test full flow in browser**

Open `http://127.0.0.1:5500/index.html`. Wait for Lamborghini to load. Then:
1. Click right arrow — Lambo slides left, BMW slides in from right. Info panel updates to BMW data.
2. Click right arrow again — BMW slides left, Ferrari 488 slides in.
3. Click right arrow again — Ferrari 488 slides left, Ferrari Roma slides in.
4. Click right arrow again — Roma slides left, Lambo slides in (loop).
5. Click left arrow — Lambo slides right, Roma slides in from left.
6. Verify color picker still works on each car.
7. Verify double-click zoom works on each car.
8. Check browser console for zero errors.

- [ ] **Step 8: Commit**

```bash
git add assets/js/hero-3d.js
git commit -m "feat: implement car switching with slide animation and info panel updates"
```

---

### Task 5: Final polish and edge case handling

**Files:**
- Modify: `assets/js/hero-3d.js`

- [ ] **Step 1: Add keyboard navigation support**

In `initHeroScene`, after the navNextEl click handler block, add keyboard support:

```js
    document.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") switchCar(-1);
      if (e.key === "ArrowRight") switchCar(1);
    });
```

- [ ] **Step 2: Add loading timeout to switchCar**

In the `switchCar` function, after `var checkLoaded = setInterval(...)`, add a safety timeout so the UI doesn't get stuck if a model fails to load:

Find this line inside switchCar:
```js
        var checkLoaded = setInterval(function () {
```

Insert right before it:
```js
        var switchTimeout = setTimeout(function () {
          clearInterval(checkLoaded);
          setNavLoading(false);
        }, LOAD_TIMEOUT_MS);
```

And in the `clearInterval(checkLoaded)` line inside the interval callback, add clearTimeout:

Find:
```js
          clearInterval(checkLoaded);
```

Replace with:
```js
          clearInterval(checkLoaded);
          clearTimeout(switchTimeout);
```

- [ ] **Step 3: Test edge cases in browser**

1. Rapidly click arrows multiple times — should be blocked by `isSwitching` guard
2. Arrow keys left/right should switch cars
3. If on slow network (throttle in DevTools to Slow 3G), arrows should stay disabled during load, then re-enable
4. Color should persist across car switches (change to red, switch car, new car should also be red)

- [ ] **Step 4: Final commit**

```bash
git add assets/js/hero-3d.js
git commit -m "feat: add keyboard nav and loading timeout safety for car switching"
```
