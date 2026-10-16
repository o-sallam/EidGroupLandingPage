import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();

console.log("Testing error handling with route interception\n");

// Intercept the second video and make it return 404
await page.route("**/v2docs/videos/2.mp4", (route) => {
  route.fulfill({
    status: 404,
    contentType: "text/html",
    body: "Not Found",
  });
});

// Mark video 1 as watched
await page.goto("http://localhost:8080/video/1");
await page.evaluate(() => {
  localStorage.setItem("eid_watch_data", JSON.stringify({ 1: { w: 1, p: 0 } }));
});

await page.goto("http://localhost:8080/video/2", { waitUntil: "networkidle" });

// Wait for hydration
await page.waitForTimeout(5000);

// Click to activate
await page.mouse.click(400, 400);
await page.waitForTimeout(1000);

// Trigger end
const mainVideo = page.locator("video").first();
const hasVideo = await mainVideo.count();

if (hasVideo > 0) {
  await mainVideo.evaluate((v) => {
    if (v.duration) v.currentTime = v.duration - 0.1;
    v.dispatchEvent(new Event("ended", { bubbles: true }));
  });
  await page.waitForTimeout(2000);
}

// Click Documents button
const allButtons = await page.locator("button").all();
for (let i = 0; i < allButtons.length; i++) {
  const text = await allButtons[i].textContent();
  if (text?.includes("الصور") || text?.includes("مستند")) {
    await allButtons[i].click();
    console.log("Clicked Documents button");
    await page.waitForTimeout(2000);
    break;
  }
}

// Check visible video thumbnails
const videoThumbnails = await page.locator("button.group").all();
const visibleThumbnails = [];

for (const thumb of videoThumbnails) {
  const isVisible = await thumb.isVisible();
  if (isVisible) visibleThumbnails.push(thumb);
}

console.log(
  `Video thumbnail buttons: ${videoThumbnails.length} total, ${visibleThumbnails.length} visible`,
);
console.log(`Expected: 2 visible (videos 1 and 3, since video 2 returns 404)`);

// Check console errors
let hasError = false;
page.on("console", (msg) => {
  if (msg.type() === "error" || msg.type() === "warning") {
    if (msg.text().includes("v2docs")) {
      console.log(`Console ${msg.type()}: ${msg.text()}`);
      hasError = true;
    }
  }
});

// Wait a bit for any errors to appear
await page.waitForTimeout(2000);

if (!hasError) {
  console.log("No console errors related to v2docs");
}

await browser.close();
