import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free AI Video Title Generator — YouTube, TikTok, SEO Titles | Creator Hub",
  description:
    "Generate SEO, clickable, curiosity, emotional, listicle, and shorts-style video titles scored for CTR and SEO. Includes keyword suggestions and thumbnail text ideas. Free for creators.",
  keywords: [
    "video title generator", "AI title generator", "YouTube title generator",
    "SEO title generator", "clickbait title generator", "thumbnail text generator",
    "TikTok title generator", "video SEO", "CTR optimization", "creator tools",
  ],
  openGraph: {
    title: "Free AI Video Title Generator | Creator Hub",
    description: "Generate scored video titles across 6 styles with SEO keywords and thumbnail text suggestions.",
    url: "https://creatorhub.io/tools/title-generator",
    siteName: "Creator Hub",
    images: [{ url: "https://creatorhub.io/og/title-generator.png", width: 1200, height: 630, alt: "Creator Hub Title Generator" }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free AI Video Title Generator | Creator Hub",
    description: "Generate CTR-scored video titles for YouTube, TikTok, Instagram & blogs.",
    images: ["https://creatorhub.io/og/title-generator.png"],
    creator: "@creatorhubio",
  },
  alternates: { canonical: "https://creatorhub.io/tools/title-generator" },
  robots: { index: true, follow: true },
};

export const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Video Title Generator — Creator Hub",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: "https://creatorhub.io/tools/title-generator",
  description: "AI-powered video title generator producing SEO, clickable, emotional, curiosity, shorts, and listicle titles scored for CTR and SEO with keyword and thumbnail text suggestions.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  featureList: [
    "6 title styles: SEO, clickable, emotional, curiosity, shorts, listicle",
    "4 platforms: YouTube, TikTok, Instagram, Blog",
    "CTR scoring (0-100)",
    "SEO scoring (0-100)",
    "Keyword suggestions",
    "Thumbnail text suggestions",
    "Saved titles library",
  ],
};

export const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What does the CTR score mean?",
      acceptedAnswer: { "@type": "Answer", text: "The CTR score (0-100) estimates the probability someone clicks a title given they've seen it. Scores above 85 indicate an irresistible title; below 50 means the title is generic." },
    },
    {
      "@type": "Question",
      name: "What does the SEO score mean?",
      acceptedAnswer: { "@type": "Answer", text: "The SEO score (0-100) estimates how discoverable a title is in search results. Higher scores mean the title naturally includes high-intent keywords." },
    },
    {
      "@type": "Question",
      name: "What title styles are available?",
      acceptedAnswer: { "@type": "Answer", text: "Six styles: SEO (search-optimized), Clickable (high CTR), Emotional (identity-driven), Curiosity (open loops), Shorts (punchy/short), and Listicle (numbered format)." },
    },
    {
      "@type": "Question",
      name: "Does it generate thumbnail text too?",
      acceptedAnswer: { "@type": "Answer", text: "Yes. Each generation includes 3-5 short thumbnail text overlay suggestions that pair well with the generated titles." },
    },
  ],
};
