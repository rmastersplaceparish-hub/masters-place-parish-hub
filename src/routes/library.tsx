import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Send, Images, MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageShell, PageHeader, SectionHeading } from "@/components/site/page-shell";
import { TELEGRAM_CHANNEL_URL } from "@/lib/site-data";
import { ogImageMeta } from "@/lib/seo";

export const Route = createFileRoute("/library")({
  head: () => ({
    meta: [
      { title: "Resource Library — RCCG The Master's Place, Ile-Ife" },
      {
        name: "description",
        content:
          "Written guides, devotionals and study material from RCCG The Master's Place, Ile-Ife. The library is being prepared — audio messages are available now.",
      },
      { property: "og:title", content: "Resource Library — RCCG The Master's Place" },
      {
        property: "og:description",
        content:
          "Study resources from RCCG The Master's Place, Ile-Ife. In the meantime, listen to the full audio message archive.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      ...ogImageMeta,
    ],
  }),
  component: LibraryPage,
});

const planned = [
  {
    title: "New Believers' Guide",
    body: "Foundations of faith, prayer and church life for anyone who has just given their life to Christ.",
  },
  {
    title: "Devotional Guides",
    body: "Daily readings and prayer points to help you keep a consistent walk with God through the week.",
  },
  {
    title: "Family & Marriage Notes",
    body: "Teaching notes from our family-focused sessions, prepared for study at home.",
  },
];

function LibraryPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Study & grow"
        title="Resource Library"
        description="Written resources from the parish teaching team are being prepared for publication. Until they are ready, the full audio archive is open to everyone."
        actions={
          <Button asChild size="lg">
            <Link to="/audio">
              <Send className="size-4" /> Listen to audio messages
            </Link>
          </Button>
        }
      />

      <section className="bg-background py-14 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="panel flex flex-col items-center px-6 py-14 text-center lg:py-20">
            <span className="inline-flex size-14 items-center justify-center rounded-full bg-secondary text-accent">
              <BookOpen className="size-6" />
            </span>
            <h2 className="mt-6 text-xl font-semibold text-foreground sm:text-2xl">
              The written library is coming soon
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
              We would rather publish nothing than publish placeholders. Material is reviewed by the
              parish teaching team before it appears here, so every download you find is genuinely
              from The Master&apos;s Place.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <a href={TELEGRAM_CHANNEL_URL} target="_blank" rel="noreferrer">
                  <Send className="size-4" /> Follow on Telegram for releases
                </a>
              </Button>
              <Button asChild variant="outline" className="border-current/30 bg-transparent text-current hover:bg-current/10 hover:text-current">
                <Link to="/gallery">
                  <Images className="size-4" /> Visit the gallery
                </Link>
              </Button>
            </div>
          </div>

          <div className="mt-14">
            <SectionHeading
              eyebrow="In preparation"
              title="What is being written"
              description="These are the first resources scheduled for publication."
            />
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {planned.map((item) => (
                <div key={item.title} className="panel p-7">
                  <span className="eyebrow">In preparation</span>
                  <h3 className="mt-3 text-base font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                </div>
              ))}
            </div>
          </div>

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
