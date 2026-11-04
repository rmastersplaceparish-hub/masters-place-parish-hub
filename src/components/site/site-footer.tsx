import { Link } from "@tanstack/react-router";
import { MapPin, Send, Images, ShieldCheck } from "lucide-react";
import { CHURCH_ADDRESS, serviceTimes, TELEGRAM_CHANNEL_URL } from "@/lib/site-data";
import { DRIVE_ROOT_URL } from "@/lib/gallery";
import logo from "@/assets/logo.png";

const exploreLinks = [
  { label: "Home", to: "/" },
  { label: "Photo Gallery", to: "/gallery" },
  { label: "Audio Messages", to: "/audio" },
  { label: "Sermons", to: "/sermons" },
  { label: "Library", to: "/library" },
] as const;

const careLinks = [
  { label: "Submit an Issue", to: "/submit-issue" },
  { label: "Check Response", to: "/check-response" },
] as const;

export function SiteFooter() {
  return (
    <footer className="surface-ink">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-3">
              <img src={logo} alt="" className="h-10 w-10 object-contain" />
              <span className="font-display text-base font-semibold">RCCG The Master's Place</span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-current/70">
              Raising disciples, transforming lives — a parish of The Redeemed Christian Church of
              God, Ile-Ife.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <a
                href={TELEGRAM_CHANNEL_URL}
                target="_blank"
                rel="noreferrer"
                className="focus-ring inline-flex items-center gap-2 rounded-md border border-current/20 px-3 py-2 text-xs font-medium transition-colors hover:bg-current/10"
              >
                <Send className="size-4" /> Telegram
              </a>
              <a
                href={DRIVE_ROOT_URL}
                target="_blank"
                rel="noreferrer"
                className="focus-ring inline-flex items-center gap-2 rounded-md border border-current/20 px-3 py-2 text-xs font-medium transition-colors hover:bg-current/10"
              >
                <Images className="size-4" /> Photo Drive
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-display text-xs font-semibold tracking-[0.22em] uppercase">
              Explore
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-current/75">
              {exploreLinks.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="focus-ring transition-colors hover:text-current">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <h3 className="font-display mt-8 text-xs font-semibold tracking-[0.22em] uppercase">
              Pastoral Care
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-current/75">
              {careLinks.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="focus-ring transition-colors hover:text-current">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-xs font-semibold tracking-[0.22em] uppercase">
              Service Times
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-current/75">
              {serviceTimes.map((s) => (
                <li key={s.day}>
                  <span className="block text-current">{s.day}</span>
                  <span>{s.title}</span>
                  <span className="block text-current/60">{s.time}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-xs font-semibold tracking-[0.22em] uppercase">
              Visit Us
            </h3>
            <p className="mt-4 flex gap-2.5 text-sm text-current/75">
              <MapPin className="mt-0.5 size-4 shrink-0" />
              {CHURCH_ADDRESS}
            </p>
            <p className="mt-5 flex gap-2.5 text-sm text-current/70">
              <ShieldCheck className="mt-0.5 size-4 shrink-0" />
              Pastoral concerns are handled confidentially through the issue channel — no name or
              email required.
            </p>
          </div>
        </div>

        <div className="mt-12 border-t border-current/15 pt-6 text-center text-xs text-current/60">
          <div className="flex flex-col items-center gap-1.5 sm:flex-row sm:justify-center sm:gap-3">
            <p>© {new Date().getFullYear()} RCCG The Master's Place. All rights reserved.</p>
            <span className="hidden sm:inline text-current/30">•</span>
            <p>Ile-Ife, Osun State, Nigeria</p>
          </div>
          <a
            href="https://zoedeve.vercel.app"
            target="_blank"
            rel="noreferrer"
            className="focus-ring mt-3 inline-flex items-center gap-1.5 font-display text-sm font-semibold tracking-wide text-accent transition-colors hover:underline underline-offset-4"
          >
            Designed & Developed by Zoefx Technologies
          </a>
        </div>
      </div>
    </footer>
  );
}
