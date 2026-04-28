# Showroom Focus And Color Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the homepage `Interactive Showroom` so the Lamborghini opens larger, disables free zoom, focuses on any double-clicked point on the car, resets on double-click outside the car, and supports an always-visible luxury paint-color panel.

**Architecture:** Keep the current single-page structure and existing `window.APEXHero3D` module, but replace the old zone-caption overlay with a compact floating color panel and extend the 3D controller with point-based raycast focus, camera reset, and body-paint recoloring. Keep the change set limited to `index.html`, `assets/css/home.css`, and `assets/js/hero-3d.js` so the homepage orchestration remains stable.

**Tech Stack:** `HTML5`, `CSS3`, `JavaScript`, `Three.js`, `GLTFLoader`, `OrbitControls`, `Raycaster`, `Bootstrap 5`, `jQuery`

---

## Scope Guardrails

- [ ] Only touch `index.html`, `assets/css/home.css`, and `assets/js/hero-3d.js`.
- [ ] Keep `window.APEXHero3D` as the public module entry point.
- [ ] Do not add captions, focus labels, or preset focus zones.
- [ ] Do not restore wheel, trackpad, or pinch zoom.
- [ ] Do not recolor glass, wheels, tires, lights, or interior meshes.
- [ ] Keep the fallback poster path working exactly as it does now.

## File Structure Map

**Modify**
- `index.html`
- `assets/css/home.css`
- `assets/js/hero-3d.js`

**Reference**
- `docs/superpowers/specs/2026-04-27-showroom-focus-color-design.md`
- `model/lambo_lp670.glb`

---

### Task 1: Replace the showroom overlay markup with a floating color panel

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add an overlay wrapper and color panel inside the 3D shell**

Update the `#hero-3d-shell` block in `index.html` so it contains a floating control layer above the canvas:

```html
<div id="hero-3d-shell" class="hero-3d-shell">
  <div id="hero-3d-canvas" class="hero-3d-canvas" aria-label="3D Lamborghini showroom scene"></div>

  <div class="hero-3d-overlay">
    <div id="hero-color-panel" class="hero-color-panel" aria-label="Car paint color selector">
      <p class="hero-color-panel__eyebrow">Exterior finish</p>
      <div class="hero-color-swatches" role="group" aria-label="Choose car color">
        <button type="button" class="hero-color-swatch is-active" data-color="white" aria-label="White"></button>
        <button type="button" class="hero-color-swatch" data-color="red" aria-label="Red"></button>
        <button type="button" class="hero-color-swatch" data-color="blue" aria-label="Blue"></button>
        <button type="button" class="hero-color-swatch" data-color="green" aria-label="Green"></button>
        <button type="button" class="hero-color-swatch" data-color="yellow" aria-label="Yellow"></button>
        <button type="button" class="hero-color-swatch" data-color="pink" aria-label="Pink"></button>
        <button type="button" class="hero-color-swatch" data-color="black" aria-label="Black"></button>
      </div>
    </div>
  </div>

  <div id="hero-fallback" class="hero-fallback is-hidden">
    <img src="images/hero-fallback-poster.svg" alt="Lamborghini 3D showroom fallback poster" />
  </div>

  <div id="hero-loading" class="hero-loading">
    <span class="hero-loading__label">Loading 3D showroom scene</span>
  </div>
</div>
```

- [ ] **Step 2: Make the initial active swatch match the JavaScript default color**

Keep `data-color="white"` as the only button with the `is-active` class in the markup above.

Expected: the UI state and the startup paint color stay in sync.

- [ ] **Step 3: Verify the new markup anchors exist**

Run:

```bash
rg -n "hero-3d-overlay|hero-color-panel|hero-color-swatch|data-color=" index.html
```

Expected: one overlay container, one color panel, and seven swatch buttons are present.

---

### Task 2: Restyle the 3D stage so the car opens larger and the color panel feels premium

**Files:**
- Modify: `assets/css/home.css`

- [ ] **Step 1: Replace the old zone-navigation styles with the color-panel styles**

In the `3D HERO SHELL` section of `assets/css/home.css`, remove the obsolete blocks for:

