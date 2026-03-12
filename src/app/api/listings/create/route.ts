import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifySessionToken } from "@/lib/auth";
import { saveUploadToDisk } from "@/lib/upload";
import { moderateListingInput } from "@/lib/moderation";

const Schema = z.object({
  title: z.string().min(2).max(120),
  description: z.string().max(4000).optional().default(""),
  price: z.coerce.number().min(0).max(1000000),
});

export async function POST(req: Request) {
  const token = (await cookies()).get("session")?.value;
  if (!token) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const session = await verifySessionToken(token);
  const form = await req.formData();

  const rawTitle = form.get("title");
  const rawDescription = form.get("description");
  const rawPrice = form.get("price");

  const parsed = Schema.safeParse({
    title: typeof rawTitle === "string" ? rawTitle : "",
    description: typeof rawDescription === "string" ? rawDescription : "",
    price: rawPrice,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid fields" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const thumbnail = form.get("thumbnail");
  const video = form.get("video");

  const savedFile = await saveUploadToDisk(file, "files");

  let thumbUrl: string | null = null;
  let savedThumbAbsPath: string | null = null;
  let thumbOriginalName: string | null = null;

  if (thumbnail instanceof File && thumbnail.size > 0) {
    const savedThumb = await saveUploadToDisk(thumbnail, "thumbs");
    thumbUrl = savedThumb.urlPath;
    thumbOriginalName = thumbnail.name;
    savedThumbAbsPath = savedThumb.absPath;
  }

  let videoUrl: string | null = null;
  if (video instanceof File && video.size > 0) {
    const savedVid = await saveUploadToDisk(video, "videos");
    videoUrl = savedVid.urlPath;
  }

  const moderation = await moderateListingInput({
    title: parsed.data.title,
    description: parsed.data.description || "",
    originalFileName: file.name,
    filePath: savedFile.absPath,
    thumbPath: savedThumbAbsPath,
    thumbOriginalName,
  });

  let finalStatus: "PUBLISHED" | "REVIEW_PENDING" | "REJECTED";

  if (moderation.decision === "ALLOW") {
    finalStatus = "PUBLISHED";
  } else if (moderation.decision === "REVIEW") {
    finalStatus = "REVIEW_PENDING";
  } else {
    finalStatus = "REJECTED";
  }

  const priceCents = Math.round(parsed.data.price * 100);

  const listing = await prisma.listing.create({
    data: {
      status: finalStatus,
      title: parsed.data.title,
      description: parsed.data.description || "",
      priceCents,
      currency: "usd",
      thumbnailUrl: thumbUrl ?? undefined,
      previewVideoUrl: videoUrl ?? undefined,
      fileUrl: savedFile.urlPath,
      originalName: savedFile.originalName,
      fileSizeBytes: BigInt(savedFile.sizeBytes),
      sellerId: session.userId,
      moderationReasons: moderation.reasons.join(" | "),
      fileSha256: moderation.fileSha256,
      thumbSha256: moderation.thumbSha256,
      avStatus: moderation.avStatus,
    },
    select: { id: true, status: true },
  });

  return NextResponse.json({
    ok: true,
    listingId: listing.id,
    status: finalStatus,
    moderationReasons: moderation.reasons,
    message:
      finalStatus === "PUBLISHED"
        ? "Listing published"
        : finalStatus === "REVIEW_PENDING"
        ? "Listing sent to admin review"
        : "Listing rejected by safety system",
  });
}