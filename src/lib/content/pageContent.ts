import { videoContent } from "../i18n/videoContent";
import { VIDEO_URLS } from "../i18n/config";
import { v4ImageUrls, v4VideoUrls } from "../v4Assets";
import { getVideoDocImages } from "../docImages";

export type PageContentRow = {
  page_key: string;
  titles: Record<string, string>;
  descriptions: Record<string, string>;
  image_url: string | null;
  video_url: string | null;
  gallery: Array<{ url: string }>;
  pdfs: Array<{ url: string; name: string }>;
  related_videos: Array<{ url: string; title: string }>;
};

const EMPTY: Omit<PageContentRow, "page_key"> = {
  titles: {},
  descriptions: {},
  image_url: null,
  video_url: null,
  gallery: [],
  pdfs: [],
  related_videos: [],
};

// Static content for each page, merged with EMPTY and videoContent at runtime
const CONTENT: Record<string, Partial<PageContentRow>> = {
  "video-1": {
    titles: {
      ar: videoContent.ar[0].title,
      en: videoContent.en[0].title,
      nl: videoContent.nl[0].title,
    },
    descriptions: {
      ar: videoContent.ar[0].description,
      en: videoContent.en[0].description,
      nl: videoContent.nl[0].description,
    },
    image_url: "/thumbnails/1.webp",
    video_url: VIDEO_URLS[1],
  },
  "video-2": {
    titles: {
      ar: videoContent.ar[1].title,
      en: videoContent.en[1].title,
      nl: videoContent.nl[1].title,
    },
    descriptions: {
      ar: videoContent.ar[1].description,
      en: videoContent.en[1].description,
      nl: videoContent.nl[1].description,
    },
    image_url: "/thumbnails/2.webp",
    video_url: VIDEO_URLS[2],
  },
  "video-3": {
    titles: {
      ar: videoContent.ar[2].title,
      en: videoContent.en[2].title,
      nl: videoContent.nl[2].title,
    },
    descriptions: {
      ar: videoContent.ar[2].description,
      en: videoContent.en[2].description,
      nl: videoContent.nl[2].description,
    },
    image_url: "/thumbnails/3.webp",
    video_url: VIDEO_URLS[3],
  },
  "video-4": {
    titles: {
      ar: videoContent.ar[3].title,
      en: videoContent.en[3].title,
      nl: videoContent.nl[3].title,
    },
    descriptions: {
      ar: videoContent.ar[3].description,
      en: videoContent.en[3].description,
      nl: videoContent.nl[3].description,
    },
    image_url: "/thumbnails/4.webp",
    video_url: VIDEO_URLS[4],
    // Gallery from public/videosdocs/v4docs/
    gallery: v4ImageUrls.map((url) => ({ url })),
    // Related videos from public/videosdocs/v4docs/
    related_videos: v4VideoUrls.map((url, i) => ({
      url,
      title: `Document ${i + 1}`,
    })),
  },
  "video-5": {
    titles: {
      ar: videoContent.ar[4].title,
      en: videoContent.en[4].title,
      nl: videoContent.nl[4].title,
    },
    descriptions: {
      ar: videoContent.ar[4].description,
      en: videoContent.en[4].description,
      nl: videoContent.nl[4].description,
    },
    image_url: "/thumbnails/5.webp",
    video_url: VIDEO_URLS[5],
  },
  // Documents page - currently no static PDFs
  // If PDFs need to be added, place them in public/docs/ and update this
  "documents": {
    titles: {
      ar: "الصور والمستندات",
      en: "Official Documents",
      nl: "Officiële documenten",
    },
    descriptions: {
      ar: "الوثائق التنظيمية والمالية للاطلاع.",
      en: "Regulatory and financial documents for your review.",
      nl: "Regelgevings- en financiële documenten ter beoordeling.",
    },
    pdfs: [],
  },
};

/**
 * Get static page content by key.
 * Returns null if the key doesn't exist (matches DB behavior for missing rows).
 */
export function getPageContent(page_key: string): PageContentRow | null {
  const c = CONTENT[page_key];
  if (!c) return null;
  return { page_key, ...EMPTY, ...c };
}

/**
 * Get doc images for a specific video (used by video page).
 * This is separate because it varies by video number.
 */
export function getDocImagesForVideo(videoNum: number): string[] {
  return getVideoDocImages(videoNum);
}