```css
.hero-zone-nav
.hero-zone-btn
.hero-zone-btn:hover
.hero-zone-btn--reset
.hero-zone-btn--reset:hover
.hero-focus-caption
.hero-focus-caption__eyebrow
.hero-focus-caption__title
.hero-focus-caption__copy
```

Expected: the stylesheet no longer contains unused zone-nav or caption rules.

- [ ] **Step 2: Add the floating luxury color panel styles**

Append this replacement block in the same `3D HERO SHELL` section:

```css
.hero-3d-shell {
  position: relative;
  min-height: 620px;
  border-radius: 0 0 7px 7px;
  overflow: hidden;
  background:
    radial-gradient(circle at 50% 42%, rgba(201, 168, 76, 0.14), transparent 54%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.02), rgba(8, 8, 12, 0.96));
}

.hero-3d-canvas {
  position: absolute;
  inset: 0;
}

.hero-3d-canvas canvas {
  display: block;
  width: 100% !important;
  height: 100% !important;
}

.hero-3d-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  padding: 1.4rem;
  pointer-events: none;
  z-index: 2;
}

.hero-color-panel {
  min-width: 220px;
  padding: 1rem 1rem 0.95rem;
  border: 1px solid rgba(201, 168, 76, 0.22);
  border-radius: 20px;
  background: rgba(10, 10, 14, 0.74);
  backdrop-filter: blur(14px);
  box-shadow: var(--shadow-soft);
  pointer-events: auto;
}

.hero-color-panel__eyebrow {
  margin: 0 0 0.8rem;
  color: var(--color-gold);
  font-family: "Space Mono", monospace;
  font-size: 0.62rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.hero-color-swatches {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
}

.hero-color-swatch {
  width: 1.8rem;
  height: 1.8rem;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 999px;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
  transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
}

.hero-color-swatch[data-color="white"] { background: #f2f1ea; }
.hero-color-swatch[data-color="red"] { background: #af1826; }
.hero-color-swatch[data-color="blue"] { background: #1f4da8; }
.hero-color-swatch[data-color="green"] { background: #2d6a4f; }
.hero-color-swatch[data-color="yellow"] { background: #d7a419; }
.hero-color-swatch[data-color="pink"] { background: #bf4b8f; }
.hero-color-swatch[data-color="black"] { background: #111118; }

.hero-color-swatch:hover,
.hero-color-swatch:focus-visible,
.hero-color-swatch.is-active {
  transform: scale(1.08);
  border-color: var(--color-gold);
  box-shadow:
    0 0 0 3px rgba(201, 168, 76, 0.12),
    inset 0 0 0 1px rgba(255, 255, 255, 0.14);
}
```

- [ ] **Step 3: Tighten the responsive shell sizes without hiding the control**

Replace the existing mobile breakpoints with:

```css
@media (max-width: 991.98px) {
  .hero-3d-shell {
    min-height: 500px;
  }

  .hero-3d-overlay {
    padding: 1rem;
  }
}

@media (max-width: 575.98px) {
  .hero-3d-shell {
    min-height: 360px;
  }

  .hero-3d-overlay {
    justify-content: center;
  }

  .hero-color-panel {
    width: min(100%, 260px);
  }
}
```

- [ ] **Step 4: Verify the CSS now targets the new control and larger shell**

Run:

```bash
rg -n "hero-color-panel|hero-color-swatch|min-height: 620px|min-height: 500px|min-height: 360px" assets/css/home.css
```

Expected: the stylesheet contains the new panel selectors and the updated shell heights.

---

### Task 3: Add paint-mesh detection and color switching to the 3D controller

**Files:**
- Modify: `assets/js/hero-3d.js`

- [ ] **Step 1: Add module-level state for raycasting, focus targets, and color config**

At the top of `assets/js/hero-3d.js`, expand the module state to include reusable helpers:

```javascript
var scene, camera, renderer, controls, carRoot;
var shell, canvasMount, loadingEl, fallbackEl, colorPanelEl, colorSwatchEls;
var raycaster = new THREE.Raycaster();
var pointer = new THREE.Vector2();
var animationFrameId = null;
var paintMeshes = [];
var defaultCameraPosition = new THREE.Vector3(3.15, 1.45, 4.35);
var defaultTarget = new THREE.Vector3(0, 0.42, 0);
var focusDistance = 2.15;
var minFocusDistance = 1.6;
var activeColorKey = "white";
var colorMap = {
  white: 0xf2f1ea,
  red: 0xaf1826,
  blue: 0x1f4da8,
  green: 0x2d6a4f,
  yellow: 0xd7a419,
  pink: 0xbf4b8f,
  black: 0x111118
};
```

