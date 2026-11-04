import { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageShell, PageHeader } from "@/components/site/page-shell";
import { DRIVE_ROOT_URL, type GalleryPhoto } from "@/lib/gallery";
import { getPublicContent, type PublicGalleryPhoto } from "@/lib/content.functions";
import { ogImageMeta } from "@/lib/seo";

type DisplayPhoto = GalleryPhoto & { category: string };

const FALLBACK_CATEGORY = "Church life";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Photo Gallery — RCCG The Master's Place, Ile-Ife" },
      {
        name: "description",
        content:
          "Recent moments of worship, fellowship and community at RCCG The Master's Place, Ile-Ife.",
      },
      { property: "og:title", content: "Photo Gallery — RCCG The Master's Place" },
      {
        property: "og:description",
        content: "See recent photos from RCCG The Master's Place, Ile-Ife.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      ...ogImageMeta,
    ],
  }),
  loader: async () => {
    try {
      const { photos } = await getPublicContent();
      return { uploadedPhotos: photos };
    } catch (error) {
      console.error("[gallery] Unable to load uploaded photos", error);
      return { uploadedPhotos: [] as PublicGalleryPhoto[] };
    }
  },
  component: GalleryPage,
  errorComponent: () => null,
  notFoundComponent: () => null,
});

function GalleryPage() {
  const { uploadedPhotos } = Route.useLoaderData();
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>("All");

  const dbPhotos: DisplayPhoto[] = useMemo(
    () =>
      uploadedPhotos
        .filter((photo) => Boolean(photo.image_url))
        .map((photo) => ({
          src: photo.image_url,
          alt: photo.caption ?? "A recent moment at RCCG The Master's Place",
          category: photo.category || FALLBACK_CATEGORY,
        })),
    [uploadedPhotos],
  );

  const allPhotos: DisplayPhoto[] = dbPhotos;

  const categories = useMemo(() => {
    const unique = Array.from(new Set(allPhotos.map((photo) => photo.category)));
    return unique.length > 1 ? ["All", ...unique] : [];
  }, [allPhotos]);

  const photos = useMemo(
    () => (filter === "All" ? allPhotos : allPhotos.filter((photo) => photo.category === filter)),
    [allPhotos, filter],
  );

  const close = useCallback(() => setLightbox(null), []);
  const step = useCallback(
    (delta: number) =>
      setLightbox((i) => (i === null ? i : (i + delta + photos.length) % photos.length)),
    [photos.length],
  );

  useEffect(() => setLightbox(null), [filter]);

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, close, step]);

  const currentPhoto = lightbox === null ? null : (photos[lightbox] ?? null);
  const heading = "Recent Moments";

  return (
    <PageShell>
      <PageHeader
        eyebrow="Life at The Master's Place"
        title="Photo Gallery"
        description="A glimpse of our recent moments together — worship, fellowship and life as one church family."
        actions={
          <Button asChild variant="outline" className="border-current/30 bg-transparent text-current hover:bg-current/10 hover:text-current">
            <a href={DRIVE_ROOT_URL} target="_blank" rel="noreferrer">
              Open Google Photos <ExternalLink className="size-4" />
            </a>
          </Button>
        }
      />

      <section id="album-view" className="scroll-mt-24 bg-background py-14 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Life at The Master&apos;s Place</p>
              <h2 className="mt-3 text-2xl font-semibold text-foreground sm:text-3xl">{heading}</h2>
              <span className="brass-rule mt-5" />
            </div>
            <Button asChild variant="outline" className="border-current/30 bg-transparent text-current hover:bg-current/10 hover:text-current" size="sm">
              <a href={DRIVE_ROOT_URL} target="_blank" rel="noreferrer">
                View all on Google Photos <ExternalLink className="size-4" />
              </a>
            </Button>
          </div>

          {categories.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setFilter(category)}
                  aria-pressed={filter === category}
                  className={`focus-ring rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
                    filter === category
                      ? "border-accent bg-accent/15 text-foreground"
                      : "border-border bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}

          {photos.length === 0 ? (
            <p className="mt-10 text-sm text-muted-foreground">
              Photos from our recent gatherings will appear here soon.
            </p>
          ) : (
            <div className="mt-10 columns-2 gap-4 md:columns-3 lg:columns-4 [&>*]:mb-4">
              {photos.map((photo, i) => (
                <button
                  key={`${photo.src}-${i}`}
                  onClick={() => setLightbox(i)}
                  className="focus-ring block w-full break-inside-avoid overflow-hidden rounded-lg border border-border bg-card"
                  aria-label={`Open photo ${i + 1} of ${photos.length}`}
                >
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    loading="lazy"
                    className="w-full object-cover transition-transform duration-500 hover:scale-[1.03]"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {currentPhoto && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/90 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={currentPhoto.alt}
          onClick={close}
        >
          <button
            onClick={close}
            aria-label="Close"
            className="focus-ring absolute top-4 right-4 inline-flex size-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X className="size-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              step(-1);
            }}
            aria-label="Previous photo"
            className="focus-ring absolute top-1/2 left-3 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:left-6"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              step(1);
            }}
            aria-label="Next photo"
            className="focus-ring absolute top-1/2 right-3 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:right-6"
          >
            <ChevronRight className="size-5" />
          </button>
          <figure className="max-h-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={currentPhoto.src}
              alt={currentPhoto.alt}
              className="max-h-[80vh] w-auto rounded-lg object-contain"
            />
            <figcaption className="mt-3 text-center text-xs text-white/70">
              {currentPhoto.alt} · {(lightbox ?? 0) + 1} / {photos.length}
            </figcaption>
          </figure>
        </div>
      )}
    </PageShell>
  );
}
