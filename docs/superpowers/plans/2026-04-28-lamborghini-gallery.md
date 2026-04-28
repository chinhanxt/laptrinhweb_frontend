# Lamborghini Gallery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a cinematic horizontal-scroll Lamborghini showcase section to `index.html`, placed after the existing showroom, featuring 3 interactive 3D car models with parallax, particle hover effects, and dynamic lighting.

**Architecture:** New `<section id="lamborghini-gallery">` in `index.html` after `#showroom-stage`. A single JS module `lambo-gallery.js` owns the Three.js renderer, particle canvas overlay, GSAP ScrollTrigger horizontal scroll, and all interaction. Renderer lifecycle is managed via ScrollTrigger callbacks — only one Three.js renderer is active at a time (showroom OR gallery, never both).

**Tech Stack:** Three.js r147 (existing CDN), GSAP 3.12.5 + ScrollTrigger (existing CDN), Canvas 2D API, vanilla JS IIFE module pattern.

**Spec:** `docs/superpowers/specs/2026-04-28-lamborghini-gallery-design.md`

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `assets/js/lambo-gallery.js` | **Create** | Main gallery module — Three.js scene, lighting, model loading, particle overlay, scroll mechanics, mobile handling |
| `assets/css/home.css` | **Modify** | Add CSS for `#lamborghini-gallery` section, panels, text, progress bar, responsive rules |
| `index.html` | **Modify** | Add `<section id="lamborghini-gallery">` HTML + `<script>` tag + `<link rel="preload">` for 3 models |
| `assets/js/hero-3d.js` | **Modify** | Add `dispose()` and `reinit()` methods to `APEXHero3D` for renderer lifecycle management |
| `assets/js/home.js` | **Modify** | Wire `LamboGallery.init()` into boot sequence |

---

### Task 1: Add `dispose()` and `reinit()` to `APEXHero3D`

**Files:**
- Modify: `assets/js/hero-3d.js:882-888` (the return object)

The gallery needs to dispose the showroom renderer when it enters view, and re-init when scrolling back. The existing `hero-3d.js` has no dispose method. We need to add `dispose()` (tears down renderer, controls, animation loop, event listeners) and `reinit()` (rebuilds from cached models without reloading GLBs).

- [ ] **Step 1: Add `dispose()` method**

Inside `hero-3d.js`, before the `return` statement (line ~882), add:

```javascript
var disposed = false;
var resizeHandler = onResize;

function dispose() {
  if (disposed) return;
  disposed = true;

  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  window.removeEventListener("resize", resizeHandler);

  if (controls) {
    controls.dispose();
    controls = null;
  }

  if (renderer) {
    renderer.domElement.removeEventListener("dblclick", handleDoubleClick);
    if (renderer.domElement.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement);
    }
    renderer.dispose();
    renderer = null;
  }

  if (warmupRenderTarget) {
    warmupRenderTarget.dispose();
    warmupRenderTarget = null;
  }

  removeCarFromScene();
  scene = null;
  camera = null;
}
```

- [ ] **Step 2: Add `reinit()` method**

```javascript
function reinit() {
  if (!disposed) return;
  disposed = false;

  shell = document.getElementById("hero-3d-shell");
  canvasMount = document.getElementById("hero-3d-canvas");
  if (!shell || !canvasMount || typeof THREE === "undefined") return false;

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(32, shell.clientWidth / shell.clientHeight, 0.1, 100);
  camera.position.copy(defaultCameraPosition);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(shell.clientWidth, shell.clientHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  canvasMount.appendChild(renderer.domElement);

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

  renderer.domElement.addEventListener("dblclick", handleDoubleClick);
  window.addEventListener("resize", resizeHandler);

  setupLights();

  if (modelCache[currentIndex]) {
    activateCachedModel(currentIndex);
    snapHeroCameraToDefault();
  }

  animate();
  return true;
}
```

- [ ] **Step 3: Expose new methods in the return object**

Change the return statement at line ~882 to:

```javascript
return {
  initHeroScene: initHeroScene,
  animate: animate,
  showHeroFallback: showHeroFallback,
  switchCar: switchCar,
  whenReady: function () { return readyPromise; },
  dispose: dispose,
  reinit: reinit
};
```

- [ ] **Step 4: Test manually**

Open `index.html` in browser. Open DevTools console. Run:
```javascript
APEXHero3D.dispose();
// The 3D canvas should disappear, no errors in console
APEXHero3D.reinit();
// The 3D canvas should reappear with the same car model
```

- [ ] **Step 5: Commit**

```bash
git add assets/js/hero-3d.js
git commit -m "feat: add dispose/reinit lifecycle methods to APEXHero3D"
```

---

### Task 2: Add HTML structure for gallery section in `index.html`

**Files:**
- Modify: `index.html:219-222` (after showroom section closing tag, before `</main>`)
- Modify: `index.html:20-25` (add preload links for gallery models)

- [ ] **Step 1: Add model preload links**

After the existing preload links (line ~25, before `</head>`), add:

```html
<link rel="preload" as="fetch" href="assets/model/revuelto_3.0tm.glb" crossorigin />
<link rel="preload" as="fetch" href="assets/model/lamborghini_centenario_roadster_sdc.glb" crossorigin />
<link rel="preload" as="fetch" href="assets/model/lamborghini_centenario_lp-770_interior_sdc.glb" crossorigin />
```

- [ ] **Step 2: Add gallery section HTML**

After line 219 (closing `</section>` of showroom-stage), before the `</main>` tag, add:

