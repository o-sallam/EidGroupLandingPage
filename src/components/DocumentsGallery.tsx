import { useState, useRef, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { getVideoDocImages } from "@/lib/docImages";

type Props = {
  videoNum: number;
  onClose: () => void;
};

export function DocumentsGallery({ videoNum, onClose }: Props) {
  const { t } = useI18n();
  const candidates = getVideoDocImages(videoNum);
  const [loaded, setLoaded] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const loadedRef = useRef(new Set<string>());

  useEffect(() => {
    loadedRef.current.clear();
    setLoaded([]);
    setSelectedIndex(null);
  }, [videoNum]);

  const handleLoad = (src: string) => {
    if (loadedRef.current.has(src)) return;
    loadedRef.current.add(src);
    setLoaded((prev) => [...prev, src]);
  };

  if (loaded.length === 0 && candidates.length > 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
        <div className="absolute inset-0 bg-black/60" onClick={onClose} />
        <div className="relative mx-4 w-full max-w-lg animate-slide-up rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-2xl">
          <button
            onClick={onClose}
            className="absolute ltr:right-4 rtl:left-4 top-4 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white/60 transition hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
          <h3 className="mb-2 font-serif text-lg text-[color:var(--gold)]">
            {t("docs.title")}
          </h3>
          {candidates.map((src) => (
            <img
              key={src}
              src={src}
              alt=""
              className="hidden"
              onLoad={() => handleLoad(src)}
              onError={() => console.warn(`[DocumentsGallery] Failed to load: ${src} for video ${videoNum}`)}
            />
          ))}
          <p className="text-xs text-[color:var(--muted-foreground)]">
            {t("docs.empty")}
          </p>
        </div>
      </div>
    );
  }

  if (loaded.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
        <div className="absolute inset-0 bg-black/60" onClick={onClose} />
        <div className="relative mx-4 w-full max-w-lg animate-slide-up rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-2xl">
          <button
            onClick={onClose}
            className="absolute ltr:right-4 rtl:left-4 top-4 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white/60 transition hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
          <h3 className="mb-2 font-serif text-lg text-[color:var(--gold)]">
            {t("docs.title")}
          </h3>
          <p className="text-xs text-[color:var(--muted-foreground)]">
            {t("docs.empty")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
        <div className="absolute inset-0 bg-black/60" onClick={onClose} />
        <div className="relative mx-4 w-full max-w-lg animate-slide-up rounded-2xl border border-white/10 bg-white/5 p-6 pb-6 shadow-2xl backdrop-blur-2xl">
          <button
            onClick={onClose}
            className="absolute ltr:right-4 rtl:left-4 top-4 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white/60 transition hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
          <h3 className="mb-4 font-serif text-lg text-[color:var(--gold)]">
            {t("docs.title")}
          </h3>
          <div
            className="flex gap-3 overflow-x-auto pb-2"
            style={{ scrollSnapType: "x mandatory" }}
          >
            {loaded.map((src, i) => (
              <button
                key={src}
                onClick={() => setSelectedIndex(i)}
                className="shrink-0 snap-start overflow-hidden rounded-xl border border-white/10 transition hover:border-[color:var(--gold)] focus:outline-none"
                style={{ width: 160, height: 120 }}
              >
                <img
                  src={src}
                  alt={`${t("docs.title")} ${i + 1}`}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
          <p className="mt-3 text-[10px] text-[color:var(--muted-foreground)]">
            {loaded.length} {loaded.length === 1 ? "document" : "documents"} — tap to expand
          </p>
        </div>
      </div>

      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85"
          onClick={() => setSelectedIndex(null)}
        >
          <button
            onClick={onClose}
            className="absolute ltr:right-4 rtl:left-4 top-4 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white/60 backdrop-blur-md transition hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
          {loaded.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex((prev) => (prev! - 1 + loaded.length) % loaded.length);
                }}
                className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white backdrop-blur-md transition hover:bg-white/20"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex((prev) => (prev! + 1) % loaded.length);
                }}
                className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white backdrop-blur-md transition hover:bg-white/20"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
          <img
            src={loaded[selectedIndex]}
            alt={`${t("docs.title")} ${selectedIndex + 1}`}
            className="max-h-[85vh] max-w-[90vw] rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <p className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs text-white/80 backdrop-blur-md">
            {selectedIndex + 1} / {loaded.length}
          </p>
        </div>
      )}
    </>
  );
}
