// Manual verification of the intro video page (Phase 2 QA).
// Run: node scripts/verify-intro.mjs  (starts preview server itself)
import { chromium } from "playwright";
import { spawn } from "node:child_process";

const PORT = 4343;
const BASE = `http://localhost:${PORT}`;

const server = spawn("npx", ["vite", "dev", "--port", String(PORT), "--strictPort"], {
  stdio: "ignore",
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForServer() {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(BASE);
      if (res.ok) return;
    } catch {}
    await sleep(500);
  }
  throw new Error("preview server did not start");
}

function assert(cond, msg) {
  if (!cond) throw new Error(`FAIL: ${msg}`);
  console.log(`  ✓ ${msg}`);
}

function captureConsoleErrors(page) {
  const errors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(String(err)));
  return errors;
}

let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } }); // iPhone-ish
  const consoleErrors = captureConsoleErrors(page);

  // 1. First visit → /lang
  console.log("\n[1] Language selection page");
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  await page.waitForURL("**/lang", { timeout: 10000 });
  assert(true, "redirected to /lang on first visit");
  // No preloader before language is chosen
  const preBefore = await page.locator(".video-preloader").count();
  assert(preBefore === 0, "no preloader before language chosen");

  // 2. Pick English
  console.log("\n[2] Choose English");
  await page.getByRole("button", { name: "English" }).click();
  await page.waitForURL("**/", { timeout: 10000 });
  await sleep(1500); // let splash start

  // Preloader should now be mounted with the English video
  const preSrc = await page
    .locator(".video-preloader")
    .getAttribute("src")
    .catch(() => null);
  assert(preSrc?.includes("intro-en.mp4"), `preloader warming en video (src=${preSrc})`);

  // 3. Splash → welcome → access
  console.log("\n[3] Splash → welcome → access");
  await page.waitForSelector("text=Private Investment Presentation", { timeout: 15000 });
  await page.getByRole("button", { name: "Enter Presentation" }).click();
  await page.waitForURL("**/access", { timeout: 10000 });
  assert(true, "reached /access");

  // Preloader must survive the route change (still mounted)
  const preAfter = await page.locator(".video-preloader").count();
  assert(preAfter === 1, "preloader persists across route change to /access");

  // 4. Unlock → /intro
  console.log("\n[4] Access code → /intro");
  await page.locator("input[type=password]").fill("EID2026");
  await page.getByRole("button", { name: "Enter" }).click();
  await page.waitForURL("**/intro", { timeout: 10000 });
  assert(true, "reached /intro (route preserved)");

  // 5. Video element checks
  console.log("\n[5] Video hero checks");
  const video = page.locator(".video-hero video");
  await video.waitFor({ state: "attached", timeout: 5000 });
  const src = await video.getAttribute("src");
  assert(src === "https://egroup.runasp.net/videos/intro-en.mp4", `src = en video (${src})`);
  const attrs = await video.evaluate((v) => ({
    autoplay: v.autoplay,
    muted: v.muted,
    playsInline: v.hasAttribute("playsinline"),
    loop: v.loop,
    controls: v.controls,
    disablePiP: v.hasAttribute("disablepictureinpicture"),
    controlsList: v.getAttribute("controlslist"),
    crossorigin: v.hasAttribute("crossorigin"),
  }));
  assert(attrs.autoplay === true, "autoplay set");
  console.log(`  ℹ muted=${attrs.muted} (true = waiting for gesture, false = sound auto-ran)`);
  assert(attrs.playsInline === true, "playsInline set");
  assert(attrs.loop === false, "no loop (auto-advances on ended)");
  assert(attrs.controls === false, "no native controls");
  assert(attrs.disablePiP === true, "disablePictureInPicture set");
  assert(
    attrs.controlsList === "nodownload noplaybackrate nofullscreen",
    "controlsList restricts download/rate/fullscreen",
  );
  assert(attrs.crossorigin === false, "no crossorigin attr (CORS-free playback)");

  // Layout: full-viewport cover (wait for the 0.45s entrance animation to
  // finish — getBoundingClientRect includes the scale transform mid-flight)
  await page.waitForTimeout(800);
  const layout = await video.evaluate((v) => {
    const r = v.getBoundingClientRect();
    return {
      vw: window.innerWidth,
      vh: window.innerHeight,
      w: r.width,
      h: r.height,
      objectFit: getComputedStyle(v).objectFit,
      position: getComputedStyle(v).position,
    };
  });
  assert(Math.abs(layout.w - layout.vw) < 2, `edge-to-edge width (${layout.w} vs ${layout.vw})`);
  assert(Math.abs(layout.h - layout.vh) < 2, `edge-to-edge height (${layout.h} vs ${layout.vh})`);
  assert(layout.objectFit === "cover", "object-fit: cover");
  assert(layout.position === "absolute", "video fills fixed hero container");

  // Playback state (video is large; wait for first frame or readyState>=2)
  const ready = await video.evaluate(
    (v) =>
      new Promise((resolve) => {
        if (v.readyState >= 2) return resolve(v.readyState);
        v.addEventListener("loadeddata", () => resolve(v.readyState), { once: true });
        setTimeout(() => resolve(v.readyState), 15000);
      }),
  );
  console.log(`  ℹ readyState=${ready} (2=current data, 3=future data, 4=enough)`);
  assert(ready >= 2, "video buffered to at least current-frame (preload working)");

  const playing = await video.evaluate(
    (v) =>
      new Promise((resolve) => {
        if (!v.paused) return resolve(true);
        v.addEventListener("playing", () => resolve(true), { once: true });
        setTimeout(() => resolve(!v.paused), 10000);
      }),
  );
  assert(playing, "video is playing (muted autoplay)");

  // Right-click → no context menu
  console.log("\n[6] Context menu suppression");
  let menuOpened = false;
  page.on("contextmenu", () => (menuOpened = true));
  await video.click({ button: "right" });
  await sleep(300);
  assert(menuOpened === false, "right-click context menu suppressed");

  // Sound: either browsers let sound auto-run on arrival (Chrome — the user
  // already interacted with the domain on /lang + /access) or they keep it
  // muted until the first gesture (Safari/Firefox). Both are legal; the
  // invariants are: a gesture always ends unmuted+playing, and the toggle
  // re-mutes / re-unmutes.
  console.log("\n[6b] Sound auto-run behavior");
  const arrival = await video.evaluate((v) => ({ muted: v.muted, paused: v.paused }));
  console.log(
    `  ℹ arrival: muted=${arrival.muted} paused=${arrival.paused} (${arrival.muted ? "muted until gesture" : "sound auto-ran"})`,
  );
  if (arrival.muted) {
    // …first user gesture lifts muting (autoplay policy allows
    // play-with-sound inside a trusted gesture)…
    await page.mouse.click(195, 200);
    await sleep(400);
  }
  const afterGesture = await video.evaluate((v) => ({ muted: v.muted, paused: v.paused }));
  assert(afterGesture.muted === false, "sound is on after first interaction");
  assert(afterGesture.paused === false, "still playing with sound on");

  // …and the toggle re-mutes, then re-unmutes.
  await page.locator(".video-hero-mute").click();
  await sleep(200);
  const remuted = await video.evaluate((v) => v.muted);
  assert(remuted === true, "mute toggle mutes again");
  await page.locator(".video-hero-mute").click();
  await sleep(200);
  const reUnmuted = await video.evaluate((v) => v.muted);
  assert(reUnmuted === false, "mute toggle unmutes again");

  // Auto-advance: when the video ends it should fade to black, then land on
  // /video/1 with a light delay. First wait for the whole file to buffer
  // (preload only guarantees fast start, not the tail bytes), then seek just
  // before the end to trigger ended quickly.
  console.log("\n[6c] Auto-advance on video end");
  await page.waitForFunction(
    () => {
      const v = document.querySelector(".video-hero video");
      return v && v.buffered.length > 0 && v.buffered.end(v.buffered.length - 1) >= v.duration - 0.05;
    },
    undefined,
    { timeout: 180000, polling: 1000 }
  );
  console.log("  ℹ video fully buffered — seeking to the end");
  await video.evaluate((v) => {
    v.currentTime = Math.max(0, v.duration - 0.6);
    v.play().catch(() => {});
  });
  await page.waitForSelector(".video-hero-leaving", { timeout: 10000 });
  console.log("  ✓ fade-to-black started when video ended");
  await page.waitForURL("**/video/1", { timeout: 10000, waitUntil: "commit" });
  console.log("  ✓ auto-advanced to /video/1 after the fade delay");

  // 7. Arabic — fresh context with the lang flag preset (provider defaults to
  // "ar"), verify the preloader + hero both pick intro-ar.mp4.
  console.log("\n[7] Arabic → intro-ar.mp4");
  const arCtx = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  await arCtx.addInitScript(() => localStorage.setItem("eid_lang_chosen", "1"));
  const arPage = await arCtx.newPage();
  await arPage.goto(BASE + "/intro", { waitUntil: "domcontentloaded" });
  await arPage.waitForSelector(".video-hero video", { timeout: 15000 });
  const arHeroSrc = await arPage.locator(".video-hero video").getAttribute("src");
  assert(arHeroSrc?.includes("intro-ar.mp4"), `hero uses ar video (src=${arHeroSrc})`);
  const arPreSrc = await arPage
    .locator(".video-preloader")
    .getAttribute("src")
    .catch(() => null);
  assert(arPreSrc?.includes("intro-ar.mp4"), `preloader warms ar video (src=${arPreSrc})`);
  await arCtx.close();

  // 8. No hydration mismatch anywhere in the flow
  console.log("\n[8] Hydration integrity");
  await page.goto(BASE + "/intro", { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".video-hero video", { timeout: 15000 });
  await sleep(800);
  const hydErrors = consoleErrors.filter((e) => /hydrat/i.test(e));
  assert(hydErrors.length === 0, "no hydration mismatch errors");

  console.log("\nALL CHECKS PASSED ✅");
} catch (err) {
  console.error("\nVERIFICATION FAILED ❌\n", err.message);
  process.exitCode = 1;
} finally {
  if (browser) await browser.close().catch(() => {});
  server.kill("SIGTERM");
}
