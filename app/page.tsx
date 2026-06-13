import Link from "next/link";
import { Image as ImageIcon, Sparkles, MessageSquare, Hash, Type, ArrowRight } from "lucide-react";

const TOOLS = [
  { href: "/tools/background-remover", icon: ImageIcon, name: "Background Remover", desc: "Remove image backgrounds instantly with AI. Download transparent PNGs.", color: "bg-violet-100 text-violet-600" },
  { href: "/tools/image-compressor", icon: Sparkles, name: "Image Compressor", desc: "Compress JPG, PNG, WebP up to 80% smaller without visible quality loss.", color: "bg-sky-100 text-sky-600" },
  { href: "/tools/caption-generator", icon: MessageSquare, name: "Caption Generator", desc: "AI captions for Instagram, TikTok, YouTube, LinkedIn, Twitter & Facebook.", color: "bg-emerald-100 text-emerald-600" },
  { href: "/tools/hashtag-generator", icon: Hash, name: "Hashtag Generator", desc: "Viral, niche, broad & trending hashtags scored for difficulty and reach.", color: "bg-amber-100 text-amber-600" },
  { href: "/tools/title-generator", icon: Type, name: "Video Title Generator", desc: "SEO and CTR-scored titles for YouTube, TikTok, Instagram & blogs.", color: "bg-red-100 text-red-600" },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-5 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-1.5 text-xs font-medium text-violet-600 bg-violet-50 px-3 py-1 rounded-full mb-5">
          <Sparkles size={12} />
          5 free AI tools · No signup required
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-stone-900 mb-4 tracking-tight">
          Free AI tools for content creators
        </h1>
        <p className="text-base text-stone-500 max-w-xl mx-auto leading-relaxed">
          Remove backgrounds, compress images, write captions, find hashtags, and generate
          video titles — all powered by AI, all free, no account needed.
        </p>
      </section>

      {/* Tool grid */}
      <section className="max-w-4xl mx-auto px-5 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group flex flex-col gap-3 p-5 rounded-2xl border border-stone-100 hover:border-stone-200 hover:shadow-sm transition-all"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tool.color}`}>
                <tool.icon size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-stone-900 flex items-center gap-1.5">
                  {tool.name}
                  <ArrowRight size={13} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </p>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">{tool.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
