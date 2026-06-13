import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free AI Caption Generator — Instagram, TikTok, YouTube Captions | Creator Hub",
  description:
    "Generate AI captions for Instagram, TikTok, YouTube, LinkedIn, Twitter and Facebook in seconds. Includes hooks, CTAs, hashtags, and emoji suggestions. Free online caption writer for creators.",
  keywords: [
    "caption generator",
    "AI caption generator",
    "Instagram caption generator",
    "TikTok caption generator",
    "YouTube caption generator",
    "social media captions",
    "free caption writer",
    "hashtag generator",
    "creator tools",
    "content creation",
  ],
  openGraph: {
    title: "Free AI Caption Generator | Creator Hub",
    description:
      "Generate scroll-stopping captions for any platform in seconds. Includes hook, short caption, long caption, CTAs, hashtags, and emojis.",
    url: "https://creatorhub.io/tools/caption-generator",
    siteName: "Creator Hub",
    images: [
      {
        url: "https://creatorhub.io/og/caption-generator.png",
        width: 1200,
        height: 630,
        alt: "Creator Hub Caption Generator",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free AI Caption Generator | Creator Hub",
    description:
      "Generate perfect captions for Instagram, TikTok, YouTube, LinkedIn, Twitter & Facebook. AI-powered with hooks, hashtags & CTAs.",
    images: ["https://creatorhub.io/og/caption-generator.png"],
    creator: "@creatorhubio",
  },
  alternates: {
    canonical: "https://creatorhub.io/tools/caption-generator",
  },
  robots: { index: true, follow: true },
};

export const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Caption Generator — Creator Hub",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: "https://creatorhub.io/tools/caption-generator",
  description:
    "AI-powered caption generator for social media creators. Generates platform-optimised captions for Instagram, TikTok, YouTube, LinkedIn, Twitter, and Facebook.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "Instagram captions",
    "TikTok captions",
    "YouTube descriptions",
    "LinkedIn posts",
    "Twitter / X posts",
    "Facebook captions",
    "Hook line generation",
    "CTA suggestions",
    "Hashtag generation",
    "Emoji suggestions",
    "6 tone options",
    "Short and long caption variants",
    "Generation history",
  ],
};

export const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Which platforms does the caption generator support?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Creator Hub's caption generator supports Instagram, TikTok, YouTube, LinkedIn, Twitter/X, and Facebook. Each platform has custom prompt engineering for platform-specific best practices.",
      },
    },
    {
      "@type": "Question",
      name: "Does the caption generator include hashtags?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Each generation includes 20 hashtags — a mix of broad, niche, and trending hashtags relevant to your topic and platform. You can copy them individually or all at once.",
      },
    },
    {
      "@type": "Question",
      name: "What tone options are available?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Six tones are available: Motivational, Casual, Professional, Humorous, Emotional, and Educational. Each produces a distinctly different caption style suited to different audiences.",
      },
    },
    {
      "@type": "Question",
      name: "How many captions can I generate for free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Free plan allows 10 generations per day. Pro plan unlocks 200 generations per day, and Agency plan unlocks 1,000 generations per day.",
      },
    },
  ],
};