```html
<!-- LAMBORGHINI GALLERY — Cinematic Horizontal Showcase -->
<section id="lamborghini-gallery" class="lambo-gallery">
  <div class="lambo-gallery__track">
    <!-- Background parallax layer -->
    <div class="lambo-gallery__bg" id="lambo-gallery-bg"></div>

    <!-- Three.js canvas mount -->
    <div class="lambo-gallery__canvas-wrap" id="lambo-gallery-canvas"></div>

    <!-- Particle overlay canvas -->
    <canvas class="lambo-gallery__particles" id="lambo-gallery-particles"></canvas>

    <!-- Text panels (one per car, parallax layer) -->
    <div class="lambo-gallery__panels" id="lambo-gallery-panels">
      <div class="lambo-gallery__panel" data-car="revuelto">
        <div class="lambo-gallery__info">
          <h3 class="lambo-gallery__name">REVUELTO</h3>
          <p class="lambo-gallery__sub">V12 Hybrid Supercar</p>
        </div>
        <div class="lambo-gallery__specs">
          <div class="lambo-gallery__spec"><span class="lambo-gallery__spec-val">1015</span><span class="lambo-gallery__spec-unit">HP</span></div>
          <div class="lambo-gallery__spec"><span class="lambo-gallery__spec-val">2.5<small>s</small></span><span class="lambo-gallery__spec-unit">0-100</span></div>
          <div class="lambo-gallery__spec"><span class="lambo-gallery__spec-val">350</span><span class="lambo-gallery__spec-unit">km/h</span></div>
        </div>
      </div>

      <div class="lambo-gallery__panel" data-car="centenario-roadster">
        <div class="lambo-gallery__info">
          <h3 class="lambo-gallery__name">CENTENARIO ROADSTER</h3>
          <p class="lambo-gallery__sub">Limited Edition — 20 Units</p>
        </div>
        <div class="lambo-gallery__specs">
          <div class="lambo-gallery__spec"><span class="lambo-gallery__spec-val">770</span><span class="lambo-gallery__spec-unit">HP</span></div>
          <div class="lambo-gallery__spec"><span class="lambo-gallery__spec-val">2.8<small>s</small></span><span class="lambo-gallery__spec-unit">0-100</span></div>
          <div class="lambo-gallery__spec"><span class="lambo-gallery__spec-val">355</span><span class="lambo-gallery__spec-unit">km/h</span></div>
        </div>
      </div>

      <div class="lambo-gallery__panel" data-car="centenario-interior">
        <div class="lambo-gallery__info">
          <h3 class="lambo-gallery__name">CENTENARIO LP-770</h3>
          <p class="lambo-gallery__sub">Interior Experience</p>
        </div>
        <div class="lambo-gallery__specs">
          <div class="lambo-gallery__spec"><span class="lambo-gallery__spec-val">770</span><span class="lambo-gallery__spec-unit">HP</span></div>
          <div class="lambo-gallery__spec"><span class="lambo-gallery__spec-val">Alcantara</span><span class="lambo-gallery__spec-unit">Material</span></div>
          <div class="lambo-gallery__spec"><span class="lambo-gallery__spec-val">Carbon</span><span class="lambo-gallery__spec-unit">Trim</span></div>
        </div>
      </div>
    </div>

    <!-- Progress indicator -->
    <div class="lambo-gallery__progress">
      <div class="lambo-gallery__progress-bar"><div class="lambo-gallery__progress-fill" id="lambo-gallery-fill"></div></div>
      <div class="lambo-gallery__dots">
        <button class="lambo-gallery__dot is-active" data-index="0" aria-label="Revuelto"></button>
        <button class="lambo-gallery__dot" data-index="1" aria-label="Centenario Roadster"></button>
        <button class="lambo-gallery__dot" data-index="2" aria-label="Centenario Interior"></button>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 3: Add script tag for lambo-gallery.js**

After the `hero-3d.js` script tag (line ~279), add:

```html
<script src="assets/js/lambo-gallery.js"></script>
```

- [ ] **Step 4: Verify HTML is valid**

Open `index.html` in browser. The new section should appear (unstyled) after the showroom. No console errors.

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: add lamborghini gallery HTML structure and model preloads"
```

---

### Task 3: Add CSS for gallery section

**Files:**
- Modify: `assets/css/home.css` (append at end of file)

- [ ] **Step 1: Add gallery section CSS**

Append to the end of `assets/css/home.css`:

