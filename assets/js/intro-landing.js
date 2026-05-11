/* ============================================================
   INTRO LANDING — model-viewer + fan spin + GSAP scroll
   + Zoom mode: character dissolve to gold particles
   ============================================================ */

window.APEXIntro = (function () {
  var fanNodes = [];
  var mvEl = null;
  var running = false;
  var isZoomed = false;
  var loadingEl = null;
  var resolveReady = function () {};
  var readyPromise = new Promise(function (resolve) {
    resolveReady = resolve;
  });
  var isReady = false;
  var loadingDismissed = false;
  var isInView = true;
  var isTabActive = true;
  var loadingDismissed = false;
  var isInView = true;
  var isTabActive = true;
  var DEFAULT_ORBIT = "150deg 89deg 44%";
  var ZOOMED_ORBIT = "150deg 89deg 25%";

  var zoomTransitioning = false;
  var charSplitCache = {};
  var particleCanvas = null;
  var particleCtx = null;
  var particles = [];
  var particleAnimId = null;
  var antigravityCanvas = null;
  var antigravityCtx = null;
  var antigravityAnimId = null;
  var antigravityParticles = [];
  var antigravityStreaks = [];
  var antigravityResizeBound = false;
  var antigravityPointer = {
    x: 0,
    y: 0,
    lastX: 0,
    lastY: 0,
    speed: 0,
    active: false,
    lastMove: 0,
    lastSpawn: 0
  };
  var antigravityIdleTimer = null;
  var orbitStreakCanvas = null;
  var orbitStreakCtx = null;
  var orbitStreakAnimId = null;
  var orbitStreaks = [];
  var orbitPointer = {
    active: false,
    x: 0,
    y: 0,
    lastX: 0,
    lastY: 0,
    lastSpawn: 0
  };
  var ORBIT_STREAK_PRESETS = {
    orbit: {
      maxItems: 70,
      core: "224,48,255",
      edge: "128,82,255"
    },
    zoom: {
      maxItems: 140,
      focusX: 0.58,
      focusYIn: 0.58,
      focusYOut: 0.64,
      rimLeft: 0.12,
      rimRight: 0.88,
      rimTop: 0.27,
      rimBottom: 0.86,
      core: "240,244,255",
      edge: "126,137,180",
      accent: "202,178,255"
    }
  };
  function getCharRgb(el) {
    var style = window.getComputedStyle(el.parentElement || el);
    var c = style.color;
    var m = c.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
    if (m) return [parseInt(m[1]), parseInt(m[2]), parseInt(m[3])];
    return [255, 255, 255];
  }

  function startEmbeddedAnimation() {
    if (!mvEl || typeof mvEl.play !== "function") return false;

    var animations = Array.isArray(mvEl.availableAnimations) ? mvEl.availableAnimations.filter(Boolean) : [];
    if (!animations.length) return false;

    mvEl.animationName = animations[0];

    try {
      mvEl.play({ repetitions: Infinity });
    } catch (err) {
      mvEl.play();
    }

    return true;
  }

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function getIntroSceneRect() {
    var section = document.getElementById("intro-landing");
    return section ? section.getBoundingClientRect() : { width: window.innerWidth, height: window.innerHeight, left: 0, top: 0 };
  }

  function resizeOrbitStreakCanvas() {
    if (!orbitStreakCanvas) return;
    var rect = getIntroSceneRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    orbitStreakCanvas.width = Math.max(1, Math.floor(rect.width * dpr));
    orbitStreakCanvas.height = Math.max(1, Math.floor(rect.height * dpr));
    orbitStreakCanvas.style.width = rect.width + "px";
    orbitStreakCanvas.style.height = rect.height + "px";
    if (orbitStreakCtx) {
      orbitStreakCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }

  function ensureOrbitStreakContext() {
    if (!orbitStreakCanvas || prefersReducedMotion()) return false;
    if (!orbitStreakCtx) {
      orbitStreakCtx = orbitStreakCanvas.getContext("2d", { alpha: true });
      if (!orbitStreakCtx) return false;
      resizeOrbitStreakCanvas();
      window.addEventListener("resize", resizeOrbitStreakCanvas);
    }
    return true;
  }

  function spawnOrbitEdgeStreaks(speed, mode) {
    if (!ensureOrbitStreakContext()) return;
    var rect = getIntroSceneRect();
    var width = rect.width;
    var height = rect.height;
    var wind = mode === "wind";
    if (wind) {
      spawnZoomWindTunnel(speed);
      return;
    }
    var modelBox = {
      left: width * 0.12,
      right: width * 0.88,
      top: height * 0.27,
      bottom: height * 0.86
    };
    var intensity = Math.min(1, Math.max(0.18, speed / 44));
    var count = 2 + Math.floor(intensity * 5);
    var focus = {
      x: width * ORBIT_STREAK_PRESETS.zoom.focusX,
      y: height * (isZoomed ? ORBIT_STREAK_PRESETS.zoom.focusYIn : ORBIT_STREAK_PRESETS.zoom.focusYOut)
    };

    for (var i = 0; i < count; i++) {
      var side = i % 2 === 0 ? "left" : "right";
      var fromLeft = side === "left";
      var band = Math.random();
      var y = modelBox.top + band * (modelBox.bottom - modelBox.top);
      var x = fromLeft ? modelBox.left - Math.random() * 30 : modelBox.right + Math.random() * 30;
      var aimX = focus.x + (Math.random() - 0.5) * width * 0.12;
      var aimY = focus.y + (Math.random() - 0.5) * height * 0.12;
      var dx = aimX - x;
      var dy = aimY - y;
      var dist = Math.sqrt(dx * dx + dy * dy) || 1;
      var depth = 0.7 + Math.random() * 0.45;
      var velocity = 190 + Math.random() * 260 + speed * 4;

      orbitStreaks.push({
        x: x,
        y: y,
        vx: (dx / dist) * velocity,
        vy: (dy / dist) * velocity,
        length: 80 + Math.random() * 150 + depth * 70,
        width: (1.2 + Math.random() * 2.2) * depth,
        angle: Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.12,
        curve: (fromLeft ? 1 : -1) * (6 + Math.random() * 20),
        life: 0.82,
        decay: 1.9 + Math.random() * 0.8,
        depth: depth,
        side: side,
        mode: "orbit"
      });
    }

    if (orbitStreaks.length > ORBIT_STREAK_PRESETS.orbit.maxItems) {
      orbitStreaks.splice(0, orbitStreaks.length - ORBIT_STREAK_PRESETS.orbit.maxItems);
    }

    startOrbitStreakLoop();
  }

  function spawnZoomWindTunnel(speed) {
    var rect = getIntroSceneRect();
    var width = rect.width;
    var height = rect.height;
    var preset = ORBIT_STREAK_PRESETS.zoom;
    var focus = {
      x: width * preset.focusX,
      y: height * (isZoomed ? preset.focusYIn : preset.focusYOut)
    };
    var modelBox = {
      left: width * preset.rimLeft,
      right: width * preset.rimRight,
      top: height * preset.rimTop,
      bottom: height * preset.rimBottom
    };

    orbitStreaks.push({
      x: focus.x,
      y: focus.y,
      radius: Math.min(width, height) * 0.06,
      maxRadius: Math.min(width, height) * (isZoomed ? 0.38 : 0.46),
      life: 0.78,
      decay: 1.08,
      mode: "zoomPulse",
      depth: 1
    });

    for (var i = 0; i < 46; i++) {
      var angle = -Math.PI + Math.random() * Math.PI * 2;
      var side = Math.random() < 0.5 ? "left" : "right";
      var sideSign = side === "left" ? -1 : 1;
      var startX = focus.x + Math.cos(angle) * (28 + Math.random() * 80);
      var startY = focus.y + Math.sin(angle) * (20 + Math.random() * 62);
      var endX = side === "left"
        ? modelBox.left - Math.random() * width * 0.08
        : modelBox.right + Math.random() * width * 0.08;
      var endY = modelBox.top + Math.pow(Math.random(), 0.82) * (modelBox.bottom - modelBox.top);
      var dx = endX - startX;
      var dy = endY - startY;
      var dist = Math.sqrt(dx * dx + dy * dy) || 1;
      var velocity = 420 + Math.random() * 760 + speed * 3.2;
      var depth = 0.45 + Math.random() * 1.15;

      orbitStreaks.push({
        x: startX,
        y: startY,
        vx: (dx / dist) * velocity,
        vy: (dy / dist) * velocity,
        length: 140 + Math.random() * 280 + depth * 120,
        width: (0.45 + Math.random() * 1.15) * depth,
        angle: Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.045,
        curve: sideSign * (10 + Math.random() * 34),
        life: 0.72 + Math.random() * 0.42,
        decay: 1.2 + Math.random() * 0.55,
        depth: depth,
        side: side,
        mode: "zoomRay"
      });
    }

    for (var j = 0; j < 18; j++) {
      var ribbonSide = j % 2 === 0 ? "left" : "right";
      var fromLeft = ribbonSide === "left";
      var y = modelBox.top + Math.random() * (modelBox.bottom - modelBox.top);
      var x = fromLeft ? modelBox.left - Math.random() * 22 : modelBox.right + Math.random() * 22;
      var aimX = focus.x + (Math.random() - 0.5) * width * 0.16;
      var aimY = focus.y + (Math.random() - 0.5) * height * 0.18;
      var rdx = aimX - x;
      var rdy = aimY - y;
      var rdist = Math.sqrt(rdx * rdx + rdy * rdy) || 1;
      var ribbonVelocity = 260 + Math.random() * 420 + speed * 2.4;

      orbitStreaks.push({
        x: x,
        y: y,
        vx: (rdx / rdist) * ribbonVelocity,
        vy: (rdy / rdist) * ribbonVelocity,
        length: 80 + Math.random() * 180,
        width: 0.5 + Math.random() * 0.7,
        angle: Math.atan2(rdy, rdx) + (Math.random() - 0.5) * 0.05,
        curve: (fromLeft ? 1 : -1) * (28 + Math.random() * 54),
        life: 0.9 + Math.random() * 0.28,
        decay: 1.45 + Math.random() * 0.42,
        depth: 0.75 + Math.random() * 0.55,
        side: ribbonSide,
        mode: "zoomRibbon"
      });
    }

    if (orbitStreaks.length > preset.maxItems) {
      orbitStreaks.splice(0, orbitStreaks.length - preset.maxItems);
    }

    startOrbitStreakLoop();
  }

  function startOrbitStreakLoop() {
    if (!orbitStreakCanvas || !orbitStreakCtx || orbitStreakAnimId) return;
    var last = performance.now();

    function tick(now) {
      var rect = getIntroSceneRect();
      var width = rect.width;
      var height = rect.height;
      var dt = Math.min((now - last) / 1000, 0.033);
      last = now;

      orbitStreakCtx.clearRect(0, 0, width, height);
      orbitStreakCtx.save();
      orbitStreakCtx.globalCompositeOperation = "lighter";

      var next = [];
      for (var i = 0; i < orbitStreaks.length; i++) {
        var s = orbitStreaks[i];
        s.life -= s.decay * dt;
        if (s.life <= 0) continue;

        if (s.mode !== "zoomPulse") {
          s.x += s.vx * dt;
          s.y += s.vy * dt;
        }
        drawOrbitStreak(s);
        next.push(s);
      }

      orbitStreakCtx.restore();
      orbitStreaks = next;

      if (orbitStreaks.length > 0) {
        orbitStreakAnimId = requestAnimationFrame(tick);
      } else {
        orbitStreakAnimId = null;
        orbitStreakCtx.clearRect(0, 0, width, height);
      }
    }

    orbitStreakAnimId = requestAnimationFrame(tick);
  }

  function drawOrbitStreak(streak) {
    var alpha = Math.pow(Math.max(0, Math.min(1, streak.life)), 1.25);
    if (streak.mode === "zoomPulse") {
      drawZoomPulse(streak, alpha);
      return;
    }

    var isZoom = streak.mode === "zoomRay" || streak.mode === "zoomRibbon";
    var isRibbon = streak.mode === "zoomRibbon";
    var core = isZoom ? ORBIT_STREAK_PRESETS.zoom.core : ORBIT_STREAK_PRESETS.orbit.core;
    var edge = isZoom ? ORBIT_STREAK_PRESETS.zoom.edge : ORBIT_STREAK_PRESETS.orbit.edge;

    orbitStreakCtx.save();
    orbitStreakCtx.translate(streak.x, streak.y);
    orbitStreakCtx.rotate(streak.angle);
    var gradient = orbitStreakCtx.createLinearGradient(-streak.length, 0, streak.length * 0.18, 0);
    gradient.addColorStop(0, "rgba(" + edge + ",0)");
    gradient.addColorStop(0.35, "rgba(" + edge + "," + ((isZoom ? 0.14 : 0.18) * alpha).toFixed(3) + ")");
    gradient.addColorStop(0.78, "rgba(" + core + "," + ((isZoom ? 0.5 : 0.72) * alpha).toFixed(3) + ")");
    gradient.addColorStop(1, "rgba(255,255,255," + ((isZoom ? 0.88 : 0.5) * alpha).toFixed(3) + ")");
    orbitStreakCtx.strokeStyle = gradient;
    orbitStreakCtx.lineWidth = streak.width;
    orbitStreakCtx.lineCap = "round";
    orbitStreakCtx.shadowBlur = (isZoom ? 12 : 18) * (streak.depth || 1);
    orbitStreakCtx.shadowColor = "rgba(" + core + "," + ((isZoom ? 0.22 : 0.44) * alpha).toFixed(3) + ")";
    orbitStreakCtx.beginPath();
    orbitStreakCtx.moveTo(-streak.length, 0);
    orbitStreakCtx.quadraticCurveTo(-streak.length * 0.38, streak.curve || 0, streak.length * 0.18, 0);
    orbitStreakCtx.stroke();

    if (isZoom && !isRibbon && streak.width > 0.62) {
      orbitStreakCtx.strokeStyle = "rgba(255,255,255," + (0.2 * alpha).toFixed(3) + ")";
      orbitStreakCtx.lineWidth = Math.max(0.35, streak.width * 0.26);
      orbitStreakCtx.shadowBlur = 0;
      orbitStreakCtx.beginPath();
      orbitStreakCtx.moveTo(-streak.length * 0.32, 0);
      orbitStreakCtx.lineTo(streak.length * 0.13, 0);
      orbitStreakCtx.stroke();
    }
    orbitStreakCtx.restore();
  }

  function drawZoomPulse(streak, alpha) {
    var progress = 1 - Math.max(0, Math.min(1, streak.life));
    var radius = streak.radius + (streak.maxRadius - streak.radius) * progress;
    var ring = orbitStreakCtx.createRadialGradient(streak.x, streak.y, Math.max(1, radius * 0.2), streak.x, streak.y, radius);
    ring.addColorStop(0, "rgba(255,255,255,0)");
    ring.addColorStop(0.58, "rgba(" + ORBIT_STREAK_PRESETS.zoom.accent + "," + (0.07 * alpha).toFixed(3) + ")");
    ring.addColorStop(0.84, "rgba(255,255,255," + (0.18 * alpha).toFixed(3) + ")");
    ring.addColorStop(1, "rgba(255,255,255,0)");

    orbitStreakCtx.save();
    orbitStreakCtx.strokeStyle = ring;
    orbitStreakCtx.lineWidth = 2.4;
    orbitStreakCtx.beginPath();
    orbitStreakCtx.ellipse(streak.x, streak.y, radius * 1.45, radius * 0.52, -0.04, 0, Math.PI * 2);
    orbitStreakCtx.stroke();
    orbitStreakCtx.restore();
  }

  function onOrbitPointerDown(event) {
    if (!loadingDismissed || !mvEl) return;
    ensureOrbitStreakContext();
    orbitPointer.active = true;
    orbitPointer.lastX = event.clientX || 0;
    orbitPointer.lastY = event.clientY || 0;
    orbitPointer.x = orbitPointer.lastX;
    orbitPointer.y = orbitPointer.lastY;
  }

  function onOrbitPointerMove(event) {
    if (!orbitPointer.active || !loadingDismissed) return;
    var x = event.clientX || 0;
    var y = event.clientY || 0;
    var dx = x - orbitPointer.lastX;
    var dy = y - orbitPointer.lastY;
    var speed = Math.min(80, Math.sqrt(dx * dx + dy * dy));
    var now = performance.now();

    orbitPointer.lastX = x;
    orbitPointer.lastY = y;
    if (speed > 1.4 && now - orbitPointer.lastSpawn > 34) {
      spawnOrbitEdgeStreaks(speed, "orbit");
      orbitPointer.lastSpawn = now;
    }
  }

  function onOrbitPointerUp() {
    orbitPointer.active = false;
  }

  function initOrbitStreaks() {
    orbitStreakCanvas = document.getElementById("intro-orbit-streak-canvas");
    if (!orbitStreakCanvas || !mvEl || prefersReducedMotion()) return;

    mvEl.addEventListener("pointerdown", onOrbitPointerDown);
    window.addEventListener("pointermove", onOrbitPointerMove);
    window.addEventListener("pointerup", onOrbitPointerUp);
    window.addEventListener("pointercancel", onOrbitPointerUp);
  }

  function resizeAntigravityCanvas() {
    if (!antigravityCanvas || !loadingEl) return;
    var rect = loadingEl.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    antigravityCanvas.width = Math.max(1, Math.floor(rect.width * dpr));
    antigravityCanvas.height = Math.max(1, Math.floor(rect.height * dpr));
    antigravityCanvas.style.width = rect.width + "px";
    antigravityCanvas.style.height = rect.height + "px";
    if (antigravityCtx) {
      antigravityCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }

  function ensureAntigravityContext() {
    if (!antigravityCanvas || !loadingEl || prefersReducedMotion()) return false;
    if (!antigravityCtx) {
      antigravityCtx = antigravityCanvas.getContext("2d", { alpha: true });
      if (!antigravityCtx) return false;
    }
    resizeAntigravityCanvas();
    if (!antigravityResizeBound) {
      antigravityResizeBound = true;
      window.addEventListener("resize", resizeAntigravityCanvas);
    }
    return true;
  }

  function seedAntigravityParticles(width, height, x, y) {
    antigravityParticles.length = 0;
    if (!width || !height) return;
    var count = Math.min(36, Math.max(16, Math.floor((width * height) / 64000)));
    var palette = [
      [91, 88, 255],
      [147, 77, 255],
      [232, 46, 255],
      [255, 174, 28]
    ];

    for (var i = 0; i < count; i++) {
      var color = palette[i % palette.length];
      antigravityParticles.push({
        x: typeof x === "number" ? x + (Math.random() - 0.5) * 300 : Math.random() * width,
        y: typeof y === "number" ? y + (Math.random() - 0.5) * 220 : Math.random() * height,
        vx: -18 + Math.random() * 36,
        vy: -10 + Math.random() * 20,
        size: 0.8 + Math.random() * 1.8,
        stretch: 4 + Math.random() * 12,
        color: color,
        alpha: 0.18 + Math.random() * 0.42,
        phase: Math.random() * Math.PI * 2,
        life: 0.72 + Math.random() * 0.34
      });
    }
  }

  function spawnAntigravityStreak(x, y, speed) {
    if (!loadingEl) return;
    var rect = loadingEl.getBoundingClientRect();
    var intensity = Math.min(1, speed / 46);
    var count = 1 + Math.floor(intensity * 3);

    for (var i = 0; i < count; i++) {
      antigravityStreaks.push({
        x: x + (Math.random() - 0.5) * 180,
        y: y + (Math.random() - 0.5) * 130,
        vx: -360 - Math.random() * 520 - speed * 5,
        vy: -28 + Math.random() * 56,
        length: 90 + Math.random() * 210 + intensity * 120,
        width: 1 + Math.random() * 1.8,
        angle: (-3 + Math.random() * 6) * Math.PI / 180,
        life: 1,
        decay: 1.3 + Math.random() * 0.9,
        hue: Math.random() > 0.72 ? "gold" : "violet"
      });
    }

    if (antigravityStreaks.length > 46) {
      antigravityStreaks.splice(0, antigravityStreaks.length - 46);
    }

    if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
      antigravityPointer.active = false;
    }
  }

  function onAntigravityMove(event) {
    if (!loadingEl || !antigravityCanvas) return;
    if (!ensureAntigravityContext()) return;
    var rect = loadingEl.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    var now = performance.now();
    var dx = x - antigravityPointer.lastX;
    var dy = y - antigravityPointer.lastY;

    antigravityPointer.x = x;
    antigravityPointer.y = y;
    antigravityPointer.speed = Math.min(80, Math.sqrt(dx * dx + dy * dy));
    antigravityPointer.active = true;
    antigravityPointer.lastX = x;
    antigravityPointer.lastY = y;
    antigravityPointer.lastMove = now;

    if (now - antigravityPointer.lastSpawn > 42 && antigravityPointer.speed > 2) {
      if (antigravityParticles.length === 0) {
        seedAntigravityParticles(rect.width, rect.height, x, y);
      }
      spawnAntigravityStreak(x, y, antigravityPointer.speed);
      antigravityPointer.lastSpawn = now;
    }

    startAntigravityLoop();
  }

  function onAntigravityLeave() {
    antigravityPointer.active = false;
  }

  function initAntigravityLoading() {
    antigravityCanvas = document.getElementById("intro-antigravity-canvas");
    if (!antigravityCanvas || !loadingEl || prefersReducedMotion()) return;

    loadingEl.addEventListener("mousemove", onAntigravityMove);
    loadingEl.addEventListener("mouseleave", onAntigravityLeave);
    loadingEl.addEventListener("touchmove", function (event) {
      if (event.touches && event.touches[0]) {
        onAntigravityMove(event.touches[0]);
      }
    }, { passive: true });
  }

  function stopAntigravityLoading() {
    window.clearTimeout(antigravityIdleTimer);
    antigravityIdleTimer = null;
    if (antigravityAnimId) {
      cancelAnimationFrame(antigravityAnimId);
      antigravityAnimId = null;
    }
    if (antigravityCanvas && antigravityCtx) {
      antigravityCtx.clearRect(0, 0, antigravityCanvas.width, antigravityCanvas.height);
    }
    antigravityParticles.length = 0;
    antigravityStreaks.length = 0;
  }

  function startAntigravityLoop() {
    if (!antigravityCanvas || !antigravityCtx || antigravityAnimId) return;
    var last = performance.now();

    function tick(now) {
      if (!antigravityCanvas || !antigravityCtx || loadingDismissed) {
        stopAntigravityLoading();
        return;
      }

      var rect = loadingEl ? loadingEl.getBoundingClientRect() : { width: 0, height: 0 };
      var width = rect.width;
      var height = rect.height;
      var dt = Math.min((now - last) / 1000, 0.033);
      last = now;

      if (document.hidden) {
        antigravityAnimId = requestAnimationFrame(tick);
        return;
      }

      if (now - antigravityPointer.lastMove > 420) {
        antigravityPointer.active = false;
      }

      if (!antigravityPointer.active && antigravityStreaks.length === 0 && antigravityParticles.length === 0) {
        stopAntigravityLoading();
        return;
      }

      antigravityCtx.clearRect(0, 0, width, height);
      antigravityCtx.save();
      antigravityCtx.globalCompositeOperation = "lighter";

      drawAntigravityParticles(width, height, dt, now);
      drawAntigravityStreaks(dt);

      antigravityCtx.restore();
      antigravityAnimId = requestAnimationFrame(tick);
    }

    antigravityAnimId = requestAnimationFrame(tick);
  }

  function drawAntigravityParticles(width, height, dt, now) {
    for (var i = 0; i < antigravityParticles.length; i++) {
      var p = antigravityParticles[i];
      p.life -= dt * 0.32;
      if (p.life <= 0) continue;
      var dx = p.x - antigravityPointer.x;
      var dy = p.y - antigravityPointer.y;
      var distSq = dx * dx + dy * dy;
      var force = antigravityPointer.active ? Math.max(0, 1 - distSq / 76000) : 0;
      var pulse = 0.65 + Math.sin(now * 0.0012 + p.phase) * 0.35;

      if (force > 0) {
        var dist = Math.sqrt(distSq) || 1;
        p.vx += (dx / dist) * force * 170 * dt;
        p.vy += (dy / dist) * force * 92 * dt;
      }

      p.x += (p.vx + Math.sin(now * 0.0007 + p.phase) * 12) * dt;
      p.y += (p.vy + Math.cos(now * 0.0008 + p.phase) * 8) * dt;
      p.vx *= 0.992;
      p.vy *= 0.992;

      if (p.x < -30) p.x = width + 30;
      if (p.x > width + 30) p.x = -30;
      if (p.y < -30) p.y = height + 30;
      if (p.y > height + 30) p.y = -30;

      var alpha = Math.min(0.95, p.alpha + force * 0.55) * pulse * Math.min(1, p.life);
      antigravityCtx.strokeStyle = "rgba(" + p.color[0] + "," + p.color[1] + "," + p.color[2] + "," + alpha.toFixed(3) + ")";
      antigravityCtx.lineWidth = p.size;
      antigravityCtx.lineCap = "round";
      antigravityCtx.beginPath();
      antigravityCtx.moveTo(p.x, p.y);
      antigravityCtx.lineTo(p.x + p.stretch + force * 24, p.y + force * 4);
      antigravityCtx.stroke();
    }

    antigravityParticles = antigravityParticles.filter(function (p) {
      return p.life > 0;
    });
  }

  function drawAntigravityStreaks(dt) {
    var next = [];
    for (var i = 0; i < antigravityStreaks.length; i++) {
      var s = antigravityStreaks[i];
      s.life -= s.decay * dt;
      if (s.life <= 0) continue;

      s.x += s.vx * dt;
      s.y += s.vy * dt;
      var alpha = Math.max(0, Math.min(1, s.life));
      var core = s.hue === "gold" ? "255,190,42" : "234,44,255";
      var edge = s.hue === "gold" ? "255,120,32" : "88,84,255";

      antigravityCtx.save();
      antigravityCtx.translate(s.x, s.y);
      antigravityCtx.rotate(s.angle);
      var gradient = antigravityCtx.createLinearGradient(-s.length, 0, s.length * 0.25, 0);
      gradient.addColorStop(0, "rgba(" + edge + ",0)");
      gradient.addColorStop(0.42, "rgba(" + edge + "," + (0.42 * alpha).toFixed(3) + ")");
      gradient.addColorStop(0.78, "rgba(" + core + "," + (0.86 * alpha).toFixed(3) + ")");
      gradient.addColorStop(1, "rgba(255,255,255," + (0.64 * alpha).toFixed(3) + ")");
      antigravityCtx.strokeStyle = gradient;
      antigravityCtx.lineWidth = s.width;
      antigravityCtx.lineCap = "round";
      antigravityCtx.shadowBlur = 18;
      antigravityCtx.shadowColor = "rgba(" + core + "," + (0.46 * alpha).toFixed(3) + ")";
      antigravityCtx.beginPath();
      antigravityCtx.moveTo(-s.length, 0);
      antigravityCtx.lineTo(s.length * 0.25, 0);
      antigravityCtx.stroke();
      antigravityCtx.restore();
      next.push(s);
    }
    antigravityStreaks = next;
  }

  function fadeOutLoading(el, duration, revealDelay, onReveal, onComplete) {
    if (!el) {
      if (onReveal) onReveal();
      if (onComplete) onComplete();
      return;
    }

    var section = el.closest ? el.closest(".intro-landing") : document.getElementById("intro-landing");
    var reducedMotion = prefersReducedMotion();
    var exitDuration = reducedMotion ? 80 : duration;
    var textDelay = reducedMotion ? 0 : revealDelay;
    var revealTimer = null;
    var completeTimer = null;
    var completed = false;

    function complete() {
      if (completed) return;
      completed = true;
      window.clearTimeout(revealTimer);
      window.clearTimeout(completeTimer);
      el.removeEventListener("transitionend", onTransitionEnd);
      if (section) section.classList.add("is-loading-complete");
      el.style.pointerEvents = "none";
      stopAntigravityLoading();
      if (typeof onComplete === "function") onComplete();
    }

    function onTransitionEnd(event) {
      if (event.target === el && event.propertyName === "opacity") {
        complete();
      }
    }

    el.addEventListener("transitionend", onTransitionEnd);

    requestAnimationFrame(function () {
      if (section) section.classList.add("is-loading-dismissing");
    });

    revealTimer = window.setTimeout(function () {
      if (typeof onReveal === "function") onReveal();
    }, textDelay);
    completeTimer = window.setTimeout(complete, exitDuration + 140);
  }

  function markReady() {
    if (isReady) return;
    isReady = true;
    window.__introReady = true;
    resolveReady(true);
  }

  function dismissLoading(onComplete) {
    if (loadingDismissed) {
      if (typeof onComplete === "function") onComplete();
      return;
    }
    loadingDismissed = true;

    prepareTextReveal();

    /* PERF: Request model-viewer to pause rendering during text animation
       by temporarily disabling camera-controls events */
    if (mvEl && mvEl.addEventListener) {
      mvEl.style.pointerEvents = "none";
    }

    fadeOutLoading(loadingEl, 1180, 190,
      function onReveal() {
        animateTextReveal();
      },
      function onDone() {
        /* Re-enable model-viewer interaction after text animation */
        if (mvEl && mvEl.style) {
          mvEl.style.pointerEvents = "auto";
        }
        document.body.classList.remove("app-is-booting");
        if (typeof onComplete === "function") onComplete();
      }
    );
  }

  function init() {
    mvEl = document.getElementById("intro-model");
    loadingEl = document.getElementById("intro-loading");
    var progressEl = document.getElementById("intro-loading-progress");

    initAntigravityLoading();

    particleCanvas = document.getElementById("intro-particle-canvas");
    if (particleCanvas) {
      particleCtx = particleCanvas.getContext("2d");
      resizeParticleCanvas();
      window.addEventListener("resize", resizeParticleCanvas);
    }

    if (!mvEl) {
      markReady();
      return;
    }

    var shimmerEl = document.querySelector(".intro-landing__breathing");
    if (shimmerEl) {
      requestAnimationFrame(function () {
        shimmerEl.classList.add("is-animating");
      });
    }

    mvEl.addEventListener("progress", function (e) {
      if (progressEl && e.detail && typeof e.detail.totalProgress === "number") {
        progressEl.textContent = Math.round(e.detail.totalProgress * 100) + "%";
      }
    });

    mvEl.addEventListener("load", function () {
      /* PERF: Defer fan collection but don't start loop yet. */
      setTimeout(function () {
        if (!startEmbeddedAnimation()) {
          collectFans();
        }
      }, 100);

      /* PERF: "Solid Stabilization" Strategy
         1. Model is reveal="auto", so it starts rendering immediately behind loading.
         2. We wait a very generous 2.5 seconds.
         3. This ensures all initial GPU spikes, memory allocations, and first frames
            are long gone before the user sees the model.
      */
      setTimeout(function() {
        markReady();
      }, 2500);
    });

    mvEl.addEventListener("error", function () {
      markReady();
    });

    mvEl.addEventListener("dblclick", handleDoubleClickZoom);
    initOrbitStreaks();

    mvEl.addEventListener("dblclick", handleDoubleClickZoom);
    initOrbitStreaks();

    initZoomNavigation();
    setupScrollAnimation();

    /* PERF: Intersection Observer to pause rendering when not in view */
    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            isInView = entry.isIntersecting;
            if (!isInView) {
              running = false;
            } else if (isReady && loadingDismissed && fanNodes.length > 0) {
              startFanLoop();
            }
          });
        },
        { threshold: 0.01 }
      );
      var section = document.getElementById("intro-landing");
      if (section) observer.observe(section);
    }

    /* PERF: Tab visibility check to pause loops in background */
    document.addEventListener("visibilitychange", function () {
      isTabActive = !document.hidden;
      if (!isTabActive) {
        running = false;
      } else if (isInView && isReady && loadingDismissed && fanNodes.length > 0) {
        startFanLoop();
      }
    });
  }

  /* ----------------------------------------------------------
     SCENE / FAN HELPERS (unchanged)
     ---------------------------------------------------------- */
  function getInternalScene() {
    if (!mvEl) return null;

    var symbols = Object.getOwnPropertySymbols(mvEl);
    for (var i = 0; i < symbols.length; i++) {
      var desc = symbols[i].description || String(symbols[i]);
      if (desc.indexOf("scene") !== -1) {
        var val = mvEl[symbols[i]];
        if (val && typeof val.traverse === "function") return val;
        if (val && val.scene && typeof val.scene.traverse === "function") return val.scene;
        if (val && val.model && typeof val.model.traverse === "function") return val.model;
      }
    }

    for (var j = 0; j < symbols.length; j++) {
      try {
        var v = mvEl[symbols[j]];
        if (v && typeof v === "object") {
          if (typeof v.traverse === "function") return v;
          var keys = Object.keys(v);
          for (var k = 0; k < keys.length; k++) {
            var child = v[keys[k]];
            if (child && typeof child.traverse === "function") return child;
          }
          var childSyms = Object.getOwnPropertySymbols(v);
          for (var m = 0; m < childSyms.length; m++) {
            var cv = v[childSyms[m]];
            if (cv && typeof cv.traverse === "function") return cv;
          }
        }
      } catch (e) {}
    }

    return null;
  }

  function collectFans() {
    var scene = getInternalScene();
    if (!scene) return;

    scene.traverse(function (node) {
      var name = (node.name || "").toLowerCase();
      if (name.indexOf("elice") !== -1) {
        fanNodes.push(node);
      }
    });
  }

  function startFanLoop() {
    if (fanNodes.length === 0 || running || !isInView || !isTabActive || !loadingDismissed) return;
    running = true;
    var last = performance.now();
    var frameSkip = 0; /* Throttle to ~30fps instead of 60fps */

    function tick(now) {
      if (!running || !isInView || !isTabActive) {
        running = false;
        return;
      }

      var dt = (now - last) / 1000;
      last = now;

      /* Throttle rendering to 30fps for fan rotation */
      frameSkip++;
      if (frameSkip < 2) {
        requestAnimationFrame(tick);
        return;
      }
      frameSkip = 0;

      /* Batch fan rotation updates */
      var rotationDelta = dt * 16.0; /* 8.0 * 2 to compensate for skipped frames */
      for (var i = 0; i < fanNodes.length; i++) {
        fanNodes[i].rotation.x += rotationDelta;
      }

      requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  /* ----------------------------------------------------------
     TEXT REVEAL (initial page load)
     Uses CSS transitions on compositor thread (GPU) instead of
     GSAP (main thread) to avoid jank from 3D rendering contention.
     ---------------------------------------------------------- */
  function prepareTextReveal() {
    /* PERF: Pause CPU-heavy loops during text animation
       to dedicate all resources to smooth CSS transitions.*/
    running = false;
    if (particleAnimId) {
      cancelAnimationFrame(particleAnimId);
      particleAnimId = null;
    }
  }


  function animateTextReveal() {
    var section = document.getElementById("intro-landing");
    if (!section) return;

    requestAnimationFrame(function () {
      section.classList.add("is-text-revealed");

      /* PERF: Keep the intro model isolated after text reveal. requestIdleCallback
         can fire during the reveal, so wait first, then use idle time. */
      var resumeDelay = 3200;
      var resumeAuxiliaryMotion = function () {
        var runAuxiliaryMotion = function () {
          if (fanNodes.length > 0) {
            startFanLoop();
          }
          if (particleCanvas && particles.length > 0) {
            startParticleLoop();
          }
        };

        if ("requestIdleCallback" in window) {
          requestIdleCallback(runAuxiliaryMotion, { timeout: 1200 });
        } else {
          runAuxiliaryMotion();
        }
      };
      setTimeout(resumeAuxiliaryMotion, resumeDelay);

      /* Batch DOM cleanup to avoid layout recalculation */
      var els = section.querySelectorAll(
        ".intro-landing__eyebrow," +
        ".intro-landing__title," +
        ".intro-landing__tagline," +
        ".intro-landing__line," +
        ".intro-landing__scroll"
      );
      setTimeout(function () {
        for (var i = 0; i < els.length; i++) {
          els[i].style.willChange = "auto";
        }
      }, 1600);
    });
  }

  /* ----------------------------------------------------------
     CHARACTER SPLIT SYSTEM
     ---------------------------------------------------------- */
  function splitTextToChars(el) {
    var text = el.textContent;
    if (!text) return [];

    var rect = el.getBoundingClientRect();
    el.setAttribute("data-original-text", text);
    el.setAttribute("data-original-style", el.getAttribute("style") || "");
    el.style.minWidth = rect.width + "px";
    el.style.minHeight = rect.height + "px";
    el.style.overflow = "visible";
    el.style.whiteSpace = "pre";

    if (window.getComputedStyle(el).display === "block") {
      el.style.display = "flex";
      el.style.justifyContent = "center";
      el.style.alignItems = "center";
    }

    el.textContent = "";

    var chars = [];
    for (var i = 0; i < text.length; i++) {
      var span = document.createElement("span");
      span.className = "char-particle";
      span.textContent = text[i] === " " ? "\u00A0" : text[i];
      el.appendChild(span);
      chars.push(span);
    }

    return chars;
  }

  function restoreOriginalText(el) {
    var original = el.getAttribute("data-original-text");
    if (original !== null) {
      el.textContent = original;
      el.removeAttribute("data-original-text");
      el.setAttribute("style", el.getAttribute("data-original-style") || "");
      el.removeAttribute("data-original-style");
    }
  }

  /* ----------------------------------------------------------
     GOLD PARTICLE CANVAS SYSTEM
     ---------------------------------------------------------- */
  function resizeParticleCanvas() {
    if (!particleCanvas) return;
    var section = document.getElementById("intro-landing");
    if (!section) return;
    var dpr = window.devicePixelRatio || 1;
    particleCanvas.width = section.offsetWidth * dpr;
    particleCanvas.height = section.offsetHeight * dpr;
    particleCanvas.style.width = section.offsetWidth + "px";
    particleCanvas.style.height = section.offsetHeight + "px";
    if (particleCtx) {
      particleCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }

  function spawnParticlesFromChar(charEl, rgb) {
    if (!particleCanvas) return;
    var rect = charEl.getBoundingClientRect();
    var section = document.getElementById("intro-landing");
    var sectionRect = section.getBoundingClientRect();

    var cx = rect.left + rect.width / 2 - sectionRect.left;
    var cy = rect.top + rect.height / 2 - sectionRect.top;
    var base = "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ",";

    var count = 3 + Math.floor(Math.random() * 3);
    for (var i = 0; i < count; i++) {
      var angle = Math.random() * Math.PI * 2;
      var speed = 50 + Math.random() * 100;
      particles.push({
        x: cx + (Math.random() - 0.5) * rect.width,
        y: cy + (Math.random() - 0.5) * rect.height,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 40 - Math.random() * 50,
        size: 0.8 + Math.random() * 2,
        colorBase: base,
        life: 1.0,
        decay: 0.5 + Math.random() * 0.4,
        gravity: 20 + Math.random() * 20
      });
    }
  }

  function startParticleLoop() {
    if (particleAnimId) return;
    var lastTime = performance.now();
    var cw = particleCanvas.width / (window.devicePixelRatio || 1);
    var ch = particleCanvas.height / (window.devicePixelRatio || 1);

    function tick(now) {
      var dt = Math.min((now - lastTime) / 1000, 0.04);
      lastTime = now;

      particleCtx.clearRect(0, 0, cw, ch);

      var alive = 0;
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.life -= p.decay * dt;
        if (p.life <= 0) continue;

        p.vy += p.gravity * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= (1 - 2 * dt);

        var a = p.life * p.life;
        var r = p.size * p.life;
        particleCtx.fillStyle = p.colorBase + a.toFixed(2) + ")";
        particleCtx.fillRect(p.x - r * 0.5, p.y - r * 0.5, r, r);
        alive++;
      }

      if (alive > 0) {
        particleAnimId = requestAnimationFrame(tick);
      } else {
        particles.length = 0;
        particleAnimId = null;
      }
    }

    particleAnimId = requestAnimationFrame(tick);
  }

  /* ----------------------------------------------------------
     ZOOM TEXT TRANSITIONS
     ---------------------------------------------------------- */
  function animateZoomIn() {
    if (typeof gsap === "undefined") return;
    zoomTransitioning = true;

    var content = document.querySelector(".intro-landing__content");
    var eyebrow = document.querySelector(".intro-landing__eyebrow");
    var title = document.querySelector(".intro-landing__title");
    var tagline = document.querySelector(".intro-landing__tagline");
    var line = document.querySelector(".intro-landing__line");
    var scroll = document.querySelector(".intro-landing__scroll--bottom");

    var tl = gsap.timeline({
      onComplete: function () {
        gsap.set([eyebrow, title, tagline, line, scroll], {
          autoAlpha: 0,
          clearProps: "transform"
        });
        if (content) {
          gsap.set(content, { autoAlpha: 0 });
        }
        revealZoomContent();
        zoomTransitioning = false;
      }
    });

    tl.to(scroll, {
      opacity: 0,
      y: 15,
      duration: 0.3,
      ease: "power2.in"
    }, 0);

    tl.to(line, {
      scaleX: 0,
      opacity: 0,
      duration: 0.35,
      ease: "power2.in"
    }, 0.05);

    tl.to(tagline, {
      opacity: 0,
      y: 20,
      duration: 0.35,
      ease: "power2.in"
    }, 0.08);

    tl.to(title, {
      opacity: 0,
      y: 20,
      duration: 0.4,
      ease: "power2.in"
    }, 0.15);

    tl.to(eyebrow, {
      opacity: 0,
      y: 15,
      duration: 0.35,
      ease: "power2.in"
    }, 0.2);
  }

  function revealZoomContent() {
    var zoomContent = document.querySelector(".intro-landing__zoom-content");
    if (!zoomContent) return;

    gsap.set(".intro-landing__zoom-eyebrow", { opacity: 0, y: 20 });
    gsap.set(".intro-landing__zoom-title", { opacity: 0, y: 30 });
    gsap.set(".intro-landing__zoom-link", { opacity: 0, y: 20 });
    gsap.set(".intro-landing__zoom-scroll", { opacity: 0, y: 15, xPercent: -50 });

    zoomContent.classList.add("is-visible");
    gsap.set(zoomContent, { opacity: 1, visibility: "visible" });

    var tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.to(".intro-landing__zoom-eyebrow", {
      opacity: 1, y: 0, duration: 0.7
    }, 0);

    tl.to(".intro-landing__zoom-title", {
      opacity: 1, y: 0, duration: 0.9, ease: "power4.out"
    }, 0.15);

    tl.to(".intro-landing__zoom-link", {
      opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power3.out"
    }, 0.35);

    tl.to(".intro-landing__zoom-scroll", {
      opacity: 1, y: 0, xPercent: -50, duration: 0.5
    }, 0.65);
  }

  function animateZoomOut() {
    if (typeof gsap === "undefined") return;
    zoomTransitioning = true;

    var zoomContent = document.querySelector(".intro-landing__zoom-content");

    var tl = gsap.timeline({
      onComplete: function () {
        if (zoomContent) {
          zoomContent.classList.remove("is-visible");
          gsap.set(zoomContent, { opacity: 0, visibility: "hidden" });
        }
        gsap.set(".intro-landing__zoom-eyebrow", { opacity: 0, y: 20 });
        gsap.set(".intro-landing__zoom-title", { opacity: 0, y: 30 });
        gsap.set(".intro-landing__zoom-link", { opacity: 0, y: 20 });
        gsap.set(".intro-landing__zoom-scroll", { opacity: 0, y: 15, xPercent: -50 });

        restoreIntroText();
        zoomTransitioning = false;
      }
    });

    tl.to(".intro-landing__zoom-scroll", {
      opacity: 0, y: 15, xPercent: -50, duration: 0.3, ease: "power2.in"
    }, 0);

    tl.to(".intro-landing__zoom-link", {
      opacity: 0, y: 15, duration: 0.35, stagger: 0.05, ease: "power2.in"
    }, 0.05);

    tl.to(".intro-landing__zoom-title", {
      opacity: 0, y: 20, duration: 0.4, ease: "power2.in"
    }, 0.15);

    tl.to(".intro-landing__zoom-eyebrow", {
      opacity: 0, y: 15, duration: 0.35, ease: "power2.in"
    }, 0.2);
  }

  function restoreIntroText() {
    var section = document.getElementById("intro-landing");
    var content = document.querySelector(".intro-landing__content");
    var eyebrow = document.querySelector(".intro-landing__eyebrow");
    var title = document.querySelector(".intro-landing__title");
    var tagline = document.querySelector(".intro-landing__tagline");
    var line = document.querySelector(".intro-landing__line");
    var scroll = document.querySelector(".intro-landing__scroll--bottom");

    restoreOriginalText(eyebrow);
    restoreOriginalText(title);
    restoreOriginalText(tagline);

    if (content) {
      gsap.set(content, { clearProps: "opacity,visibility,filter" });
      gsap.set(content, { opacity: 1, visibility: "visible" });
    }

    /* Clear any GSAP inline styles from zoom transitions */
    gsap.set([eyebrow, title, tagline, line, scroll], {
      clearProps: "opacity,visibility,transform,filter,display,y,scaleX"
    });

    /* Remove revealed state so CSS sets elements back to hidden */
    if (section) section.classList.remove("is-text-revealed");

    /* Re-trigger the CSS reveal in next frame */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        if (section) section.classList.add("is-text-revealed");
      });
    });
  }

  /* ----------------------------------------------------------
     ZOOM NAVIGATION (smooth scroll)
     ---------------------------------------------------------- */
  function initZoomNavigation() {
    var links = document.querySelectorAll(".intro-landing__zoom-link[data-scroll-target]");
    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener("click", function (e) {
        e.preventDefault();
        var target = this.getAttribute("data-scroll-target");
        if (target && typeof gsap !== "undefined" && typeof ScrollToPlugin !== "undefined") {
          gsap.to(window, {
            scrollTo: { y: "#" + target, offsetY: 0 },
            duration: 1.2,
            ease: "power2.inOut"
          });
        }
      });
    }
  }

  /* ----------------------------------------------------------
     CAMERA ZOOM TWEEN
     ---------------------------------------------------------- */
  var zoomTweenId = null;

  function parseOrbit(str) {
    var parts = str.match(/([\d.]+)deg\s+([\d.]+)deg\s+([\d.]+)%/);
    return { theta: parseFloat(parts[1]), phi: parseFloat(parts[2]), radius: parseFloat(parts[3]) };
  }

  function lerpOrbit(a, b, t) {
    return {
      theta: a.theta + (b.theta - a.theta) * t,
      phi: a.phi + (b.phi - a.phi) * t,
      radius: a.radius + (b.radius - a.radius) * t
    };
  }

  function orbitString(o) {
    return o.theta.toFixed(2) + "deg " + o.phi.toFixed(2) + "deg " + o.radius.toFixed(2) + "%";
  }

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function tweenZoom(targetOrbit, targetFov, duration) {
    if (zoomTweenId) cancelAnimationFrame(zoomTweenId);

    var currentOrbitStr = mvEl.getAttribute("camera-orbit");
    var currentFovStr = mvEl.getAttribute("field-of-view");
    var startOrbit = parseOrbit(currentOrbitStr);
    var endOrbit = parseOrbit(targetOrbit);
    var startFov = parseFloat(currentFovStr);
    var endFov = parseFloat(targetFov);
    var startTime = performance.now();

    function tick(now) {
      var progress = Math.min((now - startTime) / duration, 1);
      var eased = easeInOutCubic(progress);

      var o = lerpOrbit(startOrbit, endOrbit, eased);
      var fov = startFov + (endFov - startFov) * eased;

      mvEl.setAttribute("camera-orbit", orbitString(o));
      mvEl.setAttribute("field-of-view", fov.toFixed(2) + "deg");

      if (progress < 1) {
        zoomTweenId = requestAnimationFrame(tick);
      } else {
        zoomTweenId = null;
      }
    }

    zoomTweenId = requestAnimationFrame(tick);
  }

  /* ----------------------------------------------------------
     DOUBLE-CLICK ZOOM HANDLER
     ---------------------------------------------------------- */
  function handleDoubleClickZoom() {
    if (!mvEl || zoomTransitioning) return;
    isZoomed = !isZoomed;
    spawnOrbitEdgeStreaks(72, "wind");

    if (isZoomed) {
      mvEl.setAttribute("min-camera-orbit", "105deg 89deg 20%");
      mvEl.setAttribute("max-camera-orbit", "180deg 89deg 44%");
      tweenZoom(ZOOMED_ORBIT, "25deg", 900);
      animateZoomIn();
    } else {
      tweenZoom(DEFAULT_ORBIT, "18deg", 900);
      setTimeout(function () {
        mvEl.setAttribute("min-camera-orbit", "105deg 89deg 44%");
        mvEl.setAttribute("max-camera-orbit", "180deg 89deg 44%");
      }, 950);
      animateZoomOut();
    }
  }

  /* ----------------------------------------------------------
     SCROLL ANIMATION
     ---------------------------------------------------------- */
  function setupScrollAnimation() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    gsap.to("#intro-landing", {
      scrollTrigger: {
        trigger: "#intro-landing",
        start: "top top",
        end: "bottom top",
        scrub: 0.8
      },
      opacity: 0,
      y: -80,
      ease: "none"
    });

    gsap.to(".intro-landing__content", {
      scrollTrigger: {
        trigger: "#intro-landing",
        start: "top top",
        end: "60% top",
        scrub: 0.5
      },
      y: -120,
      opacity: 0,
      ease: "none"
    });
  }

  return {
    init: init,
    whenReady: function () { return readyPromise; },
    dismissLoading: dismissLoading
  };
})();
