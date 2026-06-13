import type { Metadata } from "next";
import { Zap, Image as ImageIcon, MessageSquare, Hash, Type, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "About | Creator Hub",
  description: "Learn about Creator Hub — free AI-powered tools for content creators, built by TensorLab.",
  robots: { index: true, follow: true },
};

const TOOLS = [
  { icon: ImageIcon, name: "Background Remover", desc: "Remove image backgrounds instantly with AI" },
  { icon: Sparkles, name: "Image Compressor", desc: "Reduce file size up to 80% without quality loss" },
  { icon: MessageSquare, name: "Caption Generator", desc: "AI captions for Instagram, TikTok, YouTube & more" },
  { icon: Hash, name: "Hashtag Generator", desc: "Scored hashtag sets — viral, niche, broad & trending" },
  { icon: Type, name: "Video Title Generator", desc: "CTR & SEO-scored titles for YouTube and beyond" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="flex items-center gap-2 mb-4">
          <Zap size={14} className="text-violet-500" />
          <span className="text-xs font-medium text-violet-600 uppercase tracking-wider">About us</span>
        </div>

        <h1 className="text-3xl font-bold text-stone-900 mb-4">Free AI tools, built for creators</h1>

        <p className="text-base text-stone-600 leading-relaxed mb-6">
          Creator Hub is a free toolkit of AI-powered utilities designed for YouTubers, Instagram
          and TikTok creators, marketers, and small content teams. Our goal is simple: remove the
          friction from everyday content tasks — background removal, image compression, caption
          writing, hashtag research, and title brainstorming — so you can focus on creating.
        </p>

        <p className="text-base text-stone-600 leading-relaxed mb-10">
          Every tool runs instantly in your browser with no signup required. We use fast,
          modern AI models (via Groq's LLaMA 3.3) and best-in-class image processing (Sharp,
          remove.bg) to deliver results in seconds.
        </p>

        <h2 className="text-lg font-semibold text-stone-900 mb-4">Our tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
          {TOOLS.map((tool) => (
            <div key={tool.name} className="flex items-start gap-3 p-4 rounded-xl border border-stone-100 bg-stone-50">
              <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
                <tool.icon size={16} className="text-violet-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-stone-900">{tool.name}</p>
                <p className="text-xs text-stone-500 mt-0.5">{tool.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <h2 className="text-lg font-semibold text-stone-900 mb-3">Who we are</h2>
        <p className="text-base text-stone-600 leading-relaxed mb-6">
          Creator Hub is built and maintained by <strong>TensorLab</strong>, an independent
          software studio focused on practical AI tools for creators, marketers, and small
          businesses. We're a small team that ships fast and listens to feedback.
        </p>

        <h2 className="text-lg font-semibold text-stone-900 mb-3">Get in touch</h2>
        <p className="text-base text-stone-600 leading-relaxed">
          Have feedback, found a bug, or want to suggest a new tool? Visit our{" "}
          <a href="/contact" className="text-violet-600 underline">Contact page</a> or email us
          directly at{" "}
          <a href="mailto:faisalagentai@gmail.com" className="text-violet-600 underline">
            faisalagentai@gmail.com
          </a>.
        </p>
      </div>
    </div>
  );
}
