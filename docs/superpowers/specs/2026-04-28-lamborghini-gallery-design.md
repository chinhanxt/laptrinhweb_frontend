# Lamborghini Gallery — Cinematic Horizontal Showcase

## Overview

New section added to `index.html` after the existing showroom (`#showroom-stage`). Presents 3 Lamborghini models as a cinematic horizontal-scroll narrative journey with interactive 3D, lighting effects, and particle hover effects.

**Flow:** Intro → Showroom → **Lamborghini Gallery** → rest of page

## Architecture & Layout

### Position in page

```
index.html
├── #intro-landing          (model-viewer, existing)
├── #showroom-stage         (Three.js hero, existing)
├── #lamborghini-gallery    (NEW — horizontal scroll Three.js)
└── ... (rest of page)
```

### Renderer management

- Only 1 active Three.js renderer at any time
- When user scrolls into `#lamborghini-gallery`: call `APEXHero3D.dispose()` to free showroom renderer, then init gallery renderer (note: `dispose()` method must be added to `hero-3d.js` if not already present — needs to dispose renderer, scene, controls, and cached models)
- When user scrolls back to showroom: dispose gallery renderer, re-init showroom
- When user scrolls past gallery: dispose gallery renderer

### File structure

| File | Purpose |
|---|---|
| `assets/js/lambo-gallery.js` | Main module (`window.LamboGallery`), exposes `init()` and `whenReady()` |
| `assets/css/home.css` | CSS additions for gallery section |
| `index.html` | New `<section id="lamborghini-gallery">` after `#showroom-stage` |

### Horizontal scroll

- Section occupies `100vh` height, `300vw` total width (3 panels)
- GSAP ScrollTrigger pins section, converts vertical scroll → horizontal movement
- `scrub: 1` for smooth scroll-linked animation
- Each car = 1 panel at `100vw`

## 3D Rendering & Lighting

### Three.js scene

- 1 shared `WebGLRenderer` + `Scene`, swap model on scroll between panels
- `GLTFLoader` preloads all 3 models into `modelCache{}` (same pattern as `hero-3d.js`)
- Camera: `PerspectiveCamera`, 3/4 diagonal angle
- `OrbitControls` for user drag rotation

### Lighting system

| Light | Purpose | Behavior |
|---|---|---|
| `AmbientLight` (0.3) | Base visibility | Color tinted per car |
| `SpotLight` (top-down) | Stage spotlight | angle 0.5, penumbra 0.8, intensity 0 → 2 on hover |
| `PointLight` (rim left) | Left rim light | Color per car, intensity 0 → 1.5 on hover |
| `PointLight` (rim right) | Right rim light | Complementary color, intensity 0 → 1 on hover |
| `DirectionalLight` (0.5) | Fill light | Fixed diagonal angle |

### Per-car colors

| Car | Spotlight | Rim | Neon hue range |
|---|---|---|---|
| Revuelto | `#e63946` crimson | `#ff6b6b` | 340–370 (red → pink) |
| Centenario Roadster | `#00b4d8` electric blue | `#48cae4` | 190–210 (cyan → blue) |
| Centenario Interior | `#c9a84c` gold | `#e8d590` | 40–55 (gold → amber) |

### Glossy hover effect

- On hover: traverse all meshes, tween `material.roughness` 0.5 → 0.2, `material.metalness` 0.5 → 0.85 via `gsap.to(material, { duration: 0.8 })`
- On leave: tween back to original values
- `PMREMGenerator` + environment map for realistic reflections

## Hover Effects — Neon Streaks + Smoke + Dust

### Rendering

- Separate Canvas 2D overlay on top of Three.js canvas, `pointer-events: none`
- Own `requestAnimationFrame` loop, independent of Three.js render
- Tracks `mousemove` on container, calculates speed + angle

### 4 particle layers

| Layer | Description | Trigger |
|---|---|---|
| Neon streaks | Long glowing lines, color per car, shadow glow | speed > 1.5, count scales with speed (max 4) |
| White light lines | Thin white lines interspersed | speed > 1.5, fewer than neon (max 3) |
| Thin smoke wisps | Elliptical smoke, radial gradient, slow rotation | speed > 1.5, 55% random chance |
| Road dust | Small particles rising from bottom near ground | speed > 1.5, 35% random chance |

### Behavior

- Slow mouse: near-zero effect → clean view of car
- Fast mouse: dense streaks + smoke + dust → dramatic speed feel
- Streaks fly opposite to cursor direction (car-in-motion illusion)
- All particles have `life` decay → fade naturally
- Hard cap: ~200 active particles max

