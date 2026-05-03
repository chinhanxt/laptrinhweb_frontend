# High-Quality GLB Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce the initial loading wait by shrinking runtime `.glb` assets while preserving showroom-quality visuals and keeping eager model loading behavior.

**Architecture:** Use a conservative glTF Transform pipeline that avoids aggressive mesh simplification and keeps existing runtime filenames stable. Generate optimized candidates in `tmp/model-optimization/`, visually verify them, then replace only the approved runtime `.glb` files in `assets/model/`. Keep backups outside the runtime path so the app does not preload duplicate model data.

**Tech Stack:** Static HTML, Three.js `GLTFLoader`, `model-viewer`, Node.js CommonJS, `npx @gltf-transform/cli`, existing local static server, Chrome/browser visual smoke testing.

---

## File Structure

- Modify: `assets/model/lambo_lp670.glb`
  - Replace only if the optimized candidate is visually equivalent and smaller.
- Modify: `assets/model/2015_bmw_3.0_csl_hommage_concept.glb`
  - Replace only if the optimized candidate keeps the current BMW paint/material appearance.
- Modify: `assets/model/2019_ferrari_488_pista_spider.glb`
  - Replace only if the optimized candidate keeps paint, glass, wheels, and interior intact.
- Modify: `assets/model/2020_ferrari_roma.glb`
  - High-priority target because it is about `16M`.
- Modify: `assets/model/lamborghini_centenario_roadster_sdc.glb`
  - High-priority target because it is about `31M`.
- Modify: `assets/model/lamborghini_centenario_lp-770_interior_sdc.glb`
  - High-priority target because it is about `38M`.
- Review only: `index.html`
  - Eager/preload behavior should remain. Do not remove model preloads as part of this plan.
- Review only: `assets/js/data.js`
  - Existing model paths should remain stable unless a model replacement fails and a new filename is intentionally chosen.
- Review only: `assets/js/hero-3d.js`
  - Existing homepage showroom model paths should remain stable.
- Review only: `assets/js/lambo-gallery.js`
  - Existing Lamborghini gallery model paths should remain stable.
- Review only: `tools/capture-car-stills.js`
  - Existing capture model paths should remain stable.
- Temporary only, do not commit: `tmp/model-optimization/`
  - Store reports, intermediate candidates, and before/after size logs.
- Temporary only, do not commit: `/tmp/try-glb-originals-YYYYMMDD-HHMMSS/`
  - Store rollback copies of runtime GLBs during the optimization session.

## Task 1: Prepare Baseline And Rollback Copies

**Files:**
- Read: `assets/model/*.glb`
- Temporary create: `tmp/model-optimization/baseline-sizes.txt`
- Temporary create: `/tmp/try-glb-originals-YYYYMMDD-HHMMSS/`

- [ ] **Step 1: Check the current working tree before touching binary assets**

Run:

```bash
git status --short
```

Expected: note any pre-existing cleanup changes. Do not revert user deletions or unrelated edits.

- [ ] **Step 2: Create local rollback copies outside the runtime path**

Run:

```bash
BACKUP_DIR="/tmp/try-glb-originals-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp assets/model/lambo_lp670.glb "$BACKUP_DIR/"
cp assets/model/2015_bmw_3.0_csl_hommage_concept.glb "$BACKUP_DIR/"
cp assets/model/2019_ferrari_488_pista_spider.glb "$BACKUP_DIR/"
cp assets/model/2020_ferrari_roma.glb "$BACKUP_DIR/"
cp assets/model/lamborghini_centenario_roadster_sdc.glb "$BACKUP_DIR/"
cp assets/model/lamborghini_centenario_lp-770_interior_sdc.glb "$BACKUP_DIR/"
printf '%s\n' "$BACKUP_DIR"
```

Expected: command prints a `/tmp/try-glb-originals-...` path containing six `.glb` files. Keep this path available for rollback.

- [ ] **Step 3: Record the baseline model sizes**

Run:

