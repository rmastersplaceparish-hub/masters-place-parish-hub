// Absolute URL of the social share preview image (public/og-image.png).
// Set VITE_SITE_URL (e.g. https://your-vercel-domain.vercel.app) in each
// deployment environment so WhatsApp/Facebook/Twitter crawlers get a valid
// absolute URL. Falls back to the Lovable preview URL.
const SITE_URL =
  (import.meta.env["VITE_SITE_URL"] as string | undefined)?.replace(/\/$/, "") ??
  "https://id-preview--23567c28-58c9-436f-83a9-a870db587025.lovable.app";

export const OG_IMAGE_URL = `${SITE_URL}/og-image.png`;

export const ogImageMeta = [
  { property: "og:image", content: OG_IMAGE_URL },
  { property: "og:image:width", content: "1200" },
  { property: "og:image:height", content: "640" },
  { name: "twitter:image", content: OG_IMAGE_URL },
];
