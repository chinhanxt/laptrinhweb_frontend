const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const heroSource = fs.readFileSync(path.join(root, "assets/js/hero-3d.js"), "utf8");
const gallerySource = fs.readFileSync(path.join(root, "assets/js/lambo-gallery.js"), "utf8");
const homeSource = fs.readFileSync(path.join(root, "assets/js/home.js"), "utf8");
const introSource = fs.readFileSync(path.join(root, "assets/js/intro-landing.js"), "utf8");
const mainSource = fs.readFileSync(path.join(root, "assets/js/main.js"), "utf8");
const baseCssSource = fs.readFileSync(path.join(root, "assets/css/base.css"), "utf8");
const homeCssSource = fs.readFileSync(path.join(root, "assets/css/home.css"), "utf8");
const indexSource = fs.readFileSync(path.join(root, "index.html"), "utf8");

function extractArray(source, variableName) {
  const start = source.indexOf(`var ${variableName} = [`);
  assert.notStrictEqual(start, -1, `${variableName} declaration was not found`);

  const openBracket = source.indexOf("[", start);
  let depth = 0;
  for (let i = openBracket; i < source.length; i += 1) {
    if (source[i] === "[") depth += 1;
    if (source[i] === "]") depth -= 1;
    if (depth === 0) {
      return source.slice(openBracket, i + 1);
    }
  }

  throw new Error(`${variableName} array was not closed`);
}

const heroCatalog = extractArray(heroSource, "CAR_CATALOG");
const heroModels = Array.from(heroCatalog.matchAll(/model:\s*"([^"]+)"/g)).map((match) => match[1]);
const galleryCatalog = extractArray(gallerySource, "GALLERY_CARS");
const galleryModels = Array.from(galleryCatalog.matchAll(/model:\s*"([^"]+)"/g)).map((match) => match[1]);

assert.strictEqual(heroModels.length, 4, "homepage showroom should only preload four models");
assert(
  !heroCatalog.includes("Centenario Roadster"),
  "homepage showroom should not include Centenario Roadster"
);
assert(
  !heroCatalog.includes("Centenario LP-770"),
  "homepage showroom should not include Centenario LP-770"
);
assert(
  !heroModels.includes("assets/model/lamborghini_centenario_roadster_sdc.glb"),
  "homepage showroom should not preload the Centenario Roadster GLB"
);
assert(
  !heroModels.includes("assets/model/lamborghini_centenario_lp-770_interior_sdc.glb"),
  "homepage showroom should not preload the Centenario LP-770 GLB"
);

assert(
  galleryModels.includes("assets/model/lamborghini_centenario_roadster_sdc.glb"),
  "lower Lamborghini gallery should still keep the Centenario Roadster"
);
assert(
  galleryModels.includes("assets/model/lamborghini_centenario_lp-770_interior_sdc.glb"),
  "lower Lamborghini gallery should still keep the Centenario LP-770"
);

assert(
  indexSource.includes('id="hero-nav-index">01 / 04</span>'),
  "static homepage showroom nav should advertise four cars"
);

assert(
  !homeSource.includes("requestIdleCallback(startLamboGalleryLoad"),
  "lower Lamborghini gallery should not auto-load during first-screen idle time"
);

