import fs from "fs";

// Read the manifest
const manifestContent = fs.readFileSync("src/lib/mediaManifest.ts", "utf-8");
console.log("=== Checking DOC_COUNTS for video 1 ===\n");

// Extract DOC_COUNTS line for video 1
const video1Line = manifestContent.match(/1:\s*\{\s*images:\s*(\d+),\s*videos:\s*(\d+)\s*\}/);
if (video1Line) {
  console.log(`Video 1 config: { images: ${video1Line[1]}, videos: ${video1Line[2]} }`);
  console.log(`Expected: { images: 5, videos: 0 }`);
  console.log(`Match: ${video1Line[1] === "5" && video1Line[2] === "0" ? "✓ PASS" : "✗ FAIL"}`);
} else {
  console.log("✗ FAIL - Could not find video 1 config");
}

// Check mediaUrl.ts
console.log("\n=== Checking mediaUrl.ts ===\n");
const mediaUrlContent = fs.readFileSync("src/lib/mediaUrl.ts", "utf-8");
const baseUrlMatch = mediaUrlContent.match(/MEDIA_BASE_URL[^"]*"([^"]+)"/);
if (baseUrlMatch) {
  console.log(`Base URL: ${baseUrlMatch[1]}`);
}

const docImageUrlFunc = mediaUrlContent.match(/getDocImageUrl[^}]+\}/s);
if (docImageUrlFunc) {
  console.log("\ngetDocImageUrl function exists: ✓");
}

// Simulate what getVideoDocImages(1) would return
console.log("\n=== Simulated getVideoDocImages(1) ===\n");
const baseUrl = "https://egroup.runasp.net/videosdocs";
for (let i = 1; i <= 5; i++) {
  console.log(`${i}: ${baseUrl}/v1docs/images/${i}.webp`);
}
