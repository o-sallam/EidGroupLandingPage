// Quick inline test of doc counts
const DOC_COUNTS = {
  1: { images: 5, videos: 0 },
  2: { images: 0, videos: 3 },
  3: { images: 0, videos: 2 },
  4: { images: 0, videos: 4 },
  5: { images: 0, videos: 2 },
};

console.log("Verifying doc counts:\n");
[1, 2, 3, 4, 5, 9].forEach((num) => {
  const c = DOC_COUNTS[num];
  const images = c ? c.images : 0;
  const videos = c ? c.videos : 0;
  console.log(`Video ${num}: ${images} images, ${videos} videos`);
});

console.log("\nExpected:");
console.log("Video 1: 5 images, 0 videos");
console.log("Video 2: 0 images, 3 videos");
console.log("Video 3: 0 images, 2 videos");
console.log("Video 4: 0 images, 4 videos");
console.log("Video 5: 0 images, 2 videos");
console.log("Video 9: 0 images, 0 videos");
