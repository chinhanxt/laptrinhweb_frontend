const http = require("http");
const fs = require("fs");
const net = require("net");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const OUTPUT_ROOT = path.join(PROJECT_ROOT, "assets", "img", "cars");
const RENDER_PAGE = "/tools/render-car-stills.html";
const PORT = 9877;
const VIEWPORT = { width: 1920, height: 1080 };
const CHROME_PATH = process.env.CHROME_PATH || "/usr/bin/google-chrome";

const CAPTURE_PRESETS = {
  hero: { cameraOrbit: "320deg 72deg 74%", cameraTarget: "0m 0.45m 0m", fieldOfView: "24deg" },
  front: { cameraOrbit: "0deg 78deg 78%", cameraTarget: "0m 0.42m 0m", fieldOfView: "25deg" },
  rear: { cameraOrbit: "140deg 76deg 79%", cameraTarget: "0m 0.44m 0m", fieldOfView: "25deg" },
  top: { cameraOrbit: "320deg 58deg 84%", cameraTarget: "0m 0.48m 0m", fieldOfView: "27deg" }
};

const CARS = [
  {
    id: "murcielago",
    src: "/assets/model/lambo_lp670.glb",
    exposure: "1.5",
    cameraTarget: "auto auto auto",
    targetLongestSide: 4.9,
    presetOverrides: {
      hero: { cameraOrbit: "320deg 73deg 74%", cameraTarget: "auto auto auto", fieldOfView: "24deg" },
      front: { cameraOrbit: "0deg 79deg 76%", cameraTarget: "auto auto auto", fieldOfView: "24deg" },
      rear: { cameraOrbit: "140deg 76deg 77%", cameraTarget: "auto auto auto", fieldOfView: "24deg" },
      top: { cameraOrbit: "320deg 58deg 84%", cameraTarget: "auto auto auto", fieldOfView: "26deg" }
    }
  },
  {
    id: "bmw-3-0-csl-hommage",
    src: "/assets/model/2015_bmw_3.0_csl_hommage_concept.glb",
    exposure: "1.45",
    baseDistance: "108%",
    cameraTarget: "0m 0.42m 0m"
  },
  {
    id: "ferrari-488-pista-spider",
    src: "/assets/model/2019_ferrari_488_pista_spider.glb",
    exposure: "1.55",
    baseDistance: "106%",
    cameraTarget: "0m 0.36m 0m"
  },
  {
    id: "ferrari-roma",
    src: "/assets/model/2020_ferrari_roma.glb",
    exposure: "1.5",
    baseDistance: "108%",
    cameraTarget: "0m 0.34m 0m"
  },
  {
    id: "centenario-roadster",
    src: "/assets/model/lamborghini_centenario_roadster_sdc.glb",
    exposure: "1.0",
    baseDistance: "105%",
    cameraTarget: "0m 0.3m 0m"
  },
  {
    id: "centenario-lp770",
    src: "/assets/model/lamborghini_centenario_lp-770_interior_sdc.glb",
    exposure: "1.0",
    baseDistance: "120%",
    cameraTarget: "0m 0.45m 0m"
  }
];

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".glb": "model/gltf-binary",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp"
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getAvailablePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(0, () => {
      const address = server.address();
      server.close(() => resolve(address.port));
    });
    server.on("error", reject);
  });
}

function buildPresetForCar(car, preset) {
  const presetName = preset.name;
  const override = presetName && car.presetOverrides ? car.presetOverrides[presetName] : null;
  const mergedPreset = Object.assign({}, preset, override || {});
  const orbitParts = mergedPreset.cameraOrbit.split(" ");
  const multiplier = car.orbitDistanceMultiplier || 1;
  const orbitDistance = orbitParts[2];
  const distanceMatch = /^([0-9.]+)(.*)$/.exec(orbitDistance);
  const resolvedDistance = distanceMatch
    ? Number(distanceMatch[1]) * multiplier + distanceMatch[2]
    : orbitDistance;

  return {
    cameraOrbit: orbitParts.slice(0, 2).concat(resolvedDistance).join(" "),
    cameraTarget: (override && override.cameraTarget) || car.cameraTarget || mergedPreset.cameraTarget,
    fieldOfView: mergedPreset.fieldOfView
  };
}

function parseArgs(argv) {
  const options = {
    carIds: null
  };

  argv.forEach((arg) => {
    if (arg.startsWith("--car=")) {
      options.carIds = [arg.slice("--car=".length)].filter(Boolean);
    } else if (arg.startsWith("--cars=")) {
      options.carIds = arg
        .slice("--cars=".length)
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
    }
  });

  return options;
}

