import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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

export function usePageContent(page_key: string) {
  const [row, setRow] = useState<PageContentRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    (supabase.from("page_content" as never) as never as {
      select: (s: string) => {
        eq: (c: string, v: string) => { maybeSingle: () => Promise<{ data: PageContentRow | null }> };
      };
    })
      .select("*")
      .eq("page_key", page_key)
      .maybeSingle()
      .then(({ data }) => {
        if (!alive) return;
        setRow(data ? { ...EMPTY, ...data } : null);
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [page_key]);

  return { row, loading };
}
