import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;

  const listing = await prisma.listing.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      priceCents: true,
      fileUrl: true, // like /uploads/files/xxxx.zip
      originalName: true,
    },
  });

  if (!listing || listing.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // If paid: require PAID purchase by this user
  if (listing.priceCents > 0) {
    const token = (await cookies()).get("session")?.value;
    if (!token) return NextResponse.json({ error: "Login required" }, { status: 401 });

    let userId: string;
    try {
      const session = await verifySessionToken(token);
      userId = session.userId;
    } catch {
      return NextResponse.json({ error: "Login required" }, { status: 401 });
    }

    const purchase = await prisma.purchase.findFirst({
      where: {
        listingId: listing.id,
        buyerId: userId,
        status: "PAID",
      },
      select: { id: true },
    });

    if (!purchase) {
      return NextResponse.json({ error: "Purchase required" }, { status: 403 });
    }
  }

  // Convert fileUrl -> actual disk path
  // fileUrl format: /uploads/files/<filename>
  const parts = listing.fileUrl.split("/").filter(Boolean); // ["uploads","files","name.ext"]
  const folder = parts[1]; // "files"
  const filename = parts[2];

  if (folder !== "files" || !filename || filename.includes("..")) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const fullPath = path.join(process.cwd(), "uploads", "files", filename);

  try {
    const data = await fs.readFile(fullPath);

    return new NextResponse(data, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(
          listing.originalName
        )}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}