function getCarsToCapture(options) {
  if (!options.carIds || options.carIds.length === 0) {
    return CARS.slice();
  }

  const requested = {};
  options.carIds.forEach((id) => {
    requested[id] = true;
  });

  const filteredCars = CARS.filter((car) => requested[car.id]);
  if (filteredCars.length !== options.carIds.length) {
    const found = {};
    filteredCars.forEach((car) => {
      found[car.id] = true;
    });

    const missing = options.carIds.filter((id) => !found[id]);
    throw new Error("Unknown car id(s): " + missing.join(", "));
  }

  return filteredCars;
}

function startServer(port) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const requestPath = req.url === "/" ? RENDER_PAGE : req.url.split("?")[0];
      const filePath = path.resolve(PROJECT_ROOT, "." + decodeURIComponent(requestPath));

      if (!filePath.startsWith(PROJECT_ROOT) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Not found: " + req.url);
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const mimeType = MIME_TYPES[ext] || "application/octet-stream";
      res.writeHead(200, { "Content-Type": mimeType });
      fs.createReadStream(filePath).pipe(res);
    });

    server.listen(port, () => {
      console.log("Server running at http://localhost:" + port);
      resolve(server);
    });
  });
}

async function waitForChromeTarget(port, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  const endpointUrl = "http://127.0.0.1:" + port + "/json/list";

  while (Date.now() < deadline) {
    try {
      const response = await fetch(endpointUrl);
      if (response.ok) {
        const targets = await response.json();
        const pageTarget = targets.find((target) => target.type === "page" && target.webSocketDebuggerUrl);
        if (pageTarget) {
          return pageTarget;
        }
      }
    } catch (error) {
      // Chrome is still starting.
    }
    await sleep(250);
  }

  throw new Error("Timed out waiting for Chrome remote debugging endpoint");
}

function launchChrome(remoteDebuggingPort) {
  if (!fs.existsSync(CHROME_PATH)) {
    throw new Error("Chrome executable not found at " + CHROME_PATH);
  }

  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "car-stills-chrome-"));
  const chrome = spawn(
    CHROME_PATH,
    [
      "--headless=new",
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--disable-background-networking",
      "--disable-background-timer-throttling",
      "--disable-breakpad",
      "--disable-component-update",
      "--disable-renderer-backgrounding",
      "--disable-sync",
      "--use-gl=angle",
      "--use-angle=swiftshader",
      "--enable-webgl",
      "--ignore-gpu-blocklist",
      "--enable-unsafe-swiftshader",
      "--mute-audio",
      "--hide-scrollbars",
      "--allow-file-access-from-files",
      "--window-size=" + VIEWPORT.width + "," + VIEWPORT.height,
      "--remote-debugging-port=" + remoteDebuggingPort,
      "--user-data-dir=" + userDataDir,
      "about:blank"
    ],
    {
      stdio: ["ignore", "pipe", "pipe"]
    }
  );

  chrome.stdout.on("data", () => {});
  chrome.stderr.on("data", () => {});

  return {
    chrome,
    userDataDir,
    async close() {
      if (!chrome.killed) {
        chrome.kill("SIGTERM");
        await new Promise((resolve) => chrome.once("exit", resolve));
      }
      fs.rmSync(userDataDir, { recursive: true, force: true });
    }
  };
}

class CdpClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.nextId = 1;
    this.pending = new Map();
    this.eventHandlers = new Map();
    this.socket = null;
  }

  async connect() {
    await new Promise((resolve, reject) => {
      const socket = new WebSocket(this.wsUrl);
      this.socket = socket;

      socket.addEventListener("open", resolve, { once: true });
      socket.addEventListener("error", reject, { once: true });
      socket.addEventListener("message", (event) => this.handleMessage(event.data));
      socket.addEventListener("close", () => {
        for (const [, pending] of this.pending) {
          pending.reject(new Error("CDP socket closed"));
        }
        this.pending.clear();
      });
    });
  }

  handleMessage(rawData) {
    const payload = JSON.parse(rawData.toString());

    if (payload.id) {
      const pending = this.pending.get(payload.id);
      if (!pending) {
        return;
      }
      this.pending.delete(payload.id);
      if (payload.error) {
        pending.reject(new Error(payload.error.message || "Unknown CDP error"));
      } else {
        pending.resolve(payload.result || {});
      }
      return;
    }

    const handlers = this.eventHandlers.get(payload.method);
    if (handlers) {
      handlers.forEach((handler) => handler(payload.params || {}));
    }
  }

  send(method, params) {
    const id = this.nextId++;
    const message = { id, method, params: params || {} };

    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.socket.send(JSON.stringify(message));
    });
  }

  on(method, handler) {
    const handlers = this.eventHandlers.get(method) || new Set();
    handlers.add(handler);
    this.eventHandlers.set(method, handlers);
    return () => handlers.delete(handler);
  }

  waitForEvent(method, predicate, timeoutMs) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        unsubscribe();
        reject(new Error("Timed out waiting for " + method));
      }, timeoutMs);

      const unsubscribe = this.on(method, (params) => {
        if (predicate && !predicate(params)) {
          return;
        }
        clearTimeout(timer);
        unsubscribe();
        resolve(params);
      });
    });
  }

  async evaluate(expression) {
    const result = await this.send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true
    });

    if (result.exceptionDetails) {
      throw new Error("Runtime evaluation failed: " + expression);
    }

    return result.result ? result.result.value : undefined;
  }

  async waitForFunction(fnSource, timeoutMs) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const passed = await this.evaluate("(" + fnSource + ")()");
      if (passed) {
        return;
      }
      await sleep(250);
    }
    throw new Error("Timed out waiting for page function");
  }

  async close() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.close();
      await sleep(100);
    }
  }
}

async function captureWebp(client, outputPath) {
  const screenshot = await client.send("Page.captureScreenshot", {
    format: "webp",
    fromSurface: true
  });
  fs.writeFileSync(outputPath, Buffer.from(screenshot.data, "base64"));
}

async function ensureOutputDirectories(cars) {
  fs.mkdirSync(OUTPUT_ROOT, { recursive: true });
  cars.forEach((car) => {
    fs.mkdirSync(path.join(OUTPUT_ROOT, car.id), { recursive: true });
  });
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const carsToCapture = getCarsToCapture(options);
  await ensureOutputDirectories(carsToCapture);

  const server = await startServer(PORT);
  const remoteDebuggingPort = await getAvailablePort();
  const chromeSession = launchChrome(remoteDebuggingPort);
  let client = null;

  try {
    const pageTarget = await waitForChromeTarget(remoteDebuggingPort, 15000);
    client = new CdpClient(pageTarget.webSocketDebuggerUrl);
    await client.connect();
    await client.send("Page.enable");
    await client.send("Runtime.enable");
    client.on("Runtime.consoleAPICalled", (params) => {
      const text = (params.args || [])
        .map((arg) => (typeof arg.value === "undefined" ? arg.description : arg.value))
        .join(" ");
      if (text) {
        console.log("[PAGE]", text);
      }
    });

    const navigation = client.waitForEvent("Page.loadEventFired", null, 120000);
    await client.send("Page.navigate", { url: "http://localhost:" + PORT + RENDER_PAGE });
    await navigation;
    await client.waitForFunction(() => Boolean(window.__stillCapture && window.__stillCapture.ready), 120000);

    for (const car of carsToCapture) {
      const loadResult = await client.evaluate("window.__stillCapture.loadCar(" + JSON.stringify(car) + ")");
      if (loadResult && loadResult.scaleFactor) {
        console.log(
          "Loaded " +
            car.id +
            " scale=" +
            Number(loadResult.scaleFactor).toFixed(2) +
            (loadResult.dimensions
              ? " dims=" +
                [loadResult.dimensions.x, loadResult.dimensions.y, loadResult.dimensions.z]
                  .map((value) => Number(value).toFixed(3))
                  .join("x")
              : "")
        );
      }

      for (const [presetName, preset] of Object.entries(CAPTURE_PRESETS)) {
        const resolvedPreset = buildPresetForCar(car, Object.assign({ name: presetName }, preset));
        await client.evaluate(
          "window.__stillCapture.applyPreset(" +
            JSON.stringify(presetName) +
            ", " +
            JSON.stringify(resolvedPreset) +
            ")"
        );

        const outputPath = path.join(OUTPUT_ROOT, car.id, presetName + ".webp");
        await captureWebp(client, outputPath);
      }

      console.log("Completed capture group: " + car.id);
    }
  } finally {
    if (client) {
      await client.close();
    }
    await chromeSession.close();
    await new Promise((resolve) => server.close(resolve));
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
