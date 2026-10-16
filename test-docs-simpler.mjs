import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

try {
  console.log("=== TESTING /video/1 DOCUMENTS ===\n");

  console.log("1. Navigating to /video/1...");
  await page.goto("http://localhost:8082/video/1", {
    waitUntil: "domcontentloaded",
    timeout: 10000,
  });
  await page.waitForTimeout(2000);

  console.log("2. Triggering video end...");
  await page.evaluate(() => {
    const video = document.querySelector("video");
    if (video) {
      video.currentTime = video.duration || 100;
      const event = new Event("ended");
      video.dispatchEvent(event);
    }
  });
  await page.waitForTimeout(1500);

  console.log("3. Looking for buttons...");
  const buttonInfo = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    return buttons
      .map((btn) => ({
        text: btn.textContent?.trim() || "",
        hasFileIcon: !!btn.querySelector("svg"),
      }))
      .filter((b) => b.text || b.hasFileIcon);
  });
  console.log("Buttons found:", JSON.stringify(buttonInfo, null, 2));

  // Click button with FileText icon (Documents)
  await page.click(
    'button:has(svg):has-text("مستندات"), button:has(svg):has-text("Documents"), button[aria-label*="doc" i], button:nth-child(2):has(svg)',
  );
  await page.waitForTimeout(1000);

  console.log("\n=== DOM INSPECTION ===");
  const result = await page.evaluate(() => {
    const images = Array.from(document.querySelectorAll('img[src*="videosdocs"]'));
    const visibleImages = images.filter((img) => {
      const style = window.getComputedStyle(img);
      return (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        !img.className.includes("hidden")
      );
    });

    return {
      totalImages: images.length,
      visibleImages: visibleImages.length,
      imageDetails: images.map((img) => ({
        src: img.src,
        className: img.className,
        display: window.getComputedStyle(img).display,
        visibility: window.getComputedStyle(img).visibility,
        complete: img.complete,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
      })),
    };
  });

  console.log(`\nTotal images with videosdocs URL: ${result.totalImages}`);
  console.log(`Visible images: ${result.visibleImages}`);

  result.imageDetails.forEach((img, i) => {
    console.log(`\nImage ${i + 1}:`);
    console.log(`  src: ${img.src}`);
    console.log(`  className: ${img.className}`);
    console.log(`  display: ${img.display}, visibility: ${img.visibility}`);
    console.log(`  loaded: ${img.complete}, size: ${img.naturalWidth}x${img.naturalHeight}`);
  });

  console.log("\n=== SCREENSHOT ===");
  await page.screenshot({ path: "docs-overlay.png", fullPage: true });
  console.log("Saved to: docs-overlay.png");
} catch (error) {
  console.error("Error:", error.message);
} finally {
  await browser.close();
}
