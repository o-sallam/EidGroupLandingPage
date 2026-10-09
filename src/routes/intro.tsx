import { createFileRoute } from "@tanstack/react-router";
import { VideoHeroPage } from "@/components/VideoHeroPage";

export const Route = createFileRoute("/intro")({ component: IntroPage });

/**
 * Full-screen bilingual motion-graphics intro video (replaces the old
 * "7 videos" text card). Route path is preserved so existing navigation
 * (/lang → / → /intro → /video/1) keeps working unchanged.
 */
function IntroPage() {
  return <VideoHeroPage />;
}
