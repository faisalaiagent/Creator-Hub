import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { uploadToCloudinary } from "@/lib/storage/cloudinary";
import { checkRateLimit, getClientIp } from "@/lib/utils/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const DAILY_LIMIT = 20;
type OutputFormat = "jpeg" | "png" | "webp" | "original";

function resolveFormat(requested: OutputFormat, originalMime: string): "jpeg" | "png" | "webp" {
  if (requested !== "original") return requested;
  if (originalMime === "image/png") return "png";
  if (originalMime === "image/webp") return "webp";
  return "jpeg";
}

function outputExt(fmt: "jpeg" | "png" | "webp"): string {
  return fmt === "jpeg" ? ".jpg" : fmt === "png" ? ".png" : ".webp";
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const { allowed, remaining } = checkRateLimit(ip, "image-compressor", DAILY_LIMIT);
    if (!allowed) {
      return NextResponse.json(
        { error: `Daily limit reached (${DAILY_LIMIT}/day). Try again tomorrow or upgrade to Pro.` },
        { status: 429 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("image") as File | null;
    const qualityParam = formData.get("quality");
    const formatParam = (formData.get("format") as OutputFormat) ?? "webp";

    if (!file) return NextResponse.json({ error: "No image provided" }, { status: 400 });
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Unsupported format. Use JPG, PNG, or WebP." }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large. Max 20 MB." }, { status: 400 });
    }

    const quality = Math.min(100, Math.max(1, parseInt(String(qualityParam ?? "80"), 10)));
    const targetFormat = resolveFormat(formatParam, file.type);

    const inputBuffer = Buffer.from(await file.arrayBuffer());
    let sharpInstance = sharp(inputBuffer);
    const meta = await sharpInstance.metadata();

    switch (targetFormat) {
      case "jpeg":
        sharpInstance = sharpInstance.jpeg({ quality, progressive: true, mozjpeg: true });
        break;
      case "png":
        sharpInstance = sharpInstance.png({ quality, compressionLevel: Math.round((100 - quality) / 11) });
        break;
      case "webp":
        sharpInstance = sharpInstance.webp({ quality, effort: 4, smartSubsample: true });
        break;
    }

    const compressedBuffer = await sharpInstance.toBuffer();
    const compressedSize = compressedBuffer.length;

    const finalBuffer = compressedSize < inputBuffer.length ? compressedBuffer : inputBuffer;
    const finalSize = compressedSize < inputBuffer.length ? compressedSize : file.size;
    const finalFormat = compressedSize < inputBuffer.length ? targetFormat : resolveFormat("original", file.type);

    const stem = file.name.replace(/\.[^.]+$/, "");
    const cloudinaryResult = await uploadToCloudinary(finalBuffer, {
      folder: "creator-hub/compressed",
      format: finalFormat,
      public_id: `${Date.now()}_${stem}_compressed`,
      resource_type: "image",
    });

    const filename = stem + "_compressed" + outputExt(finalFormat as "jpeg" | "png" | "webp");

    return NextResponse.json({
      success: true,
      url: cloudinaryResult.secure_url,
      filename,
      compressedSize: finalSize,
      originalSize: file.size,
      savingsPercent: Math.round(((file.size - finalSize) / file.size) * 100),
      format: finalFormat,
      width: cloudinaryResult.width ?? meta.width,
      height: cloudinaryResult.height ?? meta.height,
      remaining,
    });
  } catch (err: unknown) {
    console.error("[image-compressor/route]", err);
    if (err instanceof Error && err.message.includes("Input file is missing")) {
      return NextResponse.json({ error: "Corrupt or unreadable image." }, { status: 400 });
    }
    return NextResponse.json({ error: "Compression failed. Please try again." }, { status: 500 });
  }
}
