# Asset Population — Image Downloads for Catalog & Detail Pages

**Date:** 2026-04-30
**Brand:** T.R.Y.P
**Scope:** Download free-license car images for all 7 vehicles, place in `assets/img/` matching data.js references

---

## 1. Current State

- `assets/img/` directory does not exist
- `data.js` references 26 image files (7 hero + 19 gallery)
- All images use `.webp` format
- Code has `onerror` fallback to placeholder text — currently ALL images show placeholders
- 3D models: 3 cars have working models (Aventador, SF90, Roma), 4 show fallback text — no changes needed

---

## 2. Required Images

### Aventador LP 670

| File | Description |
|------|-------------|
| `aventador-hero.webp` | 3/4 front angle, dark/neutral background |
| `aventador-exterior.webp` | Front or side exterior |
| `aventador-interior.webp` | Cockpit/interior |
| `aventador-rear.webp` | Rear angle |
| `aventador-engine.webp` | Engine bay |

### Huracan STO

| File | Description |
|------|-------------|
| `huracan-hero.webp` | 3/4 front angle |
| `huracan-exterior.webp` | Exterior shot |
| `huracan-interior.webp` | Interior |
| `huracan-rear.webp` | Rear angle |

### Revuelto

| File | Description |
|------|-------------|
| `revuelto-hero.webp` | 3/4 front angle |
| `revuelto-exterior.webp` | Exterior |
| `revuelto-interior.webp` | Interior |
| `revuelto-rear.webp` | Rear |

### SF90 Stradale

| File | Description |
|------|-------------|
| `sf90-hero.webp` | 3/4 front angle |
| `sf90-exterior.webp` | Exterior |
| `sf90-interior.webp` | Interior |
| `sf90-rear.webp` | Rear |

### Roma

| File | Description |
|------|-------------|
| `roma-hero.webp` | 3/4 front angle |
| `roma-exterior.webp` | Exterior |
| `roma-interior.webp` | Interior |
| `roma-rear.webp` | Rear |

### McLaren 750S

| File | Description |
|------|-------------|
| `750s-hero.webp` | 3/4 front angle |
| `750s-exterior.webp` | Exterior |
| `750s-interior.webp` | Interior |
| `750s-rear.webp` | Rear |

### 911 GT3 RS

| File | Description |
|------|-------------|
| `gt3rs-hero.webp` | 3/4 front angle |
| `gt3rs-exterior.webp` | Exterior |
| `gt3rs-interior.webp` | Interior |
| `gt3rs-rear.webp` | Rear |

---

## 3. Image Requirements

- **Source:** Unsplash, Pexels, Pixabay (free license, no attribution required)
- **Min width:** 1200px
- **Format:** Download as JPEG/PNG, convert to .webp
- **Style:** Prefer dark/neutral backgrounds to match luxury theme
- **Hero:** 3/4 front angle preferred, landscape orientation

---

## 4. 3D Models — No Changes

| Car | model3d | Status |
|-----|---------|--------|
| Aventador LP 670 | `lambo_lp670.glb` | Working |
| SF90 Stradale | `2019_ferrari_488_pista_spider.glb` | Working |
| Roma | `2020_ferrari_roma.glb` | Working |
| Huracan STO | null | Fallback text |
| Revuelto | null | Fallback text |
| McLaren 750S | null | Fallback text |
| 911 GT3 RS | null | Fallback text |

---

## 5. Out of Scope

- No code changes needed (onerror fallbacks already handle missing images gracefully)
- No 3D model changes
- No data.js changes