```bash
mkdir -p tmp/model-optimization
du -h assets/model/lambo_lp670.glb \
  assets/model/2015_bmw_3.0_csl_hommage_concept.glb \
  assets/model/2019_ferrari_488_pista_spider.glb \
  assets/model/2020_ferrari_roma.glb \
  assets/model/lamborghini_centenario_roadster_sdc.glb \
  assets/model/lamborghini_centenario_lp-770_interior_sdc.glb \
  | sort -h | tee tmp/model-optimization/baseline-sizes.txt
```

Expected: baseline report shows current approximate sizes: `2.3M`, `5.9M`, `8.5M`, `16M`, `31M`, and `38M`.

- [ ] **Step 4: Confirm glTF Transform CLI is available**

Run:

```bash
npx --yes @gltf-transform/cli --version
```

Expected: prints a version such as `4.3.0`.

- [ ] **Step 5: Inspect each current runtime model**

Run:

```bash
mkdir -p tmp/model-optimization/reports
npx --yes @gltf-transform/cli inspect assets/model/lambo_lp670.glb > tmp/model-optimization/reports/lambo_lp670.before.txt
npx --yes @gltf-transform/cli inspect assets/model/2015_bmw_3.0_csl_hommage_concept.glb > tmp/model-optimization/reports/2015_bmw_3.0_csl_hommage_concept.before.txt
npx --yes @gltf-transform/cli inspect assets/model/2019_ferrari_488_pista_spider.glb > tmp/model-optimization/reports/2019_ferrari_488_pista_spider.before.txt
npx --yes @gltf-transform/cli inspect assets/model/2020_ferrari_roma.glb > tmp/model-optimization/reports/2020_ferrari_roma.before.txt
npx --yes @gltf-transform/cli inspect assets/model/lamborghini_centenario_roadster_sdc.glb > tmp/model-optimization/reports/lamborghini_centenario_roadster_sdc.before.txt
npx --yes @gltf-transform/cli inspect assets/model/lamborghini_centenario_lp-770_interior_sdc.glb > tmp/model-optimization/reports/lamborghini_centenario_lp-770_interior_sdc.before.txt
```

Expected: six inspect reports exist in `tmp/model-optimization/reports/`.

## Task 2: Build Conservative Optimized Candidates

**Files:**
- Read: `assets/model/*.glb`
- Temporary create: `tmp/model-optimization/stage/*.glb`
- Temporary create: `tmp/model-optimization/optimized/*.glb`
- Temporary create: `tmp/model-optimization/after-sizes.txt`

- [ ] **Step 1: Create candidate directories**

Run:

```bash
mkdir -p tmp/model-optimization/stage tmp/model-optimization/optimized
```

Expected: both directories exist.

- [ ] **Step 2: Optimize `lambo_lp670.glb` conservatively**

Run:

```bash
npx --yes @gltf-transform/cli prune assets/model/lambo_lp670.glb tmp/model-optimization/stage/lambo_lp670.01-prune.glb
npx --yes @gltf-transform/cli dedup tmp/model-optimization/stage/lambo_lp670.01-prune.glb tmp/model-optimization/stage/lambo_lp670.02-dedup.glb
npx --yes @gltf-transform/cli resample tmp/model-optimization/stage/lambo_lp670.02-dedup.glb tmp/model-optimization/stage/lambo_lp670.03-resample.glb
npx --yes @gltf-transform/cli webp tmp/model-optimization/stage/lambo_lp670.03-resample.glb tmp/model-optimization/optimized/lambo_lp670.glb --quality 95 --effort 90
```

Expected: `tmp/model-optimization/optimized/lambo_lp670.glb` exists. If output is larger than input, keep the original runtime model for this car during Task 4.

- [ ] **Step 3: Optimize `2015_bmw_3.0_csl_hommage_concept.glb` conservatively**

Run:

