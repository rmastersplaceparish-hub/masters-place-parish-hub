import { createFileRoute, Link } from "@tanstack/react-router";
import { Send, Images, CalendarClock, BookOpenCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageShell, PageHeader, SectionHeading } from "@/components/site/page-shell";
import { serviceTimes, TELEGRAM_CHANNEL_URL, CHURCH_ADDRESS } from "@/lib/site-data";
import { getPublicContent, type PublicGalleryPhoto } from "@/lib/content.functions";
import { ogImageMeta } from "@/lib/seo";

export const Route = createFileRoute("/sermons")({
  loader: async () => {
    try { return { photos: (await getPublicContent()).photos }; }
    catch { return { photos: [] as PublicGalleryPhoto[] }; }
  },
  head: () => ({
    meta: [
      { title: "Sermons — RCCG The Master's Place, Ile-Ife" },
      {
        name: "description",
        content:
          "Catch up on the Word taught at RCCG The Master's Place, Ile-Ife. Full messages are published as audio recordings on our Telegram channel.",
      },
      { property: "og:title", content: "Sermons — RCCG The Master's Place" },
      {
        property: "og:description",
        content:
          "Messages from RCCG The Master's Place, Ile-Ife — published as free audio recordings each week.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      ...ogImageMeta,
    ],
  }),
  component: SermonsPage,
});

function SermonsPage() {
  const { photos } = Route.useLoaderData();
  const image = photos.find((photo) => photo.image_url)?.image_url;
  return (
    <PageShell>
      <PageHeader
        eyebrow="The Word"
        title="Sermons"
        description="Sound, Bible-based teaching every Sunday and midweek — and a free audio archive so no message is ever missed."
        actions={
          <Button asChild size="lg">
            <Link to="/audio">
              Listen to audio messages <ArrowRight className="size-4" />
            </Link>
          </Button>
        }
      />

      <section className="bg-background py-14 lg:py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
          {image && <div className="relative aspect-4/3 overflow-hidden rounded-xl border border-border">
            <img
              src={image}
              alt="The Word being ministered at RCCG The Master's Place"
              loading="lazy"
              className="size-full object-cover"
            />
          </div>}
          <div>
            <SectionHeading
              align="left"
              eyebrow="Where to listen"
              title="Every message, free to stream or download"
            />
            <p className="mt-6 text-base leading-relaxed text-muted-foreground">
              Rather than a paywalled or partial archive, the parish publishes full recordings of
              our messages on a public Telegram channel. You can stream them in a browser, download
              them for offline listening, or forward a message to someone who needs it.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link to="/audio">
                  <Send className="size-4" /> Browse audio messages
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-current/30 bg-transparent text-current hover:bg-current/10 hover:text-current">
                <a href={TELEGRAM_CHANNEL_URL} target="_blank" rel="noreferrer">
                  Open Telegram channel
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-secondary py-14 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Join us live"
            title="When the Word is taught"
            description="You are welcome in person at The Master's Place — there is always room for you."
          />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {serviceTimes.map((s) => (
              <div key={s.day} className="panel p-8">
                <CalendarClock className="size-6 text-accent" />
                <span className="eyebrow mt-5 block">{s.day}</span>
                <h3 className="mt-2 text-lg font-semibold text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.time}</p>
              </div>
            ))}
          </div>
          <p className="mt-10 text-center text-sm text-muted-foreground">{CHURCH_ADDRESS}</p>
        </div>
      </section>

      <section className="bg-background py-14 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 md:grid-cols-2 lg:px-8">
          <Link to="/gallery" className="panel focus-ring block p-8 transition-shadow hover:shadow-md">
            <Images className="size-6 text-accent" />
            <h3 className="mt-5 text-lg font-semibold text-foreground">See parish life</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Photos from Sunday services, Cultural Sunday, Family Weekend and the Master&apos;s
              Praise Concert.
            </p>
          </Link>
          <Link to="/library" className="panel focus-ring block p-8 transition-shadow hover:shadow-md">
            <BookOpenCheck className="size-6 text-accent" />
            <h3 className="mt-5 text-lg font-semibold text-foreground">Study resources</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Written guides and devotionals being prepared by the parish teaching team.
            </p>
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
