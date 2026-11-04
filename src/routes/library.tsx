import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Download, FileText, Images, MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageShell, PageHeader, SectionHeading } from "@/components/site/page-shell";
import { TELEGRAM_CHANNEL_URL } from "@/lib/site-data";
import { ogImageMeta } from "@/lib/seo";
import { listPublicBooks, BOOK_CATEGORY_LABELS, type BookCategory, type LibraryBook } from "@/lib/library.functions";

export const Route = createFileRoute("/library")({
  head: () => ({
    meta: [
      { title: "Resource Library — RCCG The Master's Place, Ile-Ife" },
      {
        name: "description",
        content:
          "Download study books for the School of Disciples, Workers in Training and Baptismal Class at RCCG The Master's Place, Ile-Ife.",
      },
      { property: "og:title", content: "Resource Library — RCCG The Master's Place" },
      {
        property: "og:description",
        content: "Study books and resources from RCCG The Master's Place, Ile-Ife.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      ...ogImageMeta,
    ],
  }),
  loader: async () => {
    try {
      return { books: await listPublicBooks() };
    } catch (error) {
      console.error("[library] Unable to load books", error);
      return { books: [] as LibraryBook[] };
    }
  },
  component: LibraryPage,
});

const CLASS_CATEGORIES: BookCategory[] = ["school_of_disciples", "workers_in_training", "baptismal_class"];

function fmtSize(bytes: number | null) {
  if (!bytes) return null;
  return bytes > 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
}

function BookCard({ book }: { book: LibraryBook }) {
  return (
    <div className="panel flex h-full flex-col gap-3 p-6">
      <span className="inline-flex size-11 items-center justify-center rounded-full bg-secondary text-accent">
        <BookOpen className="size-5" />
      </span>
      <div>
        <h3 className="text-base font-semibold text-foreground">{book.title}</h3>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
          <FileText className="size-3" /> PDF{fmtSize(book.fileSize) ? ` · ${fmtSize(book.fileSize)}` : ""}
        </p>
      </div>
      {book.description && <p className="flex-1 text-sm leading-relaxed text-muted-foreground">{book.description}</p>}
      {book.downloadUrl ? (
        <Button asChild className="mt-auto self-start">
          <a href={book.downloadUrl} target="_blank" rel="noreferrer" download={book.fileName}>
            <Download className="size-4" /> Download
          </a>
        </Button>
      ) : (
        <p className="mt-auto text-xs text-muted-foreground">Temporarily unavailable — check back shortly.</p>
      )}
    </div>
  );
}

function LibraryPage() {
  const { books } = Route.useLoaderData();
  const byCategory = new Map<BookCategory, LibraryBook[]>();
  for (const book of books) {
    const list = byCategory.get(book.category) ?? [];
    list.push(book);
    byCategory.set(book.category, list);
  }
  const otherBooks = byCategory.get("other") ?? [];

  return (
    <PageShell>
      <PageHeader
        eyebrow="Study & grow"
        title="Resource Library"
        description="Download the class manuals and study material used across the parish — for the School of Disciples, Workers in Training and the Baptismal Class."
        actions={
          <Button asChild size="lg">
            <Link to="/exams">
              <BookOpen className="size-4" /> Take an exam
            </Link>
          </Button>
        }
      />

      <section className="bg-background py-14 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {books.length === 0 ? (
            <div className="panel flex flex-col items-center px-6 py-14 text-center lg:py-20">
              <span className="inline-flex size-14 items-center justify-center rounded-full bg-secondary text-accent">
                <BookOpen className="size-6" />
              </span>
              <h2 className="mt-6 text-xl font-semibold text-foreground sm:text-2xl">
                The written library is being prepared
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
                We would rather publish nothing than publish placeholders. Material is reviewed by the
                parish teaching team before it appears here, so every download you find is genuinely
                from The Master&apos;s Place.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild>
                  <a href={TELEGRAM_CHANNEL_URL} target="_blank" rel="noreferrer">
                    <Download className="size-4" /> Follow on Telegram for releases
                  </a>
                </Button>
                <Button asChild variant="outline" className="border-current/30 bg-transparent text-current hover:bg-current/10 hover:text-current">
                  <Link to="/gallery">
                    <Images className="size-4" /> Visit the gallery
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            CLASS_CATEGORIES.map((category) => {
              const list = byCategory.get(category) ?? [];
              return (
                <div key={category} className={category === "school_of_disciples" ? "" : "mt-14"}>
                  <SectionHeading
                    eyebrow="Class manual"
                    title={BOOK_CATEGORY_LABELS[category]}
                    {...(list.length === 0 ? { description: "Material for this class is being prepared for publication." } : {})}
                  />
                  {list.length > 0 && (
                    <div className="mt-10 grid gap-6 md:grid-cols-3">
                      {list.map((book) => (
                        <BookCard key={book.id} book={book} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}

          {otherBooks.length > 0 && (
            <div className={books.length === 0 ? "" : "mt-14"}>
              <SectionHeading
                eyebrow="More study material"
                title={BOOK_CATEGORY_LABELS.other}
              />
              <div className="mt-10 grid gap-6 md:grid-cols-3">
                {otherBooks.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            </div>
          )}

          <div className="panel mt-14 flex flex-col items-start gap-5 p-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-semibold text-foreground">
                Need help with something specific?
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Ask pastoral leadership confidentially — no name or email required.
              </p>
            </div>
            <Button asChild className="shrink-0">
              <Link to="/submit-issue">
                <MessageSquarePlus className="size-4" /> Submit an issue
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