```bash
npx --yes @gltf-transform/cli prune assets/model/2015_bmw_3.0_csl_hommage_concept.glb tmp/model-optimization/stage/2015_bmw_3.0_csl_hommage_concept.01-prune.glb
npx --yes @gltf-transform/cli dedup tmp/model-optimization/stage/2015_bmw_3.0_csl_hommage_concept.01-prune.glb tmp/model-optimization/stage/2015_bmw_3.0_csl_hommage_concept.02-dedup.glb
npx --yes @gltf-transform/cli resample tmp/model-optimization/stage/2015_bmw_3.0_csl_hommage_concept.02-dedup.glb tmp/model-optimization/stage/2015_bmw_3.0_csl_hommage_concept.03-resample.glb
npx --yes @gltf-transform/cli webp tmp/model-optimization/stage/2015_bmw_3.0_csl_hommage_concept.03-resample.glb tmp/model-optimization/optimized/2015_bmw_3.0_csl_hommage_concept.glb --quality 95 --effort 90
```

Expected: optimized BMW candidate exists and preserves the current green/yellow material tone.

- [ ] **Step 4: Optimize `2019_ferrari_488_pista_spider.glb` conservatively**

Run:

```bash
npx --yes @gltf-transform/cli prune assets/model/2019_ferrari_488_pista_spider.glb tmp/model-optimization/stage/2019_ferrari_488_pista_spider.01-prune.glb
npx --yes @gltf-transform/cli dedup tmp/model-optimization/stage/2019_ferrari_488_pista_spider.01-prune.glb tmp/model-optimization/stage/2019_ferrari_488_pista_spider.02-dedup.glb
npx --yes @gltf-transform/cli resample tmp/model-optimization/stage/2019_ferrari_488_pista_spider.02-dedup.glb tmp/model-optimization/stage/2019_ferrari_488_pista_spider.03-resample.glb
npx --yes @gltf-transform/cli webp tmp/model-optimization/stage/2019_ferrari_488_pista_spider.03-resample.glb tmp/model-optimization/optimized/2019_ferrari_488_pista_spider.glb --quality 95 --effort 90
```

Expected: optimized Ferrari 488 candidate exists.

- [ ] **Step 5: Optimize `2020_ferrari_roma.glb` conservatively**

Run:

```bash
npx --yes @gltf-transform/cli prune assets/model/2020_ferrari_roma.glb tmp/model-optimization/stage/2020_ferrari_roma.01-prune.glb
npx --yes @gltf-transform/cli dedup tmp/model-optimization/stage/2020_ferrari_roma.01-prune.glb tmp/model-optimization/stage/2020_ferrari_roma.02-dedup.glb
npx --yes @gltf-transform/cli resample tmp/model-optimization/stage/2020_ferrari_roma.02-dedup.glb tmp/model-optimization/stage/2020_ferrari_roma.03-resample.glb
npx --yes @gltf-transform/cli webp tmp/model-optimization/stage/2020_ferrari_roma.03-resample.glb tmp/model-optimization/optimized/2020_ferrari_roma.glb --quality 95 --effort 90
```

Expected: optimized Ferrari Roma candidate exists.

- [ ] **Step 6: Optimize `lamborghini_centenario_roadster_sdc.glb` conservatively**

Run:

```bash
npx --yes @gltf-transform/cli prune assets/model/lamborghini_centenario_roadster_sdc.glb tmp/model-optimization/stage/lamborghini_centenario_roadster_sdc.01-prune.glb
npx --yes @gltf-transform/cli dedup tmp/model-optimization/stage/lamborghini_centenario_roadster_sdc.01-prune.glb tmp/model-optimization/stage/lamborghini_centenario_roadster_sdc.02-dedup.glb
npx --yes @gltf-transform/cli resample tmp/model-optimization/stage/lamborghini_centenario_roadster_sdc.02-dedup.glb tmp/model-optimization/stage/lamborghini_centenario_roadster_sdc.03-resample.glb
npx --yes @gltf-transform/cli webp tmp/model-optimization/stage/lamborghini_centenario_roadster_sdc.03-resample.glb tmp/model-optimization/optimized/lamborghini_centenario_roadster_sdc.glb --quality 95 --effort 90
```

Expected: optimized Centenario Roadster candidate exists.

- [ ] **Step 7: Optimize `lamborghini_centenario_lp-770_interior_sdc.glb` conservatively**

Run:

