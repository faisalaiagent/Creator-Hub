import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/utils/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 30;

const REMOVE_BG_API = "https://api.remove.bg/v1.0/removebg";
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const DAILY_LIMIT = 10;

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const { allowed, remaining } = checkRateLimit(ip, "background-remover", DAILY_LIMIT);
    if (!allowed) {
      return NextResponse.json(
        { error: `Daily limit reached (${DAILY_LIMIT}/day). Try again tomorrow.` },
        { status: 429 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("image") as File | null;
    if (!file) return NextResponse.json({ error: "No image provided" }, { status: 400 });

    if (!ACCEPTED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Use JPG, PNG, or WebP." }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large. Max 10MB per image." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Call remove.bg
    const removeBgForm = new FormData();
    removeBgForm.append("image_file", new Blob([buffer], { type: file.type }), file.name);
    removeBgForm.append("size", "auto");
    removeBgForm.append("format", "png");

    const removeBgRes = await fetch(REMOVE_BG_API, {
      method: "POST",
      headers: { "X-Api-Key": process.env.REMOVE_BG_API_KEY! },
      body: removeBgForm,
    });

    if (!removeBgRes.ok) {
      const errText = await removeBgRes.text();
      console.error("[remove.bg error]", removeBgRes.status, errText);
      if (removeBgRes.status === 402) {
        return NextResponse.json({ error: "AI processing quota exceeded. Please try again later." }, { status: 503 });
      }
      return NextResponse.json({ error: "Background removal failed. Please try another image." }, { status: 502 });
    }

    // Get the transparent PNG buffer from remove.bg
    const resultBuffer = Buffer.from(await removeBgRes.arrayBuffer());

    // Return as base64 data URL — this skips Cloudinary entirely.
    // Cloudinary was converting the transparent PNG and filling
    // transparent areas with black. Base64 preserves transparency 100%.
    const base64 = resultBuffer.toString("base64");
    const dataUrl = `data:image/png;base64,${base64}`;

    return NextResponse.json({
      success: true,
      resultUrl: dataUrl,
      resultSize: resultBuffer.length,
      remaining,
    });
  } catch (err: unknown) {
    console.error("[bg-remover/route]", err);
    return NextResponse.json({ error: "Internal server error. Please try again." }, { status: 500 });
  }
}