```css
/* ----------------------------------------------------------
   LAMBORGHINI GALLERY — Cinematic Horizontal Showcase
   ---------------------------------------------------------- */
.lambo-gallery {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: #050508;
}

.lambo-gallery__track {
  display: flex;
  width: 300vw;
  height: 100vh;
  position: relative;
}

.lambo-gallery__bg {
  position: absolute;
  inset: 0;
  width: 300vw;
  z-index: 0;
  pointer-events: none;
  background: radial-gradient(ellipse at 16% 60%, rgba(230, 57, 70, 0.06), transparent 50%),
              radial-gradient(ellipse at 50% 60%, rgba(0, 180, 216, 0.06), transparent 50%),
              radial-gradient(ellipse at 84% 60%, rgba(201, 168, 76, 0.06), transparent 50%);
}

.lambo-gallery__canvas-wrap {
  position: absolute;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1;
}

.lambo-gallery__canvas-wrap canvas {
  display: block;
  width: 100% !important;
  height: 100% !important;
}

.lambo-gallery__particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 2;
  pointer-events: none;
}

.lambo-gallery__panels {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  width: 300vw;
  height: 100vh;
  z-index: 3;
  pointer-events: none;
}

.lambo-gallery__panel {
  width: 100vw;
  height: 100vh;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 0 clamp(2rem, 5vw, 5rem) clamp(5rem, 8vh, 7rem);
  pointer-events: none;
}

.lambo-gallery__info {
  pointer-events: auto;
}

.lambo-gallery__name {
  font-family: "Bebas Neue", sans-serif;
  font-size: clamp(2.5rem, 5vw, 4.5rem);
  letter-spacing: 0.08em;
  color: var(--color-text);
  margin: 0 0 0.2rem;
  line-height: 1;
}

.lambo-gallery__sub {
  font-family: "Cormorant Garamond", serif;
  font-size: clamp(0.85rem, 1.5vw, 1.1rem);
  font-weight: 300;
  font-style: italic;
  letter-spacing: 0.1em;
  color: var(--color-silver);
  margin: 0;
}

.lambo-gallery__specs {
  display: flex;
  gap: clamp(1.5rem, 3vw, 3rem);
  margin-top: 1.2rem;
  pointer-events: auto;
}

.lambo-gallery__spec {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.lambo-gallery__spec-val {
  font-family: "Bebas Neue", sans-serif;
  font-size: clamp(1.5rem, 2.5vw, 2.2rem);
  color: var(--color-gold);
  line-height: 1.1;
  letter-spacing: 0.04em;
}

.lambo-gallery__spec-val small {
  font-size: 0.6em;
}

.lambo-gallery__spec-unit {
  font-family: "Space Mono", monospace;
  font-size: 0.6rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--color-muted);
  margin-top: 0.15rem;
}

/* Progress indicator */
.lambo-gallery__progress {
  position: absolute;
  bottom: clamp(1.5rem, 3vh, 2.5rem);
  left: 50%;
  transform: translateX(-50%);
  z-index: 4;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  width: min(80vw, 400px);
}

.lambo-gallery__progress-bar {
  width: 100%;
  height: 2px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 1px;
  overflow: hidden;
}

.lambo-gallery__progress-fill {
  height: 100%;
  width: 0%;
  background: var(--color-gold);
  border-radius: 1px;
  transition: width 0.05s linear;
}

.lambo-gallery__dots {
  display: flex;
  gap: 0.75rem;
}

.lambo-gallery__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: transparent;
  cursor: pointer;
  padding: 0;
  transition: all 0.3s ease;
  pointer-events: auto;
}

.lambo-gallery__dot.is-active {
  background: var(--color-gold);
  border-color: var(--color-gold);
  transform: scale(1.25);
}

/* Mobile responsive */
@media (max-width: 767px) {
  .lambo-gallery__name {
    font-size: 2rem;
  }
  .lambo-gallery__specs {
    gap: 1rem;
  }
  .lambo-gallery__spec-val {
    font-size: 1.3rem;
  }
  .lambo-gallery__particles {
    display: none;
  }
}
```

- [ ] **Step 2: Verify styling in browser**

Open `index.html`. The gallery section should appear with a dark background after the showroom. Text elements should be visible and properly styled at the bottom of each panel.

- [ ] **Step 3: Commit**

```bash
git add assets/css/home.css
git commit -m "feat: add CSS for lamborghini gallery section"
```

---

### Task 4: Create `lambo-gallery.js` — Core Three.js scene + model loading

**Files:**
- Create: `assets/js/lambo-gallery.js`

This task creates the core module with: car data, Three.js scene init, model preloading/caching, model swap on scroll, camera setup, and the module shell. Lighting and particles are added in subsequent tasks.

- [ ] **Step 1: Create the module shell with car data and Three.js scene init**

Create `assets/js/lambo-gallery.js`:

