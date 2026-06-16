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
      console.error("[contact] RESEND_API_KEY env var is not set");
      return NextResponse.json(
        { error: "Email service not configured. Please email us directly at faisalagentai@gmail.com" },
        { status: 503 }
      );
    }

    // Resend free tier restriction:
    // "from" must be onboarding@resend.dev OR a verified domain email
    // "to" on free tier: can only send to the account owner's email
    // Make sure faisalagentai@gmail.com is the email you signed up to Resend with
    const payload = {
      from: "onboarding@resend.dev",
      to: "faisalagentai@gmail.com",
      reply_to: email.trim(),
      subject: `[Creator Hub] New message from ${name.trim()}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px">
          <h2 style="margin:0 0 20px;font-size:18px;color:#111827">
            📬 New contact form message — Creator Hub
          </h2>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr>
              <td style="padding:10px 0;color:#6b7280;width:80px;vertical-align:top;font-weight:600">Name</td>
              <td style="padding:10px 0;color:#111827">${name.trim()}</td>
            </tr>
            <tr style="border-top:1px solid #f3f4f6">
              <td style="padding:10px 0;color:#6b7280;vertical-align:top;font-weight:600">Email</td>
              <td style="padding:10px 0">
                <a href="mailto:${email.trim()}" style="color:#7c3aed">${email.trim()}</a>
              </td>
            </tr>
            <tr style="border-top:1px solid #f3f4f6">
              <td style="padding:10px 0;color:#6b7280;vertical-align:top;font-weight:600">Message</td>
              <td style="padding:10px 0;color:#111827;white-space:pre-wrap">${message.trim()}</td>
            </tr>
          </table>
          <div style="margin-top:24px;padding:12px 16px;background:#f9fafb;border-radius:6px;font-size:12px;color:#9ca3af">
            Sent from Creator Hub · creatorhub-shah.vercel.app
          </div>
        </div>
      `,
    };

    console.log("[contact] Sending via Resend to faisalagentai@gmail.com");

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const resendData = await resendRes.json();

    if (!resendRes.ok) {
      // Log the full Resend error for debugging in Vercel logs
      console.error("[contact] Resend API error:", {
        status: resendRes.status,
        statusText: resendRes.statusText,
        body: resendData,
      });

      // Return specific helpful error based on Resend error codes
      const resendError = resendData?.message ?? resendData?.name ?? "Unknown error";

      if (resendRes.status === 401) {
        return NextResponse.json(
          { error: "Email service authentication failed. Please contact us directly at faisalagentai@gmail.com" },
          { status: 502 }
        );
      }

      if (resendRes.status === 422) {
        // Most common: sending to unverified email on free tier
        return NextResponse.json(
          { error: "Email delivery failed. Please contact us directly at faisalagentai@gmail.com" },
          { status: 502 }
        );
      }

      console.error("[contact] Resend error detail:", resendError);
      return NextResponse.json(
        { error: "Failed to send email. Please contact us directly at faisalagentai@gmail.com" },
        { status: 502 }
      );
    }

    console.log("[contact] Email sent successfully, id:", resendData?.id);
    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("[contact/route] Unexpected error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please email us directly at faisalagentai@gmail.com" },
      { status: 500 }
    );
  }
}