- [ ] **Step 2: Add helper functions for material cloning, paint-mesh collection, and swatch state**

Insert these helpers above `loadModel()`:

```javascript
function isPaintCandidate(node) {
  var name = (node.name || "").toLowerCase();
  return (
    name.includes("body") ||
    name.includes("carpaint") ||
    name.includes("paint") ||
    name.includes("door") ||
    name.includes("hood") ||
    name.includes("fender") ||
    name.includes("bumper")
  );
}

function cloneMaterialIfNeeded(mesh) {
  if (!mesh || !mesh.material) return;
  if (Array.isArray(mesh.material)) {
    mesh.material = mesh.material.map(function (material) {
      return material ? material.clone() : material;
    });
    return;
  }
  mesh.material = mesh.material.clone();
}

function collectPaintMeshes(root) {
  var meshes = [];

  root.traverse(function (node) {
    if (!node.isMesh || !node.material) return;
    if (!isPaintCandidate(node)) return;
    cloneMaterialIfNeeded(node);
    meshes.push(node);
  });

  return meshes;
}

function setActiveSwatch(colorKey) {
  activeColorKey = colorKey;
  colorSwatchEls.forEach(function (button) {
    button.classList.toggle("is-active", button.dataset.color === colorKey);
  });
}

function applyCarColor(colorKey) {
  var colorValue = colorMap[colorKey];
  if (typeof colorValue === "undefined") return;

  paintMeshes.forEach(function (mesh) {
    var materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    materials.forEach(function (material) {
      if (material && material.color) {
        material.color.setHex(colorValue);
        material.needsUpdate = true;
      }
    });
  });

  setActiveSwatch(colorKey);
}
```

- [ ] **Step 3: Wire the panel buttons after the DOM anchors are captured**

Inside `initHeroScene()`, capture the new elements and bind the click handler:

```javascript
colorPanelEl = document.getElementById("hero-color-panel");
colorSwatchEls = Array.prototype.slice.call(document.querySelectorAll(".hero-color-swatch"));
```

Then add this helper and call it before `loadModel()`:

```javascript
function bindColorControls() {
  colorSwatchEls.forEach(function (button) {
    button.addEventListener("click", function () {
      applyCarColor(button.dataset.color);
    });
  });
}
```

Call:

```javascript
bindColorControls();
```

Expected: the swatches are interactive even before the first color change is applied.

- [ ] **Step 4: Collect paint meshes after the model loads and apply the startup color**

Inside the `loader.load(... success ...)` callback, after `scene.add(carRoot);`, insert:

```javascript
paintMeshes = collectPaintMeshes(carRoot);
applyCarColor(activeColorKey);
```

Expected: the rendered car immediately matches the default active swatch.

- [ ] **Step 5: Run a syntax check after the color-state changes**

Run:

```bash
node --check assets/js/hero-3d.js
```

Expected: no syntax errors are reported.

---

### Task 4: Replace free zoom with point-based focus and outside-reset behavior

**Files:**
- Modify: `assets/js/hero-3d.js`

- [ ] **Step 1: Lock OrbitControls to rotation only and move the default camera closer**

Inside `initHeroScene()`, replace the current camera and controls setup with:

```javascript
camera = new THREE.PerspectiveCamera(32, shell.clientWidth / shell.clientHeight, 0.1, 100);
camera.position.copy(defaultCameraPosition);

controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enablePan = false;
controls.enableDamping = true;
controls.enableZoom = false;
controls.autoRotate = false;
controls.minDistance = 1;
controls.maxDistance = 12;
controls.minPolarAngle = 0.55;
controls.maxPolarAngle = 1.65;
controls.target.copy(defaultTarget);
controls.update();
```

Expected: the car opens larger and the mouse wheel no longer changes camera distance.

