import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { PortalShell } from "@/components/PortalShell";
import {
  adminLogin,
  adminLogout,
  adminStatus,
  savePageContent,
  createUploadUrl,
  type PageContentInput,
} from "@/lib/admin.functions";
import { Loader2, LogOut, Save, Upload, Trash2, Plus } from "lucide-react";

const LANGS = ["ar", "en", "nl"] as const;
type Lang = (typeof LANGS)[number];

const PAGES: { key: string; label: string }[] = [
  ...Array.from({ length: 7 }, (_, i) => ({ key: `video-${i + 1}`, label: `Video ${i + 1}` })),
  { key: "documents", label: "Documents" },
];

const EMPTY: PageContentInput = {
  page_key: "",
  titles: { ar: "", en: "", nl: "" },
  descriptions: { ar: "", en: "", nl: "" },
  image_url: null,
  video_url: null,
  gallery: [],
  pdfs: [],
  related_videos: [],
};

export function AdminPage() {
  const login = useServerFn(adminLogin);
  const logout = useServerFn(adminLogout);
  const status = useServerFn(adminStatus);

  const [authed, setAuthed] = useState<boolean | null>(null);
  const [passcode, setPasscode] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    status().then((r) => setAuthed(r.admin));
  }, [status]);

  async function submitLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoggingIn(true);
    setErr(null);
    const r = await login({ data: { passcode } });
    setLoggingIn(false);
    if (r.ok) setAuthed(true);
    else setErr("Invalid passcode");
  }

  if (authed === null) {
    return (
      <PortalShell>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-[color:var(--gold)]" />
        </div>
      </PortalShell>
    );
  }

  if (!authed) {
    return (
      <PortalShell>
        <div className="mx-auto max-w-md py-10">
          <div className="card-luxe rounded-2xl p-8">
            <h1 className="mb-2 font-serif text-2xl text-[color:var(--foreground)]">Admin</h1>
            <p className="mb-6 text-sm text-[color:var(--muted-foreground)]">
              Enter the admin passcode.
            </p>
            <form onSubmit={submitLogin} className="space-y-4">
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-[rgba(200,169,106,0.25)] bg-[rgba(11,15,20,0.6)] px-4 py-3 text-[color:var(--foreground)] outline-none focus:border-[color:var(--gold)]"
                autoFocus
              />
              {err && <p className="text-sm text-red-400">{err}</p>}
              <button
                type="submit"
                disabled={loggingIn}
                className="w-full rounded-lg bg-[color:var(--gold)] px-4 py-3 text-sm font-semibold text-[color:var(--bg-raw)] hover:brightness-110 disabled:opacity-50"
              >
                {loggingIn ? "…" : "Sign in"}
              </button>
            </form>
          </div>
        </div>
      </PortalShell>
    );
  }

  return (
    <PortalShell>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-3xl text-[color:var(--foreground)]">Admin Panel</h1>
        <button
          onClick={async () => {
            await logout();
            setAuthed(false);
          }}
          className="inline-flex items-center gap-2 rounded-full border border-[rgba(200,169,106,0.3)] px-4 py-2 text-xs text-[color:var(--foreground)] hover:bg-[color:var(--gold-soft)]"
        >
          <LogOut className="h-3.5 w-3.5" /> Sign out
        </button>
      </div>

      <div className="space-y-4">
        {PAGES.map((p) => (
          <PageEditor key={p.key} pageKey={p.key} label={p.label} />
        ))}
      </div>
    </PortalShell>
  );
}

