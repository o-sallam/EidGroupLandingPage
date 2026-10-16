import fs from "fs";

const docTitles = JSON.parse(fs.readFileSync("src/lib/docTitles.json", "utf-8"));

function getDocVideoTitle(videoNum, index, lang) {
  const videoEntry = docTitles[String(videoNum)]?.videos;
  if (!videoEntry) {
    return undefined;
  }

  // Try requested language first
  let titleList = videoEntry[lang];
  // Fall back to Arabic if requested language not found
  if (!titleList || titleList.length === 0) {
    titleList = videoEntry["ar"];
  }
  // Still nothing? Give up
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

console.log("=== TESTING getDocVideoTitle(videoNum, index, lang) ===\n");

const languages = ["ar", "en", "nl"];

// Test all existing videos in DOC_COUNTS for all languages
languages.forEach((lang) => {
  console.log(`\n=== Language: ${lang.toUpperCase()} ===`);
  Object.entries(DOC_COUNTS).forEach(([num, counts]) => {
    const videoNum = parseInt(num, 10);
    if (counts.videos > 0) {
      console.log(`Video ${videoNum}:`);
      for (let i = 1; i <= counts.videos; i++) {
        const title = getDocVideoTitle(videoNum, i, lang);
        console.log(`  ${i}: ${title !== undefined ? `"${title}"` : "undefined"}`);
      }
    }
  });
});

// Test edge cases
console.log("\n\n=== EDGE CASES ===");
console.log(`(9, 1, "en"):  ${getDocVideoTitle(9, 1, "en") || "undefined"}`);
console.log(`(4, 3, "nl"):  ${getDocVideoTitle(4, 3, "nl") || "undefined"}`);
console.log(`(4, 4, "nl"):  ${getDocVideoTitle(4, 4, "nl") || "undefined"}`);
console.log(`(2, 1, "fr"):  ${getDocVideoTitle(2, 1, "fr") || "undefined"} (should fallback to ar)`);
