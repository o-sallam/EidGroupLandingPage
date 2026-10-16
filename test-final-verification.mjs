import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();

async function testVideo(num, expectedImages, expectedVideos) {
  const page = await context.newPage();
  
  console.log(`\n=== Testing /video/${num} (expect ${expectedImages} images, ${expectedVideos} videos) ===`);
  
  // Mark video 1 as watched if testing video > 1
  if (num > 1) {
    await page.goto('http://localhost:8080/video/1');
    await page.evaluate(() => {
      localStorage.setItem('eid_watch_data', JSON.stringify({ 1: { w: 1, p: 0 } }));
    });
  }
  
  await page.goto(`http://localhost:8080/video/${num}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000);
  await page.mouse.click(400, 400);
  await page.waitForTimeout(1000);
  
  const mainVideo = page.locator('video').first();
  const hasVideo = await mainVideo.count();
  
  if (hasVideo > 0) {
    await mainVideo.evaluate(v => {
      if (v.duration) v.currentTime = v.duration - 0.1;
      v.dispatchEvent(new Event('ended', { bubbles: true }));
    });
    await page.waitForTimeout(2000);
  }
  
  // Click Documents button
  const allButtons = await page.locator('button').all();
  for (let i = 0; i < allButtons.length; i++) {
    const text = await allButtons[i].textContent();
    if (text?.includes('الصور') || text?.includes('مستند')) {
      await allButtons[i].click();
      await page.waitForTimeout(2000);
      break;
    }
  }
  
  // Check doc images
  const docImages = await page.locator('img[src*="/videosdocs/"]').all();
  console.log(`Doc images: ${docImages.length} (expected ${expectedImages})`);
  
  // Check video thumbnails
  const videoThumbnails = await page.locator('button.group').all();
  console.log(`Video thumbnails: ${videoThumbnails.length} (expected ${expectedVideos})`);
  
  // Verify match
  const match = docImages.length === expectedImages && videoThumbnails.length === expectedVideos;
  console.log(match ? '✓ PASS' : '✗ FAIL');
  
  await page.close();
}

// Test all videos
await testVideo(1, 5, 0);  // 5 images, 0 videos
await testVideo(2, 0, 3);  // 0 images, 3 videos
await testVideo(3, 0, 2);  // 0 images, 2 videos
await testVideo(4, 0, 4);  // 0 images, 4 videos
await testVideo(5, 0, 2);  // 0 images, 2 videos

// Test unknown video
const page = await context.newPage();
await page.goto('http://localhost:8080/video/1');
await page.evaluate(() => {
  localStorage.setItem('eid_watch_data', JSON.stringify({ 1: { w: 1, p: 0 } }));
});
await page.goto('http://localhost:8080/video/6', { waitUntil: 'networkidle' });
await page.waitForTimeout(5000);
await page.mouse.click(400, 400);
await page.waitForTimeout(1000);

const mainVideo = page.locator('video').first();
const hasVideo = await mainVideo.count();

if (hasVideo > 0) {
  await mainVideo.evaluate(v => {
    if (v.duration) v.currentTime = v.duration - 0.1;
    v.dispatchEvent(new Event('ended', { bubbles: true }));
  });
  await page.waitForTimeout(2000);
}

const allButtons = await page.locator('button').all();
for (let i = 0; i < allButtons.length; i++) {
  const text = await allButtons[i].textContent();
  if (text?.includes('الصور') || text?.includes('مستند')) {
    await allButtons[i].click();
    await page.waitForTimeout(2000);
    break;
  }
}

const emptyState = await page.locator('text=لا توجد').count();
console.log(`\n=== Testing /video/6 (expect empty state) ===`);
console.log(`Empty state message: ${emptyState > 0 ? 'shown' : 'not shown'}`);
console.log(emptyState > 0 ? '✓ PASS' : '✗ FAIL');

await page.close();
await browser.close();
