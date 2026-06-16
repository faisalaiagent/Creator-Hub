import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, message } = body;

    // Basic validation
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
    }
    if (!message || typeof message !== "string" || message.trim().length < 5) {
      return NextResponse.json({ error: "Message is too short." }, { status: 400 });
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (!RESEND_API_KEY) {
      console.error("[contact] RESEND_API_KEY not set");
      return NextResponse.json(
        { error: "Email service not configured. Please try again later." },
        { status: 503 }
      );
    }

    // Send email via Resend REST API (no extra npm package needed)
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        // Resend free tier requires sending FROM your verified domain OR onboarding@resend.dev
        // Until you verify a custom domain, use: onboarding@resend.dev
        from: "Creator Hub Contact <onboarding@resend.dev>",
        to: ["faisalagentai@gmail.com"],
        reply_to: email.trim(),
        subject: `[Creator Hub] New message from ${name.trim()}`,
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px">
            <h2 style="margin:0 0 20px;font-size:18px;color:#111827">
              New contact form message
            </h2>

            <table style="width:100%;border-collapse:collapse;font-size:14px">
              <tr>
                <td style="padding:10px 0;color:#6b7280;width:100px;vertical-align:top">Name</td>
                <td style="padding:10px 0;color:#111827;font-weight:600">${name.trim()}</td>
              </tr>
              <tr style="border-top:1px solid #f3f4f6">
                <td style="padding:10px 0;color:#6b7280;vertical-align:top">Email</td>
                <td style="padding:10px 0">
                  <a href="mailto:${email.trim()}" style="color:#7c3aed">${email.trim()}</a>
                </td>
              </tr>
              <tr style="border-top:1px solid #f3f4f6">
                <td style="padding:10px 0;color:#6b7280;vertical-align:top">Message</td>
                <td style="padding:10px 0;color:#111827;white-space:pre-wrap">${message.trim()}</td>
              </tr>
            </table>

            <div style="margin-top:24px;padding:12px 16px;background:#f9fafb;border-radius:6px;font-size:12px;color:#6b7280">
              Sent from Creator Hub contact form · creatorhub-shah.vercel.app
            </div>
          </div>
        `,
      }),
    });

    if (!resendRes.ok) {
      const err = await resendRes.json();
      console.error("[contact] Resend error:", err);
      return NextResponse.json(
        { error: "Failed to send email. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[contact/route]", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
