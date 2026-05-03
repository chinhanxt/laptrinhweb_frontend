# Collection & Detail Six-Model Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align the collection and detail experience to the same 6 homepage models, generate fresh still images from those models, and make each detail page load the correct 360 model with closer showroom-style framing.

**Architecture:** Replace the current 7-car collection/detail data source with a strict 6-car catalog in `assets/js/data.js`, then have both `catalog.js` and `detail.js` render only from that shared source. Add a small Puppeteer-based capture utility under `tools/` to generate consistent `hero/front/rear/top` stills from each `.glb`, and wire those generated assets back into the shared data so cards, hero, gallery, compare, and booking all stay in sync.

**Tech Stack:** Static HTML, jQuery, Bootstrap 5, GSAP/ScrollTrigger, `model-viewer`, Node.js CommonJS, `puppeteer-core`, existing local static server patterns, `node --check` for JS validation, browser smoke testing.

---

## File Structure

- Modify: `assets/js/data.js`
  - Replace the legacy 7-car collection/detail data with the canonical 6-car catalog and shared helper functions.
- Modify: `assets/js/catalog.js`
  - Keep catalog rendering dynamic, but remove assumptions tied to the old car list and ensure only the 6 approved entries render across cards and booking options.
- Modify: `assets/js/detail.js`
  - Make detail strictly use the new catalog ids, render the 4 generated stills, and tune `360° View` to a closer showroom framing per model.
- Modify: `assets/html/catalog.html`
  - Keep markup lean, but adjust any copy or empty-state text if needed for the new 6-model scope.
- Modify: `assets/html/detail.html`
  - Keep the structural shells, but ensure the page boots correctly for the shared 6-car flow.
- Modify: `assets/css/detail.css`
  - Tune the `360° View` container so the larger default framing still looks balanced on desktop/tablet/mobile.
- Create: `tools/render-car-stills.html`
  - Minimal viewer page used by Puppeteer to load each model and apply capture presets.
- Create: `tools/capture-car-stills.js`
  - Headless capture script that exports `hero/front/rear/top` stills for each of the 6 cars.
- Create: `assets/img/cars/<car-id>/hero.webp`
- Create: `assets/img/cars/<car-id>/front.webp`
- Create: `assets/img/cars/<car-id>/rear.webp`
- Create: `assets/img/cars/<car-id>/top.webp`
  - Generated still image assets per approved model.

## Task 1: Replace The Shared Catalog Data

**Files:**
- Modify: `assets/js/data.js`

- [ ] **Step 1: Snapshot the current data file before editing**

Run:

```bash
cp assets/js/data.js /tmp/data.js.before-six-model
```

Expected: command exits successfully and `/tmp/data.js.before-six-model` exists as a rollback reference during implementation.

- [ ] **Step 2: Replace the legacy 7-car data with the canonical 6-car catalog**

Update `assets/js/data.js` so the catalog is reduced to the approved 6 models and each car carries the correct model path, generated image paths, and a per-model 360 camera preset.

```js
var CARS_DATA = [
  {
    id: "murcielago",
    brand: "Lamborghini",
    name: "Murciélago",
    subtitle: "LP 670-4 SuperVeloce",
    specs: {
      year: "2010",
      hp: 670,
      engine: "6.5L V12",
      acceleration: "3.2s",
      topSpeed: "342 km/h",
      price: "26 tỷ VND"
    },
    images: {
      hero: "../img/cars/murcielago/hero.webp",
      gallery: [
        "../img/cars/murcielago/hero.webp",
        "../img/cars/murcielago/front.webp",
        "../img/cars/murcielago/rear.webp",
        "../img/cars/murcielago/top.webp"
      ]
    },
    model3d: "../model/lambo_lp670.glb",
    modelConfig: {
      cameraOrbit: "320deg 72deg 74%",
      cameraTarget: "0m 0.45m 0m",
      fieldOfView: "24deg",
      exposure: "1.35"
    }
  }
];
```

