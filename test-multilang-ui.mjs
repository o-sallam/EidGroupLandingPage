import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

try {
  console.log("=== TESTING MULTILANG TITLES & VIDEO THUMBNAILS ===\n");

  const testVideo = async (videoNum) => {
    console.log(`\n=== VIDEO ${videoNum} ===`);
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
    await page.waitForTimeout(2500);

    // Find language switcher - check for common patterns
    const langSwitcher = await page.evaluate(() => {
      // Look for language buttons or links
      const buttons = Array.from(document.querySelectorAll("button, a"));
      const langElements = buttons.filter(
        (el) =>
          el.textContent?.includes("EN") ||
          el.textContent?.includes("AR") ||
          el.textContent?.includes("NL") ||
          el.textContent?.includes("English") ||
          el.textContent?.includes("العربية") ||
          el.textContent?.includes("Nederlands"),
      );
      return langElements.length > 0;
    });

    console.log(`Language switcher found: ${langSwitcher ? "YES" : "NO (will skip lang tests)"}`);

    // Click Documents button
    try {
      await page.waitForSelector('button:has-text("المستندات"), button:has-text("Documents")', {
        timeout: 3000,
      });
      await page.click('button:has-text("المستندات"), button:has-text("Documents")');
    } catch (e) {
      console.log("Could not find Documents button - skipping");
      return;
    }

    await page.waitForTimeout(1500);

    // Test each language
    const languages = ["ar", "en", "nl"];
    for (const lang of languages) {
      console.log(`\n  Language: ${lang.toUpperCase()}`);

      // Switch language via document.documentElement if no UI switcher
      await page.evaluate((l) => {
        document.documentElement.setAttribute("lang", l);
      }, lang);
      await page.waitForTimeout(500);

      // Extract titles
      const titles = await page.evaluate(() => {
        const spans = Array.from(document.querySelectorAll('span[dir="rtl"], span[dir="ltr"]'));
        return spans
          .map((el) => el.textContent?.trim())
          .filter((t) => t && t.length > 3 && !t.includes("..."));
      });

      console.log(`    Titles: ${titles.length > 0 ? titles.join(" | ") : "none"}`);

      // Check video thumbnails
      const videoInfo = await page.evaluate(() => {
        const videos = Array.from(
          document.querySelectorAll('video[src*="#t=0.1"][preload="metadata"]'),
        );
        return videos.map((v) => ({
          hasSrc: !!v.getAttribute("src"),
          readyState: v.readyState,
          videoWidth: v.videoWidth,
        }));
      });

      if (videoInfo.length > 0) {
        console.log(`    Video thumbnails: ${videoInfo.length} found`);
        const decoded = videoInfo.filter((v) => v.videoWidth > 0).length;
        console.log(`    Decoded frames: ${decoded}/${videoInfo.length}`);
      }
    }

    // Screenshot for video 2 in English
    if (videoNum === 2) {
      await page.evaluate(() => {
        document.documentElement.setAttribute("lang", "en");
      });
      await page.waitForTimeout(500);
      await page.screenshot({ path: "video2-docs-en.png", fullPage: true });
      console.log("\n  Screenshot: video2-docs-en.png");
    }
  };

  // Test videos with doc videos
  await testVideo(2);
  await testVideo(3);
  await testVideo(4);
  await testVideo(5);

  // Test video 1 (images only)
  console.log("\n\n=== VIDEO 1 (Images only) ===");
  await page.goto("http://localhost:8082/video/1", {
    waitUntil: "domcontentloaded",
    timeout: 10000,
  });
  await page.waitForTimeout(2000);

  const v1Images = await page.evaluate(() => {
    return document.querySelectorAll('img.hidden[src*="v1docs/images"]').length;
  });
  console.log(`Image preloaders: ${v1Images} (expected: 5) - ${v1Images === 5 ? "✓" : "✗"}`);

  // Test video 6 (empty)
  console.log("\n=== VIDEO 6 (Empty state) ===");
  await page.goto("http://localhost:8082/video/6", {
    waitUntil: "domcontentloaded",
    timeout: 10000,
  });
  await page.waitForTimeout(2000);

  const v6Preloaders = await page.evaluate(() => {
    return document.querySelectorAll('img.hidden[src*="videosdocs"]').length;
  });
  console.log(`Preloaders: ${v6Preloaders} (expected: 0) - ${v6Preloaders === 0 ? "✓" : "✗"}`);

  console.log("\n=== ALL TESTS COMPLETE ===");
} catch (error) {
  console.error("Error:", error.message);
} finally {
  await browser.close();
}
