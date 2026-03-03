import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth";
import { signDownload } from "@/lib/sign";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;

  const listing = await prisma.listing.findUnique({
    where: { id },
    select: { id: true, status: true, priceCents: true },
  });

  if (!listing || listing.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Free listing → PUBLIC token
  if (listing.priceCents === 0) {
    const token = await signDownload({ listingId: listing.id, userId: "PUBLIC" });
    return NextResponse.json({ token });
  }

  // Paid listing → require login + PAID purchase
  const sessToken = (await cookies()).get("session")?.value;
  if (!sessToken) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const session = await verifySessionToken(sessToken);

  const purchase = await prisma.purchase.findFirst({
    where: { listingId: listing.id, buyerId: session.userId, status: "PAID" },
    select: { id: true },
  });

  if (!purchase) return NextResponse.json({ error: "Purchase required" }, { status: 403 });

  const token = await signDownload({ listingId: listing.id, userId: session.userId });
  return NextResponse.json({ token });
}