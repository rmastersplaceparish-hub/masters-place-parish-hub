import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  MessageSquarePlus,
  Search,
  Headphones,
  Images,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Eye,
  Target,
  Globe,
  Clock,
  MapPin,
  Heart,
  Users,
  Megaphone,
  Baby,
  Sparkles,
  Shield,
  HeartHandshake,
  Music,
  Flame,
  Fish,
  ArrowRight,
  BookOpen,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageShell, SectionHeading } from "@/components/site/page-shell";
import { Reveal } from "@/components/site/reveal";
import { SplashScreen } from "@/components/site/splash-screen";
import {
  CHURCH_ADDRESS,
  coreValues,
  desires,
  events,
  ministries,
  missionPoints,
  rccgKnownFor,
  serviceTimes,
  visitorExpectations,
  TELEGRAM_CHANNEL_URL,
} from "@/lib/site-data";
import { getPublicContent, type PublicEvent, type PublicGalleryPhoto } from "@/lib/content.functions";
import { ogImageMeta } from "@/lib/seo";
import adeboye1 from "@/assets/adeboye-1.webp";
import adeboye2 from "@/assets/adeboye-2.webp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RCCG The Master's Place, Ile-Ife — Worship, Word & Transformation" },
      {
        name: "description",
        content:
          "RCCG The Master's Place, Ile-Ife: service times, ministries, photo gallery, free audio messages and a confidential pastoral care channel.",
      },
      {
        property: "og:title",
        content: "RCCG The Master's Place, Ile-Ife — Worship, Word & Transformation",
      },
      {
        property: "og:description",
        content:
          "A parish of The Redeemed Christian Church of God in Ile-Ife. Join us for worship, teaching and community.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      ...ogImageMeta,
    ],
  }),
  loader: async () => {
    try {
      const { events: publishedEvents, photos } = await getPublicContent();
      return { publishedEvents, photos };
    } catch (error) {
      console.error("[home] Unable to load published events", error);
      return { publishedEvents: [] as PublicEvent[], photos: [] as PublicGalleryPhoto[] };
    }
  },
  component: HomePage,
  errorComponent: () => null,
  notFoundComponent: () => null,
});

