import { NextRequest, NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/storage/cloudinary";
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
        { error: `Daily limit reached (${DAILY_LIMIT}/day). Try again tomorrow or upgrade to Pro.` },
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

    const resultBuffer = Buffer.from(await removeBgRes.arrayBuffer());
    const cloudinaryResult = await uploadToCloudinary(resultBuffer, {
      folder: "creator-hub/bg-removed",
      format: "png",
      resource_type: "image",
      public_id: `${Date.now()}_${file.name.replace(/\.[^.]+$/, "")}`,
    });

    return NextResponse.json({
      success: true,
      resultUrl: cloudinaryResult.secure_url,
      resultSize: resultBuffer.length,
      width: cloudinaryResult.width,
      height: cloudinaryResult.height,
      remaining,
    });
  } catch (err: unknown) {
    console.error("[bg-remover/route]", err);
    return NextResponse.json({ error: "Internal server error. Please try again." }, { status: 500 });
  }
}