```javascript
window.LamboGallery = (function () {
  "use strict";

  var GALLERY_CARS = [
    {
      id: "revuelto",
      name: "REVUELTO",
      model: "assets/model/revuelto_3.0tm.glb",
      color: { primary: "#e63946", rim: "#ff6b6b", hueRange: [340, 370] },
      targetSize: 3.8,
      cameraPosition: { x: 3.4, y: 1.55, z: 4.8 },
      cameraTarget: { x: 0, y: 0.5, z: 0 }
    },
    {
      id: "centenario-roadster",
      name: "CENTENARIO ROADSTER",
      model: "assets/model/lamborghini_centenario_roadster_sdc.glb",
      color: { primary: "#00b4d8", rim: "#48cae4", hueRange: [190, 210] },
      targetSize: 3.8,
      cameraPosition: { x: 3.4, y: 1.55, z: 4.8 },
      cameraTarget: { x: 0, y: 0.5, z: 0 }
    },
    {
      id: "centenario-interior",
      name: "CENTENARIO LP-770",
      model: "assets/model/lamborghini_centenario_lp-770_interior_sdc.glb",
      color: { primary: "#c9a84c", rim: "#e8d590", hueRange: [40, 55] },
      targetSize: 3.8,
      cameraPosition: { x: 3.4, y: 1.55, z: 4.8 },
      cameraTarget: { x: 0, y: 0.5, z: 0 }
    }
  ];

  var scene, camera, renderer, controls;
  var currentIndex = 0;
  var modelCache = {};
  var activeModel = null;
  var disposed = false;
  var animLoopId = null;
  var isMobile = false;

  // Lighting references
  var ambientLight, spotLight, rimLightL, rimLightR, fillLight;

  // Particle overlay
  var particleCanvas, particleCtx;
  var particleAnimId = null;
  var neonStreaks = [], lightLines = [], smokes = [], dust = [];
  var mouse = { x: 0, y: 0, px: 0, py: 0, active: false };

  // DOM references
  var section, canvasWrap, bgEl, panelsEl, fillEl;
  var dotEls = [];
  var panelEls = [];

  // Scroll state
  var scrollTriggerInstance = null;

  // Ready promise
  var resolveReady;
  var readyPromise = new Promise(function (resolve) { resolveReady = resolve; });

  // ----------------------------------------------------------------
  // Three.js scene
  // ----------------------------------------------------------------
  function initScene() {
    section = document.getElementById("lamborghini-gallery");
    canvasWrap = document.getElementById("lambo-gallery-canvas");
    bgEl = document.getElementById("lambo-gallery-bg");
    panelsEl = document.getElementById("lambo-gallery-panels");
    fillEl = document.getElementById("lambo-gallery-fill");
    particleCanvas = document.getElementById("lambo-gallery-particles");
    dotEls = Array.prototype.slice.call(document.querySelectorAll(".lambo-gallery__dot"));
    panelEls = Array.prototype.slice.call(document.querySelectorAll(".lambo-gallery__panel"));

    if (!section || !canvasWrap || typeof THREE === "undefined") return false;

    isMobile = window.innerWidth < 768;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(32, window.innerWidth / window.innerHeight, 0.1, 100);

    var preset = getCameraPreset(0);
    camera.position.copy(preset.position);

    renderer = new THREE.WebGLRenderer({ antialias: !isMobile, alpha: true });
    renderer.setPixelRatio(isMobile ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    canvasWrap.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.enableZoom = false;
    controls.autoRotate = false;
    controls.minPolarAngle = 0.55;
    controls.maxPolarAngle = 1.65;
    controls.target.copy(preset.target);
    controls.update();

    setupLighting();
    window.addEventListener("resize", onResize);

    return true;
  }

  function getCameraPreset(index) {
    var car = GALLERY_CARS[index] || GALLERY_CARS[0];
    return {
      position: new THREE.Vector3(car.cameraPosition.x, car.cameraPosition.y, car.cameraPosition.z),
      target: new THREE.Vector3(car.cameraTarget.x, car.cameraTarget.y, car.cameraTarget.z)
    };
  }

  function onResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    if (particleCanvas) {
      var dpr = isMobile ? 1 : (window.devicePixelRatio || 1);
      particleCanvas.width = window.innerWidth * dpr;
      particleCanvas.height = window.innerHeight * dpr;
      if (particleCtx) particleCtx.scale(dpr, dpr);
    }
  }

  // ----------------------------------------------------------------
  // Lighting
  // ----------------------------------------------------------------
  function setupLighting() {
    ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
    fillLight.position.set(4, 6, 5);
    scene.add(fillLight);

    spotLight = new THREE.SpotLight(0xffffff, 0, 20, 0.5, 0.8, 1);
    spotLight.position.set(0, 8, 0);
    scene.add(spotLight);

    if (!isMobile) {
      rimLightL = new THREE.PointLight(0xffffff, 0, 12);
      rimLightL.position.set(-4, 2, 0);
      scene.add(rimLightL);

      rimLightR = new THREE.PointLight(0xffffff, 0, 12);
      rimLightR.position.set(4, 2, -1);
      scene.add(rimLightR);
    }

    applyCarLighting(0);
  }

  function applyCarLighting(index) {
    var car = GALLERY_CARS[index];
    var primaryColor = new THREE.Color(car.color.primary);
    var rimColor = new THREE.Color(car.color.rim);

    ambientLight.color.copy(primaryColor);
    ambientLight.intensity = 0.3;

    spotLight.color.copy(primaryColor);

    if (rimLightL) rimLightL.color.copy(rimColor);
    if (rimLightR) {
      var complementary = new THREE.Color(car.color.rim);
      complementary.offsetHSL(0.1, 0, 0);
      rimLightR.color.copy(complementary);
    }
  }

  function tweenLightsOn() {
    gsap.to(spotLight, { intensity: 2, duration: 0.8, ease: "power2.out" });
    if (rimLightL) gsap.to(rimLightL, { intensity: 1.5, duration: 0.8, ease: "power2.out" });
    if (rimLightR) gsap.to(rimLightR, { intensity: 1.0, duration: 0.8, ease: "power2.out" });
  }

  function tweenLightsOff() {
    gsap.to(spotLight, { intensity: 0, duration: 0.6, ease: "power2.in" });
    if (rimLightL) gsap.to(rimLightL, { intensity: 0, duration: 0.6, ease: "power2.in" });
    if (rimLightR) gsap.to(rimLightR, { intensity: 0, duration: 0.6, ease: "power2.in" });
  }

  // ----------------------------------------------------------------
  // Glossy hover
  // ----------------------------------------------------------------
  var originalMaterials = [];

  function storeOriginalMaterials(root) {
    originalMaterials = [];
    root.traverse(function (node) {
      if (!node.isMesh || !node.material) return;
      var mats = Array.isArray(node.material) ? node.material : [node.material];
      mats.forEach(function (mat) {
        if (mat && typeof mat.roughness === "number") {
          originalMaterials.push({ mat: mat, roughness: mat.roughness, metalness: mat.metalness || 0 });
        }
      });
    });
  }

  function tweenGlossyOn() {
    originalMaterials.forEach(function (entry) {
      gsap.to(entry.mat, { roughness: Math.max(0.1, entry.roughness - 0.3), metalness: Math.min(1, entry.metalness + 0.35), duration: 0.8, ease: "power2.out" });
    });
  }

  function tweenGlossyOff() {
    originalMaterials.forEach(function (entry) {
      gsap.to(entry.mat, { roughness: entry.roughness, metalness: entry.metalness, duration: 0.6, ease: "power2.in" });
    });
  }

  // ----------------------------------------------------------------
  // Model loading
  // ----------------------------------------------------------------
  function normalizeModel(root, index) {
    var car = GALLERY_CARS[index];
    var box = new THREE.Box3().setFromObject(root);
    var size = box.getSize(new THREE.Vector3());
    var widthDim = Math.max(size.x, size.z);
    if (widthDim > 0) root.scale.setScalar(car.targetSize / widthDim);
    box.setFromObject(root);
    var center = box.getCenter(new THREE.Vector3());
    root.position.sub(center);
    root.position.y += 0.35;
  }

  function loadModel(index, callback) {
    if (modelCache[index]) {
      callback(modelCache[index]);
      return;
    }
    var loader = new THREE.GLTFLoader();
    loader.load(
      GALLERY_CARS[index].model,
      function (gltf) {
        var root = gltf.scene;
        normalizeModel(root, index);
        modelCache[index] = root;
        callback(root);
      },
      undefined,
      function () { callback(null); }
    );
  }

  function preloadAll(callback) {
    if (isMobile) {
      loadModel(0, function () { callback(); });
      return;
    }
    var remaining = GALLERY_CARS.length;
    GALLERY_CARS.forEach(function (_, i) {
      loadModel(i, function () {
        remaining--;
        if (remaining === 0) callback();
      });
    });
  }

  function showModel(index) {
    if (activeModel) {
      scene.remove(activeModel);
      activeModel = null;
    }
    var model = modelCache[index];
    if (!model) return;
    var clone = model.clone(true);
    scene.add(clone);
    activeModel = clone;
    storeOriginalMaterials(clone);
    applyCarLighting(index);
    currentIndex = index;
  }

  // ----------------------------------------------------------------
  // Particle overlay (desktop only)
  // ----------------------------------------------------------------
  function initParticles() {
    if (isMobile || !particleCanvas) return;
    var dpr = window.devicePixelRatio || 1;
    particleCanvas.width = window.innerWidth * dpr;
    particleCanvas.height = window.innerHeight * dpr;
    particleCtx = particleCanvas.getContext("2d");
    particleCtx.scale(dpr, dpr);

    section.addEventListener("mouseenter", function () { mouse.active = true; });
    section.addEventListener("mouseleave", function () { mouse.active = false; });
    section.addEventListener("mousemove", function (e) {
      mouse.px = mouse.x; mouse.py = mouse.y;
      mouse.x = e.clientX; mouse.y = e.clientY;
    });

    animateParticles();
  }

  function spawnParticles() {
    if (!mouse.active) return;
    var speed = Math.sqrt(Math.pow(mouse.x - mouse.px, 2) + Math.pow(mouse.y - mouse.py, 2));
    if (speed < 1.5) return;

    var angle = Math.atan2(mouse.y - mouse.py, mouse.x - mouse.px);
    var car = GALLERY_CARS[currentIndex];
    var hueMin = car.color.hueRange[0];
    var hueMax = car.color.hueRange[1];
    var intensity = Math.min(speed, 40);

    var neonCount = Math.min(intensity * 0.3, 4);
    for (var i = 0; i < neonCount; i++) {
      var spread = (Math.random() - 0.5) * 0.5;
      neonStreaks.push({
        x: mouse.x, y: mouse.y,
        vx: -Math.cos(angle + spread) * (speed * 0.28 + Math.random() * 2),
        vy: -Math.sin(angle + spread) * (speed * 0.28 + Math.random() * 2),
        life: 1, decay: 0.014 + Math.random() * 0.008,
        len: speed * 0.7 + Math.random() * 18,
        width: Math.random() * 2.5 + 0.6,
        hue: hueMin + Math.random() * (hueMax - hueMin)
      });
    }

    var lineCount = Math.min(intensity * 0.2, 3);
    for (var j = 0; j < lineCount; j++) {
      var lSpread = (Math.random() - 0.5) * 0.35;
      lightLines.push({
        x: mouse.x, y: mouse.y,
        vx: -Math.cos(angle + lSpread) * (speed * 0.18 + Math.random() * 1.2),
        vy: -Math.sin(angle + lSpread) * (speed * 0.18 + Math.random() * 1.2),
        life: 1, decay: 0.02 + Math.random() * 0.012,
        len: speed * 0.5 + Math.random() * 10,
        width: Math.random() * 1.2 + 0.3
      });
    }

    if (Math.random() > 0.45) {
      smokes.push({
        x: mouse.x + (Math.random() - 0.5) * 25,
        y: mouse.y + (Math.random() - 0.5) * 12,
        vx: -Math.cos(angle) * speed * 0.04 + (Math.random() - 0.5) * 0.6,
        vy: -0.25 - Math.random() * 0.35,
        size: Math.random() * 20 + 8,
        life: 1, decay: 0.008 + Math.random() * 0.005,
        rot: Math.random() * Math.PI * 2,
        rotSpd: (Math.random() - 0.5) * 0.012
      });
    }

    if (Math.random() > 0.65) {
      dust.push({
        x: mouse.x + (Math.random() - 0.5) * 60,
        y: window.innerHeight - 100 + Math.random() * 20,
        vx: (Math.random() - 0.5) * 0.8,
        vy: -Math.random() * 0.5 - 0.15,
        size: Math.random() * 2 + 0.4,
        life: 1, decay: 0.006 + Math.random() * 0.004
      });
    }

    // Hard cap
    var total = neonStreaks.length + lightLines.length + smokes.length + dust.length;
    if (total > 200) {
      var excess = total - 200;
      dust.splice(0, Math.min(excess, dust.length));
      excess -= Math.min(excess, dust.length);
      if (excess > 0) smokes.splice(0, Math.min(excess, smokes.length));
    }
  }

  function renderParticles() {
    var w = window.innerWidth, h = window.innerHeight;
    particleCtx.clearRect(0, 0, w, h);

    // Smoke wisps
    for (var si = smokes.length - 1; si >= 0; si--) {
      var s = smokes[si];
      s.x += s.vx; s.y += s.vy; s.size += 0.25; s.life -= s.decay; s.rot += s.rotSpd;
      if (s.life <= 0) { smokes.splice(si, 1); continue; }
      particleCtx.save();
      particleCtx.translate(s.x, s.y);
      particleCtx.rotate(s.rot);
      particleCtx.globalAlpha = s.life * 0.14;
      var sg = particleCtx.createRadialGradient(0, 0, 0, 0, 0, s.size);
      sg.addColorStop(0, "rgba(190,185,180,0.25)");
      sg.addColorStop(0.4, "rgba(150,148,145,0.12)");
      sg.addColorStop(1, "rgba(100,100,100,0)");
      particleCtx.fillStyle = sg;
      particleCtx.beginPath();
      particleCtx.ellipse(0, 0, s.size, s.size * 0.5, 0, 0, Math.PI * 2);
      particleCtx.fill();
      particleCtx.restore();
    }

    // Neon streaks
    for (var ni = neonStreaks.length - 1; ni >= 0; ni--) {
      var n = neonStreaks[ni];
      n.x += n.vx; n.y += n.vy; n.vx *= 0.96; n.vy *= 0.96; n.life -= n.decay;
      if (n.life <= 0) { neonStreaks.splice(ni, 1); continue; }
      var na = Math.atan2(n.vy, n.vx);
      var nSpd = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
      var nLen = n.len * n.life * (nSpd / 3);
      particleCtx.save();
      particleCtx.globalAlpha = n.life * 0.75;
      particleCtx.strokeStyle = "hsla(" + n.hue + ", 92%, 58%, " + (n.life * 0.85) + ")";
      particleCtx.lineWidth = n.width * n.life;
      particleCtx.lineCap = "round";
      particleCtx.shadowColor = "hsla(" + n.hue + ", 100%, 50%, 0.5)";
      particleCtx.shadowBlur = 10;
      particleCtx.beginPath();
      particleCtx.moveTo(n.x, n.y);
      particleCtx.lineTo(n.x - Math.cos(na) * nLen, n.y - Math.sin(na) * nLen);
      particleCtx.stroke();
      particleCtx.restore();
    }

    // White light lines
    for (var li = lightLines.length - 1; li >= 0; li--) {
      var l = lightLines[li];
      l.x += l.vx; l.y += l.vy; l.vx *= 0.955; l.vy *= 0.955; l.life -= l.decay;
      if (l.life <= 0) { lightLines.splice(li, 1); continue; }
      var la = Math.atan2(l.vy, l.vx);
      var lSpd2 = Math.sqrt(l.vx * l.vx + l.vy * l.vy);
      var lLen = l.len * l.life * (lSpd2 / 2);
      particleCtx.save();
      particleCtx.globalAlpha = l.life * 0.5;
      particleCtx.strokeStyle = "rgba(235,230,225," + (l.life * 0.6) + ")";
      particleCtx.lineWidth = l.width * l.life;
      particleCtx.lineCap = "round";
      particleCtx.shadowColor = "rgba(255,255,255,0.25)";
      particleCtx.shadowBlur = 5;
      particleCtx.beginPath();
      particleCtx.moveTo(l.x, l.y);
      particleCtx.lineTo(l.x - Math.cos(la) * lLen, l.y - Math.sin(la) * lLen);
      particleCtx.stroke();
      particleCtx.restore();
    }

    // Road dust
    for (var di = dust.length - 1; di >= 0; di--) {
      var d = dust[di];
      d.x += d.vx; d.y += d.vy; d.life -= d.decay;
      if (d.life <= 0) { dust.splice(di, 1); continue; }
      particleCtx.globalAlpha = d.life * 0.4;
      particleCtx.fillStyle = "rgba(215,200,175," + (d.life * 0.5) + ")";
      particleCtx.beginPath();
      particleCtx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
      particleCtx.fill();
    }

    particleCtx.globalAlpha = 1;
  }

  function animateParticles() {
    spawnParticles();
    renderParticles();
    particleAnimId = requestAnimationFrame(animateParticles);
  }

  // ----------------------------------------------------------------
  // Hover handlers (spotlight + glossy + particles)
  // ----------------------------------------------------------------
  function onSectionMouseEnter() {
    tweenLightsOn();
    tweenGlossyOn();
  }

  function onSectionMouseLeave() {
    tweenLightsOff();
    tweenGlossyOff();
  }

  function bindHoverEvents() {
    if (isMobile) {
      section.addEventListener("click", function () {
        if (spotLight.intensity > 0.5) {
          tweenLightsOff();
        } else {
          tweenLightsOn();
        }
      });
      return;
    }
    section.addEventListener("mouseenter", onSectionMouseEnter);
    section.addEventListener("mouseleave", onSectionMouseLeave);
  }

  // ----------------------------------------------------------------
  // GSAP ScrollTrigger — horizontal scroll + parallax
  // ----------------------------------------------------------------
  function initScrollTrigger() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    var trackWidth = section.scrollWidth;

    scrollTriggerInstance = ScrollTrigger.create({
      trigger: section,
      pin: true,
      scrub: 1,
      end: function () { return "+=" + (trackWidth - window.innerWidth); },
      onUpdate: function (self) {
        var progress = self.progress;

        // Move track horizontally
        gsap.set(".lambo-gallery__track", { x: -(trackWidth - window.innerWidth) * progress });

        // Parallax: background at 0.6x
        gsap.set(bgEl, { x: (trackWidth - window.innerWidth) * progress * 0.4 });

        // Parallax: text panels at 1.3x
        gsap.set(panelsEl, { x: -(trackWidth - window.innerWidth) * progress * 0.3 });

        // Progress bar
        if (fillEl) fillEl.style.width = (progress * 100) + "%";

        // Active car index
        var newIndex = Math.min(Math.floor(progress * GALLERY_CARS.length), GALLERY_CARS.length - 1);
        if (newIndex !== currentIndex) {
          showModel(newIndex);
          var preset = getCameraPreset(newIndex);
          gsap.to(camera.position, { x: preset.position.x, y: preset.position.y, z: preset.position.z, duration: 0.8, ease: "power2.inOut" });
          gsap.to(controls.target, { x: preset.target.x, y: preset.target.y, z: preset.target.z, duration: 0.8, ease: "power2.inOut" });
        }

        // Dots
        dotEls.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === newIndex);
        });
      }
    });

    // Dot click navigation
    dotEls.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var index = parseInt(dot.dataset.index, 10);
        var targetProgress = index / (GALLERY_CARS.length - 1);
        var scrollTo = scrollTriggerInstance.start + (scrollTriggerInstance.end - scrollTriggerInstance.start) * targetProgress;
        gsap.to(window, { scrollTo: scrollTo, duration: 1, ease: "power2.inOut" });
      });
    });
  }

  // ----------------------------------------------------------------
  // Renderer lifecycle — managed by external ScrollTrigger in home.js
  // ----------------------------------------------------------------
  function disposeGallery() {
    if (disposed) return;
    disposed = true;

    if (animLoopId) { cancelAnimationFrame(animLoopId); animLoopId = null; }
    if (particleAnimId) { cancelAnimationFrame(particleAnimId); particleAnimId = null; }

    window.removeEventListener("resize", onResize);
    section.removeEventListener("mouseenter", onSectionMouseEnter);
    section.removeEventListener("mouseleave", onSectionMouseLeave);

    if (controls) { controls.dispose(); controls = null; }
    if (renderer) {
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
      renderer.dispose(); renderer = null;
    }
    if (activeModel) { scene.remove(activeModel); activeModel = null; }

    scene = null; camera = null;
    neonStreaks = []; lightLines = []; smokes = []; dust = [];
  }

  function reinitGallery() {
    if (!disposed) return;
    disposed = false;
    initScene();
    if (modelCache[currentIndex]) {
      showModel(currentIndex);
    }
    if (!isMobile) initParticles();
    bindHoverEvents();
    animate();
  }

  // ----------------------------------------------------------------
  // Render loop
  // ----------------------------------------------------------------
  function animate() {
    if (!renderer || !scene || !camera || disposed) return;
    animLoopId = requestAnimationFrame(animate);
    if (controls) controls.update();
    renderer.render(scene, camera);
  }

  // ----------------------------------------------------------------
  // Public init
  // ----------------------------------------------------------------
  function init() {
    if (!initScene()) {
      resolveReady(false);
      return;
    }

    preloadAll(function () {
      showModel(0);
      if (!isMobile) initParticles();
      bindHoverEvents();
      initScrollTrigger();
      animate();
      resolveReady(true);
    });
  }

  return {
    init: init,
    whenReady: function () { return readyPromise; },
    dispose: disposeGallery,
    reinit: reinitGallery
  };
})();
```