function formatEventDate(value: string) {
  return new Date(value).toLocaleString("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const quickActions = [
  {
    icon: MessageSquarePlus,
    label: "Submit an Issue",
    description: "Share a concern confidentially",
    to: "/submit-issue",
  },
  {
    icon: Search,
    label: "Check Response",
    description: "View the pastoral reply",
    to: "/check-response",
  },
  {
    icon: Headphones,
    label: "Audio Messages",
    description: "Stream or download free",
    to: "/audio",
  },
  {
    icon: Images,
    label: "Photo Gallery",
    description: "Life at The Master's Place",
    to: "/gallery",
  },
] as const;

const valueIcons = [Heart, BookOpen, Users, Megaphone] as const;
const ministryIcons = [Baby, Sparkles, Shield, HeartHandshake, Music] as const;
const eventIcons = [Flame, Users, Fish] as const;

function HomePage() {
  const { publishedEvents, photos } = Route.useLoaderData();
  const managedPhotos = photos.filter((photo) => photo.image_url).map((photo) => ({ src: photo.image_url, alt: photo.caption || "A moment at The Master's Place" }));
  const slides = managedPhotos.slice(0, 4);
  const highlights = managedPhotos.slice(0, 6);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || !slides.length) return;
    const timer = setInterval(() => setCurrent((prev) => (prev + 1) % slides.length), 6000);
    return () => clearInterval(timer);
  }, [paused, slides.length]);

  useEffect(() => setCurrent(0), [slides.length]);

  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);
  const next = () => setCurrent((c) => (c + 1) % slides.length);

  const now = Date.now();
  const upcoming = publishedEvents
    .filter((event) => event.status !== "concluded")
    .filter((event) => new Date(event.end_date ?? event.event_date).getTime() >= now)
    .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());
  const announcement = upcoming.find((event) => event.is_featured) ?? null;
  const eventCards = upcoming.length > 0 ? upcoming.slice(0, 6) : publishedEvents.slice(0, 6);

  return (
    <PageShell>
      <SplashScreen />

      {announcement && (
        <div className="border-b border-accent/30 bg-accent/10">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <div className="flex items-start gap-3">
              <Megaphone className="mt-0.5 size-5 shrink-0 text-accent" />
              <div>
                <p className="eyebrow">Next up at the parish</p>
                <p className="mt-1 text-sm font-semibold text-foreground sm:text-base">
                  {announcement.title}
                  {announcement.theme ? ` — ${announcement.theme}` : ""}
                </p>
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                  {formatEventDate(announcement.event_date)} · {announcement.location}
                </p>
              </div>
            </div>
            <Button asChild size="sm" className="shrink-0 self-start sm:self-auto">
              <a href="#events">
                See details <ArrowRight className="size-4" />
              </a>
            </Button>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="surface-ink">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:px-8 lg:py-24">
          <div className="animate-rise">
            <p className="font-display text-[11px] font-semibold tracking-[0.24em] text-current/70 uppercase">
              The Redeemed Christian Church of God
            </p>
            <h1 className="mt-4 text-4xl leading-[1.05] font-semibold sm:text-5xl lg:text-6xl">
              RCCG The Master&apos;s Place
            </h1>
            <span className="brass-rule mt-6" />
            <p className="mt-6 max-w-xl text-base leading-relaxed text-current/75 sm:text-lg">
              A place of Worship, Word, and Transformation. We are a vibrant community in Ile-Ife
              committed to raising disciples, transforming lives, and spreading the Gospel of Jesus
              Christ.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <a href="#services">
                  Plan your visit <ArrowRight className="size-4" />
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-current/30 bg-transparent text-current hover:bg-current/10 hover:text-current"
              >
                <Link to="/audio">
                  <Headphones className="size-4" /> Listen to messages
                </Link>
              </Button>
            </div>
          </div>

           {slides.length > 0 && <div className="relative">
            <div
              aria-hidden
              className="animate-spin-slow absolute -top-12 -right-12 hidden size-48 rounded-full border-4 border-dashed border-accent/50 lg:block"
            />
            <div
              aria-hidden
              className="animate-spin-slow-reverse absolute -top-4 -right-4 hidden size-32 rounded-full border-[3px] border-accent/30 lg:block"
            />
            <div
              aria-hidden
              className="animate-spin-slow absolute -bottom-12 -left-12 hidden size-36 rounded-full border-4 border-dashed border-current/25 lg:block"
            >
              <span className="absolute -top-1.5 left-1/2 size-3 -translate-x-1/2 rounded-full bg-accent shadow-[0_0_12px_var(--accent)]" />
            </div>
            <div
              aria-hidden
              className="animate-spin-slow-reverse absolute right-1/4 -bottom-14 hidden size-20 rounded-full border-[3px] border-accent/40 lg:block"
            />
            <div
              aria-hidden
              className="absolute -bottom-8 -left-8 hidden size-24 rounded-full bg-accent/15 blur-2xl lg:block"
            />
            <div
              className="relative aspect-4/3 overflow-hidden rounded-xl border border-current/15 shadow-2xl"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
            >
              {slides.map((img, i) => (
                <img
                  key={`${img.src}-${i}`}
                  src={img.src}
                  alt={img.alt}
                  loading={i === 0 ? "eager" : "lazy"}
                  className={`absolute inset-0 size-full object-cover transition-opacity duration-700 ${
                    i === current ? "animate-ken-burns opacity-100" : "opacity-0"
                  }`}
                />
              ))}
              <button
                onClick={prev}
                aria-label="Previous image"
                className="focus-ring absolute top-1/2 left-3 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-background/70 text-foreground backdrop-blur transition-colors hover:bg-background"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                onClick={next}
                aria-label="Next image"
                className="focus-ring absolute top-1/2 right-3 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-background/70 text-foreground backdrop-blur transition-colors hover:bg-background"
              >
                <ChevronRight className="size-4" />
              </button>
              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                {slides.map((slide, i) => (
                  <button
                    key={`${slide.src}-${i}`}
                    onClick={() => setCurrent(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    aria-current={i === current}
                    className={`h-1.5 rounded-full transition-all ${
                      i === current ? "w-6 bg-accent" : "w-1.5 bg-current/50"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>}
        </div>

        {/* Quick actions */}
        <div className="border-t border-current/15">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-current/15 lg:grid-cols-4">
            {quickActions.map((action) => (
              <Link
                key={action.to}
                to={action.to}
                className="focus-ring group flex flex-col gap-2 bg-[color-mix(in_oklch,var(--ink)_92%,transparent)] p-5 transition-colors hover:bg-[color-mix(in_oklch,var(--ink)_75%,transparent)] sm:p-6"
              >
                <action.icon className="size-5 text-accent transition-transform duration-300 group-hover:-translate-y-0.5" />
                <span className="font-display text-sm font-semibold sm:text-base">
                  {action.label}
                </span>
                <span className="text-xs text-current/65 sm:text-sm">{action.description}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Welcome */}
      <section id="welcome" className="bg-background py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Who we are"
            title="Welcome to RCCG The Master's Place"
            description="Whether you are visiting for the first time or looking for a church family, you are welcome here."
          />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {desires.map((d, i) => (
              <Reveal key={d} delay={i * 90} className="panel flex items-start gap-3 p-5">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-accent" />
                <span className="text-sm font-medium text-foreground">{d}</span>
              </Reveal>
            ))}
          </div>
          <blockquote className="panel mt-10 p-8 text-center lg:p-10">
            <p className="font-display text-lg leading-relaxed font-medium text-foreground sm:text-xl">
              &ldquo;Welcome to RCCG The Master&apos;s Place — Raising Disciples, Transforming
              Lives.&rdquo;
            </p>
          </blockquote>
        </div>
      </section>

      {/* Gallery preview */}
      <section id="gallery" className="bg-secondary py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Life at The Master's Place"
            title="Moments from our services & programmes"
            description="Real photographs from Sunday worship, Cultural Sunday, Family Weekend, Christmas Carol and the Master's Praise Concert."
          />
           {highlights.length > 0 && <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
              {highlights.map((photo, i) => (
              <Reveal
                  key={`${photo.src}-${i}`}
                delay={i * 80}
                className={`overflow-hidden rounded-lg border border-border ${
                  i === 0 ? "col-span-2 aspect-16/10 lg:col-span-2 lg:row-span-2 lg:aspect-auto" : "aspect-4/3"
                }`}
              >
                <img
                  src={photo.src}
                  alt={photo.alt}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </Reveal>
            ))}
           </div>}
          <div className="mt-10 flex justify-center">
            <Button asChild size="lg">
              <Link to="/gallery">
                <Images className="size-4" /> View the full gallery
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section id="vision" className="bg-background py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Our foundation" title="Vision & Mission" />
          <Reveal className="mt-12 grid gap-6 lg:grid-cols-2">
            <div className="panel p-8">
              <Eye className="size-6 text-accent" />
              <h3 className="mt-5 text-xl font-semibold text-foreground">Our Vision</h3>
              <p className="mt-3 text-sm text-muted-foreground">
                The vision of The Redeemed Christian Church of God is:
              </p>
              <p className="font-display mt-2 text-2xl font-semibold text-primary">
                To make Heaven.
              </p>
            </div>
            <div className="panel p-8">
              <Target className="size-6 text-accent" />
              <h3 className="mt-5 text-xl font-semibold text-foreground">Our Mission</h3>
              <ul className="mt-4 space-y-3">
                {missionPoints.map((point) => (
                  <li
                    key={point}
                    className="flex gap-3 text-sm leading-relaxed text-muted-foreground"
                  >
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal className="panel mt-6 grid overflow-hidden lg:grid-cols-2">
            <div className="p-8 lg:p-10">
              <Globe className="size-6 text-accent" />
              <h3 className="mt-5 text-xl font-semibold text-foreground">About RCCG Worldwide</h3>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                The Redeemed Christian Church of God (RCCG) is an international Pentecostal church
                founded in 1952 by Josiah Olufemi Akindayomi in Nigeria. From humble beginnings,
                RCCG has grown into a global movement with thousands of parishes in more than 190
                countries worldwide, currently led by the General Overseer, Pastor Enoch Adejare
                Adeboye.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {rccgKnownFor.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground"
                  >
                    {item}
                  </span>
                ))}
              </div>
              <figure className="mt-8 flex items-center gap-4">
                <img
                  src={adeboye2}
                  alt="Portrait of Pastor Enoch Adejare Adeboye"
                  loading="lazy"
                  className="size-16 shrink-0 rounded-full border border-border object-cover object-top"
                />
                <figcaption className="text-xs leading-relaxed text-muted-foreground">
                  <span className="block text-sm font-semibold text-foreground">
                    Pastor E. A. Adeboye
                  </span>
                  General Overseer, RCCG — serving since 1981.
                </figcaption>
              </figure>

            </div>
            <div className="relative min-h-72 lg:min-h-0">
              <img
                src={adeboye1}
                alt="Pastor Enoch Adejare Adeboye, General Overseer of the RCCG"
                loading="lazy"
                className="absolute inset-0 size-full object-cover"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Core values */}
      <section id="values" className="bg-secondary py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="What we stand for" title="Our Core Values" />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {coreValues.map((item, i) => {
              const Icon = valueIcons[i % valueIcons.length]!;
              return (
                <Reveal
                  key={item.title}
                  delay={i * 90}
                  className="panel p-7 transition-shadow duration-300 hover:shadow-md"
                >
                  <Icon className="size-6 text-accent" />
                  <h3 className="mt-5 text-base font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Ministries */}
      <section id="ministries" className="bg-background py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Get involved"
            title="Ministries & Departments"
            description="There is a place for everyone to grow and serve at RCCG The Master's Place."
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {ministries.map((item, i) => {
              const Icon = ministryIcons[i % ministryIcons.length]!;
              return (
                <Reveal
                  key={item.title}
                  delay={i * 90}
                  className="panel p-7 transition-shadow duration-300 hover:shadow-md"
                >
                  <Icon className="size-6 text-accent" />
                  <h3 className="mt-5 text-base font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Visitors */}
      <section id="visitors" className="bg-secondary py-16 lg:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
          {managedPhotos.length > 0 && <Reveal className="relative aspect-4/3 overflow-hidden rounded-xl border border-border">
            <img
              src={(managedPhotos[4] ?? managedPhotos[0])?.src ?? ""}
              alt="Members welcoming one another at RCCG The Master's Place"
              loading="lazy"
              className="size-full object-cover"
            />
          </Reveal>}
          <Reveal delay={120}>
            <SectionHeading
              align="left"
              eyebrow="First time?"
              title="New here?"
              description="Visiting RCCG The Master's Place for the first time? We want your experience to be warm, welcoming, and meaningful."
            />
            <ul className="mt-8 space-y-4">
              {visitorExpectations.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-accent" />
                  <span className="text-sm text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* Service times */}
      <section id="services" className="scroll-mt-20 bg-background py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Join us" title="Service Times" />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {serviceTimes.map((s, i) => (
              <Reveal key={s.day} delay={i * 110} className="panel p-8 text-center">
                <span className="eyebrow">{s.day}</span>
                <h3 className="mt-4 text-lg font-semibold text-foreground">{s.title}</h3>
                <p className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="size-4 text-accent" /> {s.time}
                </p>
              </Reveal>
            ))}
          </div>
          <p className="mt-10 flex flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground sm:flex-row">
            <MapPin className="size-4 text-accent" /> {CHURCH_ADDRESS}
          </p>
        </div>
      </section>

      {/* Events */}
      <section id="events" className="bg-secondary py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Through the year"
            title="Church Events"
            description={
              eventCards.length > 0
                ? "Upcoming services, programmes and special gatherings at the parish."
                : "Special gatherings we look forward to through the year."
            }
          />
          {eventCards.length > 0 ? (
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {eventCards.map((event, i) => {
                const Icon = eventIcons[i % eventIcons.length]!;
                return (
                  <Reveal key={event.id} delay={i * 110} className="panel overflow-hidden">
                    {event.flyer_url && (
                      <img
                        src={event.flyer_url}
                        alt={`Flyer for ${event.title}`}
                        loading="lazy"
                        className="aspect-16/9 w-full object-cover"
                      />
                    )}
                    <div className="p-8">
                      <Icon className="size-6 text-accent" />
                      <h3 className="mt-5 text-base font-semibold text-foreground">{event.title}</h3>
                      {event.theme && (
                        <p className="mt-1 text-sm font-medium text-accent">{event.theme}</p>
                      )}
                      <p className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="size-4 text-accent" /> {formatEventDate(event.event_date)}
                      </p>
                      <p className="mt-1.5 inline-flex items-start gap-2 text-sm text-muted-foreground">
                        <MapPin className="mt-0.5 size-4 shrink-0 text-accent" /> {event.location}
                      </p>
                      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                        {event.description}
                      </p>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          ) : (
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {events.map((event, i) => {
                const Icon = eventIcons[i % eventIcons.length]!;
                return (
                  <Reveal key={event.title} delay={i * 110} className="panel p-8">
                    <Icon className="size-6 text-accent" />
                    <h3 className="mt-5 text-base font-semibold text-foreground">{event.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {event.description}
                    </p>
                  </Reveal>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Connect */}
      <section id="connect" className="surface-ink py-16 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
          <Reveal>
            <p className="eyebrow text-current/70">Connect with us</p>
            <h2 className="mt-3 text-2xl font-semibold sm:text-3xl lg:text-4xl">
              Come and worship, or reach us privately
            </h2>
            <span className="brass-rule mt-5" />
            <p className="mt-6 max-w-xl text-base leading-relaxed text-current/75">
              You are welcome at any of our services at {CHURCH_ADDRESS}. If you would rather speak
              to pastoral leadership first, the confidential channel below reaches them directly —
              no name, phone number or email is required.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link to="/submit-issue">
                  <MessageSquarePlus className="size-4" /> Submit a confidential issue
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-current/30 bg-transparent text-current hover:bg-current/10 hover:text-current"
              >
                <Link to="/check-response">Check a response</Link>
              </Button>
            </div>
          </Reveal>

          <Reveal delay={140} className="grid gap-4 sm:grid-cols-2">
            <a
              href={TELEGRAM_CHANNEL_URL}
              target="_blank"
              rel="noreferrer"
              className="focus-ring rounded-xl border border-current/15 p-6 transition-colors hover:bg-current/5"
            >
              <Send className="size-5 text-accent" />
              <h3 className="font-display mt-4 text-base font-semibold">Audio on Telegram</h3>
              <p className="mt-2 text-sm text-current/70">
                Free recordings of our messages, ready to stream or download.
              </p>
            </a>
            <Link
              to="/gallery"
              className="focus-ring rounded-xl border border-current/15 p-6 transition-colors hover:bg-current/5"
            >
              <Images className="size-5 text-accent" />
              <h3 className="font-display mt-4 text-base font-semibold">Photo Gallery</h3>
              <p className="mt-2 text-sm text-current/70">
                Ten albums of real moments from parish life.
              </p>
            </Link>
            <div className="rounded-xl border border-current/15 p-6 sm:col-span-2">
              <MapPin className="size-5 text-accent" />
              <h3 className="font-display mt-4 text-base font-semibold">Visit the parish</h3>
              <p className="mt-2 text-sm text-current/70">{CHURCH_ADDRESS}</p>
              <ul className="mt-4 space-y-1.5 text-sm text-current/70">
                {serviceTimes.map((s) => (
                  <li key={s.day}>
                    <span className="text-current">{s.day}</span> — {s.time}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>
    </PageShell>
  );
}