Implementation note: repeat the same structure for the remaining 5 cars:

- `bmw-3-0-csl-hommage` -> `../model/2015_bmw_3.0_csl_hommage_concept.glb`
- `ferrari-488-pista-spider` -> `../model/2019_ferrari_488_pista_spider.glb`
- `ferrari-roma` -> `../model/2020_ferrari_roma.glb`
- `centenario-roadster` -> `../model/lamborghini_centenario_roadster_sdc.glb`
- `centenario-lp770` -> `../model/lamborghini_centenario_lp-770_interior_sdc.glb`

- [ ] **Step 3: Keep the helper API stable for existing consumers**

Preserve the existing public helpers so `catalog.js` and `detail.js` do not need a full interface rewrite.

```js
function getCarById(id) {
  for (var i = 0; i < CARS_DATA.length; i++) {
    if (CARS_DATA[i].id === id) return CARS_DATA[i];
  }
  return null;
}

function getBrands() {
  var seen = {};
  var brands = [];
  for (var i = 0; i < CARS_DATA.length; i++) {
    var brand = CARS_DATA[i].brand;
    if (!seen[brand]) {
      seen[brand] = true;
      brands.push(brand);
    }
  }
  return brands;
}
```

- [ ] **Step 4: Validate the new data file parses cleanly**

Run:

```bash
node --check assets/js/data.js
```

Expected: no output and exit code `0`.

- [ ] **Step 5: Commit the data layer update**

Run:

```bash
git add assets/js/data.js
git commit -m "refactor: align shared car catalog to six approved models"
```

## Task 2: Build The Model Still Capture Utility

**Files:**
- Create: `tools/render-car-stills.html`
- Create: `tools/capture-car-stills.js`

- [ ] **Step 1: Add a minimal browser render page for controlled still capture**

