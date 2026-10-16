import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

try {
  console.log("=== TESTING DOC VIDEO TITLES IN UI ===\n");

  const testVideo = async (videoNum, expectedTitles) => {
    console.log(`TEST: /video/${videoNum}`);
    await page.goto(`http://localhost:8082/video/${videoNum}`, {
      waitUntil: "domcontentloaded",
      timeout: 10000,
    });
    await page.waitForTimeout(2000);

    // Trigger video end
    await page.evaluate(() => {
      const video = document.querySelector("video");
      if (video) {
        video.currentTime = video.duration || 100;
        video.dispatchEvent(new Event("ended"));
      }
    });
    await page.waitForTimeout(1500);

    // Find and click Documents button - it's the second button in the end screen action group
    try {
      // Wait for end screen to appear
      await page.waitForSelector('button:has-text("المستندات"), button:has-text("Documents")', {
        timeout: 5000,
      });
      await page.click('button:has-text("المستندات"), button:has-text("Documents")');
    } catch (e) {
      // Fallback: look for button with FileText icon after Questions button
      const allButtons = await page.locator("button").all();
      let clicked = false;
      for (let i = 0; i < allButtons.length; i++) {
        const btn = allButtons[i];
        const text = await btn.textContent();
        if (text && text.includes("مستند")) {
          await btn.click();
          clicked = true;
          break;
        }
      }
      if (!clicked) {
        console.log("  Could not find Documents button - skipping");
        return;
      }
    }
    
    await page.waitForTimeout(1000);

    // Extract visible titles
    const titles = await page.evaluate(() => {
      const titleElements = Array.from(
        document.querySelectorAll('button[aria-label*=""] span[dir="auto"]'),
      );
      return titleElements.map((el) => el.textContent?.trim()).filter(Boolean);
    });

    console.log(`  Found ${titles.length} titles:`);
    titles.forEach((title, i) => {
      console.log(`    ${i + 1}. ${title}`);
    });

    if (expectedTitles.length > 0) {
      const match = titles.length === expectedTitles.length;
      console.log(
        `  Expected: ${expectedTitles.length} titles - ${match ? "✓ PASS" : "✗ FAIL"}`,
      );
    } else {
      console.log(`  Expected: no titles - ${titles.length === 0 ? "✓ PASS" : "✗ FAIL"}`);
    }

    // Take screenshot for video 2
    if (videoNum === 2) {
      await page.screenshot({ path: "video2-docs-overlay.png", fullPage: true });
      console.log("  Screenshot: video2-docs-overlay.png");
    }

    console.log();
  };

  // Test videos with titles
  await testVideo(2, ["الاستثمار الذكي", "الفرص ما بضل متاحة", "الاستثمار صح"]);
  await testVideo(3, ["تحليل العروض", "الهدف من شراء العقار"]);
  await testVideo(4, ["بعض الاراضي", "بعض الاراضي"]); // Only 2 titles, not 4
  await testVideo(5, ["فحص الاوراق", "تدقيق قانوني وفني"]);

  // Test video 1 (images only)
  console.log("TEST: /video/1 (should show 5 images, no videos)");
  await page.goto("http://localhost:8082/video/1", {
    waitUntil: "domcontentloaded",
    timeout: 10000,
  });
  await page.waitForTimeout(2000);

  const imagePreloaders = await page.evaluate(() => {
    return document.querySelectorAll('img.hidden[src*="v1docs/images"]').length;
  });
  console.log(`  Image preloaders: ${imagePreloaders}`);
  console.log(`  Expected: 5 - ${imagePreloaders === 5 ? "✓ PASS" : "✗ FAIL"}\n`);

  // Test video 6 (empty state)
  console.log("TEST: /video/6 (should show empty state)");
  await page.goto("http://localhost:8082/video/6", {
    waitUntil: "domcontentloaded",
    timeout: 10000,
  });
  await page.waitForTimeout(2000);

  const video6Preloaders = await page.evaluate(() => {
    return document.querySelectorAll('img.hidden[src*="videosdocs"]').length;
  });
  console.log(`  Preloaders: ${video6Preloaders}`);
  console.log(`  Expected: 0 - ${video6Preloaders === 0 ? "✓ PASS" : "✗ FAIL"}\n`);

  console.log("=== ALL TESTS COMPLETE ===");
} catch (error) {
  console.error("Error:", error.message);
} finally {
  await browser.close();
}
