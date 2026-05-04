# Fast First Screen With Predictive Loading Design

## Goal

Make the homepage enter as quickly as possible while making below-the-fold 3D sections feel ready by the time the user reaches them.

The page should stop treating lower sections as part of the first boot. Instead, it should load the first visible experience immediately, then prepare later experiences in the background based on idle time and scroll proximity.

## Current Problem

Recent loading work reduced the showroom preload pressure, but the homepage boot flow can still wait on sections that are not visible at first paint.

The clearest issue is in `assets/js/home.js`: `LamboGallery.whenReady()` is added to the main `bootTasks` list. Because `Promise.all(bootTasks)` controls when the intro loading state is dismissed, the page can keep the user waiting for the Lamborghini gallery even though that gallery sits below the first visible screen.

This makes the first entry feel slower than necessary.

## Requirements

- Prioritize the fastest possible first screen.
- Do not block the intro loading overlay on below-the-fold gallery readiness.
- Keep intro landing behavior intact.
- Keep the first showroom car behavior intact.
- Make the Lamborghini gallery begin loading before the user reaches it when possible.
- If the user scrolls quickly, show a local gallery loading state instead of blocking the whole page.
- Avoid broad visual redesigns, catalog changes, or model filename changes.
- Preserve existing scripts and global modules where practical.

## Non-Goals

- No new model compression pipeline in this pass.
- No replacement of Three.js, model-viewer, or Bootstrap.
- No rewrite of catalog or detail pages.
- No new build system.
- No guarantee that every below-the-fold model finishes before an extremely fast scroll on slow networks.

## Proposed Behavior

Use a fast-first-screen and predictive-loading model:

- The homepage boot overlay waits only for intro and above-the-fold critical work.
- `LamboGallery.whenReady()` is removed from the initial `Promise.all(bootTasks)` path.
- The Lamborghini gallery initializes lazily through a scheduler.
- The scheduler starts gallery loading when either:
  - the browser becomes idle after first screen entry, or
  - the gallery approaches the viewport through an `IntersectionObserver` with a large `rootMargin`.
- The gallery keeps its text, controls, and background visible immediately.
- The gallery 3D canvas becomes active once its first model is ready.
- If the user reaches the gallery before the model is ready, the gallery displays its own lightweight loading affordance.

## Architecture

### `assets/js/home.js`

Change the homepage boot sequence so first screen readiness and below-the-fold readiness are separate concepts.

The initial `bootTasks` list should include:

- `APEXIntro.whenReady()` when available.
- `APEXHero3D.whenReady()` only when the desktop showroom is initialized.
- resolved fallback promises for cases that intentionally skip 3D.

The initial `bootTasks` list should not include:

- `LamboGallery.whenReady()`.

After the intro loading overlay is dismissed, call a new helper such as `scheduleLamboGalleryLoad()`.

That helper should:

- guard against duplicate initialization,
- observe `#lamborghini-gallery` with a generous margin such as `1200px 0px`,
- start `window.LamboGallery.init()` when the observer fires,
- also schedule a background start with `requestIdleCallback` when available,
- fall back to `setTimeout` when `requestIdleCallback` is not available.

### `assets/js/lambo-gallery.js`

Keep the current public API shape:

- `init()`
- `whenReady()`

Make sure `init()` is safe to call once from the scheduler and does not restart if already initialized.

If not already present, add a small internal state flag:

- `initStarted`
- `readySettled`

The gallery should resolve `whenReady()` after its first visible model is ready or after it has intentionally fallen back. It should not affect the homepage boot overlay.

### Local Loading State

The gallery should own its own loading state. The page-level intro loading overlay should not return after it has been dismissed.

If the user scrolls into the gallery while the first model is still loading:

- keep the gallery copy and controls visible,
- show a subtle local message or loading class within the gallery,
- hide that local loading state once the first gallery model is shown.

## Data Flow

1. Browser loads the homepage.
2. Intro and critical first-screen scripts initialize.
3. The page-level loading overlay dismisses when critical first-screen promises settle.
4. `home.js` schedules below-the-fold loading.
5. The gallery starts during idle time or when it nears the viewport.
6. `lambo-gallery.js` loads its first model and renders the canvas.
7. Secondary gallery models continue to load through existing gallery behavior.

## Error Handling

- If intro loading fails, keep the existing intro fallback behavior.
- If the first showroom model fails, keep the existing showroom fallback behavior.
- If the gallery model fails, do not re-open or extend the page-level loading overlay.
- Gallery failure should remain local to the gallery section, with text and controls still visible where possible.
- The scheduler should tolerate missing `IntersectionObserver` or `requestIdleCallback` by falling back to a delayed start.

## Testing

- Run JavaScript syntax checks for changed files.
- Verify `home.js` no longer adds `LamboGallery.whenReady()` to the page-level `bootTasks`.
- Verify `LamboGallery.init()` starts after first-screen loading is dismissed.
- Verify scrolling near the gallery starts loading before the gallery enters the viewport.
- Verify a fast scroll to the gallery shows only a local gallery loading state.
- Verify the intro overlay does not wait for the gallery.
- Verify the gallery still renders and its controls still work after lazy initialization.

## Success Criteria

- The first screen becomes interactive sooner because below-the-fold gallery readiness no longer blocks boot.
- The gallery usually appears ready when the user scrolls naturally.
- Fast scrolling degrades gracefully with a local section loading state.
- Existing visuals, model mappings, and page structure remain intact.
