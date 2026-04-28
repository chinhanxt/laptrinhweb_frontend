/* ============================================================
   INTRO LANDING — model-viewer + fan spin + GSAP scroll
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
  var DEFAULT_ORBIT = "150deg 89deg 44%";
  var ZOOMED_ORBIT = "150deg 89deg 25%";

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

    console.log("[APEX Intro] Playing embedded animation:", animations[0]);
    return true;
  }

  function fadeOutLoading(el, duration, onComplete) {
    if (!el) { if (onComplete) onComplete(); return; }
    var start = performance.now();

    function tick(now) {
      var t = Math.min((now - start) / duration, 1);
      el.style.opacity = 1 - t;
      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        el.style.pointerEvents = "none";
        if (onComplete) onComplete();
      }
    }

    requestAnimationFrame(tick);
  }

  function markReady() {
    if (isReady) return;
    isReady = true;
    window.__introReady = true;
    resolveReady(true);
  }

  function dismissLoading() {
    if (loadingDismissed) return;
    loadingDismissed = true;
    fadeOutLoading(loadingEl, 1200, function () {
      animateTextReveal();
      document.body.classList.remove("app-is-booting");
    });
  }

  function init() {
    mvEl = document.getElementById("intro-model");
    loadingEl = document.getElementById("intro-loading");
    var progressEl = document.getElementById("intro-loading-progress");

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
      if (!startEmbeddedAnimation()) {
        collectFans();
        startFanLoop();
      }
      markReady();
    });

    mvEl.addEventListener("error", function () {
      markReady();
    });

    mvEl.addEventListener("dblclick", handleDoubleClickZoom);

    setupScrollAnimation();
  }

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
    if (!scene) {
      console.warn("[APEX Intro] Could not access internal Three.js scene");
      return;
    }

    scene.traverse(function (node) {
      var name = (node.name || "").toLowerCase();
      if (name.indexOf("elice") !== -1) {
        fanNodes.push(node);
      }
    });

    console.log("[APEX Intro] Fan nodes found:", fanNodes.length);
  }

  function startFanLoop() {
    if (fanNodes.length === 0 || running) return;
    running = true;
    var last = performance.now();

    function tick() {
      if (!running) return;
      var now = performance.now();
      var dt = (now - last) / 1000;
      last = now;

      for (var i = 0; i < fanNodes.length; i++) {
        fanNodes[i].rotation.x += dt * 8.0;
      }

      requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  function animateTextReveal() {
    if (typeof gsap === "undefined") return;

    var tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.to(".intro-landing__eyebrow", { opacity: 1, y: 0, duration: 0.8 }, 0.3)
      .to(".intro-landing__title", { opacity: 1, y: 0, duration: 1, ease: "power4.out" }, 0.6)
      .to(".intro-landing__tagline", { opacity: 1, y: 0, duration: 0.8 }, 1.0)
      .to(".intro-landing__line", { scaleX: 1, opacity: 1, duration: 0.6 }, 1.2)
      .to(".intro-landing__scroll", { opacity: 1, y: 0, duration: 0.6 }, 1.5);
  }

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

  function handleDoubleClickZoom() {
    if (!mvEl) return;
    isZoomed = !isZoomed;

    if (isZoomed) {
      mvEl.setAttribute("min-camera-orbit", "105deg 89deg 20%");
      mvEl.setAttribute("max-camera-orbit", "180deg 89deg 44%");
      tweenZoom(ZOOMED_ORBIT, "25deg", 900);
    } else {
      tweenZoom(DEFAULT_ORBIT, "18deg", 900);
      setTimeout(function () {
        mvEl.setAttribute("min-camera-orbit", "105deg 89deg 44%");
        mvEl.setAttribute("max-camera-orbit", "180deg 89deg 44%");
      }, 950);
    }
  }

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
