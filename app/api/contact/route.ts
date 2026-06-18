import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// Replace this with your actual Formspree endpoint
// Get it free at formspree.io → New Form → copy the endpoint URL
const FORMSPREE_ENDPOINT = process.env.FORMSPREE_ENDPOINT ?? "https://formspree.io/f/YOUR_FORM_ID";

export async function POST(req: NextRequest) {
  try {
    let body: { name?: string; email?: string; message?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const name    = (body.name    ?? "").trim();
    const email   = (body.email   ?? "").trim();
    const message = (body.message ?? "").trim();

    if (name.length < 2)      return NextResponse.json({ error: "Name is required."        }, { status: 400 });
    if (!email.includes("@")) return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
    if (message.length < 5)   return NextResponse.json({ error: "Message is too short."    }, { status: 400 });

    console.log("[contact] Submitting to Formspree...");

    const res = await fetch(FORMSPREE_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        message,
        _replyto: email,
        _subject: "[Creator Hub] New message from " + name,
      }),
    });

    const text = await res.text();
    console.log("[contact] Formspree status:", res.status, "response:", text.substring(0, 200));

    let data: { ok?: boolean; error?: string } = {};
    try {
      data = JSON.parse(text);
    } catch {
      console.error("[contact] Formspree non-JSON response:", text.substring(0, 300));
      return NextResponse.json(
        { error: "Email service error. Please email faisalagentai@gmail.com directly." },
        { status: 502 }
      );
    }

    if (!res.ok) {
      console.error("[contact] Formspree error:", data);
      return NextResponse.json(
        { error: "Delivery failed: " + (data.error ?? "unknown error") },
        { status: 502 }
      );
    }

    console.log("[contact] Email sent successfully via Formspree");
    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("[contact] Unhandled error:", String(err));
    return NextResponse.json(
      { error: "Server error. Please email faisalagentai@gmail.com" },
      { status: 500 }
    );
  }
}