```bash
npx --yes @gltf-transform/cli prune assets/model/lamborghini_centenario_lp-770_interior_sdc.glb tmp/model-optimization/stage/lamborghini_centenario_lp-770_interior_sdc.01-prune.glb
npx --yes @gltf-transform/cli dedup tmp/model-optimization/stage/lamborghini_centenario_lp-770_interior_sdc.01-prune.glb tmp/model-optimization/stage/lamborghini_centenario_lp-770_interior_sdc.02-dedup.glb
npx --yes @gltf-transform/cli resample tmp/model-optimization/stage/lamborghini_centenario_lp-770_interior_sdc.02-dedup.glb tmp/model-optimization/stage/lamborghini_centenario_lp-770_interior_sdc.03-resample.glb
npx --yes @gltf-transform/cli webp tmp/model-optimization/stage/lamborghini_centenario_lp-770_interior_sdc.03-resample.glb tmp/model-optimization/optimized/lamborghini_centenario_lp-770_interior_sdc.glb --quality 95 --effort 90
```

Expected: optimized Centenario LP-770 candidate exists.

- [ ] **Step 8: Record candidate sizes**

Run:

```bash
du -h tmp/model-optimization/optimized/*.glb | sort -h | tee tmp/model-optimization/after-sizes.txt
```

Expected: `after-sizes.txt` lists six candidate sizes. Continue even if one small model does not shrink meaningfully; replacement decisions happen in Task 4.

- [ ] **Step 9: Inspect optimized candidates**

Run:

```bash
npx --yes @gltf-transform/cli inspect tmp/model-optimization/optimized/lambo_lp670.glb > tmp/model-optimization/reports/lambo_lp670.after.txt
npx --yes @gltf-transform/cli inspect tmp/model-optimization/optimized/2015_bmw_3.0_csl_hommage_concept.glb > tmp/model-optimization/reports/2015_bmw_3.0_csl_hommage_concept.after.txt
npx --yes @gltf-transform/cli inspect tmp/model-optimization/optimized/2019_ferrari_488_pista_spider.glb > tmp/model-optimization/reports/2019_ferrari_488_pista_spider.after.txt
npx --yes @gltf-transform/cli inspect tmp/model-optimization/optimized/2020_ferrari_roma.glb > tmp/model-optimization/reports/2020_ferrari_roma.after.txt
npx --yes @gltf-transform/cli inspect tmp/model-optimization/optimized/lamborghini_centenario_roadster_sdc.glb > tmp/model-optimization/reports/lamborghini_centenario_roadster_sdc.after.txt
npx --yes @gltf-transform/cli inspect tmp/model-optimization/optimized/lamborghini_centenario_lp-770_interior_sdc.glb > tmp/model-optimization/reports/lamborghini_centenario_lp-770_interior_sdc.after.txt
```

Expected: six `after` reports exist. No command should report an invalid GLB.

## Task 3: Optional Texture Cap For Still-Large Candidates

**Files:**
- Read: `tmp/model-optimization/optimized/*.glb`
- Temporary create if needed: `tmp/model-optimization/optimized-4096/*.glb`

- [ ] **Step 1: Identify candidates that are still larger than `15M`**

Run:

```bash
find tmp/model-optimization/optimized -name "*.glb" -size +15M -print | sort
```

Expected: likely prints one or both Centenario models, and possibly Ferrari Roma.

- [ ] **Step 2: Create a 4096px texture-capped candidate directory**

Run:

```bash
mkdir -p tmp/model-optimization/optimized-4096
```

Expected: directory exists.

- [ ] **Step 3: If Ferrari Roma is still above `15M`, create a 4096px texture-capped candidate**

Run only if Step 1 listed `tmp/model-optimization/optimized/2020_ferrari_roma.glb`:

```bash
npx --yes @gltf-transform/cli resize tmp/model-optimization/optimized/2020_ferrari_roma.glb tmp/model-optimization/optimized-4096/2020_ferrari_roma.glb --width 4096 --height 4096 --filter lanczos3
```

Expected: 4096-capped Roma candidate exists. If Step 1 did not list Roma, skip this step and keep the non-resized optimized candidate.