function PageEditor({ pageKey, label }: { pageKey: string; label: string }) {
  const save = useServerFn(savePageContent);
  const uploadUrl = useServerFn(createUploadUrl);
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<PageContentInput>({ ...EMPTY, page_key: pageKey });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    (supabase.from("page_content" as never) as never as {
      select: (s: string) => {
        eq: (c: string, v: string) => { maybeSingle: () => Promise<{ data: PageContentInput | null }> };
      };
    })
      .select("*")
      .eq("page_key", pageKey)
      .maybeSingle()
      .then(({ data: row }) => {
        if (row) setData({ ...EMPTY, ...row, page_key: pageKey });
        setLoading(false);
      });
  }, [open, pageKey]);

  async function handleUpload(file: File, kind: "image" | "video" | "gallery" | "pdf" | "related") {
    const path = `${pageKey}/${Date.now()}-${file.name}`;
    const { uploadUrl: url, token, publicUrl } = await uploadUrl({ data: { path } });
    void token;
    const res = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": file.type || "application/octet-stream" },
      body: file,
    });
    if (!res.ok) throw new Error("Upload failed");
    if (kind === "image") setData((d) => ({ ...d, image_url: publicUrl }));
    else if (kind === "video") setData((d) => ({ ...d, video_url: publicUrl }));
    else if (kind === "gallery") setData((d) => ({ ...d, gallery: [...d.gallery, { url: publicUrl }] }));
    else if (kind === "pdf") setData((d) => ({ ...d, pdfs: [...d.pdfs, { url: publicUrl, name: file.name }] }));
    else if (kind === "related")
      setData((d) => ({ ...d, related_videos: [...d.related_videos, { url: publicUrl, title: file.name }] }));
  }

  async function doSave() {
    setSaving(true);
    setMsg(null);
    try {
      await save({ data });
      setMsg("Saved ✓");
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card-luxe rounded-2xl">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-4 text-start"
      >
        <span className="font-serif text-lg text-[color:var(--foreground)]">{label}</span>
        <span className="text-xs text-[color:var(--muted-foreground)]">{open ? "Close" : "Edit"}</span>
      </button>
      {open && (
        <div className="space-y-6 border-t border-[rgba(200,169,106,0.15)] px-5 py-6">
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin text-[color:var(--gold)]" />
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                {LANGS.map((l) => (
                  <div key={l} className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
                      Title ({l})
                    </label>
                    <input
                      value={data.titles[l] ?? ""}
                      onChange={(e) =>
                        setData((d) => ({ ...d, titles: { ...d.titles, [l]: e.target.value } }))
                      }
                      className="w-full rounded-lg border border-[rgba(200,169,106,0.2)] bg-[rgba(11,15,20,0.6)] px-3 py-2 text-sm text-[color:var(--foreground)]"
                      dir={l === "ar" ? "rtl" : "ltr"}
                    />
                  </div>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {LANGS.map((l) => (
                  <div key={l} className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
                      Description ({l})
                    </label>
                    <textarea
                      value={data.descriptions[l] ?? ""}
                      onChange={(e) =>
                        setData((d) => ({
                          ...d,
                          descriptions: { ...d.descriptions, [l]: e.target.value },
                        }))
                      }
                      rows={4}
                      className="w-full rounded-lg border border-[rgba(200,169,106,0.2)] bg-[rgba(11,15,20,0.6)] px-3 py-2 text-sm text-[color:var(--foreground)]"
                      dir={l === "ar" ? "rtl" : "ltr"}
                    />
                  </div>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <MediaSlot
                  label="Main video"
                  currentUrl={data.video_url}
                  accept="video/*"
                  onUpload={(f) => handleUpload(f, "video")}
                  onClear={() => setData((d) => ({ ...d, video_url: null }))}
                />
                <MediaSlot
                  label="Main image / poster"
                  currentUrl={data.image_url}
                  accept="image/*"
                  onUpload={(f) => handleUpload(f, "image")}
                  onClear={() => setData((d) => ({ ...d, image_url: null }))}
                />
              </div>

              <ListSection
                title="Image gallery"
                accept="image/*"
                items={data.gallery.map((g) => ({ label: g.url }))}
                onAdd={(f) => handleUpload(f, "gallery")}
                onRemove={(i) =>
                  setData((d) => ({ ...d, gallery: d.gallery.filter((_, idx) => idx !== i) }))
                }
              />
              <ListSection
                title="PDF documents"
                accept="application/pdf"
                items={data.pdfs.map((p) => ({ label: p.name }))}
                onAdd={(f) => handleUpload(f, "pdf")}
                onRemove={(i) =>
                  setData((d) => ({ ...d, pdfs: d.pdfs.filter((_, idx) => idx !== i) }))
                }
              />
              <ListSection
                title="Related videos"
                accept="video/*"
                items={data.related_videos.map((r) => ({ label: r.title }))}
                onAdd={(f) => handleUpload(f, "related")}
                onRemove={(i) =>
                  setData((d) => ({
                    ...d,
                    related_videos: d.related_videos.filter((_, idx) => idx !== i),
                  }))
                }
              />

              <div className="flex items-center justify-end gap-3">
                {msg && <span className="text-xs text-[color:var(--muted-foreground)]">{msg}</span>}
                <button
                  onClick={doSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-full bg-[color:var(--gold)] px-6 py-2.5 text-sm font-semibold text-[color:var(--bg-raw)] hover:brightness-110 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function MediaSlot({
  label,
  currentUrl,
  accept,
  onUpload,
  onClear,
}: {
  label: string;
  currentUrl: string | null;
  accept: string;
  onUpload: (f: File) => Promise<void>;
  onClear: () => void;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="space-y-2">
      <label className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)]">{label}</label>
      <div className="flex items-center gap-2">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[rgba(200,169,106,0.3)] bg-[rgba(23,28,34,0.6)] px-3 py-2 text-xs text-[color:var(--foreground)] hover:bg-[color:var(--gold-soft)]">
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          {currentUrl ? "Replace" : "Upload"}
          <input
            type="file"
            accept={accept}
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              setBusy(true);
              try {
                await onUpload(f);
              } finally {
                setBusy(false);
                e.target.value = "";
              }
            }}
          />
        </label>
        {currentUrl && (
          <button
            onClick={onClear}
            className="inline-flex items-center gap-1 rounded-lg border border-[rgba(200,169,106,0.2)] px-3 py-2 text-xs text-[color:var(--muted-foreground)] hover:text-red-400"
          >
            <Trash2 className="h-3.5 w-3.5" /> Remove
          </button>
        )}
      </div>
      {currentUrl && (
        <a
          href={currentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block truncate text-[10px] text-[color:var(--muted-foreground)] hover:text-[color:var(--gold)]"
        >
          {currentUrl}
        </a>
      )}
    </div>
  );
}

function ListSection({
  title,
  accept,
  items,
  onAdd,
  onRemove,
}: {
  title: string;
  accept: string;
  items: { label: string }[];
  onAdd: (f: File) => Promise<void>;
  onRemove: (i: number) => void;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)]">{title}</label>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[rgba(200,169,106,0.3)] bg-[rgba(23,28,34,0.6)] px-3 py-1.5 text-xs text-[color:var(--foreground)] hover:bg-[color:var(--gold-soft)]">
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
          Add
          <input
            type="file"
            accept={accept}
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              setBusy(true);
              try {
                await onAdd(f);
              } finally {
                setBusy(false);
                e.target.value = "";
              }
            }}
          />
        </label>
      </div>
      {items.length === 0 ? (
        <p className="text-[10px] text-[color:var(--muted-foreground)]">Empty — section hidden.</p>
      ) : (
        <ul className="space-y-1">
          {items.map((it, i) => (
            <li
              key={i}
              className="flex items-center justify-between gap-3 rounded-lg border border-[rgba(200,169,106,0.15)] bg-[rgba(11,15,20,0.4)] px-3 py-2 text-xs"
            >
              <span className="truncate text-[color:var(--foreground)]">{it.label}</span>
              <button
                onClick={() => onRemove(i)}
                className="text-[color:var(--muted-foreground)] hover:text-red-400"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}