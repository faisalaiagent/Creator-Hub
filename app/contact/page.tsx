"use client";

import { useState } from "react";
import { Mail, Send, CheckCircle2, MessageCircle, Loader2, AlertCircle } from "lucide-react";

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
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setSent(true);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">

        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle size={14} className="text-violet-500" />
          <span className="text-xs font-medium text-violet-600 uppercase tracking-wider">
            Contact
          </span>
        </div>
        <h1 className="text-3xl font-bold text-stone-900 mb-3">Get in touch</h1>
        <p className="text-base text-stone-600 leading-relaxed mb-10">
          Questions, feedback, bug reports, or tool requests — we'd love to hear from you.
          We reply to every message within 24 hours.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* ── Form ── */}
          <div>
            {sent ? (
              /* Success state */
              <div className="flex items-start gap-3 p-5 rounded-2xl bg-emerald-50 border border-emerald-100">
                <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-emerald-800 mb-1">
                    Message sent successfully!
                  </p>
                  <p className="text-xs text-emerald-600 leading-relaxed">
                    Thanks {name} — we've received your message and will reply to{" "}
                    <strong>{email}</strong> within 24 hours.
                  </p>
                  <button
                    onClick={() => { setSent(false); setName(""); setEmail(""); setMessage(""); }}
                    className="mt-3 text-xs text-emerald-700 underline"
                  >
                    Send another message
                  </button>
                </div>
              </div>
            ) : (
              /* Form */
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1.5">
                    Your name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                    className="w-full text-sm border border-stone-200 rounded-xl px-3 py-2.5 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all disabled:opacity-50"
                    placeholder="Jane Creator"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1.5">
                    Your email <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="w-full text-sm border border-stone-200 rounded-xl px-3 py-2.5 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all disabled:opacity-50"
                    placeholder="jane@example.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1.5">
                    Message <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={loading}
                    className="w-full text-sm border border-stone-200 rounded-xl px-3 py-2.5 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all resize-none disabled:opacity-50"
                    placeholder="How can we help? Describe your question, bug, or tool request..."
                  />
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-50 border border-red-100">
                    <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
                    <p className="text-xs text-red-600">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-violet-600 text-white text-sm font-medium rounded-xl py-3 hover:bg-violet-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      Send message
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Direct email */}
            <div className="mt-5 flex items-center gap-2 text-sm text-stone-500">
              <Mail size={14} className="text-stone-400" />
              <span>Or email directly:</span>
              <a
                href="mailto:faisalagentai@gmail.com"
                className="text-violet-600 hover:underline font-medium"
              >
                faisalagentai@gmail.com
              </a>
            </div>
          </div>

          {/* ── FAQ ── */}
          <div>
            <h2 className="text-sm font-semibold text-stone-900 mb-4">
              Frequently asked questions
            </h2>
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