- [ ] **Step 2: Verify module loads without errors**

Open `index.html` in browser. Check DevTools console for errors. Run `typeof LamboGallery` — should return `"object"`.

- [ ] **Step 3: Commit**

```bash
git add assets/js/lambo-gallery.js
git commit -m "feat: create lambo-gallery.js with Three.js scene, lighting, particles, and scroll mechanics"
```

---

### Task 5: Wire gallery into boot sequence + renderer lifecycle

**Files:**
- Modify: `assets/js/home.js:60-116`

- [ ] **Step 1: Add gallery init and renderer lifecycle to home.js**

In `home.js`, inside the `$(function () { ... })` block, after the APEXHero3D initialization block (after line ~94) and before the `if (!bootTasks.length)` check, add:

```javascript
// Lamborghini Gallery — init + renderer lifecycle
if (window.LamboGallery) {
  bootTasks.push(window.LamboGallery.whenReady());

  if (!isMobile) {
    window.LamboGallery.init();

    // Renderer lifecycle: swap between showroom and gallery
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.create({
      trigger: "#lamborghini-gallery",
      start: "top 80%",
      end: "bottom 20%",
      onEnter: function () {
        if (window.APEXHero3D && typeof window.APEXHero3D.dispose === "function") {
          window.APEXHero3D.dispose();
        }
      },
      onLeaveBack: function () {
        if (window.LamboGallery && typeof window.LamboGallery.dispose === "function") {
          window.LamboGallery.dispose();
        }
        if (window.APEXHero3D && typeof window.APEXHero3D.reinit === "function") {
          window.APEXHero3D.reinit();
        }
      },
      onLeave: function () {
        if (window.LamboGallery && typeof window.LamboGallery.dispose === "function") {
          window.LamboGallery.dispose();
        }
      }
    });
  } else {
    window.LamboGallery.init();
  }
}
```