Create `tools/render-car-stills.html` with a full-viewport `model-viewer` and a tiny JS API Puppeteer can call.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      html, body { margin: 0; background: #07070b; }
      model-viewer { width: 1600px; height: 900px; display: block; margin: 0 auto; }
    </style>
    <script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js"></script>
  </head>
  <body>
    <model-viewer
      id="capture-viewer"
      camera-controls
      disable-pan
      interaction-prompt="none"
      environment-image="neutral"
      shadow-intensity="0.2"
      style="background: radial-gradient(circle at center, rgba(201,168,76,0.08), transparent 48%), #07070b;">
    </model-viewer>
    <script>
      window.__captureStill = async function (payload) {
        var viewer = document.getElementById("capture-viewer");
        viewer.setAttribute("src", payload.src);
        viewer.setAttribute("camera-orbit", payload.cameraOrbit);
        viewer.setAttribute("camera-target", payload.cameraTarget);
        viewer.setAttribute("field-of-view", payload.fieldOfView);
        viewer.setAttribute("exposure", payload.exposure || "1.35");
        await viewer.updateComplete;
        await new Promise(function (resolve) { setTimeout(resolve, 350); });
        return true;
      };
    </script>
  </body>
</html>
```

- [ ] **Step 2: Add a headless capture script that exports the 4 stills per car**

Create `tools/capture-car-stills.js` by reusing the local static-server pattern already used in `tools/capture-video.js`, but loop through the 6 cars and 4 capture angles instead of rendering a video.

```js
const CAPTURE_PRESETS = {
  hero: { cameraOrbit: "320deg 72deg 74%", cameraTarget: "0m 0.45m 0m", fieldOfView: "24deg" },
  front: { cameraOrbit: "0deg 78deg 78%", cameraTarget: "0m 0.42m 0m", fieldOfView: "25deg" },
  rear: { cameraOrbit: "140deg 76deg 79%", cameraTarget: "0m 0.44m 0m", fieldOfView: "25deg" },
  top: { cameraOrbit: "320deg 58deg 84%", cameraTarget: "0m 0.48m 0m", fieldOfView: "27deg" }
};

const CARS = [
  { id: "murcielago", model: "assets/model/lambo_lp670.glb" },
  { id: "bmw-3-0-csl-hommage", model: "assets/model/2015_bmw_3.0_csl_hommage_concept.glb" },
  { id: "ferrari-488-pista-spider", model: "assets/model/2019_ferrari_488_pista_spider.glb" },
  { id: "ferrari-roma", model: "assets/model/2020_ferrari_roma.glb" },
  { id: "centenario-roadster", model: "assets/model/lamborghini_centenario_roadster_sdc.glb" },
  { id: "centenario-lp770", model: "assets/model/lamborghini_centenario_lp-770_interior_sdc.glb" }
];
```

Implementation note: for each car, create `assets/img/cars/<id>/`, call `window.__captureStill(...)`, then save `hero.png`, `front.png`, `rear.png`, and `top.png`. If WebP encoding is easier in a second pass, screenshot PNGs first and convert after the flow is stable.

- [ ] **Step 3: Run the capture script once to verify the pipeline works end-to-end**

Run:

```bash
node tools/capture-car-stills.js
```

Expected: the command prints one completed capture group per model and creates 24 still files under `assets/img/cars/`.

- [ ] **Step 4: If the script currently emits PNG, convert the outputs to the final `.webp` contract**

Run one of these patterns depending on implementation:

```bash
find assets/img/cars -type f | sort
```

Expected: every approved car directory contains exactly `hero.webp`, `front.webp`, `rear.webp`, and `top.webp`.

- [ ] **Step 5: Commit the capture utility and generated assets**

Run:

```bash
git add tools/render-car-stills.html tools/capture-car-stills.js assets/img/cars
git commit -m "feat: generate six-model still image set from 3d assets"
```

## Task 3: Rewire The Collection Page To The Six-Model Catalog

**Files:**
- Modify: `assets/js/catalog.js`
- Modify: `assets/html/catalog.html`

- [ ] **Step 1: Keep dynamic brand filtering but ensure cards always render from the new six-model catalog**

Update the catalog card renderer so it only depends on `CARS_DATA` and the new generated `hero` images.

```js
function renderCards(cars) {
  var html = "";
  for (var i = 0; i < cars.length; i++) {
    var car = cars[i];
    html +=
      '<div class="catalog-card" data-brand="' + car.brand + '">' +
        '<div class="catalog-card__media">' +
          '<img src="' + car.images.hero + '" alt="' + car.name + '" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">' +
          '<span class="catalog-card__media-placeholder" style="display:none;position:absolute;inset:0;align-items:center;justify-content:center;">' + car.name + '</span>' +
          '<span class="catalog-card__badge">' + car.brand + '</span>' +
        '</div>' +
        '<div class="catalog-card__body">' +
          '<h3 class="catalog-card__name">' + car.name + '</h3>' +
          '<div class="catalog-card__specs">' +
            '<span>' + car.specs.hp + ' HP</span>' +
            '<span>' + car.specs.engine + '</span>' +
            '<span>' + car.specs.price + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="catalog-card__footer">' +
          '<a href="detail.html?car=' + car.id + '" class="btn-luxury-outline btn-luxury--arrow">Xem chi tiết</a>' +
        '</div>' +
      '</div>';
  }
  $strip.html(html);
}
```

- [ ] **Step 2: Ensure the booking dropdown and empty state also read from the six approved models only**

Keep the booking option builder simple and shared with the updated data list.

```js
function renderBookingOptions() {
  var html = '<option value="">Chọn mẫu xe</option>';
  for (var i = 0; i < CARS_DATA.length; i++) {
    html += '<option value="' + CARS_DATA[i].id + '">' + CARS_DATA[i].brand + ' ' + CARS_DATA[i].name + '</option>';
  }
  $bookingCar.html(html);
}
```

- [ ] **Step 3: Sanity-check that no catalog markup still assumes the removed legacy car ids**

Run:

```bash
rg -n "aventador|huracan|revuelto|sf90|750s|911-gt3-rs" assets/html/catalog.html assets/js/catalog.js
```

Expected: no matches tied to the removed collection/detail lineup.

- [ ] **Step 4: Validate the catalog page scripts**

Run:

```bash
node --check assets/js/catalog.js
node --check assets/js/data.js
```

Expected: no output and exit code `0` for both checks.

- [ ] **Step 5: Commit the catalog alignment**

Run:

```bash
git add assets/js/catalog.js assets/html/catalog.html
git commit -m "feat: align catalog page to six-model shared dataset"
```

## Task 4: Rewire The Detail Page To The Six-Model Catalog

**Files:**
- Modify: `assets/js/detail.js`
- Modify: `assets/html/detail.html`
- Modify: `assets/css/detail.css`

- [ ] **Step 1: Make detail boot from a valid six-model id and keep invalid ids on a safe fallback**

Keep the current fallback pattern, but ensure it can only resolve into the 6 approved entries.

```js
var carId = new URLSearchParams(window.location.search).get("car");
var car = getCarById(carId) || CARS_DATA[0];
document.title = "T.R.Y.P | " + car.name;
```

- [ ] **Step 2: Update the hero, gallery, compare, and booking renderers to rely only on the new generated stills**

The gallery should stay a 4-image projection of the selected car’s render set instead of pulling from unrelated static assets.

```js
var gallery = (car.images && car.images.gallery) || [];

$("#section-specs").html(
  '<p class="section-kicker">Thông Số Kỹ Thuật</p>' +
  '<div class="specs-grid">' + tilesHtml + '</div>'
);
```

Implementation note: keep the existing lightbox and compare-table structure; only replace the source data and verify the compare dropdown excludes the current car while listing the other 5 approved models.

- [ ] **Step 3: Tune the 360 renderer to use closer showroom framing and optional exposure from `modelConfig`**

Extend the existing `render360` function to honor `exposure` and keep the car visually larger in frame.

```js
var config = car.modelConfig || {};
var orbit = config.cameraOrbit || "320deg 72deg 74%";
var target = config.cameraTarget || "0m 0.45m 0m";
var fov = config.fieldOfView || "24deg";
var exposure = config.exposure || "1.35";

$section.html(
  '<p class="section-kicker">360° View</p>' +
  '<div class="view360-container">' +
    '<model-viewer ' +
      'src="' + car.model3d + '" ' +
      'camera-controls ' +
      'disable-zoom ' +
      'disable-pan ' +
      'interaction-prompt="none" ' +
      'camera-orbit="' + orbit + '" ' +
      'camera-target="' + target + '" ' +
      'field-of-view="' + fov + '" ' +
      'exposure="' + exposure + '" ' +
      'shadow-intensity="0.2" ' +
      'environment-image="neutral" ' +
      'loading="lazy" ' +
      'style="width:100%;height:100%;background:transparent;">' +
    '</model-viewer>' +
  '</div>'
);
```

- [ ] **Step 4: Adjust the 360 section container styling so the larger framing still breathes**

Tune `assets/css/detail.css` around the current `.view360-container` rules.

```css
.view360-container {
  height: 520px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background:
    radial-gradient(circle at center, rgba(201, 168, 76, 0.08), transparent 42%),
    linear-gradient(180deg, rgba(18, 16, 26, 0.96), rgba(10, 10, 14, 0.98));
}
```

Implementation note: keep the responsive breakpoints, but check that mobile still reduces the viewer height to roughly `320-380px`.

- [ ] **Step 5: Validate the detail page scripts and styles**

Run:

```bash
node --check assets/js/detail.js
node --check assets/js/data.js
```

Expected: no output and exit code `0`.

- [ ] **Step 6: Commit the detail alignment**

Run:

```bash
git add assets/js/detail.js assets/html/detail.html assets/css/detail.css
git commit -m "feat: align detail experience to six-model showroom data"
```

## Task 5: Verify End-To-End Consistency In Browser

**Files:**
- Modify if needed after QA: `assets/js/data.js`
- Modify if needed after QA: `assets/js/catalog.js`
- Modify if needed after QA: `assets/js/detail.js`
- Modify if needed after QA: `assets/css/detail.css`

- [ ] **Step 1: Start the local static server you normally use for this frontend**

Run the project with the same local server setup used in the screenshot workflow. If `127.0.0.1:5500` is the established flow, use that.

Expected: `index.html`, `assets/html/catalog.html`, and `assets/html/detail.html?car=...` are all reachable in the browser.

- [ ] **Step 2: Smoke-test the collection page against the 6 approved models**

Manually verify:

```text
1. Open /assets/html/catalog.html
2. Count visible cards across all brands -> exactly 6 total
3. Confirm removed cars no longer appear:
   Aventador LP 670, Huracán STO, Revuelto, SF90 Stradale, 750S, 911 GT3 RS
4. Confirm approved cars do appear:
   Murciélago, 3.0 CSL Hommage, 488 Pista Spider, Roma, Centenario Roadster, Centenario LP-770
```

Expected: the rendered collection matches the approved six-model set only.

- [ ] **Step 3: Smoke-test all six detail pages for internal consistency**

Manually verify each URL:

```text
detail.html?car=murcielago
detail.html?car=bmw-3-0-csl-hommage
detail.html?car=ferrari-488-pista-spider
detail.html?car=ferrari-roma
detail.html?car=centenario-roadster
detail.html?car=centenario-lp770
```

Expected on each page:

- Sidebar title matches the selected model
- Hero image matches that model
- Gallery shows 4 generated stills from that same model
- `360° View` loads the corresponding `.glb`
- Compare dropdown lists the other 5 approved models only

- [ ] **Step 4: Tune any camera presets that still feel too far from the homepage showroom reference**

If one or more cars still appear too small, update only the corresponding `modelConfig` values in `assets/js/data.js`.

```js
modelConfig: {
  cameraOrbit: "318deg 70deg 71%",
  cameraTarget: "0m 0.46m 0m",
  fieldOfView: "23deg",
  exposure: "1.38"
}
```

Expected: after reload, the car sits visibly closer and more balanced inside the 360 container.

- [ ] **Step 5: Commit the QA polish pass**

Run:

```bash
git add assets/js/data.js assets/js/catalog.js assets/js/detail.js assets/css/detail.css
git commit -m "fix: polish six-model 360 framing and asset consistency"
```

## Task 6: Final Verification And Handoff

**Files:**
- Review only unless fixes are needed: `docs/superpowers/specs/2026-05-03-collection-detail-six-model-alignment-design.md`
- Review only unless fixes are needed: `docs/superpowers/plans/2026-05-03-collection-detail-six-model-alignment-plan.md`

- [ ] **Step 1: Run the final static validation sweep**

Run:

```bash
node --check assets/js/data.js
node --check assets/js/catalog.js
node --check assets/js/detail.js
find assets/img/cars -maxdepth 2 -type f | sort
```

Expected:

- all JS parse checks pass
- 24 still image files exist under the 6 model directories

- [ ] **Step 2: Re-check the spec coverage against the live implementation**

Manually confirm the implementation satisfies these spec anchors:

```text
1. Same six models across homepage, collection, detail
2. No legacy extra collection/detail cars
3. Correct one-to-one title/image/model mapping on every detail page
4. Four generated stills per car
5. Closer default 360 framing aligned to the homepage showroom feel
```

Expected: every item is satisfied without caveats.

- [ ] **Step 3: Create the final implementation commit if any uncommitted fixes remain**

Run:

```bash
git status --short
```

Expected: working tree is clean. If not, add and commit the remaining intended changes with a focused message before handoff.
