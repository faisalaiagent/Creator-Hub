import type { Metadata } from "next";

// ─── Static metadata for /tools/background-remover ───────────────────────────
export const metadata: Metadata = {
  title: "Free AI Background Remover — Remove Image Background Instantly | Creator Hub",
  description:
    "Remove image backgrounds for free with AI. No Photoshop needed. Upload JPG, PNG, or WebP and download a transparent PNG in seconds. Perfect for YouTube thumbnails, product photos, and social media.",
  keywords: [
    "background remover",
    "remove background from image",
    "transparent background",
    "AI background remover",
    "free background remover",
    "remove bg online",
    "YouTube thumbnail background",
    "creator tools",
  ],
  openGraph: {
    title: "Free AI Background Remover | Creator Hub",
    description:
      "Remove image backgrounds instantly with AI. Free for creators — no signup required for first use.",
    url: "https://creatorhub.io/tools/background-remover",
    siteName: "Creator Hub",
    images: [
      {
        url: "https://creatorhub.io/og/background-remover.png",
        width: 1200,
        height: 630,
        alt: "Creator Hub Background Remover Tool",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free AI Background Remover | Creator Hub",
    description: "Remove image backgrounds in seconds with AI. Download transparent PNG instantly.",
    images: ["https://creatorhub.io/og/background-remover.png"],
    creator: "@creatorhubio",
  },
  alternates: {
    canonical: "https://creatorhub.io/tools/background-remover",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
};

// ─── Structured data (JSON-LD) ────────────────────────────────────────────────
// Inject this via <script type="application/ld+json"> in the page <head>
export const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Background Remover — Creator Hub",
  applicationCategory: "DesignApplication",
  operatingSystem: "Web",
  url: "https://creatorhub.io/tools/background-remover",
  description:
    "AI-powered background remover for creators. Remove backgrounds from images and download transparent PNGs instantly.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
  },
  featureList: [
    "AI background removal",
    "Transparent PNG download",
    "Batch processing",
    "Before/after preview",
    "Multiple background color options",
    "JPG, PNG, WebP support",
  ],
  screenshot: "https://creatorhub.io/screenshots/background-remover.png",
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "1247",
  },
};

// ─── FAQ structured data ──────────────────────────────────────────────────────
export const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is the background remover free to use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, Creator Hub offers 10 free background removals per day. Upgrade to Pro for unlimited removals.",
      },
    },
    {
      "@type": "Question",
      name: "What image formats are supported?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "JPG, JPEG, PNG, and WebP are all supported. Maximum file size is 10MB per image.",
      },
    },
    {
      "@type": "Question",
      name: "What format is the output image?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The background-removed image is always downloaded as a transparent PNG file.",
      },
    },
    {
      "@type": "Question",
      name: "Can I process multiple images at once?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Free plan supports up to 5 images per batch. Pro plan supports up to 50 images simultaneously.",
      },
    },
  ],
};
