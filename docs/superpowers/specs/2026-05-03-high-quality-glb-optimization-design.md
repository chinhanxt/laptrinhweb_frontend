# High-Quality GLB Optimization Design

## Goal

Reduce the initial loading wait by making the existing car `.glb` assets lighter while preserving showroom-quality visuals. The homepage should still load/preload the relevant models early so interactions feel smooth after the loading phase finishes.

## Current Context

The intro model has already been reduced from `8000_followerstm_original.glb` at about `122M` to `8000_followerstm.glb` at about `3.0M`, which shows the project can benefit significantly from model optimization.

Current runtime car model sizes:

- `lambo_lp670.glb`: about `2.3M`
- `2015_bmw_3.0_csl_hommage_concept.glb`: about `5.9M`
- `2019_ferrari_488_pista_spider.glb`: about `8.5M`
- `2020_ferrari_roma.glb`: about `16M`
- `lamborghini_centenario_roadster_sdc.glb`: about `31M`
- `lamborghini_centenario_lp-770_interior_sdc.glb`: about `38M`

The homepage currently preloads the intro model and the six showroom car models. This eager loading behavior is intentional and should remain because it avoids interaction lag after the page has finished loading.

## Requirements

- Preserve visual quality as the first priority.
- Reduce model file sizes enough to shorten the initial loading phase.
- Keep eager/preload behavior for the showroom models.
- Do not introduce low-quality preview models for this pass.
- Do not change catalog/detail car mappings unless filenames intentionally change.
- Verify that 360 detail views and homepage showroom still load every optimized model.

## Non-Goals

- No aggressive polygon reduction that visibly changes car shape, silhouette, wheels, interior, or body seams.
- No lazy-loading redesign for the homepage showroom models.
- No replacement of the six-model catalog.
- No visual redesign of the loading screen.

## Optimization Strategy

Use a conservative, visually-lossless GLB optimization pass:

- Remove unused nodes, meshes, materials, animations, and accessors where safe.
- Deduplicate repeated data.
- Resample or clean animation data only when it does not affect visible behavior.
- Compress or resize textures only within a quality-preserving limit.
- Avoid strong mesh simplification by default.
- Keep original material appearance, scale, orientation, and animation behavior.

The largest wins are expected from the Centenario models and Ferrari Roma. Very small models may be left unchanged if additional compression does not provide meaningful benefit.

## Asset Safety

Before replacing runtime models, keep recoverable originals outside the runtime path or under a clearly named backup location that is not loaded by the app. The implementation plan should decide whether these backups are committed or kept local based on size.

Optimized files should ideally keep the same filenames so existing references in these files remain stable:

- `index.html`
- `assets/js/data.js`
- `assets/js/hero-3d.js`
- `assets/js/lambo-gallery.js`
- `tools/capture-car-stills.js`

## Verification

For each optimized model:

- Record before/after file size.
- Confirm `node --check` passes for affected JavaScript if references change.
- Load homepage and verify the eager loading flow still completes.
- Switch through all homepage showroom models without missing textures or broken materials.
- Open each detail page and verify the `360° View` model appears with the expected scale, angle, and color.
- Compare the optimized model visually against the pre-optimization version when possible, especially for paint, wheels, interior, and transparent/glass parts.

## Success Criteria

- Initial load waits less because total model bytes are reduced.
- The six showroom/detail models remain visually equivalent to the current versions.
- No model renders black, missing, distorted, off-scale, or with broken materials.
- The homepage still preloads models early enough that post-load interactions feel smooth.
