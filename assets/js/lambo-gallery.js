window.LamboGallery = (function () {
  "use strict";

  var GALLERY_CARS = [
    {
      id: "centenario-roadster",
      name: "CENTENARIO ROADSTER",
      model: "assets/model/lamborghini_centenario_roadster_sdc.glb",
      color: { primary: "#7b5ea7", rim: "#9d8ec9", hueRange: [260, 290] },
      targetSize: 3.8,
      cameraPosition: { x: -3.5, y: 1.6, z: 4.6 },
      cameraTarget: { x: 0.1, y: 0.4, z: 0 }
    },
    {
      id: "centenario-interior",
      name: "CENTENARIO LP-770",
      model: "assets/model/lamborghini_centenario_lp-770_interior_sdc.glb",
      color: { primary: "#c9a84c", rim: "#e8d590", hueRange: [40, 55] },
      targetSize: 3.8,
      cameraPosition: { x: -3.5, y: 1.6, z: 4.6 },
      cameraTarget: { x: 0.1, y: 0.4, z: 0 }
    }
  ];

  var scene, camera, renderer, controls;
  var currentIndex = 0;
  var modelCache = {};
  var animCache = {};
  var activeModel = null;
  var hitBox = null;
  var doorHitBoxL = null;
  var doorHitBoxR = null;
  var activeMixer = null;
  var activeActions = [];
  var doorOpen = false;
  var mixerClock = null;
  var disposed = false;
  var animLoopId = null;
  var isMobile = false;

  // Lighting references
  var ambientLight, spotLight, rimLightL, rimLightR, fillLight;

  // Particle overlay (4K canvas)
  var particleCanvas, particleCtx;
  var particleAnimId = null;
  var neonStreaks = [], lightLines = [], smokes = [], dust = [], windStreaks = [];
  var prevAzimuth = 0, prevPolar = 0;
  var spawnCooldown = 0;

  // DOM references
  var section, canvasWrap, bgEl, panelsEl;
  var dotEls = [];
  var panelEls = [];
  var prevBtn, nextBtn;
  var transitioning = false;

  // Ready promise
  var resolveReady;
  var readySettled = false;
  var initStarted = false;
  var readyPromise = new Promise(function (resolve) { resolveReady = resolve; });

  function settleReady(value) {
    if (readySettled) return;
    readySettled = true;
    resolveReady(value);
  }

  // ----------------------------------------------------------------
  // Three.js scene
  // ----------------------------------------------------------------
  function initScene() {
    section = document.getElementById("lamborghini-gallery");
    canvasWrap = document.getElementById("lambo-gallery-canvas");
    bgEl = document.getElementById("lambo-gallery-bg");
    panelsEl = document.getElementById("lambo-gallery-panels");
    particleCanvas = document.getElementById("lambo-gallery-particles");
    prevBtn = document.getElementById("lambo-gallery-prev");
    nextBtn = document.getElementById("lambo-gallery-next");
    dotEls = Array.prototype.slice.call(document.querySelectorAll(".lambo-gallery__dot"));
    panelEls = Array.prototype.slice.call(document.querySelectorAll(".lambo-gallery__panel"));

    if (!section || !canvasWrap || typeof THREE === "undefined") return false;

    isMobile = window.innerWidth < 768;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(32, window.innerWidth / window.innerHeight, 0.1, 100);

    var preset = getCameraPreset(0);
    camera.position.copy(preset.position);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.6;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    canvasWrap.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.enableZoom = false;
    controls.autoRotate = false;
    controls.minPolarAngle = 0.55;
    controls.maxPolarAngle = 1.65;
    controls.enabled = false;
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

  function updateLocalLoadingText(text) {
    var loadingMessage = document.getElementById("lambo-gallery-loading");
    if (!loadingMessage) return;
    var textEl = loadingMessage.querySelector("span:last-child");
    if (textEl) textEl.textContent = text;
  }

  function setLocalLoading(isLoading) {
    if (!section) return;
    section.classList.toggle("is-loading", isLoading);
    if (isLoading) {
      section.classList.remove("is-ready");
      section.classList.remove("is-error");
      updateLocalLoadingText("Đang chuẩn bị trải nghiệm Lamborghini");
    }
  }

  function markGalleryReady() {
    if (!section) return;
    section.classList.remove("is-loading");
    section.classList.remove("is-error");
    section.classList.add("is-ready");
  }

  function markGalleryUnavailable() {
    if (!section) return;
    section.classList.remove("is-loading");
    section.classList.remove("is-ready");
    section.classList.add("is-error");
    updateLocalLoadingText("Không thể tải trải nghiệm Lamborghini");
  }

  function markGalleryModelLoadFailed() {
    if (!section) return;
    section.classList.remove("is-loading");
    section.classList.add("is-ready");
    section.classList.add("is-error");
    updateLocalLoadingText("Không thể tải mẫu Lamborghini này");
  }

  function onResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    if (particleCanvas && particleCtx) {
      var dpr = Math.min(window.devicePixelRatio || 1, 3);
      particleCanvas.width = window.innerWidth * dpr;
      particleCanvas.height = window.innerHeight * dpr;
      particleCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }

  // ----------------------------------------------------------------
  // Lighting
  // ----------------------------------------------------------------
  var fillLight2, hemiLight, keyLight, studioEnvMap;

  function generateStudioEnv() {
    var pmremGen = new THREE.PMREMGenerator(renderer);
    pmremGen.compileEquirectangularShader();
    var envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0x111115);
    var topPanel = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 12),
      new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
    );
    topPanel.position.set(0, 5, 0);
    topPanel.rotation.x = Math.PI / 2;
    envScene.add(topPanel);
    var frontPanel = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 4),
      new THREE.MeshBasicMaterial({ color: 0x888899, side: THREE.DoubleSide })
    );
    frontPanel.position.set(0, 1, 6);
    envScene.add(frontPanel);
    var leftPanel = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 4),
      new THREE.MeshBasicMaterial({ color: 0x555566, side: THREE.DoubleSide })
    );
    leftPanel.position.set(-6, 1, 0);
    leftPanel.rotation.y = Math.PI / 2;
    envScene.add(leftPanel);
    var rightPanel = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 4),
      new THREE.MeshBasicMaterial({ color: 0x555566, side: THREE.DoubleSide })
    );
    rightPanel.position.set(6, 1, 0);
    rightPanel.rotation.y = -Math.PI / 2;
    envScene.add(rightPanel);
    studioEnvMap = pmremGen.fromScene(envScene, 0.04).texture;
    pmremGen.dispose();
    envScene.traverse(function (obj) {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
    });
  }

  function setupLighting() {
    ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    hemiLight = new THREE.HemisphereLight(0xc8d0e0, 0x2a2a3a, 0.6);
    scene.add(hemiLight);

    fillLight = new THREE.DirectionalLight(0xffffff, 1.2);
    fillLight.position.set(4, 6, 5);
    scene.add(fillLight);

    fillLight2 = new THREE.DirectionalLight(0xeeeeff, 0.7);
    fillLight2.position.set(-4, 4, -3);
    scene.add(fillLight2);

    keyLight = new THREE.DirectionalLight(0xffffff, 0);
    keyLight.position.set(0, 3, 6);
    scene.add(keyLight);

    spotLight = new THREE.SpotLight(0xffffff, 0.8, 20, 0.5, 0.8, 1);
    spotLight.position.set(0, 8, 0);
    scene.add(spotLight);

    if (!isMobile) {
      rimLightL = new THREE.PointLight(0xffffff, 0.6, 12);
      rimLightL.position.set(-4, 2, 0);
      scene.add(rimLightL);

      rimLightR = new THREE.PointLight(0xffffff, 0.5, 12);
      rimLightR.position.set(4, 2, -1);
      scene.add(rimLightR);
    }

    generateStudioEnv();
    applyCarLighting(0);
  }

  function tintWhite(color, blend) {
    var white = new THREE.Color(0xffffff);
    return white.lerp(color, blend);
  }

  function applyCarLighting(index) {
    var car = GALLERY_CARS[index];
    var primaryColor = new THREE.Color(car.color.primary);
    var rimColor = new THREE.Color(car.color.rim);

    ambientLight.color.copy(tintWhite(primaryColor, 0.12));
    ambientLight.intensity = 1.2;

    spotLight.color.set(0xffffff);
    spotLight.intensity = 0.8;

    if (rimLightL) rimLightL.color.copy(tintWhite(rimColor, 0.3));
    if (rimLightR) {
      var complementary = new THREE.Color(car.color.rim);
      complementary.offsetHSL(0.1, 0, 0);
      rimLightR.color.copy(tintWhite(complementary, 0.3));
    }

    if (bgEl) {
      bgEl.style.transition = "background 0.8s ease";
      bgEl.style.background = "radial-gradient(ellipse at 50% 60%, " + car.color.primary + "30 0%, " + car.color.primary + "12 30%, transparent 60%)";
    }
  }

  function tweenLightsOn() {
    gsap.to(spotLight, { intensity: 4, duration: 0.8, ease: "power2.out" });
    gsap.to(keyLight, { intensity: 1.5, duration: 0.8, ease: "power2.out" });
    gsap.to(fillLight, { intensity: 1.8, duration: 0.8, ease: "power2.out" });
    gsap.to(fillLight2, { intensity: 1.2, duration: 0.8, ease: "power2.out" });
    gsap.to(ambientLight, { intensity: 1.6, duration: 0.8, ease: "power2.out" });
    if (rimLightL) gsap.to(rimLightL, { intensity: 2.5, duration: 0.8, ease: "power2.out" });
    if (rimLightR) gsap.to(rimLightR, { intensity: 2.0, duration: 0.8, ease: "power2.out" });
    if (renderer) {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 3));
      gsap.to(renderer, { toneMappingExposure: 2.0, duration: 0.8, ease: "power2.out" });
    }
  }

  function tweenLightsOff() {
    gsap.to(spotLight, { intensity: 0.8, duration: 0.6, ease: "power2.in" });
    gsap.to(keyLight, { intensity: 0, duration: 0.6, ease: "power2.in" });
    gsap.to(fillLight, { intensity: 1.2, duration: 0.6, ease: "power2.in" });
    gsap.to(fillLight2, { intensity: 0.7, duration: 0.6, ease: "power2.in" });
    gsap.to(ambientLight, { intensity: 1.2, duration: 0.6, ease: "power2.in" });
    if (rimLightL) gsap.to(rimLightL, { intensity: 0.6, duration: 0.6, ease: "power2.in" });
    if (rimLightR) gsap.to(rimLightR, { intensity: 0.5, duration: 0.6, ease: "power2.in" });
    if (renderer) {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      gsap.to(renderer, { toneMappingExposure: 1.6, duration: 0.6, ease: "power2.in" });
    }
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
          originalMaterials.push({
            mat: mat,
            roughness: mat.roughness,
            metalness: mat.metalness || 0,
            envMapIntensity: mat.envMapIntensity || 0.5
          });
          if (studioEnvMap && !mat.envMap) {
            mat.envMap = studioEnvMap;
            mat.envMapIntensity = 0.5;
            mat.needsUpdate = true;
          }
        }
      });
    });
  }

  function tweenGlossyOn() {
    originalMaterials.forEach(function (entry) {
      gsap.to(entry.mat, {
        roughness: Math.max(0.05, entry.roughness * 0.3),
        metalness: Math.min(1, entry.metalness + 0.5),
        envMapIntensity: 1.8,
        duration: 0.8,
        ease: "power2.out"
      });
      if (studioEnvMap) entry.mat.envMap = studioEnvMap;
      entry.mat.needsUpdate = true;
    });
  }

  function tweenGlossyOff() {
    originalMaterials.forEach(function (entry) {
      gsap.to(entry.mat, {
        roughness: entry.roughness,
        metalness: entry.metalness,
        envMapIntensity: entry.envMapIntensity || 0.5,
        duration: 0.6,
        ease: "power2.in"
      });
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
    root.rotation.y = car.modelRotationY || 0;
    if (car.modelOffset) {
      root.position.x += car.modelOffset.x || 0;
      root.position.y += car.modelOffset.y || 0;
      root.position.z += car.modelOffset.z || 0;
    }
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
        animCache[index] = gltf.animations || [];
        callback(root);
      },
      undefined,
      function () { callback(null); }
    );
  }

  function preloadRemainingModelsInBackground() {
    GALLERY_CARS.forEach(function (_, i) {
      if (i === currentIndex || modelCache[i]) return;
      loadModel(i, function () {});
    });
  }

  function showModel(index) {
    if (index === currentIndex && activeModel) return;
    if (activeModel) {
      scene.remove(activeModel);
      activeModel = null;
    }
    [hitBox, doorHitBoxL, doorHitBoxR].forEach(function (b) {
      if (b) scene.remove(b);
    });
    hitBox = doorHitBoxL = doorHitBoxR = null;
    if (activeMixer) {
      activeMixer.stopAllAction();
      activeMixer = null;
    }
    activeActions = [];
    doorOpen = false;

    var model = modelCache[index];
    if (!model) return;
    var clone = model.clone(true);
    clone.traverse(function (node) {
      if (!node.isMesh || !node.material) return;
      if (Array.isArray(node.material)) {
        node.material = node.material.map(function (m) { return m.clone(); });
      } else {
        node.material = node.material.clone();
      }
    });
    scene.add(clone);
    activeModel = clone;

    var box = new THREE.Box3();
    clone.traverse(function (node) {
      if (!node.isMesh || !node.visible || !node.geometry) return;
      var mat = Array.isArray(node.material) ? node.material[0] : node.material;
      if (mat && mat.visible === false) return;
      var name = (node.name || "").toLowerCase();
      if (/ground|floor|plane|env|sky|shadow|backdrop/i.test(name)) return;
      node.updateWorldMatrix(true, false);
      var geomBox = node.geometry.boundingBox;
      if (!geomBox) node.geometry.computeBoundingBox();
      geomBox = node.geometry.boundingBox;
      if (geomBox) {
        var worldBox = geomBox.clone().applyMatrix4(node.matrixWorld);
        box.union(worldBox);
      }
    });
    if (box.isEmpty()) box.setFromObject(clone);
    var size = box.getSize(new THREE.Vector3());
    var center = box.getCenter(new THREE.Vector3());
    var invisMat = new THREE.MeshBasicMaterial({ visible: false });

    hitBox = new THREE.Mesh(new THREE.BoxGeometry(size.x * 0.85, size.y * 0.9, size.z * 0.85), invisMat);
    hitBox.position.copy(center);
    scene.add(hitBox);

    doorHitBoxL = new THREE.Mesh(new THREE.BoxGeometry(size.x * 0.12, size.y * 0.55, size.z * 0.4), invisMat);
    doorHitBoxL.position.set(center.x - size.x * 0.42, center.y + size.y * 0.05, center.z);
    scene.add(doorHitBoxL);

    doorHitBoxR = new THREE.Mesh(new THREE.BoxGeometry(size.x * 0.12, size.y * 0.55, size.z * 0.4), invisMat);
    doorHitBoxR.position.set(center.x + size.x * 0.42, center.y + size.y * 0.05, center.z);
    scene.add(doorHitBoxR);

    storeOriginalMaterials(clone);
    applyCarLighting(index);
    currentIndex = index;

    var clips = animCache[index];
    if (clips && clips.length > 0) {
      activeMixer = new THREE.AnimationMixer(clone);
      if (!mixerClock) mixerClock = new THREE.Clock();
      clips.forEach(function (clip) {
        var action = activeMixer.clipAction(clip);
        action.clampWhenFinished = true;
        action.loop = THREE.LoopOnce;
        action.paused = true;
        activeActions.push(action);
      });
    }
  }

  function toggleDoorAnimation() {
    if (!activeMixer || activeActions.length === 0) return;
    activeActions.forEach(function (action) {
      if (!doorOpen) {
        action.timeScale = 2.5;
        action.paused = false;
        if (action.time === 0) action.reset();
        action.play();
      } else {
        action.timeScale = -2.5;
        action.paused = false;
        action.play();
      }
    });
    doorOpen = !doorOpen;
  }

  // ----------------------------------------------------------------
  // Particle overlay — 4K Canvas 2D (high-DPI crisp rendering)
  // ----------------------------------------------------------------
  function initParticles() {
    if (isMobile || !particleCanvas) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 3);
    particleCanvas.width = window.innerWidth * dpr;
    particleCanvas.height = window.innerHeight * dpr;
    particleCtx = particleCanvas.getContext("2d", { alpha: true });
    particleCtx.scale(dpr, dpr);
    particleCtx.imageSmoothingEnabled = true;
    particleCtx.imageSmoothingQuality = "high";

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
    if (rotSpeed < 0.003) return;

    if (spawnCooldown > 0) { spawnCooldown--; return; }
    spawnCooldown = 1;

    var w = window.innerWidth, h = window.innerHeight;
    var cx = w * 0.5, cy = h * 0.45;
    var car = GALLERY_CARS[currentIndex];
    var hueMin = car.color.hueRange[0];
    var hueMax = car.color.hueRange[1];
    var dir = dAz > 0 ? 1 : -1;
    var intensity = Math.min(rotSpeed / 0.02, 1);
    var streakCount = Math.floor(1 + intensity * 3);

    var edgeX = dir > 0 ? cx + w * 0.18 : cx - w * 0.18;
    var baseAngle = dir > 0 ? 0 : Math.PI;

    for (var si = 0; si < streakCount; si++) {
      neonStreaks.push({
        x: edgeX + (Math.random() - 0.5) * 120,
        y: cy + (Math.random() - 0.5) * h * 0.45,
        vx: Math.cos(baseAngle + (Math.random() - 0.5) * 0.5) * (4 + Math.random() * 5),
        vy: (Math.random() - 0.5) * 1.8,
        life: 1, decay: 0.008 + Math.random() * 0.004,
        len: 40 + Math.random() * 60,
        width: Math.random() * 2.5 + 0.8,
        hue: hueMin + Math.random() * (hueMax - hueMin)
      });
    }

    var lineCount = Math.floor(1 + intensity * 3);
    for (var li = 0; li < lineCount; li++) {
      lightLines.push({
        x: edgeX + (Math.random() - 0.5) * 100,
        y: cy + (Math.random() - 0.5) * h * 0.4,
        vx: Math.cos(baseAngle + (Math.random() - 0.5) * 0.3) * (2 + Math.random() * 2),
        vy: (Math.random() - 0.5) * 1.0,
        life: 1, decay: 0.015 + Math.random() * 0.008,
        len: 18 + Math.random() * 25,
        width: Math.random() * 1.2 + 0.3
      });
    }

    var windCount = Math.floor(1 + intensity * 5);
    for (var wi = 0; wi < windCount; wi++) {
      windStreaks.push({
        x: dir > 0 ? -20 : w + 20,
        y: cy * 0.4 + Math.random() * h * 0.55,
        vx: dir * (6 + Math.random() * 8),
        vy: (Math.random() - 0.5) * 0.6,
        life: 1, decay: 0.008 + Math.random() * 0.006,
        len: 60 + Math.random() * 100,
        width: Math.random() * 0.8 + 0.2
      });
    }

    if (rotSpeed > 0.006) {
      var smokeCount = Math.floor(2 + intensity * 4);
      for (var smi = 0; smi < smokeCount; smi++) {
        smokes.push({
          x: edgeX + (Math.random() - 0.5) * 100,
          y: cy + h * 0.08 + Math.random() * h * 0.25,
          vx: dir * (0.5 + Math.random() * 0.8),
          vy: -0.25 - Math.random() * 0.35,
          size: Math.random() * 22 + 10,
          life: 1, decay: 0.004 + Math.random() * 0.003,
          rot: Math.random() * Math.PI * 2,
          rotSpd: (Math.random() - 0.5) * 0.01
        });
      }
    }

    if (rotSpeed > 0.008) {
      var dustCount = Math.floor(2 + intensity * 4);
      for (var di = 0; di < dustCount; di++) {
        dust.push({
          x: cx + (Math.random() - 0.5) * w * 0.5,
          y: h - 60 + Math.random() * 20,
          vx: dir * (0.3 + Math.random() * 0.5),
          vy: -Math.random() * 0.4 - 0.1,
          size: Math.random() * 2 + 0.3,
          life: 1, decay: 0.004 + Math.random() * 0.003
        });
      }
    }

    var total = neonStreaks.length + lightLines.length + smokes.length + dust.length + windStreaks.length;
    if (total > 200) {
      var excess = total - 200;
      var rd = Math.min(excess, dust.length); dust.splice(0, rd); excess -= rd;
      var rw = Math.min(excess, windStreaks.length); windStreaks.splice(0, rw); excess -= rw;
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
      particleCtx.shadowColor = "hsla(" + n.hue + ", 100%, 50%, 0.6)";
      particleCtx.shadowBlur = 18;
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
      particleCtx.shadowColor = "rgba(255,255,255,0.3)";
      particleCtx.shadowBlur = 8;
      particleCtx.beginPath();
      particleCtx.moveTo(l.x, l.y);
      particleCtx.lineTo(l.x - Math.cos(la) * lLen, l.y - Math.sin(la) * lLen);
      particleCtx.stroke();
      particleCtx.restore();
    }

    // Wind streaks
    for (var wi = windStreaks.length - 1; wi >= 0; wi--) {
      var ws = windStreaks[wi];
      ws.x += ws.vx; ws.y += ws.vy; ws.life -= ws.decay;
      if (ws.life <= 0) { windStreaks.splice(wi, 1); continue; }
      var wa = Math.atan2(ws.vy, ws.vx);
      var wLen = ws.len * ws.life;
      particleCtx.save();
      particleCtx.globalAlpha = ws.life * 0.25;
      particleCtx.strokeStyle = "rgba(255,255,255," + (ws.life * 0.3) + ")";
      particleCtx.lineWidth = ws.width * ws.life;
      particleCtx.lineCap = "round";
      particleCtx.beginPath();
      particleCtx.moveTo(ws.x, ws.y);
      particleCtx.lineTo(ws.x - Math.cos(wa) * wLen, ws.y - Math.sin(wa) * wLen);
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
  // Hover handlers (spotlight + glossy + particles) — raycasting
  // ----------------------------------------------------------------
  var raycaster = null;
  var hoverMouse = { x: 0, y: 0 };
  var isHoveringModel = false;

  function onCanvasMouseMove(e) {
    hoverMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    hoverMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    if (customCursor) {
      customCursor.style.left = e.clientX + "px";
      customCursor.style.top = e.clientY + "px";
    }
  }

  var customCursor = null;

  function initCustomCursor() {
    customCursor = document.createElement("div");
    customCursor.className = "lambo-cursor";
    customCursor.innerHTML = '<div class="lambo-cursor__ring"></div><div class="lambo-cursor__dot"></div>';
    document.body.appendChild(customCursor);
  }

  function checkModelHover() {
    if (!raycaster || !camera || !hitBox) return;
    raycaster.setFromCamera(hoverMouse, camera);
    var hits = raycaster.intersectObject(hitBox);
    if (hits.length > 0) {
      if (!isHoveringModel) {
        isHoveringModel = true;
        controls.enabled = true;
        tweenLightsOn();
        tweenGlossyOn();
        if (renderer) renderer.domElement.style.cursor = "none";
        if (customCursor) customCursor.classList.add("is-active");
      }
    } else {
      if (isHoveringModel) {
        isHoveringModel = false;
        controls.enabled = false;
        tweenLightsOff();
        tweenGlossyOff();
        if (renderer) renderer.domElement.style.cursor = "";
        if (customCursor) customCursor.classList.remove("is-active");
      }
    }
  }

  function bindHoverEvents() {
    raycaster = new THREE.Raycaster();
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
    section.addEventListener("mousemove", onCanvasMouseMove);
    section.addEventListener("mouseleave", function () {
      if (isHoveringModel) {
        isHoveringModel = false;
        controls.enabled = false;
        tweenLightsOff();
        tweenGlossyOff();
        if (renderer) renderer.domElement.style.cursor = "";
        if (customCursor) customCursor.classList.remove("is-active");
      }
    });
    var lastTapTime = 0;
    var tapStartX = 0, tapStartY = 0;
    renderer.domElement.addEventListener("pointerdown", function (e) {
      tapStartX = e.clientX;
      tapStartY = e.clientY;
    });
    renderer.domElement.addEventListener("pointerup", function (e) {
      var dx = e.clientX - tapStartX;
      var dy = e.clientY - tapStartY;
      if (dx * dx + dy * dy > 64) return;
      var now = Date.now();
      if (now - lastTapTime < 350) {
        var tapMouse = new THREE.Vector2(
          (e.clientX / window.innerWidth) * 2 - 1,
          -(e.clientY / window.innerHeight) * 2 + 1
        );
        raycaster.setFromCamera(tapMouse, camera);
        var hitDoorL = doorHitBoxL && raycaster.intersectObject(doorHitBoxL).length > 0;
        var hitDoorR = doorHitBoxR && raycaster.intersectObject(doorHitBoxR).length > 0;
        if (hitDoorL || hitDoorR) {
          toggleDoorAnimation();
        }
        lastTapTime = 0;
      } else {
        lastTapTime = now;
      }
    });
  }

  // ----------------------------------------------------------------
  // Navigation — arrow buttons + dot clicks
  // ----------------------------------------------------------------
  function activateGalleryIndex(index) {
    showModel(index);

    var preset = getCameraPreset(index);
    gsap.to(camera.position, { x: preset.position.x, y: preset.position.y, z: preset.position.z, duration: 0.8, ease: "power2.inOut" });
    gsap.to(controls.target, { x: preset.target.x, y: preset.target.y, z: preset.target.z, duration: 0.8, ease: "power2.inOut",
      onComplete: function () { transitioning = false; }
    });

    panelEls.forEach(function (p, i) { p.classList.toggle("is-active", i === index); });
    dotEls.forEach(function (d, i) { d.classList.toggle("is-active", i === index); });
  }

  function goToCar(index) {
    if (transitioning || index < 0 || index >= GALLERY_CARS.length || index === currentIndex) return;
    transitioning = true;

    if (!modelCache[index]) {
      setLocalLoading(true);
      loadModel(index, function (model) {
        if (!model) {
          transitioning = false;
          markGalleryModelLoadFailed();
          return;
        }
        markGalleryReady();
        activateGalleryIndex(index);
      });
      return;
    }

    activateGalleryIndex(index);
  }

  function bindNavigation() {
    if (prevBtn) prevBtn.addEventListener("click", function () { goToCar(currentIndex - 1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { goToCar(currentIndex + 1); });

    dotEls.forEach(function (dot) {
      dot.addEventListener("click", function () {
        goToCar(parseInt(dot.dataset.index, 10));
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
    neonStreaks = []; lightLines = []; smokes = []; dust = []; windStreaks = [];
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
    if (activeMixer && mixerClock) activeMixer.update(mixerClock.getDelta());
    if (!isMobile) checkModelHover();
    renderer.render(scene, camera);
  }

  // ----------------------------------------------------------------
  // Public init
  // ----------------------------------------------------------------
  function init() {
    if (initStarted) return readyPromise;
    initStarted = true;

    if (!initScene()) {
      if (section) markGalleryUnavailable();
      settleReady(false);
      return readyPromise;
    }

    setLocalLoading(true);

    loadModel(0, function (model) {
      if (!model) {
        markGalleryUnavailable();
        settleReady(false);
        return;
      }

      showModel(0);
      if (!isMobile) {
        initParticles();
        initCustomCursor();
      }
      bindHoverEvents();
      bindNavigation();
      animate();
      markGalleryReady();
      settleReady(true);
      preloadRemainingModelsInBackground();
    });

    return readyPromise;
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