## Scroll Mechanics & Parallax

### GSAP ScrollTrigger

- `pin: true` when section enters viewport
- Vertical scroll → horizontal `x` translate
- Total scroll distance: `200vw`
- `scrub: 1`

### 3 parallax layers

| Layer | Speed | Content |
|---|---|---|
| Background | 0.6x | Gradient ambient glow, color transitions per car |
| 3D Model | 1x (base) | Three.js canvas, model swap at transition points |
| Text specs | 1.3x | Car name + specs, moves faster for depth |

### Model swap

- Trigger points at 0%, 33%, 66% scroll progress
- On trigger: GSAP fade out old model (opacity + scale down) → swap cached model → fade in new model
- Camera position resets with GSAP tween
- Light colors tween to new car's palette

### Progress indicator

- Thin progress bar at bottom, fill tracks scroll progress, color `#c9a84c`
- 3 dots: active dot highlights per car
- Position: `fixed` while section is pinned

### Renderer lifecycle via ScrollTrigger

- `onEnter`: dispose showroom → init gallery
- `onLeaveBack`: dispose gallery → re-init showroom
- `onLeave`: dispose gallery

## Content & Data

### Car data structure

```javascript
GALLERY_CARS = [
  {
    id: 'revuelto',
    name: 'REVUELTO',
    sub: 'V12 Hybrid Supercar',
    specs: { hp: '1015 HP', accel: '2.5s', top: '350 km/h', engine: 'V12 + 3 Electric' },
    model: 'assets/model/revuelto_3.0tm.glb',
    color: { primary: '#e63946', rim: '#ff6b6b', hueRange: [340, 370] }
  },
  {
    id: 'centenario-roadster',
    name: 'CENTENARIO ROADSTER',
    sub: 'Limited Edition — 20 Units',
    specs: { hp: '770 HP', accel: '2.8s', top: '355 km/h', engine: 'V12 Naturally Aspirated' },
    model: 'assets/model/lamborghini_centenario_roadster_sdc.glb',
    color: { primary: '#00b4d8', rim: '#48cae4', hueRange: [190, 210] }
  },
  {
    id: 'centenario-interior',
    name: 'CENTENARIO LP-770',
    sub: 'Interior Experience',
    specs: { hp: '770 HP', material: 'Alcantara', trim: 'Carbon Fiber', cockpit: 'Full Digital' },
    model: 'assets/model/lamborghini_centenario_lp-770_interior_sdc.glb',
    color: { primary: '#c9a84c', rim: '#e8d590', hueRange: [40, 55] }
  }
]
```

### Panel layout (per car)

```
┌─────────────────────────────────────────┐
│                                         │
│            [Three.js Model]             │
│              centered 3D                │
│              ~70% viewport              │
│                                         │
│  TÊN XE ────────────────── HP  │  SPEC │
│  Subtitle                    0-100│ TOP  │
│                                         │
│         ● ─────────── ● ─── ●          │
│         progress bar + dots             │
└─────────────────────────────────────────┘
```

- Car name + subtitle: bottom-left, font Bebas Neue
- Specs: bottom-right, font Space Mono
- 3D model: centered, ~70% viewport

## Mobile Responsive (< 768px)

### Kept

- Horizontal scroll layout (native touch swipe)
- Parallax 3 layers (offset reduced 50%)
- 3D models (Three.js retained)
- Progress bar + dots
- Minimal text content

### Disabled / reduced

- Canvas 2D particle overlay → **disabled entirely**
- Lighting → **reduced**: 1 SpotLight top-down only, no rim lights
- Glossy hover → **disabled** (no hover on touch)
- Environment map → lower resolution
- `renderer.setPixelRatio(1)` instead of `devicePixelRatio`

### Touch interaction

- Swipe horizontal to change car (native scroll-snap or GSAP Draggable)
- Tap car → toggle spotlight on/off (replaces hover)
- OrbitControls: touch drag to rotate, pinch to zoom

### Performance budget

- Target: 30fps on mid-range mobile
- Model preload sequential (not parallel) to avoid memory spikes
- Dispose old model on car change (no 3-model cache like desktop)

## Tech Stack

- Three.js r147 (existing CDN, shared with showroom)
- GSAP 3.12.5 + ScrollTrigger (existing CDN)
- Canvas 2D API for particle overlay
- Vanilla JS IIFE module pattern (consistent with codebase)
