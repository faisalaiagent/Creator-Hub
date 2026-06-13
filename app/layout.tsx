import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Creator Hub — Free AI Tools for Content Creators",
    template: "%s | Creator Hub",
  },
  description:
    "Free AI-powered tools for creators: background remover, image compressor, caption generator, hashtag generator, and video title generator.",
  metadataBase: new URL("https://creatorhub.io"),
};

const TOOLS = [
  { href: "/tools/background-remover", label: "Background Remover" },
  { href: "/tools/image-compressor", label: "Image Compressor" },
  { href: "/tools/caption-generator", label: "Caption Generator" },
  { href: "/tools/hashtag-generator", label: "Hashtag Generator" },
  { href: "/tools/title-generator", label: "Title Generator" },
];

const LEGAL = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-stone-900 antialiased">
        {/* Header */}
        <header className="border-b border-stone-100 sticky top-0 z-30 bg-white/90 backdrop-blur-md">
          <div className="max-w-6xl mx-auto px-5 py-3.5 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center text-white text-xs font-bold">CH</div>
              <span className="text-sm font-semibold">Creator Hub</span>
            </Link>
            <nav className="hidden md:flex items-center gap-5">
              {TOOLS.map((t) => (
                <Link key={t.href} href={t.href} className="text-xs text-stone-500 hover:text-stone-900 transition-colors">
                  {t.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <main>{children}</main>

        {/* Footer — required for AdSense to discover policy pages */}
        <footer className="border-t border-stone-100 mt-12">
          <div className="max-w-6xl mx-auto px-5 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-md bg-violet-600 flex items-center justify-center text-white text-[10px] font-bold">CH</div>
                <span className="text-sm font-semibold">Creator Hub</span>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed max-w-xs">
                Free AI tools for content creators. Built by TensorLab.
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-stone-700 mb-3 uppercase tracking-wider">Tools</p>
              <ul className="space-y-2">
                {TOOLS.map((t) => (
                  <li key={t.href}>
                    <Link href={t.href} className="text-xs text-stone-400 hover:text-stone-700 transition-colors">{t.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-stone-700 mb-3 uppercase tracking-wider">Company</p>
              <ul className="space-y-2">
                {LEGAL.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-xs text-stone-400 hover:text-stone-700 transition-colors">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-stone-100 py-4 text-center">
            <p className="text-[11px] text-stone-400">© {new Date().getFullYear()} Creator Hub · TensorLab. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
