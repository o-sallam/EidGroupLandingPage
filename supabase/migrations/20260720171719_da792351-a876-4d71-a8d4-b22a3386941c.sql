
CREATE TABLE public.page_content (
  page_key text PRIMARY KEY,
  titles jsonb NOT NULL DEFAULT '{}'::jsonb,
  descriptions jsonb NOT NULL DEFAULT '{}'::jsonb,
  image_url text,
  video_url text,
  gallery jsonb NOT NULL DEFAULT '[]'::jsonb,
  pdfs jsonb NOT NULL DEFAULT '[]'::jsonb,
  related_videos jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.page_content TO anon, authenticated;
GRANT ALL ON public.page_content TO service_role;

ALTER TABLE public.page_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read of page content"
  ON public.page_content FOR SELECT
  TO anon, authenticated
  USING (true);

-- Storage: allow public read of media bucket (writes happen via service role)
CREATE POLICY "Public read media"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'media');
