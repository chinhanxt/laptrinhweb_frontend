# GLB Hero Interactive Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Sketchfab iframe hero with a locally rendered `GLB` hero scene that supports cinematic camera motion, controlled drag rotation, four focus zones, double-click focus transitions, and a premium poster fallback.

**Architecture:** Keep the website on a single `index.html` entry point, but isolate the 3D hero into its own JavaScript module so the homepage orchestration stays readable. Use `Three.js` for the scene, `GLTFLoader` for the model, `Raycaster` for input detection, `GSAP` for camera transitions, and a poster fallback layer for reliability on slow or weak devices.

**Tech Stack:** `HTML5`, `CSS3`, `JavaScript`, `Three.js`, `GLTFLoader`, `OrbitControls`, `Raycaster`, `GSAP`, `Bootstrap 5`, `jQuery`

---

## Guardrails / Non-Negotiable Requirements

- [ ] Keep the website on exactly one HTML entry file: `index.html`.
- [ ] Keep the asset structure clear with `/css`, `/js`, and `/images`.
- [ ] Replace the iframe as the primary hero solution with a local `GLB` render path.
- [ ] Keep the 3D scope limited to one homepage hero scene.
- [ ] Support exactly four focus zones in version one:
  - [ ] front
  - [ ] wheel
  - [ ] cabin
  - [ ] rear
- [ ] Support drag rotation with controlled limits.
- [ ] Support double-click focus with hybrid detection:
  - [ ] user clicks a real region on the model
  - [ ] camera flies to a preset beautiful shot
- [ ] Show a caption or label for the focused zone.
- [ ] Provide a visible reset path back to the default hero shot.
- [ ] Provide a premium poster fallback if the model fails or takes too long.
- [ ] Keep the UI cinematic and dark luxury, not technical or utilitarian.
- [ ] Do not expand into a full configurator, color switcher, door animation, or commercial 3D product viewer.

## File Structure Map

**Create**
- `js/hero-3d.js`
- `images/hero-fallback-poster.jpg`

**Modify**
- `index.html`
- `css/home.css`
- `js/home.js`

**Reference**
- `docs/superpowers/specs/2026-04-26-glb-hero-interactive-design.md`
- `docs/superpowers/specs/2026-04-26-car-showroom-requirements-consolidated.md`
- `model_iframe`

---

### Task 1: Prepare the homepage hero markup for a local 3D scene

**Files:**
- Modify: `index.html`
- Create: `images/hero-fallback-poster.jpg`

- [ ] **Step 1: Add a dedicated 3D hero stage inside the homepage view**

Update the homepage hero block in `index.html` so the visual area contains a local scene container instead of the iframe:

```html
<div class="col-lg-7">
  <div class="model-stage">
    <div class="model-stage__meta">
      <span>Interactive 3D Preview</span>
      <span>Double click to focus</span>
    </div>

    <div class="model-stage__frame">
      <div id="hero-3d-shell" class="hero-3d-shell">
        <div id="hero-3d-canvas" class="hero-3d-canvas" aria-label="3D Lamborghini hero scene"></div>

        <div id="hero-3d-overlay" class="hero-3d-overlay">
          <button
            id="hero-reset-focus"
            class="btn-luxury-outline hero-reset-focus"
            type="button"
          >
            Trở về góc tổng thể
          </button>

          <div id="hero-focus-caption" class="hero-focus-caption" aria-live="polite">
            <p class="hero-focus-caption__eyebrow">Focus Zone</p>
            <h2 class="hero-focus-caption__title">Front Identity</h2>
            <p class="hero-focus-caption__copy">
              Signature lighting và front silhouette được nhấn bằng một góc máy thấp.
            </p>
          </div>
        </div>

        <div id="hero-fallback" class="hero-fallback is-hidden">
          <img src="images/hero-fallback-poster.jpg" alt="Lamborghini hero fallback poster" />
        </div>

        <div id="hero-loading" class="hero-loading">
          <span class="hero-loading__label">Loading 3D showroom scene</span>
        </div>
      </div>
    </div>
  </div>
</div>
```

- [ ] **Step 2: Remove the old Sketchfab iframe block from the hero**

Delete the old iframe wrapper from `index.html`:

```html
<div class="sketchfab-embed-wrapper">
  <iframe ...></iframe>
</div>
```

Expected: the homepage no longer depends on Sketchfab as the hero renderer.

- [ ] **Step 3: Add a real fallback poster asset**

