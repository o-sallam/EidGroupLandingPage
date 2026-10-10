export type { Lang, Dict, QAPair, VideoMeta, I18nContextValue } from "./types";
export { dicts } from "./dicts";
export { videoContent } from "./videoContent";
export { QUESTIONS_DATA } from "./questions";
export {
  TOTAL_VIDEOS,
  VIDEO_URLS,
  INTRO_VIDEO_URLS,
  lastAvailableVideo,
  isLangChosen,
  markLangChosen,
  getIntroVideoUrl,
} from "./config";
export { I18nProvider, useI18n } from "./context";