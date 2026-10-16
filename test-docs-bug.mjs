import { chromium } from "playwright";

const browser = await chromium.launch({ headless: false });
const context = await browser.newContext();
const page = await context.newPage();

// Listen to console messages
page.on("console", (msg) => {
  if (msg.type() === "warning" || msg.type() === "error") {
    console.log(`[${msg.type()}]`, msg.text());
  }
});

console.log("Navigating to /video/1...");
await page.goto("http://localhost:8082/video/1", { waitUntil: "networkidle" });
await page.waitForTimeout(2000);

console.log("\nFast-forwarding to end of video...");
await page.evaluate(() => {
  const video = document.querySelector("video");
  if (video) {
    video.currentTime = video.duration - 0.1;
    video.dispatchEvent(new Event("ended"));
  }
});
await page.waitForTimeout(1000);

console.log("\nClicking Documents button...");
const docsButton = page
  .locator('button:has-text("المستندات"), button:has-text("Documents")')
  .last();
await docsButton.click();
await page.waitForTimeout(1000);

console.log("\n=== CHECKING DOM ===");
const images = await page.locator('img[src*="videosdocs"]').all();
console.log(`Found ${images.length} images with videosdocs URLs`);

for (let i = 0; i < images.length; i++) {
  const img = images[i];
  const src = await img.getAttribute("src");
  const computed = await img.evaluate((el) => {
    const style = window.getComputedStyle(el);
    return {
      display: style.display,
      visibility: style.visibility,
      width: style.width,
      height: style.height,
      naturalWidth: el.naturalWidth,
      naturalHeight: el.naturalHeight,
      complete: el.complete,
    };
  });
  console.log(`\nImage ${i + 1}:`);
  console.log(`  src: ${src}`);
  console.log(`  display: ${computed.display}`);
  console.log(`  visibility: ${computed.visibility}`);
  console.log(`  width: ${computed.width}, height: ${computed.height}`);
  console.log(`  naturalWidth: ${computed.naturalWidth}, naturalHeight: ${computed.naturalHeight}`);
  console.log(`  complete: ${computed.complete}`);
}

console.log("\n=== CHECKING VISIBLE THUMBNAILS ===");
const visibleThumbs = await page.locator('button img[src*="videosdocs"]').all();
console.log(`Visible thumbnail images: ${visibleThumbs.length}`);

console.log("\n=== TAKING SCREENSHOT ===");
await page.screenshot({ path: "docs-overlay-bug.png", fullPage: true });
console.log("Screenshot saved to: docs-overlay-bug.png");

await browser.close();