Place a premium still image at:

```text
images/hero-fallback-poster.jpg
```

Expected: the file exists and visually matches the dark-luxury hero tone.

- [ ] **Step 4: Verify the markup is ready for a local scene**

Run:

```bash
rg -n "hero-3d-shell|hero-3d-canvas|hero-fallback|hero-reset-focus|hero-focus-caption" index.html
```

Expected: the homepage hero contains a canvas target, overlay layer, reset button, caption block, loading block, and fallback block.

---

### Task 2: Add the visual shell for the 3D stage, captions, and fallback

**Files:**
- Modify: `css/home.css`

- [ ] **Step 1: Add layout styles for the local 3D shell**

Append this to `css/home.css`:

```css
.hero-3d-shell {
  position: relative;
  min-height: 560px;
  border-radius: 18px;
  overflow: hidden;
  background:
    radial-gradient(circle at center, rgba(201, 168, 76, 0.1), transparent 55%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.02), rgba(8, 8, 12, 0.96));
}

.hero-3d-canvas {
  position: absolute;
  inset: 0;
}

.hero-3d-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  pointer-events: none;
  padding: 1.25rem;
}

.hero-reset-focus,
.hero-focus-caption {
  pointer-events: auto;
}
```

- [ ] **Step 2: Add focus-caption styling**

Append this to `css/home.css`:

```css
.hero-focus-caption {
  align-self: flex-start;
  max-width: 320px;
  padding: 1rem 1.1rem;
  border: 1px solid rgba(201, 168, 76, 0.2);
  border-radius: 18px;
  background: rgba(10, 10, 14, 0.72);
  backdrop-filter: blur(12px);
  box-shadow: var(--shadow-soft);
}

.hero-focus-caption__eyebrow {
  margin: 0 0 0.5rem;
  color: var(--color-gold);
  font-family: "Space Mono", monospace;
  font-size: 0.62rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.hero-focus-caption__title {
  margin: 0 0 0.5rem;
  font-family: "Bebas Neue", sans-serif;
  font-size: 1.6rem;
  letter-spacing: 0.06em;
}

.hero-focus-caption__copy {
  margin: 0;
  color: var(--color-muted);
  line-height: 1.6;
}
```

- [ ] **Step 3: Add loading and fallback states**

Append this to `css/home.css`:

```css
.hero-loading,
.hero-fallback {
  position: absolute;
  inset: 0;
}

.hero-loading {
  display: grid;
  place-items: center;
  background: rgba(5, 5, 8, 0.6);
  z-index: 3;
}

.hero-loading__label {
  color: var(--color-gold);
  font-family: "Space Mono", monospace;
  font-size: 0.7rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}

.hero-fallback {
  z-index: 2;
  background: #07070a;
}

.hero-fallback img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.is-hidden {
  display: none !important;
}
```

- [ ] **Step 4: Add responsive protection for the 3D area**

Append this to `css/home.css`:

```css
@media (max-width: 991.98px) {
  .hero-3d-shell {
    min-height: 420px;
  }

  .hero-focus-caption {
    max-width: 100%;
  }
}
```

- [ ] **Step 5: Verify the visual shell works without JavaScript**

Run:

```bash
xdg-open index.html
```

Expected: even before the 3D logic is wired, the hero still looks like a premium frame with a reserved stage, overlay zone, loading state, and fallback slot.

---

### Task 3: Create the isolated 3D hero module

**Files:**
- Create: `js/hero-3d.js`
- Modify: `index.html`

- [ ] **Step 1: Load Three.js dependencies in `index.html`**

Add these script tags before `js/home.js` in `index.html`:

```html
<script src="https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.164.1/examples/js/controls/OrbitControls.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.164.1/examples/js/loaders/GLTFLoader.js"></script>
<script src="js/hero-3d.js"></script>
```

- [ ] **Step 2: Create the module shell in `js/hero-3d.js`**

Put this into `js/hero-3d.js`:

```javascript
window.APEXHero3D = (function () {
  let scene;
  let camera;
  let renderer;
  let controls;
  let carRoot;
  let shell;
  let canvasMount;

  function initHeroScene() {
    shell = document.getElementById("hero-3d-shell");
    canvasMount = document.getElementById("hero-3d-canvas");

    if (!shell || !canvasMount || typeof THREE === "undefined") {
      return false;
    }

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(32, shell.clientWidth / shell.clientHeight, 0.1, 100);
    camera.position.set(5.2, 2.4, 8.4);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(shell.clientWidth, shell.clientHeight);
    canvasMount.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableDamping = true;

    return true;
  }

  function animate() {
    if (!renderer || !scene || !camera) {
      return;
    }

    requestAnimationFrame(animate);

    if (controls) {
      controls.update();
    }

    renderer.render(scene, camera);
  }

  return {
    initHeroScene,
    animate
  };
})();
```

