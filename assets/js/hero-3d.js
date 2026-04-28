window.APEXHero3D = (function () {
  var scene, camera, renderer, controls, carRoot, carRig;
  var shell, canvasMount, loadingEl, fallbackEl, colorPanelEl, colorSwatchEls;
  var carInfoEl, colorNameEl, activeColorLabelEl, focusLabelEl, focusTextEl;
  var raycaster = new THREE.Raycaster();
  var pointer = new THREE.Vector2();
  var animationFrameId = null;
  var paintMeshes = [];
  var originalColors = [];
  var defaultCameraPosition = new THREE.Vector3(3.4, 1.55, 4.8);
  var defaultTarget = new THREE.Vector3(0, 0.5, 0);
  var focusDistance = 2.15;
  var minFocusDistance = 1.6;
  var activeColorKey = "original";
  var colorMap = {
    white: 0xe8e6df,
    red: 0x8b1a1a,
    blue: 0x1c3a6e,
    green: 0x1e4a3a,
    yellow: 0x9a7a18,
    pink: 0x7a2858,
    black: 0x111116
  };

  var CAR_CATALOG = [
    {
      model: "assets/model/lambo_lp670.glb",
      brand: "Lamborghini",
      name: "Murciélago",
      sub: "LP 670-4 SuperVeloce",
      year: "2010",
      engine: "6.5L V12",
      defaultColorName: "Bianco Isis",
      hp: "670",
      accel: "3.2",
      topSpeed: "342",
      targetSize: 3.7,
      modelOffset: { x: -0.02, y: 0, z: 0 },
      cameraPosition: { x: 3.22, y: 1.52, z: 5.12 },
      cameraTarget: { x: -0.18, y: 0.47, z: -0.01 }
    },
    {
      model: "assets/model/2015_bmw_3.0_csl_hommage_concept.glb",
      brand: "BMW",
      name: "3.0 CSL Hommage",
      sub: "Concept 2015",
      year: "2015",
      engine: "3.0L I6 Twin-Turbo",
      defaultColorName: "Bianco Isis",
      hp: "365",
      accel: "4.3",
      topSpeed: "250",
      targetSize: 3.72,
      modelOffset: { x: -0.02, y: 0, z: 0 }
    },
    {
      model: "assets/model/2019_ferrari_488_pista_spider.glb",
      brand: "Ferrari",
      name: "488 Pista Spider",
      sub: "V8 Twin-Turbo",
      year: "2019",
      engine: "3.9L V8",
      defaultColorName: "Bianco Isis",
      hp: "711",
      accel: "2.85",
      topSpeed: "340",
      targetSize: 3.68,
      modelOffset: { x: -0.04, y: 0, z: 0 }
    },
    {
      model: "assets/model/2020_ferrari_roma.glb",
      brand: "Ferrari",
      name: "Roma",
      sub: "Grand Touring",
      year: "2020",
      engine: "3.9L V8",
      defaultColorName: "Bianco Isis",
      hp: "612",
      accel: "3.4",
      topSpeed: "320",
      targetSize: 3.7,
      modelOffset: { x: 0, y: 0, z: 0 }
    }
  ];
  var currentIndex = 0;
  var isSwitching = false;
  var navPrevEl, navNextEl, navStripEl, navNameEl, navIndexEl;
  var LOAD_TIMEOUT_MS = 12000;
  var TARGET_SIZE = 3.8;
  var paintKeywords = ["carpaint", "car_paint", "nodmg", "paint_material", "coloured_material"];
  var paintExactNames = ["material"];

  // --- Preload cache: stores prepared gltf.scene clones keyed by catalog index ---
  var modelCache = {};
  var preloadingSet = {};
  var preloadCallbacks = {};
  var warmedSet = {};
  var warmupRenderTarget = null;
  var resolveReady = function () {};
  var readyPromise = new Promise(function (resolve) {
    resolveReady = resolve;
  });
  var readySettled = false;

  function settleReady(value) {
    if (readySettled) return;
    readySettled = true;
    resolveReady(value);
  }

  function showHeroFallback() {
    if (fallbackEl) fallbackEl.classList.remove("is-hidden");
    if (loadingEl) loadingEl.classList.add("is-hidden");
    window.__modelsLoaded = false;
    settleReady(false);
  }

  function hideLoadingState() {
    if (loadingEl) loadingEl.classList.add("is-hidden");
  }

  function showOverlayUI() {
    if (colorPanelEl) colorPanelEl.classList.add("is-visible");
    if (carInfoEl) {
      carInfoEl.classList.add("is-visible");
      gsap.set(carInfoEl, { opacity: 1, x: 0, pointerEvents: "auto" });
    }
    if (focusLabelEl) focusLabelEl.classList.add("is-visible");
  }

  function animateCarInfoVisibility(isVisible) {
    if (!carInfoEl) return;
    carInfoEl.classList.toggle("is-zoom-hidden", !isVisible);
    gsap.killTweensOf(carInfoEl);
    gsap.to(carInfoEl, {
      opacity: isVisible ? 1 : 0,
      duration: isVisible ? 0.52 : 0.38,
      ease: isVisible ? "power2.out" : "power2.inOut",
      pointerEvents: isVisible ? "auto" : "none"
    });
  }

  function animateNavArrowsVisibility(isVisible) {
    if (!navStripEl) return;
    navStripEl.classList.toggle("is-zoom-hidden", !isVisible);
    gsap.to(navStripEl, {
      opacity: isVisible ? 1 : 0,
      y: isVisible ? 0 : 12,
      duration: isVisible ? 0.4 : 0.28,
      ease: isVisible ? "power2.out" : "power2.in"
    });
  }

  function updateNavLabel(carData, index) {
    if (!navNameEl || !navIndexEl) return;
    var total = CAR_CATALOG.length;
    var num = (index + 1 < 10 ? "0" : "") + (index + 1);
    var den = (total < 10 ? "0" : "") + total;
    navIndexEl.textContent = num + " / " + den;

    gsap.to(navNameEl, {
      opacity: 0,
      y: -4,
      duration: 0.15,
      ease: "power2.in",
      onComplete: function () {
        navNameEl.textContent = carData.name;
        gsap.to(navNameEl, {
          opacity: 1,
          y: 0,
          duration: 0.25,
          ease: "power2.out"
        });
      }
    });
  }

  function setFocusState(isZoomed) {
    if (!focusLabelEl || !focusTextEl) return;
    focusLabelEl.classList.toggle("is-zoomed", isZoomed);
    focusTextEl.textContent = isZoomed ? "Nhấp đúp bên ngoài để trở lại" : "Nhấp đúp để xem chi tiết";

    if (carInfoEl) {
      animateCarInfoVisibility(!isZoomed);
    }
    animateNavArrowsVisibility(!isZoomed);
  }

  function setupLights() {
    var ambient = new THREE.AmbientLight(0xffffff, 1.1);
    var key = new THREE.DirectionalLight(0xf7e4aa, 2.4);
    var rim = new THREE.DirectionalLight(0xffffff, 1.0);
    key.position.set(5, 7, 6);
    rim.position.set(-6, 3, -5);
    scene.add(ambient, key, rim);
  }

  function isPaintCandidate(node) {
    var materials = Array.isArray(node.material) ? node.material : [node.material];
    return materials.some(function (mat) {
      if (!mat) return false;
      var name = (mat.name || "").toLowerCase();
      if (paintExactNames.indexOf(name) !== -1) return true;
      return paintKeywords.some(function (kw) {
        return name.indexOf(kw) !== -1;
      });
    });
  }

  function cloneMaterialIfNeeded(mesh) {
    if (!mesh || !mesh.material) return;
    if (Array.isArray(mesh.material)) {
      mesh.material = mesh.material.map(function (material) {
        return material ? material.clone() : material;
      });
      return;
    }
    mesh.material = mesh.material.clone();
  }

  function collectPaintMeshes(root) {
    var meshes = [];
    var colors = [];
    root.traverse(function (node) {
      if (!node.isMesh || !node.material) return;
      if (!isPaintCandidate(node)) return;
      cloneMaterialIfNeeded(node);
      var mats = Array.isArray(node.material) ? node.material : [node.material];
      var saved = mats.map(function (m) {
        return m && m.color ? m.color.getHex() : null;
      });
      meshes.push(node);
      colors.push(saved);
    });
    originalColors = colors;
    return meshes;
  }

  function normalizeModel(sceneRoot, catalogIndex) {
    var carConfig = CAR_CATALOG[catalogIndex] || {};
    var targetSize = carConfig.targetSize || TARGET_SIZE;
    var box = new THREE.Box3().setFromObject(sceneRoot);
    var size = box.getSize(new THREE.Vector3());
    var widthDim = Math.max(size.x, size.z);
    if (widthDim > 0) {
      sceneRoot.scale.setScalar(targetSize / widthDim);
    }
    box.setFromObject(sceneRoot);
    var center = box.getCenter(new THREE.Vector3());
    sceneRoot.position.sub(center);
    sceneRoot.position.y += 0.35;

    var modelOffset = carConfig.modelOffset || { x: 0, y: 0, z: 0 };
    sceneRoot.position.x += modelOffset.x || 0;
    sceneRoot.position.y += modelOffset.y || 0;
    sceneRoot.position.z += modelOffset.z || 0;
  }

  function getModelOffset(catalogIndex) {
    var modelOffset = (CAR_CATALOG[catalogIndex] && CAR_CATALOG[catalogIndex].modelOffset) || {};
    return {
      x: modelOffset.x || 0,
      y: modelOffset.y || 0,
      z: modelOffset.z || 0
    };
  }

  function getCameraPreset(catalogIndex) {
    var carConfig = CAR_CATALOG[catalogIndex] || {};
    var cameraPosition = carConfig.cameraPosition || {};
    var cameraTarget = carConfig.cameraTarget || {};

    return {
      position: new THREE.Vector3(
        typeof cameraPosition.x === "number" ? cameraPosition.x : defaultCameraPosition.x,
        typeof cameraPosition.y === "number" ? cameraPosition.y : defaultCameraPosition.y,
        typeof cameraPosition.z === "number" ? cameraPosition.z : defaultCameraPosition.z
      ),
      target: new THREE.Vector3(
        typeof cameraTarget.x === "number" ? cameraTarget.x : defaultTarget.x,
        typeof cameraTarget.y === "number" ? cameraTarget.y : defaultTarget.y,
        typeof cameraTarget.z === "number" ? cameraTarget.z : defaultTarget.z
      )
    };
  }

  function storeBaseTransform(root) {
    if (!root) return;
    root.userData.apexBaseTransform = {
      position: root.position.clone(),
      quaternion: root.quaternion.clone(),
      scale: root.scale.clone()
    };
  }

  function restoreBaseTransform(root) {
    if (!root || !root.userData.apexBaseTransform) return;
    root.position.copy(root.userData.apexBaseTransform.position);
    root.quaternion.copy(root.userData.apexBaseTransform.quaternion);
    root.scale.copy(root.userData.apexBaseTransform.scale);
    root.updateMatrixWorld(true);
  }

  function removeCarFromScene() {
    if (!carRig) return;
    scene.remove(carRig);
    carRig = null;
    carRoot = null;
    paintMeshes = [];
  }

  function disposeSceneGraph(root) {
    if (!root) return;
    root.traverse(function (node) {
      if (node.isMesh) {
        if (node.geometry) node.geometry.dispose();
        var materials = Array.isArray(node.material) ? node.material : [node.material];
        materials.forEach(function (mat) {
          if (mat) {
            if (mat.map) mat.map.dispose();
            if (mat.normalMap) mat.normalMap.dispose();
            if (mat.roughnessMap) mat.roughnessMap.dispose();
            if (mat.metalnessMap) mat.metalnessMap.dispose();
            if (mat.aoMap) mat.aoMap.dispose();
            if (mat.emissiveMap) mat.emissiveMap.dispose();
            mat.dispose();
          }
        });
      }
    });
  }

  // --- Preload system ---
  function flushPreloadCallbacks(catalogIndex, payload) {
    var callbacks = preloadCallbacks[catalogIndex] || [];
    delete preloadCallbacks[catalogIndex];
    callbacks.forEach(function (cb) {
      cb(payload);
    });
  }

  function preloadModel(catalogIndex, callback) {
    if (callback) {
      if (!preloadCallbacks[catalogIndex]) preloadCallbacks[catalogIndex] = [];
      preloadCallbacks[catalogIndex].push(callback);
    }
    if (modelCache[catalogIndex]) {
      flushPreloadCallbacks(catalogIndex, modelCache[catalogIndex]);
      return;
    }
    if (preloadingSet[catalogIndex]) return;
    preloadingSet[catalogIndex] = true;
    var url = CAR_CATALOG[catalogIndex].model;
    var loader = new THREE.GLTFLoader();
    loader.load(
      url,
      function (gltf) {
        var root = gltf.scene;
        var rig = new THREE.Group();
        normalizeModel(root, catalogIndex);
        storeBaseTransform(root);
        storeBaseTransform(rig);
        rig.add(root);
        modelCache[catalogIndex] = {
          rig: rig,
          root: root
        };
        delete preloadingSet[catalogIndex];
        flushPreloadCallbacks(catalogIndex, modelCache[catalogIndex]);
      },
      undefined,
      function () {
        delete preloadingSet[catalogIndex];
        flushPreloadCallbacks(catalogIndex, null);
      }
    );
  }

  function preloadAllModels(callback) {
    var remaining = CAR_CATALOG.length;
    var hasFailure = false;

    CAR_CATALOG.forEach(function (_, catalogIndex) {
      preloadModel(catalogIndex, function (entry) {
        remaining -= 1;
        if (!entry) hasFailure = true;
        if (remaining === 0 && callback) {
          callback(!hasFailure);
        }
      });
    });
  }

  function warmModelCacheEntry(catalogIndex, callback) {
    if (warmedSet[catalogIndex]) {
      if (callback) callback(true);
      return;
    }

    preloadModel(catalogIndex, function (entry) {
      if (!entry || !renderer) {
        if (callback) callback(false);
        return;
      }

      if (!warmupRenderTarget) {
        warmupRenderTarget = new THREE.WebGLRenderTarget(32, 32, {
          depthBuffer: true,
          stencilBuffer: false
        });
      }

      var tempScene = new THREE.Scene();
      var warmCamera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
      var preset = getCameraPreset(catalogIndex);
      var previousTarget = renderer.getRenderTarget();
      var previousColor = renderer.getClearColor(new THREE.Color());
      var previousAlpha = renderer.getClearAlpha();
      var warmRig = entry.rig;
      var usingClone = Boolean(entry.rig.parent);

      setupLightsForScene(tempScene);
      restoreBaseTransform(entry.rig);
      restoreBaseTransform(entry.root);

      if (usingClone) {
        warmRig = entry.rig.clone(true);
      }

      tempScene.add(warmRig);
      warmCamera.position.copy(preset.position);
      warmCamera.lookAt(preset.target);
      warmCamera.updateProjectionMatrix();

      renderer.setClearColor(0x000000, 0);
      renderer.setRenderTarget(warmupRenderTarget);
      renderer.render(tempScene, warmCamera);
      renderer.setRenderTarget(previousTarget);
      renderer.setClearColor(previousColor, previousAlpha);

      tempScene.remove(warmRig);
      warmedSet[catalogIndex] = true;

      if (callback) callback(true);
    });
  }

  function warmAllModelsSequentially(callback) {
    var queue = CAR_CATALOG.map(function (_, index) {
      return index;
    });
    var hasFailure = false;

    function warmNext() {
      if (!queue.length) {
        if (callback) callback(!hasFailure);
        return;
      }

      var catalogIndex = queue.shift();
      warmModelCacheEntry(catalogIndex, function (success) {
        if (!success) hasFailure = true;
        window.setTimeout(warmNext, 0);
      });
    }

    warmNext();
  }

  function activateCachedModel(catalogIndex) {
    var cached = modelCache[catalogIndex];
    if (!cached) return false;
    gsap.killTweensOf(cached.rig.position);
    restoreBaseTransform(cached.rig);
    restoreBaseTransform(cached.root);
    carRig = cached.rig;
    carRoot = cached.root;
    scene.add(carRig);
    paintMeshes = collectPaintMeshes(carRoot);
    activeColorKey = "original";
    setActiveSwatch("original");
    return true;
  }

  // --- UI updates ---
  function updateInfoPanel(carData) {
    var kickerEl = document.querySelector(".hero-car-info__kicker");
    var nameEl = document.querySelector(".hero-car-info__name");
    var subEl = document.querySelector(".hero-car-info__sub");
    var metaValues = document.querySelectorAll(".hero-car-info__value");
    var specNums = document.querySelectorAll(".hero-car-info__spec-num");

    var animTargets = [kickerEl, nameEl, subEl].concat(
      Array.prototype.slice.call(metaValues),
      Array.prototype.slice.call(specNums)
    ).filter(Boolean);

    gsap.to(animTargets, {
      opacity: 0,
      y: -6,
      duration: 0.18,
      stagger: 0.02,
      ease: "power2.in",
      onComplete: function () {
        if (kickerEl) kickerEl.textContent = carData.brand;
        if (nameEl) nameEl.textContent = carData.name;
        if (subEl) subEl.textContent = carData.sub;

        if (metaValues.length >= 3) {
          metaValues[0].textContent = carData.year;
          metaValues[1].textContent = carData.engine;
          metaValues[2].textContent = carData.defaultColorName;
          metaValues[2].id = "hero-car-color-name";
        }

        if (specNums.length >= 3) {
          specNums[0].textContent = carData.hp;
          specNums[1].innerHTML = carData.accel + "<small>s</small>";
          specNums[2].textContent = carData.topSpeed;
        }

        gsap.fromTo(animTargets,
          { opacity: 0, y: 8 },
          {
            opacity: 1,
            y: 0,
            duration: 0.32,
            stagger: 0.03,
            ease: "power2.out"
          }
        );
      }
    });
  }

  function setNavLoading(loading) {
    isSwitching = loading;
    if (navPrevEl) {
      navPrevEl.disabled = loading;
      navPrevEl.classList.toggle("is-loading", loading);
    }
    if (navNextEl) {
      navNextEl.disabled = loading;
      navNextEl.classList.toggle("is-loading", loading);
    }
  }

  function setActiveSwatch(colorKey) {
    activeColorKey = colorKey;
    colorSwatchEls.forEach(function (button) {
      button.classList.toggle("is-active", button.dataset.color === colorKey);
    });

    var activeButton = colorSwatchEls.find(function (button) {
      return button.dataset.color === colorKey;
    });
    if (activeButton) {
      if (colorNameEl) colorNameEl.textContent = activeButton.dataset.colorName || "";
      if (activeColorLabelEl) activeColorLabelEl.textContent = activeButton.dataset.colorName || "";
    }
  }

  function applyCarColor(colorKey) {
    if (colorKey === "original") {
      paintMeshes.forEach(function (mesh, i) {
        var materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        var saved = originalColors[i] || [];
        materials.forEach(function (material, j) {
          if (material && material.color && saved[j] !== null && saved[j] !== undefined) {
            material.color.setHex(saved[j]);
            material.needsUpdate = true;
          }
        });
      });
      setActiveSwatch(colorKey);
      return;
    }

    var colorValue = colorMap[colorKey];
    if (typeof colorValue === "undefined") return;

    paintMeshes.forEach(function (mesh) {
      var materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      materials.forEach(function (material) {
        if (material && material.color) {
          material.color.setHex(colorValue);
          material.needsUpdate = true;
        }
      });
    });

    setActiveSwatch(colorKey);
  }

  // --- Switch car (instant if cached, fallback to load) ---
  function performSlideIn(direction, nextCar) {
    var slideInX = direction === 1 ? 8 : -8;
    carRig.position.x = slideInX;
    updateInfoPanel(nextCar);
    updateNavLabel(nextCar, currentIndex);

    gsap.to(carRig.position, {
      x: 0,
      duration: 0.7,
      ease: "power3.out",
      onComplete: function () {
        snapHeroCameraToDefault();
        setNavLoading(false);
      }
    });
  }

  function switchCar(direction) {
    if (isSwitching || !carRoot) return;
    setNavLoading(true);

    var slideOutX = direction === 1 ? -8 : 8;
    var nextIndex = (currentIndex + direction + CAR_CATALOG.length) % CAR_CATALOG.length;
    var nextCar = CAR_CATALOG[nextIndex];

    resetHeroCamera();

    gsap.to(carRig.position, {
      x: slideOutX,
      duration: 0.65,
      ease: "power3.in",
      onComplete: function () {
        removeCarFromScene();
        currentIndex = nextIndex;
        snapHeroCameraToDefault();

        if (modelCache[nextIndex]) {
          activateCachedModel(nextIndex);
          performSlideIn(direction, nextCar);
        } else {
          preloadModel(nextIndex, function (entry) {
            if (!entry) {
              setNavLoading(false);
              showHeroFallback();
              return;
            }
            warmModelCacheEntry(nextIndex, function (warmed) {
              if (!warmed) {
                setNavLoading(false);
                showHeroFallback();
                return;
              }
              activateCachedModel(nextIndex);
              performSlideIn(direction, nextCar);
            });
          });
        }
      }
    });
  }

  // --- Initial load (first car) ---
  function loadInitialModel() {
    var timeoutId = window.setTimeout(showHeroFallback, LOAD_TIMEOUT_MS);

    preloadModel(currentIndex, function (entry) {
      window.clearTimeout(timeoutId);
      if (!entry) {
        showHeroFallback();
        return;
      }

      activateCachedModel(currentIndex);
      snapHeroCameraToDefault();
      showOverlayUI();
      setNavLoading(true);

      preloadAllModels(function (allLoaded) {
        if (!allLoaded) {
          setNavLoading(false);
          showHeroFallback();
          return;
        }

        warmAllModelsSequentially(function (allWarmed) {
          if (!allWarmed) {
            setNavLoading(false);
            showHeroFallback();
            return;
          }

          hideLoadingState();
          setNavLoading(false);
          window.__modelsLoaded = true;
          settleReady(true);
        });
      });
    });
  }

  // --- Camera & interaction ---
  function onResize() {
    if (!shell || !camera || !renderer) return;
    var w = shell.clientWidth;
    var h = shell.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  function tweenCamera(nextPosition, nextTarget, durationOverride) {
    var startPosition = camera.position.clone();
    var startTarget = controls.target.clone();
    var startTime = performance.now();
    var duration = durationOverride || 560;
    controls.enabled = false;

    function tick(now) {
      var progress = Math.min((now - startTime) / duration, 1);
      var eased = progress * progress * progress * (progress * (progress * 6 - 15) + 10);

      camera.position.lerpVectors(startPosition, nextPosition, eased);
      controls.target.lerpVectors(startTarget, nextTarget, eased);
      controls.update();

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(tick);
        return;
      }

      controls.enabled = true;
      animationFrameId = null;
    }

    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      controls.enabled = true;
    }

    animationFrameId = requestAnimationFrame(tick);
  }

  function resetHeroCamera() {
    var preset = getCameraPreset(currentIndex);
    setFocusState(false);
    tweenCamera(preset.position, preset.target, 980);
  }

  function snapHeroCameraToDefault() {
    var preset = getCameraPreset(currentIndex);
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
    controls.enabled = true;
    setFocusState(false);
    camera.position.copy(preset.position);
    controls.target.copy(preset.target);
    controls.update();
  }

  function getIntersections(event) {
    var rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);
    return carRoot ? raycaster.intersectObject(carRoot, true) : [];
  }

  function buildFocusPosition(hitPoint) {
    var viewDirection = camera.position.clone().sub(controls.target).normalize();
    var distance = Math.max(focusDistance, minFocusDistance);
    return hitPoint.clone().add(viewDirection.multiplyScalar(distance));
  }

  function handleDoubleClick(event) {
    var intersections = getIntersections(event);

    if (!intersections.length) {
      resetHeroCamera();
      return;
    }

    var hitPoint = intersections[0].point.clone();
    var nextPosition = buildFocusPosition(hitPoint);
    setFocusState(true);
    tweenCamera(nextPosition, hitPoint, 720);
  }

  function bindColorControls() {
    colorSwatchEls.forEach(function (button) {
      button.addEventListener("click", function () {
        applyCarColor(button.dataset.color);
      });
    });
  }

  // --- Init ---
  function initHeroScene() {
    shell = document.getElementById("hero-3d-shell");
    canvasMount = document.getElementById("hero-3d-canvas");
    loadingEl = document.getElementById("hero-loading");
    fallbackEl = document.getElementById("hero-fallback");
    colorPanelEl = document.getElementById("hero-color-panel");
    colorSwatchEls = Array.prototype.slice.call(document.querySelectorAll(".hero-color-swatch"));
    carInfoEl = document.getElementById("hero-car-info");
    colorNameEl = document.getElementById("hero-car-color-name");
    activeColorLabelEl = document.getElementById("hero-color-active-label");
    focusLabelEl = document.getElementById("hero-focus-label");
    focusTextEl = document.getElementById("hero-focus-text");
    navPrevEl = document.getElementById("hero-nav-prev");
    navNextEl = document.getElementById("hero-nav-next");
    navStripEl = document.getElementById("hero-nav-strip");
    navNameEl = document.getElementById("hero-nav-name");
    navIndexEl = document.getElementById("hero-nav-index");
    window.__modelsLoaded = false;

    if (!shell || !canvasMount || typeof THREE === "undefined") {
      return false;
    }

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(32, shell.clientWidth / shell.clientHeight, 0.1, 100);
    camera.position.copy(defaultCameraPosition);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(shell.clientWidth, shell.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    canvasMount.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.enableZoom = false;
    controls.autoRotate = false;
    controls.minDistance = 1;
    controls.maxDistance = 12;
    controls.minPolarAngle = 0.55;
    controls.maxPolarAngle = 1.65;
    controls.target.copy(defaultTarget);
    controls.update();

    renderer.domElement.addEventListener("dblclick", handleDoubleClick);
    window.addEventListener("resize", onResize);

    bindColorControls();
    if (navPrevEl) {
      navPrevEl.addEventListener("click", function () { switchCar(-1); });
    }
    if (navNextEl) {
      navNextEl.addEventListener("click", function () { switchCar(1); });
    }
    if (navStripEl) {
      navStripEl.classList.add("is-visible");
    }
    document.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") switchCar(-1);
      if (e.key === "ArrowRight") switchCar(1);
    });
    showOverlayUI();
    setFocusState(false);

    setupLights();
    loadInitialModel();
    return true;
  }

  function setupLightsForScene(targetScene) {
    var ambient = new THREE.AmbientLight(0xffffff, 1.1);
    var key = new THREE.DirectionalLight(0xf7e4aa, 2.4);
    var rim = new THREE.DirectionalLight(0xffffff, 1.0);
    key.position.set(5, 7, 6);
    rim.position.set(-6, 3, -5);
    targetScene.add(ambient, key, rim);
  }

  function animate() {
    if (!renderer || !scene || !camera) return;
    requestAnimationFrame(animate);
    if (controls) controls.update();
    renderer.render(scene, camera);
  }

  var disposed = false;
  var resizeHandler = onResize;

  function dispose() {
    if (disposed) return;
    disposed = true;

    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }

    window.removeEventListener("resize", resizeHandler);

    if (controls) {
      controls.dispose();
      controls = null;
    }

    if (renderer) {
      renderer.domElement.removeEventListener("dblclick", handleDoubleClick);
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
      renderer = null;
    }

    if (warmupRenderTarget) {
      warmupRenderTarget.dispose();
      warmupRenderTarget = null;
    }

    removeCarFromScene();
    scene = null;
    camera = null;
  }

  function reinit() {
    if (!disposed) return;
    disposed = false;

    shell = document.getElementById("hero-3d-shell");
    canvasMount = document.getElementById("hero-3d-canvas");
    if (!shell || !canvasMount || typeof THREE === "undefined") return false;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(32, shell.clientWidth / shell.clientHeight, 0.1, 100);
    camera.position.copy(defaultCameraPosition);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(shell.clientWidth, shell.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    canvasMount.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.enableZoom = false;
    controls.autoRotate = false;
    controls.minDistance = 1;
    controls.maxDistance = 12;
    controls.minPolarAngle = 0.55;
    controls.maxPolarAngle = 1.65;
    controls.target.copy(defaultTarget);
    controls.update();

    renderer.domElement.addEventListener("dblclick", handleDoubleClick);
    window.addEventListener("resize", resizeHandler);

    setupLights();

    if (modelCache[currentIndex]) {
      activateCachedModel(currentIndex);
      snapHeroCameraToDefault();
    }

    animate();
    return true;
  }

  return {
    initHeroScene: initHeroScene,
    animate: animate,
    showHeroFallback: showHeroFallback,
    switchCar: switchCar,
    whenReady: function () { return readyPromise; },
    dispose: dispose,
    reinit: reinit
  };
})();