- [ ] **Step 2: Test the full flow**

1. Open `index.html` in browser
2. Scroll from intro → showroom (3D cars should render)
3. Scroll to gallery section — showroom renderer should dispose, gallery renderer should activate
4. Scroll back to showroom — gallery disposes, showroom re-inits
5. Check DevTools console for no errors, no WebGL context warnings

- [ ] **Step 3: Test hover effects**

1. In the gallery section, move mouse quickly — neon streaks + white lines + smoke + dust should appear
2. Hover on the section — spotlight + rim lights should fade in, car should become glossier
3. Move mouse out — effects should fade

- [ ] **Step 4: Test scroll parallax**

1. Scroll through gallery — background, model, and text should move at different speeds
2. Progress bar should fill, dots should update
3. Car model should swap at 33% and 66% scroll progress

- [ ] **Step 5: Test mobile**

1. Open in DevTools mobile view (< 768px)
2. Gallery should render with simplified lighting (no rim lights)
3. No particle canvas should appear
4. Touch swipe should scroll between cars

- [ ] **Step 6: Commit**

```bash
git add assets/js/home.js
git commit -m "feat: wire lamborghini gallery into boot sequence with renderer lifecycle"
```

---

### Task 6: Tune camera angles and model positions per car

**Files:**
- Modify: `assets/js/lambo-gallery.js` (GALLERY_CARS array)