- [ ] **Step 3: Verify the isolated module can initialize**

Run:

```bash
xdg-open index.html
```

Expected: the page loads with no `THREE is undefined` or missing-script errors, and the 3D stage remains visually stable even before the model is loaded.

---

### Task 4: Add scene setup, lighting, model loading, and fallback activation

**Files:**
- Modify: `js/hero-3d.js`
- Modify: `js/home.js`

- [ ] **Step 1: Expand `js/hero-3d.js` with light setup and model loading**

Replace the module body with this structure:

```javascript
window.APEXHero3D = (function () {
  let scene;
  let camera;
  let renderer;
  let controls;
  let carRoot;
  let shell;
  let canvasMount;
  let loadingEl;
  let fallbackEl;

  const MODEL_URL = "images/lamborghini.glb";
  const LOAD_TIMEOUT_MS = 9000;

  function showHeroFallback() {
    if (fallbackEl) {
      fallbackEl.classList.remove("is-hidden");
    }

    if (loadingEl) {
      loadingEl.classList.add("is-hidden");
    }
  }

  function hideLoadingState() {
    if (loadingEl) {
      loadingEl.classList.add("is-hidden");
    }
  }

  function setupLights() {
    const ambient = new THREE.AmbientLight(0xffffff, 1.1);
    const key = new THREE.DirectionalLight(0xf7e4aa, 2.4);
    const rim = new THREE.DirectionalLight(0xffffff, 1.0);

    key.position.set(5, 7, 6);
    rim.position.set(-6, 3, -5);

    scene.add(ambient, key, rim);
  }

  function loadModel() {
    const loader = new THREE.GLTFLoader();
    const timeoutId = window.setTimeout(showHeroFallback, LOAD_TIMEOUT_MS);

    loader.load(
      MODEL_URL,
      function (gltf) {
        window.clearTimeout(timeoutId);
        carRoot = gltf.scene;
        carRoot.position.set(0, -0.8, 0);
        carRoot.scale.setScalar(1.2);
        scene.add(carRoot);
        hideLoadingState();
      },
      undefined,
      function () {
        window.clearTimeout(timeoutId);
        showHeroFallback();
      }
    );
  }

  function initHeroScene() {
    shell = document.getElementById("hero-3d-shell");
    canvasMount = document.getElementById("hero-3d-canvas");
    loadingEl = document.getElementById("hero-loading");
    fallbackEl = document.getElementById("hero-fallback");

    if (!shell || !canvasMount || typeof THREE === "undefined") {
      return false;
    }

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(32, shell.clientWidth / shell.clientHeight, 0.1, 100);
    camera.position.set(5.2, 2.4, 8.4);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(shell.clientWidth, shell.clientHeight);
    canvasMount.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableDamping = true;

    setupLights();
    loadModel();
    return true;
  }

  function animate() {
    if (!renderer || !scene || !camera) {
      return;
    }

    requestAnimationFrame(animate);

    if (controls) {
      controls.update();
    }

    renderer.render(scene, camera);
  }

  return {
    initHeroScene,
    animate,
    showHeroFallback
  };
})();
```

- [ ] **Step 2: Wire the homepage startup to the hero module**

Replace `js/home.js` with:

```javascript
$(function () {
  if (!window.APEXHero3D) {
    return;
  }

  const initialized = window.APEXHero3D.initHeroScene();

  if (initialized) {
    window.APEXHero3D.animate();
  }
});
```

- [ ] **Step 3: Add the local GLB model file**

Place the downloaded model at:

```text
images/lamborghini.glb
```

Expected: the app has a stable local model path instead of a remote iframe dependency.

- [ ] **Step 4: Verify normal load and failure behavior**

Run:

```bash
xdg-open index.html
```

Expected:
- when `images/lamborghini.glb` exists and is valid, the loading overlay disappears and the model appears
- when the file is missing or broken, the poster fallback appears instead of leaving an empty frame

---

### Task 5: Add controlled drag rotation and safe camera limits

**Files:**
- Modify: `js/hero-3d.js`