assert(
  !/setTimeout\s*\(\s*function\s*\(\)\s*\{[\s\S]*?initHeroScene/.test(homeSource),
  "homepage showroom should not initialize from a fixed post-intro timer"
);

assert(
  !/particles\.length\s*===\s*0[\s\S]{0,140}startParticleLoop/.test(introSource),
  "intro should not start the particle loop when there are no particles to render"
);

assert(
  !introSource.includes("el.style.transition"),
  "intro loading transition should be CSS-token driven, not inline JS"
);

assert(
  homeCssSource.includes("--intro-load-exit-duration") &&
    homeCssSource.includes(".intro-landing.is-loading-dismissing .intro-landing__loading"),
  "intro loading exit should use CSS motion tokens and state classes"
);

assert(
  /html\s*\{[\s\S]*scrollbar-gutter:\s*stable[\s\S]*overflow-y:\s*scroll/.test(baseCssSource) ||
    /html\s*\{[\s\S]*overflow-y:\s*scroll[\s\S]*scrollbar-gutter:\s*stable/.test(baseCssSource),
  "base layout should reserve a stable scrollbar gutter to prevent intro exit shift"
);

assert(
  indexSource.includes('id="intro-welcome-guide"') &&
    indexSource.includes('id="intro-guide-ok"') &&
    indexSource.includes('aria-modal="true"') &&
    indexSource.includes("intro-welcome-guide__step"),
  "intro should include an accessible welcome guide overlay after the text reveal"
);

assert(
  introSource.includes("showIntroGuide") &&
    introSource.includes("hideIntroGuide") &&
    introSource.includes("intro-guide-ok"),
  "intro script should control the welcome guide reveal and dismiss flow"
);

assert(
  homeCssSource.includes(".intro-welcome-guide.is-visible") &&
    !/intro-welcome-guide[\s\S]{0,500}transition:\s*all/.test(homeCssSource),
  "intro welcome guide should use explicit compositor-friendly transitions"
);

assert(
  indexSource.includes('id="intro-antigravity-canvas"') &&
    !indexSource.includes("intro-landing__velocity") &&
    homeCssSource.includes(".intro-landing__antigravity-canvas") &&
    !homeCssSource.includes("introVelocityAura") &&
    !homeCssSource.includes("rgba(138, 61, 255, 0.14)") &&
    introSource.includes("initAntigravityLoading") &&
    introSource.includes("spawnAntigravityStreak") &&
    introSource.includes("startAntigravityLoop();") &&
    !/initAntigravityLoading[\s\S]{0,900}startAntigravityLoop\(\);/.test(introSource),
  "intro loading should include a light interaction-only antigravity effect without purple smoke"
);

assert(
  indexSource.includes('id="intro-orbit-streak-canvas"') &&
    homeCssSource.includes(".intro-landing__orbit-streak-canvas") &&
    introSource.includes("initOrbitStreaks") &&
    introSource.includes('mvEl.addEventListener("pointerdown", onOrbitPointerDown)') &&
    introSource.includes('spawnOrbitEdgeStreaks(72, "wind")') &&
    introSource.includes("ORBIT_STREAK_PRESETS") &&
    introSource.includes("spawnZoomWindTunnel") &&
    introSource.includes('mode: "zoomPulse"') &&
    introSource.includes('mode: "zoomRay"') &&
    introSource.includes('mode: "zoomRibbon"') &&
    introSource.includes("Math.atan2(dy, dx)") &&
    introSource.includes("quadraticCurveTo"),
  "intro model rotation should trigger side-edge streak effects and cinematic zoom wind streaks"
);

assert(
  fs.readFileSync(path.join(root, "assets/css/components.css"), "utf8").includes(".showroom-modal__field") &&
    fs.readFileSync(path.join(root, "assets/css/components.css"), "utf8").includes(".showroom-modal__status"),
  "booking modal styles should live in shared components CSS"
);

assert(
  mainSource.includes("#bookingSubmit") &&
    mainSource.includes("bookingStatus") &&
    mainSource.includes("checkValidity"),
  "booking modal should provide submit feedback through the shared main script"
);

["index.html", "assets/html/catalog.html", "assets/html/detail.html"].forEach((pagePath) => {
  const pageSource = fs.readFileSync(path.join(root, pagePath), "utf8");
  assert(
    !pageSource.includes("style=\"font-family:'Space Mono'") &&
      !pageSource.includes("style=\"background:rgba(15,15,20"),
    `${pagePath} booking modal should not rely on inline field styles`
  );
  assert(
    pageSource.includes("showroom-modal__field") &&
      pageSource.includes('name="bookingName"') &&
      pageSource.includes('autocomplete="name"') &&
      pageSource.includes('id="bookingStatus"'),
    `${pagePath} booking modal should use the shared accessible field structure`
  );
});

console.log("home showroom config ok");
