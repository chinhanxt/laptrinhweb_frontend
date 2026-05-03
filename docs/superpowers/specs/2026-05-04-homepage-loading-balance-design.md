# Homepage Loading Balance Design

## Goal

Shorten the homepage waiting screen while preserving a polished first 3D experience. The page should stop blocking on every showroom model and should only wait for the assets needed for the first visible experience.

## Current Problem

The homepage currently requests too much 3D data before the user can move past the waiting state:

- `index.html` preloads the intro model and all six showroom `.glb` files.
- `intro-landing.js` dismisses the intro loading overlay only after the intro `<model-viewer>` reports ready.
- `hero-3d.js` loads the first car, then preloads and warms all six showroom models before resolving its ready state.
- The optimized runtime models are still large enough that loading all showroom models eagerly creates a long wait.

This makes the waiting screen feel slower than before even though the original heavy model backup has been removed.

## Requirements

- Keep the intro landing visually intact.
- Keep the first showroom car ready when the user reaches the showroom section.
- Do not block the homepage waiting state on all six showroom models.
- Keep car switching functional while background models are still loading.
- Avoid broad visual redesigns or catalog data changes.
- Preserve existing runtime filenames and model mappings.

## Non-Goals

- No new low-quality preview model pipeline.
- No aggressive GLB recompression in this pass.
- No rewrite of the catalog/detail pages.
- No Git history cleanup.

## Proposed Behavior

Use a balanced loading model:

- Preload the intro model and the first showroom model only.
- Remove the five secondary showroom model preloads from `index.html`.
- Let the intro loading overlay dismiss when the intro model is ready.
- Let the first showroom model load through `hero-3d.js` as the initial interactive showroom state.
- Start loading the remaining showroom models in the background after the first car is active.
- Warm background models opportunistically, without blocking the page-ready promise.
- If a user switches to a car that is not ready yet, show the existing navigation loading state until that model finishes loading.
- If a background model fails, keep the current car visible and allow retry or fallback for that specific switch.

## Architecture

### `index.html`

Keep these high-priority preload hints:

- `assets/model/8000_followerstm.glb`
- `assets/model/lambo_lp670.glb`

Remove preload hints for the other five showroom models so the browser does not compete for large assets during initial page entry.

### `assets/js/hero-3d.js`

Change the initial loading flow:

- `loadInitialModel()` should load and activate `currentIndex` only.
- Once the first car is active, hide the hero loading state, enable the showroom controls, set `window.__modelsLoaded = true`, and resolve the ready promise.
- After resolving ready, start background loading for the remaining models.
- Background loading should reuse the existing `preloadModel()` and warm-up helpers where possible.
- `switchCar()` should continue to call `preloadModel(nextIndex, ...)`; this already gives a natural wait point for cars that are still loading.

## Error Handling

- If the first showroom model fails, keep the existing hero fallback behavior.
- If a background model fails, do not trigger full homepage fallback.
- If the user navigates to a failed or still-loading model, keep controls in a loading state only for that switch and recover once a model loads or fallback behavior is needed.

## Testing

- Run JavaScript syntax checks for affected files.
- Open the homepage and verify the intro waiting screen disappears after the intro model is ready.
- Confirm the first showroom car renders.
- Confirm the five secondary cars are not preloaded from `<head>`.
- Click next/previous through all showroom cars and verify unloaded cars can still appear after their individual load completes.
- Confirm no missing model breaks the entire homepage after the first car is ready.

## Success Criteria

- Initial waiting screen feels fast again because it no longer waits for all showroom models.
- The first visible 3D experiences remain intact.
- Car switching remains functional while secondary models load in the background.
- Existing design, copy, filenames, and catalog mappings remain unchanged.
