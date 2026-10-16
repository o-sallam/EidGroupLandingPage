import { DOC_COUNTS } from "./src/lib/mediaManifest.ts";
import { getDocVideoTitle } from "./src/lib/docImages.ts";

console.log("=== TESTING getDocVideoTitle ===\n");

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
