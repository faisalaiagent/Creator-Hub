import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Creator Hub",
  description: "Privacy Policy for Creator Hub — how we collect, use, and protect your data.",
  robots: { index: true, follow: true },
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "January 1, 2025"; // ← Update this date when you edit the policy

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-stone-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-stone-400 mb-10">Last updated: {lastUpdated}</p>

        <div className="prose prose-stone max-w-none space-y-6 text-sm leading-relaxed text-stone-600">
          <section>
            <h2 className="text-lg font-semibold text-stone-900 mb-2">1. Introduction</h2>
            <p>
              Creator Hub ("we", "us", "our") operates the website creatorhub.io (the "Service").
              This page informs you of our policies regarding the collection, use, and disclosure
              of personal data when you use our Service and the choices you have associated with
              that data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900 mb-2">2. Information We Collect</h2>
            <p>We collect the following types of information:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>
                <strong>Content you submit:</strong> Text inputs (topics, niches, keywords) and
                images you upload to use our AI tools (background remover, image compressor,
                caption generator, hashtag generator, video title generator).
              </li>
              <li>
                <strong>Usage data:</strong> IP address (used solely for rate-limiting to prevent
                abuse), browser type, pages visited, and timestamps.
              </li>
              <li>
                <strong>Cookies:</strong> We use cookies for essential site functionality and,
                where applicable, for advertising purposes via Google AdSense (see Section 6).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900 mb-2">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>To provide, operate, and maintain our Service</li>
              <li>To process your requests through third-party AI providers (Groq, remove.bg)</li>
              <li>To prevent abuse and enforce fair usage limits (IP-based rate limiting)</li>
              <li>To improve and personalize our Service</li>
              <li>To display relevant advertising through Google AdSense</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900 mb-2">4. Third-Party Services</h2>
            <p>We use the following third-party services to operate Creator Hub:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li><strong>Groq</strong> — AI text generation (captions, hashtags, titles). Submitted text is sent to Groq's API for processing.</li>
              <li><strong>remove.bg</strong> — AI background removal. Uploaded images are sent to remove.bg's API for processing.</li>
              <li><strong>Cloudinary</strong> — Image storage and delivery for processed images.</li>
              <li><strong>Google AdSense</strong> — Displays advertisements. Google may use cookies to serve ads based on your prior visits to this and other websites.</li>
              <li><strong>Vercel</strong> — Website hosting and analytics.</li>
            </ul>
            <p className="mt-2">
              Each of these providers has their own privacy policy governing how they handle data.
              We encourage you to review their policies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900 mb-2">5. Image and Text Uploads</h2>
            <p>
              Images uploaded for background removal or compression are processed and stored
              temporarily on Cloudinary for the purpose of delivering your result. We do not use
              your uploaded content for any purpose other than fulfilling your request. Text
              inputs for AI generation tools are sent to Groq for processing and are not stored
              by us after the response is returned.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900 mb-2">6. Google AdSense & Cookies</h2>
            <p>
              This site uses Google AdSense, a third-party advertising service. Google uses
              cookies (including the DoubleClick DART cookie) to serve ads based on your visits
              to this site and other sites on the Internet. You may opt out of personalized
              advertising by visiting{" "}
              <a href="https://www.google.com/settings/ads" className="text-violet-600 underline" target="_blank" rel="noopener noreferrer">
                Google's Ads Settings
              </a>{" "}
              or{" "}
              <a href="https://www.aboutads.info/choices/" className="text-violet-600 underline" target="_blank" rel="noopener noreferrer">
                aboutads.info
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900 mb-2">7. Data Retention</h2>
            <p>
              Uploaded images are retained on our storage provider (Cloudinary) for a limited
              period to allow you to download your results. We do not maintain user accounts or
              long-term personal data storage in the current version of this Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900 mb-2">8. Children's Privacy</h2>
            <p>
              Our Service is not directed to anyone under the age of 13. We do not knowingly
              collect personally identifiable information from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900 mb-2">9. Changes to This Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any
              changes by posting the new Privacy Policy on this page and updating the "Last
              updated" date above.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900 mb-2">10. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us at{" "}
              <a href="mailto:faisalagentai@gmail.com" className="text-violet-600 underline">
                faisalagentai@gmail.com
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
