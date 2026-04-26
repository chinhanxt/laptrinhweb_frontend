const puppeteer = require("puppeteer-core");
const http = require("http");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const OUTPUT_DIR = path.join(PROJECT_ROOT, "assets", "media", "hero");
const FRAMES_DIR = path.join(OUTPUT_DIR, "frames");
const FFMPEG_PATH = require("@ffmpeg-installer/ffmpeg").path;

const MIME_TYPES = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".glb": "model/gltf-binary",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
};

function startServer(port) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let filePath = path.join(PROJECT_ROOT, req.url === "/" ? "tools/render-hero-video.html" : req.url);
      filePath = decodeURIComponent(filePath);

      if (!fs.existsSync(filePath)) {
        res.writeHead(404);
        res.end("Not found: " + req.url);
        return;
      }

      const ext = path.extname(filePath);
      const mime = MIME_TYPES[ext] || "application/octet-stream";
      const data = fs.readFileSync(filePath);
      res.writeHead(200, { "Content-Type": mime });
      res.end(data);
    });

    server.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
      resolve(server);
    });
  });
}

async function main() {
  const PORT = 9876;
  const server = await startServer(PORT);

  if (fs.existsSync(FRAMES_DIR)) {
    fs.rmSync(FRAMES_DIR, { recursive: true });
  }
  fs.mkdirSync(FRAMES_DIR, { recursive: true });

  console.log("Launching Chrome...");
  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/google-chrome",
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--use-gl=angle",
      "--use-angle=vulkan",
      "--enable-webgl",
      "--enable-gpu",
      "--disable-gpu-sandbox",
      "--enable-unsafe-swiftshader",
      "--window-size=1920,1080",
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  page.on("console", (msg) => {
    const text = msg.text();
    console.log("[PAGE]", text);
  });

  console.log("Loading renderer page...");
  await page.goto(`http://localhost:${PORT}/tools/render-hero-video.html`, {
    waitUntil: "networkidle0",
    timeout: 120000,
  });

  console.log("Waiting for models to load...");
  await page.waitForFunction(() => window.__modelsLoaded === true, { timeout: 120000 });
  console.log("Models loaded!");

  const totalFrames = await page.evaluate(() => window.__totalFrames);
  console.log(`Rendering ${totalFrames} frames (${totalFrames / 30}s at 30fps)...`);

  for (let i = 0; i < totalFrames; i++) {
    await page.evaluate((idx) => window.__renderFrame(idx), i);

    const framePath = path.join(FRAMES_DIR, `frame_${String(i).padStart(5, "0")}.jpg`);
    await page.screenshot({ path: framePath, type: "jpeg", quality: 95 });

    if (i % 30 === 0) {
      process.stdout.write(`\r  Frame ${i}/${totalFrames} (${Math.round((i / totalFrames) * 100)}%)`);
    }
  }
  console.log(`\r  Frame ${totalFrames}/${totalFrames} (100%)        `);

  await browser.close();
  server.close();

  const webmPath = path.join(OUTPUT_DIR, "apex-intro-loop.webm");
  const mp4Path = path.join(OUTPUT_DIR, "apex-intro-loop.mp4");
  const posterPath = path.join(OUTPUT_DIR, "apex-intro-poster.jpg");

  console.log("Encoding frames -> MP4...");
  execSync(
    `"${FFMPEG_PATH}" -y -framerate 30 -i "${FRAMES_DIR}/frame_%05d.jpg" -vf scale=1280:720 -c:v libx264 -crf 26 -preset medium -pix_fmt yuv420p -an -movflags +faststart "${mp4Path}"`,
    { stdio: "inherit" }
  );

  console.log("Encoding frames -> WebM...");
  execSync(
    `"${FFMPEG_PATH}" -y -framerate 30 -i "${FRAMES_DIR}/frame_%05d.jpg" -vf scale=1280:720 -c:v libvpx-vp9 -crf 38 -b:v 0 -an "${webmPath}"`,
    { stdio: "inherit" }
  );

  console.log("Extracting poster frame...");
  fs.copyFileSync(
    path.join(FRAMES_DIR, "frame_00060.jpg"),
    posterPath
  );

  console.log("Cleaning up frames...");
  fs.rmSync(FRAMES_DIR, { recursive: true });

  console.log("\nDone! Output files:");
  [webmPath, mp4Path, posterPath].forEach((f) => {
    if (fs.existsSync(f)) {
      const size = (fs.statSync(f).size / 1024 / 1024).toFixed(2);
      console.log(`  ${path.basename(f)}: ${size} MB`);
    } else {
      console.log(`  ${path.basename(f)}: MISSING`);
    }
  });
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