- [ ] **Step 2: Add camera tween, reset, and raycast helpers**

Insert these helpers above `initHeroScene()`:

```javascript
function tweenCamera(nextPosition, nextTarget) {
  var startPosition = camera.position.clone();
  var startTarget = controls.target.clone();
  var startTime = performance.now();
  var duration = 420;

  function tick(now) {
    var progress = Math.min((now - startTime) / duration, 1);
    var eased = 1 - Math.pow(1 - progress, 3);

    camera.position.lerpVectors(startPosition, nextPosition, eased);
    controls.target.lerpVectors(startTarget, nextTarget, eased);
    controls.update();

    if (progress < 1) {
      animationFrameId = requestAnimationFrame(tick);
    }
  }

  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }

  animationFrameId = requestAnimationFrame(tick);
}

function resetHeroCamera() {
  tweenCamera(defaultCameraPosition.clone(), defaultTarget.clone());
}

function getIntersections(event) {
  var rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);
  return carRoot ? raycaster.intersectObject(carRoot, true) : [];
}

function buildFocusPosition(hitPoint) {
  var viewDirection = camera.position.clone().sub(controls.target).normalize();
  var distance = Math.max(focusDistance, minFocusDistance);
  return hitPoint.clone().add(viewDirection.multiplyScalar(distance));
}
```

- [ ] **Step 3: Add the double-click handler that focuses on the car and resets outside it**

Add this helper above `animate()`:

```javascript
function handleDoubleClick(event) {
  var intersections = getIntersections(event);

  if (!intersections.length) {
    resetHeroCamera();
    return;
  }

  var hitPoint = intersections[0].point.clone();
  var nextPosition = buildFocusPosition(hitPoint);
  tweenCamera(nextPosition, hitPoint);
}
```

Then, inside `initHeroScene()`, bind it after the controls are created:

```javascript
renderer.domElement.addEventListener("dblclick", handleDoubleClick);
```

Expected: double-clicking the model focuses the camera on the hit point, and double-clicking empty stage space resets it.

- [ ] **Step 4: Keep resize and fallback behavior intact**

Do not remove these existing calls:

```javascript
window.addEventListener("resize", onResize);
setupLights();
loadModel();
```

Expected: the new interactions do not break the current responsive renderer or fallback logic.

- [ ] **Step 5: Run syntax check and targeted source inspection**

Run:

```bash
node --check assets/js/hero-3d.js
rg -n "enableZoom = false|handleDoubleClick|resetHeroCamera|applyCarColor|collectPaintMeshes" assets/js/hero-3d.js
```

Expected: syntax passes and the new focus/color hooks are present.

---

### Task 5: Verify the integrated showroom behavior in browser-sized conditions

**Files:**
- Modify: `index.html`
- Modify: `assets/css/home.css`
- Modify: `assets/js/hero-3d.js`

- [ ] **Step 1: Start a local static server from the project root**

Run:

```bash
python3 -m http.server 5500
```

Expected: the site is served at `http://127.0.0.1:5500/`.

- [ ] **Step 2: Verify the desktop acceptance flow manually**

Open `http://127.0.0.1:5500/` and confirm all of the following:

```text
1. Scroll to "Interactive Showroom".
2. The car appears noticeably larger than the current baseline.
3. Drag rotates the car.
4. Mouse wheel does not zoom.
5. Double-click on the hood, roof, and side door each moves the camera to a fixed closer shot around the clicked point.
6. Double-click empty background space resets to the wide default view.
7. Clicking each of the seven swatches changes only the body paint.
8. The color panel remains visible in both default and focused states.
```

Expected: all eight checks pass without console errors.

- [ ] **Step 3: Verify the mobile-width shell layout**

In browser responsive mode, test widths near `768px` and `390px`:

```text
1. The shell height shrinks to the new responsive sizes.
2. The color panel remains visible and inside the frame.
3. The car still fits inside the stage without clipping through the panel.
```

Expected: the control remains readable and the car stays visually dominant.

- [ ] **Step 4: Commit the finished feature**

Run:

```bash
git add index.html assets/css/home.css assets/js/hero-3d.js
git commit -m "feat: add showroom focus and paint controls"
```

Expected: one feature commit captures the final implementation.
