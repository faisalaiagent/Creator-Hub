"use client";

import { useState } from "react";
import type { Metadata } from "next";
import { Mail, Send, CheckCircle2, MessageCircle } from "lucide-react";

const FAQS = [
  {
    q: "Are these tools really free?",
    a: "Yes. All 5 tools are free to use with a daily usage limit per IP address (to prevent abuse). No signup or credit card required.",
  },
  {
    q: "Do you store my uploaded images?",
    a: "Images are temporarily stored on Cloudinary to deliver your result. We don't use your content for any other purpose. See our Privacy Policy for details.",
  },
  {
    q: "Why did I hit a daily limit?",
    a: "Each tool allows a limited number of free generations per IP per day to keep the service free and fast for everyone. The limit resets every 24 hours.",
  },
  {
    q: "Can I request a new tool?",
    a: "Absolutely — use the form below or email us directly. We read every message.",
  },
];

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // No backend wired up yet — opens the user's email client as a fallback.
    const subject = encodeURIComponent(`Creator Hub contact — ${name || "Website visitor"}`);
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
    window.location.href = `mailto:faisalagentai@gmail.com?subject=${subject}&body=${body}`;
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle size={14} className="text-violet-500" />
          <span className="text-xs font-medium text-violet-600 uppercase tracking-wider">Contact</span>
        </div>

        <h1 className="text-3xl font-bold text-stone-900 mb-3">Get in touch</h1>
        <p className="text-base text-stone-600 leading-relaxed mb-10">
          Questions, feedback, bug reports, or tool requests — we'd love to hear from you.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Form */}
          <div>
            {sent ? (
              <div className="flex items-start gap-3 p-5 rounded-2xl bg-emerald-50 border border-emerald-100">
                <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-emerald-800">Opening your email client...</p>
                  <p className="text-xs text-emerald-600 mt-1">
                    If nothing happened, email us directly at{" "}
                    <a href="mailto:faisalagentai@gmail.com" className="underline">faisalagentai@gmail.com</a>
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1.5">Your name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-sm border border-stone-200 rounded-xl px-3 py-2.5 outline-none focus:border-violet-300"
                    placeholder="Jane Creator"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1.5">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-sm border border-stone-200 rounded-xl px-3 py-2.5 outline-none focus:border-violet-300"
                    placeholder="jane@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1.5">Message</label>
                  <textarea
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full text-sm border border-stone-200 rounded-xl px-3 py-2.5 outline-none focus:border-violet-300 resize-none"
                    placeholder="How can we help?"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-violet-600 text-white text-sm font-medium rounded-xl py-3 hover:bg-violet-700 transition-colors"
                >
                  <Send size={14} />
                  Send message
                </button>
              </form>
            )}

            <div className="mt-6 flex items-center gap-2 text-sm text-stone-500">
              <Mail size={14} />
              <a href="mailto:faisalagentai@gmail.com" className="underline">faisalagentai@gmail.com</a>
            </div>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="text-sm font-semibold text-stone-900 mb-4">Frequently asked questions</h2>
            <div className="space-y-3">
              {FAQS.map((faq) => (
                <div key={faq.q} className="border border-stone-100 rounded-xl p-4">
                  <p className="text-sm font-medium text-stone-900 mb-1.5">{faq.q}</p>
                  <p className="text-xs text-stone-500 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
