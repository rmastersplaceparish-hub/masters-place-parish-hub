import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

const MOTTO = "RCCG Motto · \u201cJesus Christ the same yesterday, and today, and forever.\u201d — Hebrews 13:8";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Gallery", to: "/gallery" },
  { label: "Audio Messages", to: "/audio" },
  { label: "Sermons", to: "/sermons" },
  { label: "Library", to: "/library" },
  { label: "Check Response", to: "/check-response" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        data-scrolled={scrolled}
        className="fixed inset-x-0 top-0 z-50 flex flex-col border-b border-border/60 bg-background/80 backdrop-blur-xl transition-shadow duration-300 data-[scrolled=true]:border-border data-[scrolled=true]:shadow-[0_1px_20px_-12px_color-mix(in_oklch,var(--foreground)_60%,transparent)]"
      >
        <div className="group/motto h-7 overflow-hidden bg-primary text-primary-foreground" aria-label={MOTTO} role="note">
          <div className="flex w-max animate-marquee items-center whitespace-nowrap group-hover/motto:[animation-play-state:paused] motion-reduce:animate-none" aria-hidden="true">
            {[0, 1].map((i) => (
              <span key={i} className="flex items-center">
                {[0, 1, 2].map((j) => (
                  <span key={j} className="px-8 text-[11px] font-medium leading-7 tracking-[0.12em]">✦ {MOTTO}</span>
                ))}
              </span>
            ))}
          </div>
        </div>
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 transition-[height] duration-300 sm:px-6 lg:px-8 data-[scrolled=true]:lg:h-16 lg:h-18">

        <Link
          to="/"
          className="group flex items-center gap-3 rounded-md focus-ring"
          onClick={() => setOpen(false)}
        >
          <img
            src={logo}
            alt="RCCG The Master's Place logo"
            className="h-9 w-9 object-contain transition-transform duration-300 group-hover:scale-105 sm:h-10 sm:w-10"
          />
          <span className="flex flex-col leading-tight">
            <span className="font-display text-sm font-semibold tracking-tight text-foreground sm:text-base">
              RCCG The Master&apos;s Place
            </span>
            <span className="hidden text-[11px] tracking-[0.18em] text-muted-foreground uppercase sm:block">
              Worship · Word · Transformation
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Primary">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              activeOptions={{ exact: link.to === "/" }}
              className="focus-ring relative rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground data-[status=active]:text-foreground"
            >
              {link.label}
              <span className="pointer-events-none absolute inset-x-3 -bottom-px hidden h-0.5 rounded-full bg-accent data-[status=active]:block" />
            </Link>
          ))}
        </nav>

        <div className="hidden xl:block">
          <Button asChild size="sm">
            <Link to="/submit-issue">
              <ShieldCheck className="size-4" />
              Submit an Issue
            </Link>
          </Button>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="focus-ring inline-flex size-10 items-center justify-center rounded-md border border-border text-foreground lg:hidden"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
        </div>
      </header>

      {open && (
        <div className="fixed inset-x-0 top-[5.75rem] bottom-0 z-40 overflow-y-auto border-t border-border bg-background lg:hidden">
          <nav className="mx-auto max-w-7xl space-y-1 px-4 py-5 sm:px-6" aria-label="Mobile">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                activeOptions={{ exact: link.to === "/" }}
                className="focus-ring block rounded-lg px-3 py-3 text-base font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground data-[status=active]:bg-secondary data-[status=active]:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            <Button asChild size="lg" className="mt-4 w-full">
              <Link to="/submit-issue" onClick={() => setOpen(false)}>
                <ShieldCheck className="size-4" />
                Submit an Issue
              </Link>
            </Button>
          </nav>
        </div>
      )}
    </>
  );
}

