import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyDownload } from "@/lib/sign";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("t");
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

  let decoded: { listingId: string; userId: string | "PUBLIC" };
  try {
    decoded = await verifyDownload(token);
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 403 });
  }

  const listing = await prisma.listing.findUnique({
    where: { id: decoded.listingId },
    select: {
      id: true,
      status: true,
      priceCents: true,
      fileUrl: true,
      originalName: true,
    },
  });

  if (!listing || listing.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // If paid, token must be tied to a real user (not PUBLIC)
  if (listing.priceCents > 0 && decoded.userId === "PUBLIC") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // fileUrl format: /uploads/files/<filename>
  const parts = listing.fileUrl.split("/").filter(Boolean);
  const folder = parts[1];
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