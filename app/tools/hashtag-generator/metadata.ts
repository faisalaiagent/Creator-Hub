import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free AI Hashtag Generator — Instagram, TikTok, YouTube Hashtags | Creator Hub",
  description:
    "Generate viral, niche, broad, and trending hashtags for Instagram, TikTok, YouTube, LinkedIn, Twitter, and Pinterest. Each hashtag includes a difficulty score and popularity score. Free for creators.",
  keywords: [
    "hashtag generator",
    "AI hashtag generator",
    "Instagram hashtags",
    "TikTok hashtags",
    "YouTube hashtags",
    "trending hashtags",
    "niche hashtags",
    "viral hashtags",
    "hashtag difficulty score",
    "free hashtag tool",
    "creator tools",
    "social media hashtags",
  ],
  openGraph: {
    title: "Free AI Hashtag Generator | Creator Hub",
    description:
      "Generate categorised hashtag sets with difficulty and popularity scores for any platform. Viral, niche, broad, and trending tags — all in one generation.",
    url: "https://creatorhub.io/tools/hashtag-generator",
    siteName: "Creator Hub",
    images: [
      {
        url: "https://creatorhub.io/og/hashtag-generator.png",
        width: 1200,
        height: 630,
        alt: "Creator Hub Hashtag Generator",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free AI Hashtag Generator | Creator Hub",
    description:
      "Generate scored hashtag sets for Instagram, TikTok, YouTube & more. Viral + niche + broad + trending in one click.",
    images: ["https://creatorhub.io/og/hashtag-generator.png"],
    creator: "@creatorhubio",
  },
  alternates: {
    canonical: "https://creatorhub.io/tools/hashtag-generator",
  },
  robots: { index: true, follow: true },
};

export const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Hashtag Generator — Creator Hub",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: "https://creatorhub.io/tools/hashtag-generator",
  description:
    "AI-powered hashtag generator with difficulty and popularity scoring. Generates categorised hashtag sets for Instagram, TikTok, YouTube, LinkedIn, Twitter, and Pinterest.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "Instagram hashtag generator",
    "TikTok hashtag generator",
    "YouTube hashtag generator",
    "LinkedIn hashtag generator",
    "Twitter hashtag generator",
    "Pinterest hashtag generator",
    "Difficulty scoring (0–100)",
    "Popularity scoring (0–100)",
    "4 tag categories: viral, niche, broad, trending",
    "Hashtag strategy recommendation",
    "Select and copy individual tags",
    "Copy by category",
    "Save hashtag sets",
  ],
};

export const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What does the difficulty score mean?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The difficulty score (0–100) indicates how competitive a hashtag is. A score of 80+ means the hashtag is dominated by large accounts and very hard to rank for. A score under 40 means the hashtag has low competition and is achievable for small creators.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between viral, niche, broad, and trending hashtags?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Viral hashtags have massive reach but high competition. Niche hashtags target engaged communities with less competition. Broad hashtags aid general discovery. Trending hashtags have current momentum. A balanced mix of all four types performs best for most creators.",
      },
    },
    {
      "@type": "Question",
      name: "How many hashtags should I use on Instagram?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Instagram supports up to 30 hashtags per post. Research suggests using all 30 for maximum reach, but focusing on relevance over quantity. Mix 5 broad, 8 medium-range, 10 niche, and 7 very specific community hashtags for the best results.",
      },
    },
    {
      "@type": "Question",
      name: "Does this tool work for TikTok hashtags?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. TikTok hashtags are generated with TikTok's FYP algorithm in mind, including mega-viral discovery tags and niche community tags. The tool generates 10 hashtags for TikTok, which is the recommended range.",
      },
    },
  ],
};
