import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import { createHash, timingSafeEqual } from "node:crypto";

type AdminSession = { admin?: boolean };

function cfg() {
  return {
    password: process.env.ADMIN_SESSION_SECRET!,
    name: "eid-admin",
    maxAge: 60 * 60 * 24 * 30,
    cookie: { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/" },
  };
}

function matches(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a, "utf8").digest();
  const hb = createHash("sha256").update(b, "utf8").digest();
  return ha.length === hb.length && timingSafeEqual(ha, hb);
}

async function requireAdmin() {
  const s = await useSession<AdminSession>(cfg());
  if (!s.data.admin) throw new Error("Unauthorized");
  return s;
}

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((d: { passcode: string }) => d)
  .handler(async ({ data }) => {
    const expected = process.env.ADMIN_PASSCODE;
    if (!expected) throw new Error("ADMIN_PASSCODE not configured");
    if (!matches(data.passcode, expected)) return { ok: false as const };
    const s = await useSession<AdminSession>(cfg());
    await s.update({ admin: true });
    return { ok: true as const };
  });

export const adminLogout = createServerFn({ method: "POST" }).handler(async () => {
  const s = await useSession<AdminSession>(cfg());
  await s.clear();
  return { ok: true };
});

export const adminStatus = createServerFn({ method: "GET" }).handler(async () => {
  const s = await useSession<AdminSession>(cfg());
  return { admin: !!s.data.admin };
});

export type PageContentInput = {
  page_key: string;
  titles: Record<string, string>;
  descriptions: Record<string, string>;
  image_url: string | null;
  video_url: string | null;
  gallery: Array<{ url: string }>;
  pdfs: Array<{ url: string; name: string }>;
  related_videos: Array<{ url: string; title: string }>;
};

export const savePageContent = createServerFn({ method: "POST" })
  .inputValidator((d: PageContentInput) => d)
  .handler(async ({ data }) => {
    await requireAdmin();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("page_content").upsert({
      page_key: data.page_key,
      titles: data.titles,
      descriptions: data.descriptions,
      image_url: data.image_url,
      video_url: data.video_url,
      gallery: data.gallery,
      pdfs: data.pdfs,
      related_videos: data.related_videos,
      updated_at: new Date().toISOString(),
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const createUploadUrl = createServerFn({ method: "POST" })
  .inputValidator((d: { path: string }) => d)
  .handler(async ({ data }) => {
    await requireAdmin();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const safePath = data.path.replace(/[^a-zA-Z0-9._/-]/g, "_");
    const { data: up, error } = await supabaseAdmin.storage
      .from("media")
      .createSignedUploadUrl(safePath);
    if (error || !up) throw new Error(error?.message || "upload url error");
    const { data: dl, error: dlErr } = await supabaseAdmin.storage
      .from("media")
      .createSignedUrl(safePath, 60 * 60 * 24 * 365 * 10);
    if (dlErr || !dl) throw new Error(dlErr?.message || "signed url error");
    return { uploadUrl: up.signedUrl, token: up.token, path: up.path, publicUrl: dl.signedUrl };
  });
