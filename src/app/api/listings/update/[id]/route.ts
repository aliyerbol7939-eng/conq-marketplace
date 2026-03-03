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

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const token = (await cookies()).get("session")?.value;
  if (!token) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const session = await verifySessionToken(token);
  const { id } = await ctx.params;

  const existing = await prisma.listing.findUnique({
    where: { id },
    select: { sellerId: true },
  });

  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.sellerId !== session.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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

  const thumbnail = form.get("thumbnail");
  const video = form.get("video");

  let thumbUrl: string | undefined = undefined;
  if (thumbnail instanceof File) {
    const saved = await saveUploadToDisk(thumbnail, "thumbs");
    thumbUrl = saved.urlPath;
  }

  let videoUrl: string | undefined = undefined;
  if (video instanceof File) {
    const saved = await saveUploadToDisk(video, "videos");
    videoUrl = saved.urlPath;
  }

  const priceCents = Math.round(parsed.data.price * 100);

  await prisma.listing.update({
    where: { id },
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      priceCents,
      ...(thumbUrl ? { thumbnailUrl: thumbUrl } : {}),
      ...(videoUrl ? { previewVideoUrl: videoUrl } : {}),
    },
  });

  return NextResponse.json({ ok: true });
}