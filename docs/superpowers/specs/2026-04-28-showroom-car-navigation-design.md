# Showroom Car Navigation Arrows

**Date:** 2026-04-28
**Status:** Approved

## Overview

Add left/right navigation arrows to the 3D showroom section so users can cycle through 4 car models. All cars share the same interaction features (orbit, zoom, color picker) that already exist for the Lamborghini.

## Car Catalog

4 cars in order, looping:

| # | Model Path | Brand | Name | Sub | Year | Engine | HP | 0-100 | Top Speed |
|---|-----------|-------|------|-----|------|--------|----|-------|-----------|
| 0 | `assets/model/lambo_lp670.glb` | Lamborghini | Murci&eacute;lago | LP 670-4 SuperVeloce | 2010 | 6.5L V12 | 670 | 3.2s | 342 km/h |
| 1 | `assets/model/2015_bmw_3.0_csl_hommage_concept.glb` | BMW | 3.0 CSL Hommage | Concept 2015 | 2015 | 3.0L I6 Twin-Turbo | 365 | 4.3s | 250 km/h |
| 2 | `assets/model/2019_ferrari_488_pista_spider.glb` | Ferrari | 488 Pista Spider | V8 Twin-Turbo | 2019 | 3.9L V8 | 711 | 2.85s | 340 km/h |
| 3 | `assets/model/2020_ferrari_roma.glb` | Ferrari | Roma | Grand Touring | 2020 | 3.9L V8 | 612 | 3.4s | 320 km/h |

## Approach: Single-Scene Swap

Only 1 GLB model is loaded in Three.js memory at any time. When switching:
1. Dispose current model (geometry + materials)
2. Load new model via GLTFLoader
3. Apply current color to new model's paint meshes

Trade-off accepted: 1-3s load time between cars, mitigated by loading indicator and slide animation.

## UI: Navigation Arrows

- **Position:** Vertically centered on left and right edges of `hero-3d-shell`
- **Size:** 48px circle (36px on mobile)
- **Style:** Glassmorphism matching existing color panel (rgba bg, backdrop-filter blur, gold border on hover)
- **Icon:** Thin chevron SVG, `--color-silver` default, `--color-gold` on hover
- **Disabled state:** During model loading, both arrows get `opacity: 0.3`, `pointer-events: none`, `cursor: wait`
- **Location in DOM:** Inside `.hero-3d-overlay` alongside existing UI panels

## Slide Animation Flow (Next)

Duration: ~600-800ms per slide phase.

1. Disable both arrow buttons
2. Fade out info panel (hero-car-info) — 300ms
3. Slide current car model to left via `carRoot.position.x` tween to -8 (exits viewport)
4. Dispose old model, load new model
5. Position new model at x = +8 (off-screen right)
6. Slide new model into center (x = 0) — 600ms ease-out
7. Update info panel text with new car data, fade in — 300ms
8. Reset camera to `defaultCameraPosition`
9. Re-enable arrow buttons

Previous: same flow but slide directions reversed.

## Color Behavior

- All 4 cars share the same 7 color swatches (white, red, blue, green, yellow, pink, black)
- Color hex values and `paintMaterialNames` logic remain unchanged
- When switching car, apply `activeColorKey` to new model immediately after load
- Each car's default color name comes from its catalog data

## Loop Behavior

Navigation wraps around:
- Last car (index 3) + next = first car (index 0)
- First car (index 0) + prev = last car (index 3)

## Files Modified

### `index.html`
- Add 2 `<button>` elements inside `.hero-3d-overlay`:
  - `.hero-nav-arrow.hero-nav-arrow--prev` (left chevron)
  - `.hero-nav-arrow.hero-nav-arrow--next` (right chevron)

### `assets/js/hero-3d.js`
- Add `CAR_CATALOG` array with 4 car objects
- Add `currentIndex = 0` state variable
- Add `switchCar(direction)` function: orchestrates dispose, load, slide, info update
- Add `disposeCar()` function: traverses carRoot, disposes geometries and materials
- Modify `loadModel()` to accept a model URL parameter (currently hardcoded)
- Expose navigation via `APEXHero3D.switchCar(direction)`

### `assets/css/home.css`
- Add `.hero-nav-arrow` base styles (position, size, glassmorphism, pointer-events)
- Add `.hero-nav-arrow--prev` (left: 1.2rem)
- Add `.hero-nav-arrow--next` (right: 1.2rem)
- Add `.hero-nav-arrow:disabled` / `.hero-nav-arrow.is-loading` state
- Add responsive rules for mobile (36px size)

## No New Files

All changes contained within the 3 existing files.
