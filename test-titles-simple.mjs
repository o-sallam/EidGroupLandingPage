import fs from "fs";

const docTitles = JSON.parse(fs.readFileSync("src/lib/docTitles.json", "utf-8"));
const manifest = `
DOC_COUNTS = {
  1: { images: 5, videos: 0 },
  2: { images: 0, videos: 3 },
  3: { images: 0, videos: 2 },
  4: { images: 0, videos: 4 },
  5: { images: 0, videos: 2 },
}`;

console.log("=== TESTING getDocVideoTitle logic ===\n");

function getDocVideoTitle(videoNum, index) {
  const titleList = docTitles[String(videoNum)]?.videos;
  if (!titleList || titleList.length === 0) {
    return undefined;
  }
  const title = titleList[index - 1]; // Convert 1-based to 0-based
  return title && title.trim() ? title : undefined;
}

const DOC_COUNTS = {
  1: { images: 5, videos: 0 },
  2: { images: 0, videos: 3 },
  3: { images: 0, videos: 2 },
  4: { images: 0, videos: 4 },
  5: { images: 0, videos: 2 },
};

// Test all existing videos in DOC_COUNTS
Object.entries(DOC_COUNTS).forEach(([num, counts]) => {
  const videoNum = parseInt(num, 10);
  if (counts.videos > 0) {
    console.log(`Video ${videoNum} (${counts.videos} videos):`);
    for (let i = 1; i <= counts.videos; i++) {
      const title = getDocVideoTitle(videoNum, i);
      console.log(`  ${i}: ${title !== undefined ? `"${title}"` : "undefined"}`);
    }
  }
});

// Test edge cases
console.log("\nEdge cases:");
console.log(`Video 4, index 3: ${getDocVideoTitle(4, 3) || "undefined"}`);
console.log(`Video 4, index 4: ${getDocVideoTitle(4, 4) || "undefined"}`);
console.log(`Video 9, index 1: ${getDocVideoTitle(9, 1) || "undefined"}`);

console.log("\n=== Expected results ===");
console.log("Video 2: 3 titles (الاستثمار الذكي, الفرص ما بضل متاحة, الاستثمار صح)");
console.log("Video 3: 2 titles (تحليل العروض, الهدف من شراء العقار)");
console.log("Video 4: 2 titles on videos 1-2 (بعض الاراضي, بعض الاراضي), undefined on 3-4");
console.log("Video 5: 2 titles (فحص الاوراق, تدقيق قانوني وفني)");
console.log("Video 9: undefined (unknown video)");
