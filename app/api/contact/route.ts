import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// Simple in-memory rate limit for contact form (max 5 per IP per hour)
const contactBuckets = new Map<string, { count: number; resetAt: number }>();

function checkContactRateLimit(ip: string): boolean {
  const now = Date.now();
  const key = `contact:${ip}`;
  const existing = contactBuckets.get(key);

  if (!existing || existing.resetAt < now) {
    contactBuckets.set(key, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return true;
  }
  if (existing.count >= 5) return false;
  existing.count += 1;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    // Rate limit
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      req.headers.get("x-real-ip") ??
      "unknown";

    if (!checkContactRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many submissions. Please try again later." },
        { status: 429 }
      );
    }

    // Parse body
    const body = await req.json();
    const { name, email, message } = body;

    // Validate
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
    }
    if (!message || typeof message !== "string" || message.trim().length < 5) {
      return NextResponse.json({ error: "Message is too short." }, { status: 400 });
    }

    const WEB3FORMS_KEY = process.env.WEB3FORMS_ACCESS_KEY;

    if (!WEB3FORMS_KEY) {
      console.error("[contact] WEB3FORMS_ACCESS_KEY env var is not set");
      return NextResponse.json(
        { error: "Email service not configured." },
        { status: 503 }
      );
    }

    // Send via Web3Forms — completely free, no domain verification needed
    // Delivers directly to any Gmail/email associated with the access key
    const web3Res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        access_key: WEB3FORMS_KEY,
        subject: `[Creator Hub] New message from ${name.trim()}`,
        from_name: name.trim(),
        // Sender's email goes in reply_to so you can reply directly
        reply_to: email.trim(),
        // Message body
        message: `
Name: ${name.trim()}
Email: ${email.trim()}

Message:
${message.trim()}

---
Sent from Creator Hub contact form
https://creatorhub-shah.vercel.app/contact
        `.trim(),
        // Honeypot spam protection
        botcheck: "",
      }),
    });

    const web3Data = await web3Res.json();
    console.log("[contact] Web3Forms response:", web3Data);

    if (!web3Res.ok || web3Data.success === false) {
      console.error("[contact] Web3Forms error:", web3Data);
      return NextResponse.json(
        { error: "Failed to send message. Please email us at faisalagentai@gmail.com" },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[contact/route] Unexpected error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please email us at faisalagentai@gmail.com" },
      { status: 500 }
    );
  }
}