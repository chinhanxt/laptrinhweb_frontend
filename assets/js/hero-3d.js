window.APEXHero3D = (function () {
  var scene, camera, renderer, controls, carRoot;
  var shell, canvasMount, loadingEl, fallbackEl;

  var MODEL_URL = "model/lambo_lp670.glb";
  var LOAD_TIMEOUT_MS = 9000;

  var DEFAULT_CAMERA = { x: 3.5, y: 1.6, z: 5.5 };
  var DEFAULT_TARGET = { x: 0, y: 0.3, z: 0 };

  function showHeroFallback() {
    if (fallbackEl) fallbackEl.classList.remove("is-hidden");
    if (loadingEl) loadingEl.classList.add("is-hidden");
  }

  function hideLoadingState() {
    if (loadingEl) loadingEl.classList.add("is-hidden");
  }

  function setupLights() {
    var ambient = new THREE.AmbientLight(0xffffff, 1.1);
    var key = new THREE.DirectionalLight(0xf7e4aa, 2.4);
    var rim = new THREE.DirectionalLight(0xffffff, 1.0);
    key.position.set(5, 7, 6);
    rim.position.set(-6, 3, -5);
    scene.add(ambient, key, rim);
  }

  function loadModel() {
    var loader = new THREE.GLTFLoader();
    var timeoutId = window.setTimeout(showHeroFallback, LOAD_TIMEOUT_MS);

    loader.load(
      MODEL_URL,
      function (gltf) {
        window.clearTimeout(timeoutId);
        carRoot = gltf.scene;

        var box = new THREE.Box3().setFromObject(carRoot);
        var center = box.getCenter(new THREE.Vector3());
        carRoot.position.sub(center);
        carRoot.position.y += 0.2;

        scene.add(carRoot);
        hideLoadingState();
      },
      undefined,
      function () {
        window.clearTimeout(timeoutId);
        showHeroFallback();
      }
    );
  }

  function onResize() {
    if (!shell || !camera || !renderer) return;
    var w = shell.clientWidth;
    var h = shell.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  function initHeroScene() {
    shell = document.getElementById("hero-3d-shell");
    canvasMount = document.getElementById("hero-3d-canvas");
    loadingEl = document.getElementById("hero-loading");
    fallbackEl = document.getElementById("hero-fallback");

    if (!shell || !canvasMount || typeof THREE === "undefined") {
      return false;
    }

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(32, shell.clientWidth / shell.clientHeight, 0.1, 100);
    camera.position.set(DEFAULT_CAMERA.x, DEFAULT_CAMERA.y, DEFAULT_CAMERA.z);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(shell.clientWidth, shell.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    canvasMount.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.enableZoom = true;
    controls.minDistance = 2;
    controls.maxDistance = 14;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.2;
    controls.minPolarAngle = 0.4;
    controls.maxPolarAngle = 1.75;
    controls.target.set(DEFAULT_TARGET.x, DEFAULT_TARGET.y, DEFAULT_TARGET.z);

    window.addEventListener("resize", onResize);

    setupLights();
    loadModel();
    return true;
  }

  function animate() {
    if (!renderer || !scene || !camera) return;
    requestAnimationFrame(animate);
    if (controls) controls.update();
    renderer.render(scene, camera);
  }

  return {
    initHeroScene: initHeroScene,
    animate: animate,
    showHeroFallback: showHeroFallback
  };
})();
