import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

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

    const key = process.env.WEB3FORMS_ACCESS_KEY;
    if (!key) {
      console.error("[contact] WEB3FORMS_ACCESS_KEY is not set");
      return NextResponse.json({ error: "Email service not configured." }, { status: 503 });
    }

    const payload = {
      access_key: key,
      subject:    "[Creator Hub] New message from " + name,
      from_name:  name,
      reply_to:   email,
      message:    "Name: " + name + "\nEmail: " + email + "\n\nMessage:\n" + message,
      botcheck:   "",
    };

    console.log("[contact] Submitting to Web3Forms...");

    const res  = await fetch("https://api.web3forms.com/submit", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload),
    });

    const text = await res.text();
    console.log("[contact] Web3Forms raw response:", text);

    let data: { success?: boolean; message?: string };
    try {
      data = JSON.parse(text);
    } catch {
      console.error("[contact] Web3Forms non-JSON response:", text);
      return NextResponse.json({ error: "Email service returned unexpected response." }, { status: 502 });
    }

    if (!res.ok || !data.success) {
      console.error("[contact] Web3Forms error:", data);
      return NextResponse.json(
        { error: "Delivery failed: " + (data.message ?? "unknown error") },
        { status: 502 }
      );
    }

    console.log("[contact] Email sent successfully");
    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("[contact] Unhandled error:", String(err));
    return NextResponse.json({ error: "Server error. Please email faisalagentai@gmail.com" }, { status: 500 });
  }
}