- [ ] **Step 4: If Centenario Roadster is still above `15M`, create a 4096px texture-capped candidate**

Run only if Step 1 listed `tmp/model-optimization/optimized/lamborghini_centenario_roadster_sdc.glb`:

```bash
npx --yes @gltf-transform/cli resize tmp/model-optimization/optimized/lamborghini_centenario_roadster_sdc.glb tmp/model-optimization/optimized-4096/lamborghini_centenario_roadster_sdc.glb --width 4096 --height 4096 --filter lanczos3
```

Expected: 4096-capped Centenario Roadster candidate exists. If Step 1 did not list this model, skip this step.

- [ ] **Step 5: If Centenario LP-770 is still above `15M`, create a 4096px texture-capped candidate**

Run only if Step 1 listed `tmp/model-optimization/optimized/lamborghini_centenario_lp-770_interior_sdc.glb`:

```bash
npx --yes @gltf-transform/cli resize tmp/model-optimization/optimized/lamborghini_centenario_lp-770_interior_sdc.glb tmp/model-optimization/optimized-4096/lamborghini_centenario_lp-770_interior_sdc.glb --width 4096 --height 4096 --filter lanczos3
```

Expected: 4096-capped Centenario LP-770 candidate exists. If Step 1 did not list this model, skip this step.

- [ ] **Step 6: Compare non-resized and 4096-capped candidate sizes**

Run:

```bash
du -h tmp/model-optimization/optimized/*.glb tmp/model-optimization/optimized-4096/*.glb 2>/dev/null | sort -h
```

Expected: size table shows whether 4096-capped candidates provide meaningful savings. Do not select a 4096 candidate if visual review shows paint, glass, wheels, or interior quality loss.

## Task 4: Replace Runtime Models With Approved Candidates

**Files:**
- Modify: `assets/model/*.glb`
- Read: `tmp/model-optimization/optimized/*.glb`
- Read if created: `tmp/model-optimization/optimized-4096/*.glb`

- [ ] **Step 1: Copy approved optimized candidates over runtime filenames**

Choose the best visually safe candidate per model. Use the non-resized candidate unless the 4096-capped candidate is both meaningfully smaller and visually equivalent.

Run these commands for every approved candidate:

```bash
cp tmp/model-optimization/optimized/lambo_lp670.glb assets/model/lambo_lp670.glb
cp tmp/model-optimization/optimized/2015_bmw_3.0_csl_hommage_concept.glb assets/model/2015_bmw_3.0_csl_hommage_concept.glb
cp tmp/model-optimization/optimized/2019_ferrari_488_pista_spider.glb assets/model/2019_ferrari_488_pista_spider.glb
cp tmp/model-optimization/optimized/2020_ferrari_roma.glb assets/model/2020_ferrari_roma.glb
cp tmp/model-optimization/optimized/lamborghini_centenario_roadster_sdc.glb assets/model/lamborghini_centenario_roadster_sdc.glb
cp tmp/model-optimization/optimized/lamborghini_centenario_lp-770_interior_sdc.glb assets/model/lamborghini_centenario_lp-770_interior_sdc.glb
```

If a 4096-capped candidate is approved for one of the larger models, replace only that model's copy command with one of these matching sources:

```bash
cp tmp/model-optimization/optimized-4096/2020_ferrari_roma.glb assets/model/2020_ferrari_roma.glb
cp tmp/model-optimization/optimized-4096/lamborghini_centenario_roadster_sdc.glb assets/model/lamborghini_centenario_roadster_sdc.glb
cp tmp/model-optimization/optimized-4096/lamborghini_centenario_lp-770_interior_sdc.glb assets/model/lamborghini_centenario_lp-770_interior_sdc.glb
```

Expected: runtime filenames remain unchanged, so existing HTML/JS references still resolve.

- [ ] **Step 2: Record final runtime sizes**

Run:

```bash
du -h assets/model/lambo_lp670.glb \
  assets/model/2015_bmw_3.0_csl_hommage_concept.glb \
  assets/model/2019_ferrari_488_pista_spider.glb \
  assets/model/2020_ferrari_roma.glb \
  assets/model/lamborghini_centenario_roadster_sdc.glb \
  assets/model/lamborghini_centenario_lp-770_interior_sdc.glb \
  | sort -h | tee tmp/model-optimization/final-sizes.txt
```

Expected: final size report shows reduced total bytes compared with `baseline-sizes.txt`.

- [ ] **Step 3: Validate optimized runtime GLBs**

Run:

```bash
npx --yes @gltf-transform/cli validate assets/model/lambo_lp670.glb
npx --yes @gltf-transform/cli validate assets/model/2015_bmw_3.0_csl_hommage_concept.glb
npx --yes @gltf-transform/cli validate assets/model/2019_ferrari_488_pista_spider.glb
npx --yes @gltf-transform/cli validate assets/model/2020_ferrari_roma.glb
npx --yes @gltf-transform/cli validate assets/model/lamborghini_centenario_roadster_sdc.glb
npx --yes @gltf-transform/cli validate assets/model/lamborghini_centenario_lp-770_interior_sdc.glb
```

Expected: each model validates without fatal errors. If a model reports fatal validation errors, restore that one file from the `/tmp/try-glb-originals-...` backup and exclude it from this optimization pass.

- [ ] **Step 4: Run JavaScript parse checks**

Run:

```bash
node --check assets/js/data.js
node --check assets/js/hero-3d.js
node --check assets/js/detail.js
node --check assets/js/lambo-gallery.js
node --check tools/capture-car-stills.js
```

Expected: all commands exit `0` with no output.

## Task 5: Browser Visual And Loading Smoke Test

**Files:**
- Review: `index.html`
- Review: `assets/html/detail.html`
- Review: `assets/js/hero-3d.js`
- Review: `assets/js/detail.js`

- [ ] **Step 1: Start the static server**

Run:

```bash
python3 -m http.server 5500 --bind 127.0.0.1
```

Expected: server prints `Serving HTTP on 127.0.0.1 port 5500`. Keep this process running while testing.

- [ ] **Step 2: Smoke-test homepage eager loading**

Open:

```text
http://127.0.0.1:5500/
```

Expected:

- Loading phase completes.
- Intro model loads.
- Showroom stage loads.
- Switching through all six showroom models does not show missing textures, black materials, distorted scale, or broken glass.
- Interactions after loading feel smooth because the runtime model paths are still eagerly available.

- [ ] **Step 3: Smoke-test detail 360 pages**

Open each URL:

```text
http://127.0.0.1:5500/assets/html/detail.html?car=murcielago
http://127.0.0.1:5500/assets/html/detail.html?car=bmw-3-0-csl-hommage
http://127.0.0.1:5500/assets/html/detail.html?car=ferrari-488-pista-spider
http://127.0.0.1:5500/assets/html/detail.html?car=ferrari-roma
http://127.0.0.1:5500/assets/html/detail.html?car=centenario-roadster
http://127.0.0.1:5500/assets/html/detail.html?car=centenario-lp770
```

Expected for each page:

- `360° View` loads the correct model.
- Paint color and material appearance match the current approved look.
- Wheels, glass, interior, and body seams remain intact.
- Existing model scale/framing is not changed by optimization.

- [ ] **Step 4: If one optimized model fails visual review, restore only that model**

First recover the newest backup directory path:

```bash
BACKUP_DIR="$(ls -dt /tmp/try-glb-originals-* | head -n 1)"
printf '%s\n' "$BACKUP_DIR"
```

Then run only the restore command for the failed model:

```bash
cp "$BACKUP_DIR/lambo_lp670.glb" assets/model/lambo_lp670.glb
cp "$BACKUP_DIR/2015_bmw_3.0_csl_hommage_concept.glb" assets/model/2015_bmw_3.0_csl_hommage_concept.glb
cp "$BACKUP_DIR/2019_ferrari_488_pista_spider.glb" assets/model/2019_ferrari_488_pista_spider.glb
cp "$BACKUP_DIR/2020_ferrari_roma.glb" assets/model/2020_ferrari_roma.glb
cp "$BACKUP_DIR/lamborghini_centenario_roadster_sdc.glb" assets/model/lamborghini_centenario_roadster_sdc.glb
cp "$BACKUP_DIR/lamborghini_centenario_lp-770_interior_sdc.glb" assets/model/lamborghini_centenario_lp-770_interior_sdc.glb
```

