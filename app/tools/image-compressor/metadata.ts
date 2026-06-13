import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Image Compressor — Compress JPG, PNG, WebP Online | Creator Hub",
  description:
    "Compress images online for free. Reduce JPEG, PNG, and WebP file sizes by up to 80% without quality loss. Bulk compression for YouTube thumbnails, Instagram posts, and website images.",
  keywords: [
    "image compressor",
    "compress image online",
    "reduce image size",
    "jpeg compressor",
    "png compressor",
    "webp converter",
    "bulk image compression",
    "optimize images",
    "creator tools",
  ],
  openGraph: {
    title: "Free Image Compressor | Creator Hub",
    description:
      "Compress JPG, PNG, WebP images online for free. Reduce file size by up to 80% without visible quality loss.",
    url: "https://creatorhub.io/tools/image-compressor",
    siteName: "Creator Hub",
    images: [
      {
        url: "https://creatorhub.io/og/image-compressor.png",
        width: 1200,
        height: 630,
        alt: "Creator Hub Image Compressor Tool",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Image Compressor | Creator Hub",
    description:
      "Compress JPG, PNG, WebP images — reduce file size by 80% instantly.",
    images: ["https://creatorhub.io/og/image-compressor.png"],
    creator: "@creatorhubio",
  },
  alternates: {
    canonical: "https://creatorhub.io/tools/image-compressor",
  },
  robots: { index: true, follow: true },
};

export const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Image Compressor — Creator Hub",
  applicationCategory: "DesignApplication",
  operatingSystem: "Web",
  url: "https://creatorhub.io/tools/image-compressor",
  description:
    "Compress JPEG, PNG, and WebP images online with fine-grained quality control. Powered by Sharp for best-in-class compression.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "JPEG compression with mozjpeg",
    "PNG compression",
    "WebP conversion",
    "Bulk compression (up to 10 files)",
    "Quality slider",
    "Quick presets",
    "Before/after size comparison",
    "Download all as ZIP (Pro)",
  ],
};

export const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How much can I compress an image?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Typical savings range from 40–80% depending on the image content, format, and quality setting. WebP usually achieves the highest compression ratio.",
      },
    },
    {
      "@type": "Question",
      name: "Will compression reduce image quality?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "At quality settings of 75–85%, the compression is virtually invisible to the human eye. The default setting of 80% is the sweet spot between file size and quality.",
      },
    },
    {
      "@type": "Question",
      name: "What is the best format for web images?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "WebP is the recommended format for web use — it produces 25–35% smaller files than JPEG with equivalent quality, and is supported by all modern browsers.",
      },
    },
    {
      "@type": "Question",
      name: "Can I compress multiple images at once?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Free plan supports up to 10 images per session. Pro plan unlocks batch compression of 50 images with ZIP download.",
      },
    },
  ],
};