- [ ] **Step 1: Add bounded OrbitControls behavior**

Update the controls setup block in `js/hero-3d.js` to:

```javascript
controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enablePan = false;
controls.enableDamping = true;
controls.enableZoom = false;
controls.minAzimuthAngle = -0.8;
controls.maxAzimuthAngle = 0.8;
controls.minPolarAngle = 1.0;
controls.maxPolarAngle = 1.75;
controls.target.set(0, 0.9, 0);
```

- [ ] **Step 2: Add a default cinematic idle turn**

Inside `animate()` in `js/hero-3d.js`, add:

```javascript
if (carRoot && !controls.mouseButtons.RIGHT) {
  carRoot.rotation.y += 0.0015;
}
```

Expected: the car keeps a subtle cinematic drift when the user is not interacting.

- [ ] **Step 3: Verify the drag behavior feels premium**

Run:

```bash
xdg-open index.html
```

Expected: the user can drag to rotate the car, but cannot flip it into awkward angles or zoom it into a broken composition.

---

### Task 6: Implement the four focus zones and double-click hybrid selection

**Files:**
- Modify: `js/hero-3d.js`

- [ ] **Step 1: Add focus-zone definitions**

Add this constant near the top of `js/hero-3d.js`:

```javascript
const FOCUS_ZONES = {
  front: {
    title: "Front Identity",
    copy: "Signature lighting và front silhouette được nhấn bằng một góc máy thấp.",
    camera: { x: 3.2, y: 1.4, z: 5.0 },
    target: { x: 1.2, y: 0.8, z: 2.4 }
  },
  wheel: {
    title: "Wheel Performance",
    copy: "Mâm và phanh được đẩy lên thành điểm nhấn cơ khí giàu lực.",
    camera: { x: 2.5, y: 1.1, z: 2.8 },
    target: { x: 1.8, y: 0.6, z: 1.0 }
  },
  cabin: {
    title: "Driver Cabin",
    copy: "Side profile và tinh thần khoang lái được giữ ở một góc ngang gần tầm mắt.",
    camera: { x: 5.8, y: 1.7, z: 2.4 },
    target: { x: 0.2, y: 1.1, z: 0.3 }
  },
  rear: {
    title: "Rear Signature",
    copy: "Cụm đèn hậu, đuôi xe và exhaust được gom lại thành cú chốt cinematic.",
    camera: { x: -3.6, y: 1.5, z: -5.1 },
    target: { x: -1.5, y: 0.8, z: -2.3 }
  }
};
```

- [ ] **Step 2: Add a focus API and caption update**

Add these functions to `js/hero-3d.js`:

```javascript
function updateCaption(zoneId) {
  const zone = FOCUS_ZONES[zoneId];
  if (!zone) {
    return;
  }

  document.querySelector(".hero-focus-caption__title").textContent = zone.title;
  document.querySelector(".hero-focus-caption__copy").textContent = zone.copy;
}

function focusZone(zoneId) {
  const zone = FOCUS_ZONES[zoneId];
  if (!zone || typeof gsap === "undefined") {
    return;
  }

  updateCaption(zoneId);

  gsap.to(camera.position, {
    ...zone.camera,
    duration: 1.1,
    ease: "power3.inOut"
  });

  gsap.to(controls.target, {
    ...zone.target,
    duration: 1.1,
    ease: "power3.inOut"
  });
}
```

- [ ] **Step 3: Add hybrid zone selection on double click**

Add these helpers to `js/hero-3d.js`:

```javascript
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function inferZoneFromPoint(point) {
  if (point.z > 1.2) {
    return "front";
  }

  if (point.z < -1.2) {
    return "rear";
  }

  if (point.y < 0.6) {
    return "wheel";
  }

  return "cabin";
}

function handleDoubleClick(event) {
  if (!renderer || !camera || !carRoot) {
    return;
  }

  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObject(carRoot, true);

  if (!hits.length) {
    return;
  }

  const zoneId = inferZoneFromPoint(hits[0].point);
  focusZone(zoneId);
}
```

- [ ] **Step 4: Register the double-click interaction**

Inside `initHeroScene()` in `js/hero-3d.js`, add:

```javascript
renderer.domElement.addEventListener("dblclick", handleDoubleClick);
```

- [ ] **Step 5: Verify the four focus zones work**

Run:

```bash
xdg-open index.html
```

Expected:
- double-clicking the front region moves to the front shot
- double-clicking lower side regions moves to the wheel shot
- double-clicking the side body moves to the cabin shot
- double-clicking the rear region moves to the rear shot