Expected: the failed model is restored to the original version while other optimized models remain in place. Do not run all six restore commands unless all six optimized models failed visual review.

- [ ] **Step 5: Stop the static server**

Press `Ctrl+C` in the terminal running `python3 -m http.server`.

Expected: server exits cleanly.

## Task 6: Final Diff, Cleanup, And Commit

**Files:**
- Modify: approved `assets/model/*.glb`
- Do not commit: `tmp/model-optimization/`
- Do not commit: `/tmp/try-glb-originals-.../`

- [ ] **Step 1: Check final working tree**

Run:

```bash
git status --short
```

Expected: shows only approved optimized `.glb` files plus any pre-existing unrelated cleanup changes. Do not stage unrelated user cleanup changes unless the user explicitly asks.

- [ ] **Step 2: Review final model size savings**

Run:

```bash
cat tmp/model-optimization/baseline-sizes.txt
cat tmp/model-optimization/final-sizes.txt
```

Expected: final total model bytes are lower than baseline, especially for large models.

- [ ] **Step 3: Remove temporary optimization workspace**

Run:

```bash
rm -rf tmp/model-optimization
```

Expected: temporary reports and candidates are removed from the repo workspace. The `/tmp/try-glb-originals-...` backup may remain until the user confirms the optimized app is acceptable.

- [ ] **Step 4: Commit only approved optimized runtime models**

Run:

```bash
git add assets/model/lambo_lp670.glb \
  assets/model/2015_bmw_3.0_csl_hommage_concept.glb \
  assets/model/2019_ferrari_488_pista_spider.glb \
  assets/model/2020_ferrari_roma.glb \
  assets/model/lamborghini_centenario_roadster_sdc.glb \
  assets/model/lamborghini_centenario_lp-770_interior_sdc.glb
git commit -m "perf: optimize showroom glb assets"
```

Expected: commit contains only approved model binary changes. If some models were restored because optimization did not preserve quality, do not include those restored files in the commit.

- [ ] **Step 5: Report final results**

Prepare a short handoff note with:

```text
Optimized models:
- lambo_lp670.glb: copy the before size from baseline-sizes.txt -> copy the after size from final-sizes.txt
- 2015_bmw_3.0_csl_hommage_concept.glb: copy the before size from baseline-sizes.txt -> copy the after size from final-sizes.txt
- 2019_ferrari_488_pista_spider.glb: copy the before size from baseline-sizes.txt -> copy the after size from final-sizes.txt
- 2020_ferrari_roma.glb: copy the before size from baseline-sizes.txt -> copy the after size from final-sizes.txt
- lamborghini_centenario_roadster_sdc.glb: copy the before size from baseline-sizes.txt -> copy the after size from final-sizes.txt
- lamborghini_centenario_lp-770_interior_sdc.glb: copy the before size from baseline-sizes.txt -> copy the after size from final-sizes.txt

Restored/skipped models:
- lambo_lp670.glb: list only if restored or skipped, with the visual or size reason
- 2015_bmw_3.0_csl_hommage_concept.glb: list only if restored or skipped, with the visual or size reason
- 2019_ferrari_488_pista_spider.glb: list only if restored or skipped, with the visual or size reason
- 2020_ferrari_roma.glb: list only if restored or skipped, with the visual or size reason
- lamborghini_centenario_roadster_sdc.glb: list only if restored or skipped, with the visual or size reason
- lamborghini_centenario_lp-770_interior_sdc.glb: list only if restored or skipped, with the visual or size reason

Verification:
- gltf-transform validate: passed for optimized models
- JS parse checks: passed
- Homepage visual smoke: passed
- Detail 360 visual smoke: passed
```

Expected: user can see exactly how much the initial preload payload was reduced and which models were kept unchanged for quality.
