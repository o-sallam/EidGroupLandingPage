import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

try {
  console.log("=== TESTING DOC IMAGES FIX ===\n");

  // Test 1: Video 1 (5 images, 0 videos)
  console.log("TEST 1: /video/1 (should have 5 doc images)");
  await page.goto("http://localhost:8082/video/1", {
    waitUntil: "domcontentloaded",
    timeout: 10000,
  });
  await page.waitForTimeout(2000);

  // Check that preloaders exist even BEFORE video ends
  const preloadersBeforeEnd = await page.evaluate(() => {
    const hidden = Array.from(document.querySelectorAll('img.hidden[src*="videosdocs"]'));
    return {
      count: hidden.length,
      urls: hidden.map((img) => img.src),
    };
  });
  console.log(`  Preloaders before video end: ${preloadersBeforeEnd.count}`);
  console.log(`  Expected: 5`);
  console.log(`  Result: ${preloadersBeforeEnd.count === 5 ? "✓ PASS" : "✗ FAIL"}\n`);

  // Test 2: Video 2 (0 images, 3 videos)
  console.log("TEST 2: /video/2 (should have 0 doc images, 3 videos)");
  await page.goto("http://localhost:8082/video/2", {
    waitUntil: "domcontentloaded",
    timeout: 10000,
  });
  await page.waitForTimeout(2000);

  const video2Preloaders = await page.evaluate(() => {
    const hidden = Array.from(document.querySelectorAll('img.hidden[src*="videosdocs"]'));
    return hidden.length;
  });
  console.log(`  Image preloaders: ${video2Preloaders}`);
  console.log(`  Expected: 0`);
  console.log(`  Result: ${video2Preloaders === 0 ? "✓ PASS" : "✗ FAIL"}\n`);

  // Test 3: Video 3 (0 images, 2 videos)
  console.log("TEST 3: /video/3 (should have 0 doc images, 2 videos)");
  await page.goto("http://localhost:8082/video/3", {
    waitUntil: "domcontentloaded",
    timeout: 10000,
  });
  await page.waitForTimeout(2000);

  const video3Preloaders = await page.evaluate(() => {
    const hidden = Array.from(document.querySelectorAll('img.hidden[src*="videosdocs"]'));
    return hidden.length;
  });
  console.log(`  Image preloaders: ${video3Preloaders}`);
  console.log(`  Expected: 0`);
  console.log(`  Result: ${video3Preloaders === 0 ? "✓ PASS" : "✗ FAIL"}\n`);

  // Test 4: Video 6 (no docs at all)
  console.log("TEST 4: /video/6 (should have 0 docs)");
  await page.goto("http://localhost:8082/video/6", {
    waitUntil: "domcontentloaded",
    timeout: 10000,
  });
  await page.waitForTimeout(2000);

  const video6Preloaders = await page.evaluate(() => {
    const hidden = Array.from(document.querySelectorAll('img.hidden[src*="videosdocs"]'));
    return hidden.length;
  });
  console.log(`  Image preloaders: ${video6Preloaders}`);
  console.log(`  Expected: 0`);
  console.log(`  Result: ${video6Preloaders === 0 ? "✓ PASS" : "✗ FAIL"}\n`);

  console.log("=== ALL TESTS COMPLETE ===");
} catch (error) {
  console.error("Error:", error.message);
} finally {
  await browser.close();
}
