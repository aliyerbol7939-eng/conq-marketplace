import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifySessionToken } from "@/lib/auth";
import { saveUploadToDisk } from "@/lib/upload";

const Schema = z.object({
  title: z.string().min(2).max(120),
  description: z.string().max(4000).optional(),
  price: z.coerce.number().min(0).max(1000000),
});

export async function POST(req: Request) {
  const token = (await cookies()).get("session")?.value;
  if (!token) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const session = await verifySessionToken(token);

  const form = await req.formData();

  const title = form.get("title");
  const description = form.get("description");
  const price = form.get("price");

  const parsed = Schema.safeParse({
    title,
    description: typeof description === "string" ? description : undefined,
    price,
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

  // Save main file
  const savedFile = await saveUploadToDisk(file, "files");

  // Save thumb (optional)
  let thumbUrl: string | null = null;
  if (thumbnail instanceof File) {
    const savedThumb = await saveUploadToDisk(thumbnail, "thumbs");
    thumbUrl = savedThumb.urlPath;
  }

  // Save video (optional)
  let videoUrl: string | null = null;
  if (video instanceof File) {
    const savedVid = await saveUploadToDisk(video, "videos");
    videoUrl = savedVid.urlPath;
  }

  const priceCents = Math.round(parsed.data.price * 100);

  const listing = await prisma.listing.create({
    data: {
      status: "PUBLISHED",
      title: parsed.data.title,
      description: parsed.data.description,
      priceCents,
      currency: "usd",
      thumbnailUrl: thumbUrl ?? undefined,
      previewVideoUrl: videoUrl ?? undefined,
      fileUrl: savedFile.urlPath,
      originalName: savedFile.originalName,
      fileSizeBytes: BigInt(savedFile.sizeBytes),
      sellerId: session.userId,
    },
    select: { id: true },
  });

  return NextResponse.json({ ok: true, listingId: listing.id });
}