Each 3D model has different dimensions and orientation. After the initial implementation is working, the camera angles and target sizes need tuning per model.

- [ ] **Step 1: Load each model and determine optimal camera position**

Open `index.html`, scroll to gallery. For each car:
1. Use OrbitControls to rotate to a good 3/4 angle
2. Open DevTools console and run: `console.log(LamboGallery.__debug_camera())` (we'll add this helper)
3. Note the camera position and target values

Add a temporary debug helper to the return object of `lambo-gallery.js`:

```javascript
__debug_camera: function () {
  if (!camera || !controls) return null;
  return {
    position: { x: +camera.position.x.toFixed(2), y: +camera.position.y.toFixed(2), z: +camera.position.z.toFixed(2) },
    target: { x: +controls.target.x.toFixed(2), y: +controls.target.y.toFixed(2), z: +controls.target.z.toFixed(2) }
  };
}
```

- [ ] **Step 2: Update GALLERY_CARS with tuned values**

Update each entry's `cameraPosition`, `cameraTarget`, and `targetSize` based on Step 1 findings. Remove the `__debug_camera` helper.

- [ ] **Step 3: Verify all 3 cars display well**

Scroll through gallery. Each car should be centered, well-framed, at a good viewing angle.

- [ ] **Step 4: Commit**

```bash
git add assets/js/lambo-gallery.js
git commit -m "fix: tune camera angles and model sizes per car in gallery"
```

---

### Task 7: Final polish and edge cases

**Files:**
- Modify: `assets/js/lambo-gallery.js`
- Modify: `assets/css/home.css`

- [ ] **Step 1: Add GSAP ScrollTo plugin for dot navigation**

The dot click uses `gsap.to(window, { scrollTo: ... })` which requires the ScrollTo plugin. Add the CDN link in `index.html` after the ScrollTrigger script:

```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollToPlugin.min.js"></script>
```

- [ ] **Step 2: Handle edge case — user scrolls very fast**

In the `showModel()` function, add a guard to prevent model swap if the same index:

```javascript
function showModel(index) {
  if (index === currentIndex && activeModel) return;
  // ... rest of function
}
```

- [ ] **Step 3: Add smooth background color transition**

When car changes, tween the background gradient. In `applyCarLighting()`, add:

```javascript
if (bgEl) {
  var bgColor = car.color.primary;
  bgEl.style.transition = "background 0.8s ease";
  bgEl.style.background = "radial-gradient(ellipse at 50% 60%, " + bgColor + "0F, transparent 50%)";
}
```

- [ ] **Step 4: Ensure `.superpowers/` is in .gitignore**

```bash
echo ".superpowers/" >> .gitignore
```

- [ ] **Step 5: Test complete flow end-to-end**

1. Full page load → intro → showroom → gallery → scroll past
2. Scroll back up through entire flow
3. Test all hover effects, lighting, model swaps
4. Test mobile responsive
5. Check no console errors, no memory leaks (check DevTools Performance tab)

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: lamborghini gallery polish — ScrollTo plugin, edge cases, background transitions"
```

---

## Summary

| Task | Description | Dependencies |
|---|---|---|
| 1 | Add dispose/reinit to APEXHero3D | None |
| 2 | Add gallery HTML to index.html | None |
| 3 | Add gallery CSS | Task 2 |
| 4 | Create lambo-gallery.js | Tasks 1, 2, 3 |
| 5 | Wire into boot sequence | Tasks 1, 4 |
| 6 | Tune camera angles per model | Task 5 |
| 7 | Final polish and edge cases | Task 6 |