---

### Task 7: Add reset behavior and mobile-performance guardrails

**Files:**
- Modify: `js/hero-3d.js`
- Modify: `js/home.js`

- [ ] **Step 1: Add a reset camera state**

Add this to `js/hero-3d.js`:

```javascript
const DEFAULT_CAMERA = { x: 5.2, y: 2.4, z: 8.4 };
const DEFAULT_TARGET = { x: 0, y: 0.9, z: 0 };

function resetHeroCamera() {
  if (typeof gsap === "undefined") {
    return;
  }

  gsap.to(camera.position, {
    ...DEFAULT_CAMERA,
    duration: 1.0,
    ease: "power3.inOut"
  });

  gsap.to(controls.target, {
    ...DEFAULT_TARGET,
    duration: 1.0,
    ease: "power3.inOut"
  });
}
```

- [ ] **Step 2: Export the reset API**

Update the return block in `js/hero-3d.js` to:

```javascript
return {
  initHeroScene,
  animate,
  focusZone,
  resetHeroCamera,
  showHeroFallback
};
```

- [ ] **Step 3: Wire the reset button and small-screen fallback rule**

Replace `js/home.js` with:

```javascript
$(function () {
  if (!window.APEXHero3D) {
    return;
  }

  const prefersFallback = window.innerWidth < 576;

  if (prefersFallback) {
    window.APEXHero3D.showHeroFallback();
    $("#hero-loading").addClass("is-hidden");
    return;
  }

  const initialized = window.APEXHero3D.initHeroScene();

  if (initialized) {
    window.APEXHero3D.animate();
  }

  $("#hero-reset-focus").on("click", function () {
    window.APEXHero3D.resetHeroCamera();
  });
});
```

- [ ] **Step 4: Verify reset and small-screen protection**

Run:

```bash
xdg-open index.html
```

Expected:
- clicking the reset button returns the hero to the opening shot
- on very small screens, the poster fallback is allowed to take over instead of forcing heavy 3D

---

### Task 8: Run final acceptance QA against the GLB hero spec

**Files:**
- Review only: `index.html`
- Review only: `css/home.css`
- Review only: `js/home.js`
- Review only: `js/hero-3d.js`
- Review only: `docs/superpowers/specs/2026-04-26-glb-hero-interactive-design.md`

- [ ] **Step 1: Confirm the iframe is gone from the primary hero**

Run:

```bash
rg -n "sketchfab|iframe" index.html
```

Expected: there is no Sketchfab hero embed left as the main solution. If an old backup snippet remains in comments, remove it.

- [ ] **Step 2: Confirm the hero module boundaries are clean**

Run:

```bash
rg -n "initHeroScene|focusZone|resetHeroCamera|showHeroFallback" js/hero-3d.js js/home.js
```

Expected: `js/hero-3d.js` owns the 3D internals and `js/home.js` only orchestrates startup and UI wiring.

- [ ] **Step 3: Confirm the four focus zones are present**

Run:

```bash
rg -n "front|wheel|cabin|rear" js/hero-3d.js
```

Expected: the four focus zones are explicitly defined and used.

- [ ] **Step 4: Perform browser QA**

Run:

```bash
xdg-open index.html
```

Expected:
- desktop: opening shot is cinematic and premium
- drag rotation works within limits
- double click focus feels intentional
- reset returns to the default shot
- fallback appears if the model is missing or disabled

- [ ] **Step 5: Run the final checklist**

Use this checklist:

```text
[ ] Sketchfab iframe removed as the main hero solution
[ ] GLB renders locally
[ ] one hero scene only
[ ] four focus zones only
[ ] drag rotation works
[ ] double click focus works
[ ] camera moves to preset shots
[ ] caption updates on focus
[ ] reset path works
[ ] poster fallback works
[ ] dark luxury presentation preserved
[ ] scope did not expand into a configurator
```

- [ ] **Step 6: Commit the GLB hero work**

Run:

```bash
git add index.html css/home.css js/home.js js/hero-3d.js images/hero-fallback-poster.jpg images/lamborghini.glb docs/superpowers/specs/2026-04-26-glb-hero-interactive-design.md docs/superpowers/plans/2026-04-26-glb-hero-interactive-plan.md
git commit -m "feat: add interactive glb hero scene"
```

Expected: one commit captures the GLB hero implementation and the supporting design docs.
