import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, message } = body;

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

    const web3Res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        access_key: WEB3FORMS_KEY,
        subject: "[Creator Hub] New message from " + name.trim(),
        from_name: name.trim(),
        reply_to: email.trim(),
        message: "Name: " + name.trim() + "\nEmail: " + email.trim() + "\n\nMessage:\n" + message.trim(),
        botcheck: "",
      }),
    });

    const web3Data = await web3Res.json();
    console.log("[contact] Web3Forms response:", JSON.stringify(web3Data));

    if (!web3Res.ok || web3Data.success === false) {
      console.error("[contact] Web3Forms error:", JSON.stringify(web3Data));
      return NextResponse.json(
        { error: "Failed to send: " + (web3Data.message || "unknown error") },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[contact/route] error:", String(err));
    return NextResponse.json(
      { error: "Server error: " + String(err) },
      { status: 500 }
    );
  }
}
