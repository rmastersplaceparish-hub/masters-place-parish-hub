import { createFileRoute, Link } from "@tanstack/react-router";
import { Send, Download, Headphones, Bell, ExternalLink, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageShell, PageHeader, SectionHeading } from "@/components/site/page-shell";
import { TELEGRAM_CHANNEL_HANDLE, TELEGRAM_CHANNEL_URL } from "@/lib/site-data";
import { ogImageMeta } from "@/lib/seo";

export const Route = createFileRoute("/audio")({
  head: () => ({
    meta: [
      { title: "Audio Messages — RCCG The Master's Place, Ile-Ife" },
      {
        name: "description",
        content:
          "Listen to and download audio messages from RCCG The Master's Place, Ile-Ife, published free on our public Telegram channel.",
      },
      { property: "og:title", content: "Audio Messages — RCCG The Master's Place" },
      {
        property: "og:description",
        content:
          "Every message from RCCG The Master's Place is published as audio on our Telegram channel — stream or download at no cost.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      ...ogImageMeta,
    ],
  }),
  component: AudioPage,
});

const steps = [
  {
    icon: Send,
    title: "Open the channel",
    body: "Tap “Open in Telegram” below. You can also browse it in your web browser without installing anything.",
  },
  {
    icon: Headphones,
    title: "Stream any message",
    body: "Each post is a full audio recording. Press play and it streams straight away — no account needed to listen on the web.",
  },
  {
    icon: Download,
    title: "Download for offline",
    body: "Save messages to your phone so you can listen while travelling, during devotion, or share with someone who needs it.",
  },
  {
    icon: Bell,
    title: "Subscribe for new releases",
    body: "Join the channel in the Telegram app and you'll be notified each time a new message is uploaded.",
  },
];

function AudioPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Listen again"
        title="Audio Messages"
        description="Every message preached at RCCG The Master's Place is published as audio on our public Telegram channel — free to stream, download and share."
        actions={
          <Button asChild size="lg">
            <a href={TELEGRAM_CHANNEL_URL} target="_blank" rel="noreferrer">
              <Send className="size-4" /> Open in Telegram
            </a>
          </Button>
        }
      />

      <section className="bg-background py-14 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:gap-14 lg:px-8">
          <div>
            <SectionHeading
              align="left"
              eyebrow="The channel"
              title="RCCG The Master's Place — Audio Files"
              description="Our audio archive lives on Telegram so that messages stay easy to find, quick to download on low bandwidth, and simple to forward to family and friends."
            />
            <dl className="mt-8 space-y-6">
              {steps.map((step) => (
                <div key={step.title} className="flex gap-4">
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-accent">
                    <step.icon className="size-5" />
                  </span>
                  <div>
                    <dt className="text-sm font-semibold text-foreground">{step.title}</dt>
                    <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {step.body}
                    </dd>
                  </div>
                </div>
              ))}
            </dl>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <a href={TELEGRAM_CHANNEL_URL} target="_blank" rel="noreferrer">
                  <Send className="size-4" /> Open in Telegram
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-current/30 bg-transparent text-current hover:bg-current/10 hover:text-current">
                <a href={`${TELEGRAM_CHANNEL_URL}?boost`} target="_blank" rel="noreferrer">
                  Subscribe to the channel <ExternalLink className="size-4" />
                </a>
              </Button>
            </div>
          </div>

          <div className="panel p-6 sm:p-8">
            <div className="flex items-center gap-2 text-xs tracking-[0.18em] text-muted-foreground uppercase">
              <Radio className="size-4 text-accent" /> The channel
            </div>
            <p className="font-display mt-4 text-2xl font-semibold text-foreground">
              @{TELEGRAM_CHANNEL_HANDLE}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Telegram does not allow its channels to be embedded on other websites, so the archive
              opens in Telegram (or your browser) instead.
            </p>
            <ol className="mt-6 space-y-3 text-sm text-muted-foreground">
              {[
                "Tap “Open in Telegram” below — no account is needed to preview the channel in a browser.",
                "Scroll the archive to find the message you want.",
                "Press play to stream, or the download icon to keep a copy offline.",
              ].map((step, i) => (
                <li key={step} className="flex gap-3">
                  <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-semibold text-accent">
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            <Button asChild className="mt-7 w-full">
              <a href={TELEGRAM_CHANNEL_URL} target="_blank" rel="noreferrer">
                Open the audio archive <ExternalLink className="size-4" />
              </a>
            </Button>
          </div>

        </div>
      </section>

      <section className="bg-secondary py-14 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Keep going"
            title="More ways to stay connected"
            description="Audio is one part of the journey. Explore parish life and reach pastoral leadership whenever you need to."
          />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Link to="/gallery" className="panel focus-ring block p-7 transition-shadow hover:shadow-md">
              <h3 className="text-base font-semibold text-foreground">Photo Gallery</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Sunday services, Cultural Sunday, Family Weekend and the Master&apos;s Praise
                Concert.
              </p>
            </Link>
            <Link to="/sermons" className="panel focus-ring block p-7 transition-shadow hover:shadow-md">
              <h3 className="text-base font-semibold text-foreground">Sermons</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                How to catch up on the Word taught at The Master&apos;s Place each week.
              </p>
            </Link>
            <Link
              to="/submit-issue"
              className="panel focus-ring block p-7 transition-shadow hover:shadow-md"
            >
              <h3 className="text-base font-semibold text-foreground">Confidential Care</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Share a concern with pastoral leadership anonymously and get a private reply.
              </p>
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
