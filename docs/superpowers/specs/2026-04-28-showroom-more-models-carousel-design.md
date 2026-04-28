# 3D Carousel Strip For Additional Models

## Goal

Add a new section below the existing `showroom-stage-section` on the home page to present the rest of the car models without repeating the current left/right hero showroom pattern.

The existing showroom remains the premium spotlight area for 4 featured cars.
The new section becomes a collection browsing experience for the remaining models.

## Context

The current home page already has:

- an intro 3D landing section
- a large interactive showroom stage for featured vehicles
- shared model and car metadata in `assets/js/hero-3d.js` and `assets/js/data.js`

The problem is not lack of content, but mismatch of presentation:

- the current showroom pattern is immersive and cinematic
- it works well for a small featured set
- it does not scale well when many more models need to be shown

## Design Direction

The new section should keep the 3D identity of the site, but shift from a cinematic single-vehicle stage into a fast, premium collection browser.

Experience framing:

- top showroom: fall in love with one featured car
- lower carousel: browse the wider 3D collection

This distinction must be visible in both layout and motion.

## Recommended Approach

Use a horizontal `3D Carousel Strip`.

Each model is presented as a large horizontal card with:

- a compact 3D viewport
- short vehicle info
- one concise action

The section should suggest abundance and exploration rather than deep immersion.

## Section Structure

Place the section directly below the existing showroom stage on `index.html`.

Recommended high-level structure:

- section wrapper
- section header
- horizontal carousel shell
- card track
- progress and count footer

Suggested block names:

- `.collection-3d-section`
- `.collection-3d__header`
- `.collection-3d__viewport`
- `.collection-3d__track`
- `.collection-3d__progress`
- `.collection-3d-card`
- `.collection-3d-card__viewer`
- `.collection-3d-card__body`
- `.collection-3d-card__meta`
- `.collection-3d-card__actions`

## Card Anatomy

Each card should have three clear layers:

### 1. 3D Viewer Area

The upper portion of the card contains the 3D vehicle viewport.

Requirements:

- enough height for the silhouette to read clearly
- slow auto-rotation
- subtle ground glow or light line under the vehicle
- graceful fallback poster if the model cannot load

### 2. Information Area

Keep metadata intentionally brief:

- brand
- model name
- one short classification label or chip
- one or two concise descriptors

The section must not duplicate the verbose data density of the hero showroom.

### 3. Action Area

One primary action is enough:

- `Xem chi tiết`

Optional secondary affordance:

- small spec chips such as `Hybrid`, `Track`, `GT`

## Visual Language

This section should feel like a premium 3D catalog.

It should differ from the hero showroom in these ways:

- less theatrical
- more compact
- more rhythmic
- more product-catalog oriented

Recommended styling cues:

- darker matte background than the featured showroom
- glass or smoked-metal card surfaces
- thin luminous line accents
- compact, high-contrast typography
- more restrained copy than the hero section

## Motion And Interaction

The section should feel active without becoming noisy.

Core behavior:

- cards scroll horizontally by drag, swipe, or arrow buttons
- one center card is treated as active
- active card becomes slightly larger and brighter
- inactive side cards are slightly dimmed
- active model can rotate a little more prominently than inactive ones

Recommended feedback:

- card hover or active transition increases brightness and shadow
- active text becomes more legible
- progress indicator updates with the visible active index

The motion must communicate browsing, not cinematic storytelling.

## Layout Behavior

### Desktop

Show about `2.2` cards in view so users can clearly see there is more content off-screen.

### Tablet

Show about `1.3` to `1.5` cards.

### Mobile

Show one large card at a time with swipe navigation.

The active card must stay readable at all widths, especially the 3D model frame and CTA.

## Performance Strategy

This section may contain many models, so performance constraints must be designed in from the start.

Recommended loading strategy:

- render real 3D only for the active card
- optionally render real 3D for one adjacent card on each side
- use poster images or static placeholders for distant cards
- lazy-load models as they approach the viewport

This avoids turning a visually rich section into a heavy multi-viewer bottleneck.

## Data Strategy

The section should reuse the existing car metadata source where possible.

Recommended split:

- general text and specs continue to come from `assets/js/data.js`
- 3D model paths can be mapped in a dedicated structure if `CARS_DATA` does not currently include all required model references

The additional-model carousel should be fed from a filtered dataset:

- the 4 featured cars remain exclusive to the upper showroom
- the remaining cars populate this lower collection section

## Non-Goals

This section should not:

- replace the featured showroom
- repeat the left-panel and right-control hero composition
- show every model with equal visual complexity at once
- overload each card with long descriptions or too many controls

## Success Criteria

The design is successful if:

- the page still feels 3D-first
- the lower section clearly differs from the featured showroom
- many models can be added without the layout feeling repetitive
- users can browse additional cars quickly
- the section remains visually premium and technically lightweight

## Implementation Notes

When implementation starts, the first pass should focus on:

- semantic HTML skeleton in `index.html`
- dedicated styles in `assets/css/home.css`
- carousel interaction and lazy-load orchestration in a home-page script
- reuse of current car data before introducing new data structures

The first implementation should favor clarity and smoothness over advanced effects.
