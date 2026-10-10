import { useMemo } from "react";
import { getPageContent, type PageContentRow } from "@/lib/content/pageContent";

export type { PageContentRow };

/**
 * Returns static page content from src/lib/content/pageContent.ts.
 * This replaces the previous Supabase-based implementation.
 *
 * Always returns loading=false (synchronous), matching the behavior
 * when the DB had no override row.
 */
export function usePageContent(page_key: string) {
  const row = useMemo(() => getPageContent(page_key), [page_key]);
  return { row, loading: false };
}
