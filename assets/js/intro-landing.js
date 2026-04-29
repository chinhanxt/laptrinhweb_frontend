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
  var DEFAULT_ORBIT = "150deg 89deg 44%";
  var ZOOMED_ORBIT = "150deg 89deg 25%";

  var zoomTransitioning = false;
  var charSplitCache = {};
  var particleCanvas = null;
  var particleCtx = null;
  var particles = [];
  var particleAnimId = null;
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

    initZoomNavigation();
    setupScrollAnimation();
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

  /* ----------------------------------------------------------
     TEXT REVEAL (initial page load)
     ---------------------------------------------------------- */
  function animateTextReveal() {
    if (typeof gsap === "undefined") return;

    var tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.to(".intro-landing__eyebrow", { opacity: 1, y: 0, duration: 0.8 }, 0.3)
      .to(".intro-landing__title", { opacity: 1, y: 0, duration: 1, ease: "power4.out" }, 0.6)
      .to(".intro-landing__tagline", { opacity: 1, y: 0, duration: 0.8 }, 1.0)
      .to(".intro-landing__line", { scaleX: 1, opacity: 1, duration: 0.6 }, 1.2)
      .to(".intro-landing__scroll", { opacity: 1, y: 0, duration: 0.6 }, 1.5);
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
    gsap.set([eyebrow, title, tagline], {
      clearProps: "opacity,visibility,transform,filter,display"
    });
    gsap.set([eyebrow, title, tagline], {
      opacity: 0,
      visibility: "visible",
      y: 20,
      scale: 1
    });
    gsap.set(line, { opacity: 0, scaleX: 0, visibility: "visible" });
    gsap.set(scroll, { opacity: 0, y: 15, visibility: "visible" });

    var tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.to(eyebrow, { opacity: 1, y: 0, duration: 0.7 }, 0.1)
      .to(title, { opacity: 1, y: 0, duration: 0.9, ease: "power4.out" }, 0.25)
      .to(tagline, { opacity: 1, y: 0, duration: 0.7 }, 0.45)
      .to(line, { scaleX: 1, opacity: 1, duration: 0.5 }, 0.6)
      .to(scroll, { opacity: 1, y: 0, duration: 0.5 }, 0.75);
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
