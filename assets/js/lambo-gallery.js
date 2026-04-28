window.LamboGallery = (function () {
  "use strict";

  var GALLERY_CARS = [
    {
      id: "revuelto",
      name: "REVUELTO",
      model: "assets/model/revuelto_3.0tm.glb",
      color: { primary: "#e63946", rim: "#ff6b6b", hueRange: [340, 370] },
      targetSize: 3.8,
      cameraPosition: { x: 3.2, y: 1.5, z: 5.0 },
      cameraTarget: { x: -0.1, y: 0.45, z: 0 }
    },
    {
      id: "centenario-roadster",
      name: "CENTENARIO ROADSTER",
      model: "assets/model/lamborghini_centenario_roadster_sdc.glb",
      color: { primary: "#00b4d8", rim: "#48cae4", hueRange: [190, 210] },
      targetSize: 3.8,
      cameraPosition: { x: -3.5, y: 1.6, z: 4.6 },
      cameraTarget: { x: 0.1, y: 0.4, z: 0 }
    },
    {
      id: "centenario-interior",
      name: "CENTENARIO LP-770",
      model: "assets/model/lamborghini_centenario_lp-770_interior_sdc.glb",
      color: { primary: "#c9a84c", rim: "#e8d590", hueRange: [40, 55] },
      targetSize: 2.8,
      cameraPosition: { x: 1.2, y: 1.1, z: 2.4 },
      cameraTarget: { x: 0, y: 0.7, z: 0 }
    }
  ];

  var scene, camera, renderer, controls;
  var currentIndex = 0;
  var modelCache = {};
  var activeModel = null;
  var disposed = false;
  var animLoopId = null;
  var isMobile = false;

  // Lighting references
  var ambientLight, spotLight, rimLightL, rimLightR, fillLight;

  // Particle overlay
  var particleCanvas, particleCtx;
  var particleAnimId = null;
  var neonStreaks = [], lightLines = [], smokes = [], dust = [];
  var prevAzimuth = 0, prevPolar = 0;
  var spawnCooldown = 0;

  // DOM references
  var section, canvasWrap, bgEl, panelsEl, fillEl;
  var dotEls = [];
  var panelEls = [];

  // Scroll state
  var scrollTriggerInstance = null;

  // Ready promise
  var resolveReady;
  var readyPromise = new Promise(function (resolve) { resolveReady = resolve; });

  // ----------------------------------------------------------------
  // Three.js scene
  // ----------------------------------------------------------------
  function initScene() {
    section = document.getElementById("lamborghini-gallery");
    canvasWrap = document.getElementById("lambo-gallery-canvas");
    bgEl = document.getElementById("lambo-gallery-bg");
    panelsEl = document.getElementById("lambo-gallery-panels");
    fillEl = document.getElementById("lambo-gallery-fill");
    particleCanvas = document.getElementById("lambo-gallery-particles");
    dotEls = Array.prototype.slice.call(document.querySelectorAll(".lambo-gallery__dot"));
    panelEls = Array.prototype.slice.call(document.querySelectorAll(".lambo-gallery__panel"));

    if (!section || !canvasWrap || typeof THREE === "undefined") return false;

    isMobile = window.innerWidth < 768;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(32, window.innerWidth / window.innerHeight, 0.1, 100);

    var preset = getCameraPreset(0);
    camera.position.copy(preset.position);

    renderer = new THREE.WebGLRenderer({ antialias: !isMobile, alpha: true });
    renderer.setPixelRatio(isMobile ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    canvasWrap.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.enableZoom = false;
    controls.autoRotate = false;
    controls.minPolarAngle = 0.55;
    controls.maxPolarAngle = 1.65;
    controls.target.copy(preset.target);
    controls.update();

    setupLighting();
    window.addEventListener("resize", onResize);

    return true;
  }

  function getCameraPreset(index) {
    var car = GALLERY_CARS[index] || GALLERY_CARS[0];
    return {
      position: new THREE.Vector3(car.cameraPosition.x, car.cameraPosition.y, car.cameraPosition.z),
      target: new THREE.Vector3(car.cameraTarget.x, car.cameraTarget.y, car.cameraTarget.z)
    };
  }

  function onResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    if (particleCanvas) {
      var dpr = isMobile ? 1 : (window.devicePixelRatio || 1);
      particleCanvas.width = window.innerWidth * dpr;
      particleCanvas.height = window.innerHeight * dpr;
      if (particleCtx) particleCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }

  // ----------------------------------------------------------------
  // Lighting
  // ----------------------------------------------------------------
  function setupLighting() {
    ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
    fillLight.position.set(4, 6, 5);
    scene.add(fillLight);

    spotLight = new THREE.SpotLight(0xffffff, 0, 20, 0.5, 0.8, 1);
    spotLight.position.set(0, 8, 0);
    scene.add(spotLight);

    if (!isMobile) {
      rimLightL = new THREE.PointLight(0xffffff, 0, 12);
      rimLightL.position.set(-4, 2, 0);
      scene.add(rimLightL);

      rimLightR = new THREE.PointLight(0xffffff, 0, 12);
      rimLightR.position.set(4, 2, -1);
      scene.add(rimLightR);
    }

    applyCarLighting(0);
  }

  function applyCarLighting(index) {
    var car = GALLERY_CARS[index];
    var primaryColor = new THREE.Color(car.color.primary);
    var rimColor = new THREE.Color(car.color.rim);

    ambientLight.color.copy(primaryColor);
    ambientLight.intensity = 0.3;

    spotLight.color.copy(primaryColor);

    if (rimLightL) rimLightL.color.copy(rimColor);
    if (rimLightR) {
      var complementary = new THREE.Color(car.color.rim);
      complementary.offsetHSL(0.1, 0, 0);
      rimLightR.color.copy(complementary);
    }

    if (bgEl) {
      bgEl.style.transition = "background 0.8s ease";
      bgEl.style.background = "radial-gradient(ellipse at 50% 60%, " + car.color.primary + "0F, transparent 50%)";
    }
  }

  function tweenLightsOn() {
    gsap.to(spotLight, { intensity: 2, duration: 0.8, ease: "power2.out" });
    if (rimLightL) gsap.to(rimLightL, { intensity: 1.5, duration: 0.8, ease: "power2.out" });
    if (rimLightR) gsap.to(rimLightR, { intensity: 1.0, duration: 0.8, ease: "power2.out" });
  }

  function tweenLightsOff() {
    gsap.to(spotLight, { intensity: 0, duration: 0.6, ease: "power2.in" });
    if (rimLightL) gsap.to(rimLightL, { intensity: 0, duration: 0.6, ease: "power2.in" });
    if (rimLightR) gsap.to(rimLightR, { intensity: 0, duration: 0.6, ease: "power2.in" });
  }

  // ----------------------------------------------------------------
  // Glossy hover
  // ----------------------------------------------------------------
  var originalMaterials = [];

  function storeOriginalMaterials(root) {
    originalMaterials = [];
    root.traverse(function (node) {
      if (!node.isMesh || !node.material) return;
      var mats = Array.isArray(node.material) ? node.material : [node.material];
      mats.forEach(function (mat) {
        if (mat && typeof mat.roughness === "number") {
          originalMaterials.push({ mat: mat, roughness: mat.roughness, metalness: mat.metalness || 0 });
        }
      });
    });
  }

  function tweenGlossyOn() {
    originalMaterials.forEach(function (entry) {
      gsap.to(entry.mat, { roughness: Math.max(0.1, entry.roughness - 0.3), metalness: Math.min(1, entry.metalness + 0.35), duration: 0.8, ease: "power2.out" });
    });
  }

  function tweenGlossyOff() {
    originalMaterials.forEach(function (entry) {
      gsap.to(entry.mat, { roughness: entry.roughness, metalness: entry.metalness, duration: 0.6, ease: "power2.in" });
    });
  }

  // ----------------------------------------------------------------
  // Model loading
  // ----------------------------------------------------------------
  function normalizeModel(root, index) {
    var car = GALLERY_CARS[index];
    var box = new THREE.Box3().setFromObject(root);
    var size = box.getSize(new THREE.Vector3());
    var widthDim = Math.max(size.x, size.z);
    if (widthDim > 0) root.scale.setScalar(car.targetSize / widthDim);
    box.setFromObject(root);
    var center = box.getCenter(new THREE.Vector3());
    root.position.sub(center);
    root.position.y += 0.35;
  }

  function loadModel(index, callback) {
    if (modelCache[index]) {
      callback(modelCache[index]);
      return;
    }
    var loader = new THREE.GLTFLoader();
    loader.load(
      GALLERY_CARS[index].model,
      function (gltf) {
        var root = gltf.scene;
        normalizeModel(root, index);
        modelCache[index] = root;
        callback(root);
      },
      undefined,
      function () { callback(null); }
    );
  }

  function preloadAll(callback) {
    if (isMobile) {
      loadModel(0, function () { callback(); });
      return;
    }
    var remaining = GALLERY_CARS.length;
    GALLERY_CARS.forEach(function (_, i) {
      loadModel(i, function () {
        remaining--;
        if (remaining === 0) callback();
      });
    });
  }

  function showModel(index) {
    if (index === currentIndex && activeModel) return;
    if (activeModel) {
      scene.remove(activeModel);
      activeModel = null;
    }
    var model = modelCache[index];
    if (!model) return;
    var clone = model.clone(true);
    scene.add(clone);
    activeModel = clone;
    storeOriginalMaterials(clone);
    applyCarLighting(index);
    currentIndex = index;
  }

  // ----------------------------------------------------------------
  // Particle overlay (desktop only)
  // ----------------------------------------------------------------
  function initParticles() {
    if (isMobile || !particleCanvas) return;
    var dpr = window.devicePixelRatio || 1;
    particleCanvas.width = window.innerWidth * dpr;
    particleCanvas.height = window.innerHeight * dpr;
    particleCtx = particleCanvas.getContext("2d");
    particleCtx.scale(dpr, dpr);

    if (controls) {
      prevAzimuth = controls.getAzimuthalAngle();
      prevPolar = controls.getPolarAngle();
    }

    animateParticles();
  }

  function spawnParticles() {
    if (!controls) return;

    var azimuth = controls.getAzimuthalAngle();
    var polar = controls.getPolarAngle();
    var dAz = azimuth - prevAzimuth;
    var dPo = polar - prevPolar;
    prevAzimuth = azimuth;
    prevPolar = polar;

    var rotSpeed = Math.sqrt(dAz * dAz + dPo * dPo);
    if (rotSpeed < 0.005) return;

    if (spawnCooldown > 0) { spawnCooldown--; return; }
    spawnCooldown = 3;

    var w = window.innerWidth, h = window.innerHeight;
    var cx = w * 0.5, cy = h * 0.45;
    var car = GALLERY_CARS[currentIndex];
    var hueMin = car.color.hueRange[0];
    var hueMax = car.color.hueRange[1];
    var dir = dAz > 0 ? 1 : -1;

    var edgeX = dir > 0 ? cx + w * 0.18 : cx - w * 0.18;
    var baseAngle = dir > 0 ? 0 : Math.PI;

    neonStreaks.push({
      x: edgeX + (Math.random() - 0.5) * 60,
      y: cy + (Math.random() - 0.5) * h * 0.35,
      vx: Math.cos(baseAngle + (Math.random() - 0.5) * 0.4) * (2 + Math.random() * 2.5),
      vy: (Math.random() - 0.5) * 1.2,
      life: 1, decay: 0.012 + Math.random() * 0.006,
      len: 25 + Math.random() * 30,
      width: Math.random() * 2 + 0.8,
      hue: hueMin + Math.random() * (hueMax - hueMin)
    });

    if (Math.random() > 0.5) {
      lightLines.push({
        x: edgeX + (Math.random() - 0.5) * 80,
        y: cy + (Math.random() - 0.5) * h * 0.3,
        vx: Math.cos(baseAngle + (Math.random() - 0.5) * 0.3) * (1.5 + Math.random() * 1.5),
        vy: (Math.random() - 0.5) * 0.8,
        life: 1, decay: 0.018 + Math.random() * 0.01,
        len: 15 + Math.random() * 18,
        width: Math.random() * 1 + 0.3
      });
    }

    if (rotSpeed > 0.02 && Math.random() > 0.7) {
      smokes.push({
        x: edgeX + (Math.random() - 0.5) * 40,
        y: cy + h * 0.12 + Math.random() * 30,
        vx: dir * (0.3 + Math.random() * 0.4),
        vy: -0.15 - Math.random() * 0.2,
        size: Math.random() * 15 + 6,
        life: 1, decay: 0.008 + Math.random() * 0.004,
        rot: Math.random() * Math.PI * 2,
        rotSpd: (Math.random() - 0.5) * 0.008
      });
    }

    if (rotSpeed > 0.015 && Math.random() > 0.75) {
      dust.push({
        x: cx + (Math.random() - 0.5) * w * 0.4,
        y: h - 80 + Math.random() * 15,
        vx: (Math.random() - 0.5) * 0.5,
        vy: -Math.random() * 0.3 - 0.1,
        size: Math.random() * 1.5 + 0.3,
        life: 1, decay: 0.005 + Math.random() * 0.003
      });
    }

    // Hard cap
    var total = neonStreaks.length + lightLines.length + smokes.length + dust.length;
    if (total > 60) {
      var excess = total - 60;
      var removeDust = Math.min(excess, dust.length);
      dust.splice(0, removeDust);
      excess -= removeDust;
      if (excess > 0) smokes.splice(0, Math.min(excess, smokes.length));
    }
  }

  function renderParticles() {
    var w = window.innerWidth, h = window.innerHeight;
    particleCtx.clearRect(0, 0, w, h);

    // Smoke wisps
    for (var si = smokes.length - 1; si >= 0; si--) {
      var s = smokes[si];
      s.x += s.vx; s.y += s.vy; s.size += 0.25; s.life -= s.decay; s.rot += s.rotSpd;
      if (s.life <= 0) { smokes.splice(si, 1); continue; }
      particleCtx.save();
      particleCtx.translate(s.x, s.y);
      particleCtx.rotate(s.rot);
      particleCtx.globalAlpha = s.life * 0.14;
      var sg = particleCtx.createRadialGradient(0, 0, 0, 0, 0, s.size);
      sg.addColorStop(0, "rgba(190,185,180,0.25)");
      sg.addColorStop(0.4, "rgba(150,148,145,0.12)");
      sg.addColorStop(1, "rgba(100,100,100,0)");
      particleCtx.fillStyle = sg;
      particleCtx.beginPath();
      particleCtx.ellipse(0, 0, s.size, s.size * 0.5, 0, 0, Math.PI * 2);
      particleCtx.fill();
      particleCtx.restore();
    }

    // Neon streaks
    for (var ni = neonStreaks.length - 1; ni >= 0; ni--) {
      var n = neonStreaks[ni];
      n.x += n.vx; n.y += n.vy; n.vx *= 0.96; n.vy *= 0.96; n.life -= n.decay;
      if (n.life <= 0) { neonStreaks.splice(ni, 1); continue; }
      var na = Math.atan2(n.vy, n.vx);
      var nSpd = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
      var nLen = n.len * n.life * (nSpd / 3);
      particleCtx.save();
      particleCtx.globalAlpha = n.life * 0.75;
      particleCtx.strokeStyle = "hsla(" + n.hue + ", 92%, 58%, " + (n.life * 0.85) + ")";
      particleCtx.lineWidth = n.width * n.life;
      particleCtx.lineCap = "round";
      particleCtx.shadowColor = "hsla(" + n.hue + ", 100%, 50%, 0.5)";
      particleCtx.shadowBlur = 10;
      particleCtx.beginPath();
      particleCtx.moveTo(n.x, n.y);
      particleCtx.lineTo(n.x - Math.cos(na) * nLen, n.y - Math.sin(na) * nLen);
      particleCtx.stroke();
      particleCtx.restore();
    }

    // White light lines
    for (var li = lightLines.length - 1; li >= 0; li--) {
      var l = lightLines[li];
      l.x += l.vx; l.y += l.vy; l.vx *= 0.955; l.vy *= 0.955; l.life -= l.decay;
      if (l.life <= 0) { lightLines.splice(li, 1); continue; }
      var la = Math.atan2(l.vy, l.vx);
      var lSpd2 = Math.sqrt(l.vx * l.vx + l.vy * l.vy);
      var lLen = l.len * l.life * (lSpd2 / 2);
      particleCtx.save();
      particleCtx.globalAlpha = l.life * 0.5;
      particleCtx.strokeStyle = "rgba(235,230,225," + (l.life * 0.6) + ")";
      particleCtx.lineWidth = l.width * l.life;
      particleCtx.lineCap = "round";
      particleCtx.shadowColor = "rgba(255,255,255,0.25)";
      particleCtx.shadowBlur = 5;
      particleCtx.beginPath();
      particleCtx.moveTo(l.x, l.y);
      particleCtx.lineTo(l.x - Math.cos(la) * lLen, l.y - Math.sin(la) * lLen);
      particleCtx.stroke();
      particleCtx.restore();
    }

    // Road dust
    for (var di = dust.length - 1; di >= 0; di--) {
      var d = dust[di];
      d.x += d.vx; d.y += d.vy; d.life -= d.decay;
      if (d.life <= 0) { dust.splice(di, 1); continue; }
      particleCtx.globalAlpha = d.life * 0.4;
      particleCtx.fillStyle = "rgba(215,200,175," + (d.life * 0.5) + ")";
      particleCtx.beginPath();
      particleCtx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
      particleCtx.fill();
    }

    particleCtx.globalAlpha = 1;
  }

  function animateParticles() {
    spawnParticles();
    renderParticles();
    particleAnimId = requestAnimationFrame(animateParticles);
  }

  // ----------------------------------------------------------------
  // Hover handlers (spotlight + glossy + particles)
  // ----------------------------------------------------------------
  function onSectionMouseEnter() {
    tweenLightsOn();
    tweenGlossyOn();
  }

  function onSectionMouseLeave() {
    tweenLightsOff();
    tweenGlossyOff();
  }

  function bindHoverEvents() {
    if (isMobile) {
      section.addEventListener("click", function () {
        if (spotLight.intensity > 0.5) {
          tweenLightsOff();
        } else {
          tweenLightsOn();
        }
      });
      return;
    }
    section.addEventListener("mouseenter", onSectionMouseEnter);
    section.addEventListener("mouseleave", onSectionMouseLeave);
  }

  // ----------------------------------------------------------------
  // GSAP ScrollTrigger — horizontal scroll + parallax
  // ----------------------------------------------------------------
  function initScrollTrigger() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);
    if (typeof ScrollToPlugin !== "undefined") gsap.registerPlugin(ScrollToPlugin);

    var trackWidth = section.scrollWidth;

    scrollTriggerInstance = ScrollTrigger.create({
      trigger: section,
      pin: true,
      scrub: 1,
      end: function () { return "+=" + (trackWidth - window.innerWidth); },
      onUpdate: function (self) {
        var progress = self.progress;

        // Move track horizontally
        gsap.set(".lambo-gallery__track", { x: -(trackWidth - window.innerWidth) * progress });

        // Parallax: background at 0.6x
        gsap.set(bgEl, { x: (trackWidth - window.innerWidth) * progress * 0.4 });

        // Parallax: text panels at 1.3x
        gsap.set(panelsEl, { x: -(trackWidth - window.innerWidth) * progress * 0.3 });

        // Progress bar
        if (fillEl) fillEl.style.width = (progress * 100) + "%";

        // Active car index
        var newIndex = Math.min(Math.floor(progress * GALLERY_CARS.length), GALLERY_CARS.length - 1);
        if (newIndex !== currentIndex) {
          showModel(newIndex);
          var preset = getCameraPreset(newIndex);
          gsap.to(camera.position, { x: preset.position.x, y: preset.position.y, z: preset.position.z, duration: 0.8, ease: "power2.inOut" });
          gsap.to(controls.target, { x: preset.target.x, y: preset.target.y, z: preset.target.z, duration: 0.8, ease: "power2.inOut" });
        }

        // Dots
        dotEls.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === newIndex);
        });
      }
    });

    // Dot click navigation
    dotEls.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var index = parseInt(dot.dataset.index, 10);
        var targetProgress = index / (GALLERY_CARS.length - 1);
        var scrollTo = scrollTriggerInstance.start + (scrollTriggerInstance.end - scrollTriggerInstance.start) * targetProgress;
        gsap.to(window, { scrollTo: scrollTo, duration: 1, ease: "power2.inOut" });
      });
    });
  }

  // ----------------------------------------------------------------
  // Renderer lifecycle — managed by external ScrollTrigger in home.js
  // ----------------------------------------------------------------
  function disposeGallery() {
    if (disposed) return;
    disposed = true;

    if (animLoopId) { cancelAnimationFrame(animLoopId); animLoopId = null; }
    if (particleAnimId) { cancelAnimationFrame(particleAnimId); particleAnimId = null; }

    window.removeEventListener("resize", onResize);
    section.removeEventListener("mouseenter", onSectionMouseEnter);
    section.removeEventListener("mouseleave", onSectionMouseLeave);

    if (controls) { controls.dispose(); controls = null; }
    if (renderer) {
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
      renderer.dispose(); renderer = null;
    }
    if (activeModel) { scene.remove(activeModel); activeModel = null; }

    scene = null; camera = null;
    neonStreaks = []; lightLines = []; smokes = []; dust = [];
  }

  function reinitGallery() {
    if (!disposed) return;
    disposed = false;
    initScene();
    if (modelCache[currentIndex]) {
      showModel(currentIndex);
    }
    if (!isMobile) initParticles();
    bindHoverEvents();
    animate();
  }

  // ----------------------------------------------------------------
  // Render loop
  // ----------------------------------------------------------------
  function animate() {
    if (!renderer || !scene || !camera || disposed) return;
    animLoopId = requestAnimationFrame(animate);
    if (controls) controls.update();
    renderer.render(scene, camera);
  }

  // ----------------------------------------------------------------
  // Public init
  // ----------------------------------------------------------------
  function init() {
    if (!initScene()) {
      resolveReady(false);
      return;
    }

    preloadAll(function () {
      showModel(0);
      if (!isMobile) initParticles();
      bindHoverEvents();
      initScrollTrigger();
      animate();
      resolveReady(true);
    });
  }

  return {
    init: init,
    whenReady: function () { return readyPromise; },
    dispose: disposeGallery,
    reinit: reinitGallery,
    __debug_camera: function () {
      if (!camera || !controls) return null;
      return {
        position: { x: +camera.position.x.toFixed(2), y: +camera.position.y.toFixed(2), z: +camera.position.z.toFixed(2) },
        target: { x: +controls.target.x.toFixed(2), y: +controls.target.y.toFixed(2), z: +controls.target.z.toFixed(2) }
      };
    }
  };
})();
