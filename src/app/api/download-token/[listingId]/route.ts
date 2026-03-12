import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { verifySessionToken } from "@/lib/auth";

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ listingId: string }> }
) {
  const token = (await cookies()).get("session")?.value;
  if (!token) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const session = await verifySessionToken(token);
  const { listingId } = await ctx.params;

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: {
      id: true,
      priceCents: true,
      sellerId: true,
      status: true,
    },
  });

  if (!listing || listing.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  let allowed = false;

  if (listing.priceCents === 0) {
    allowed = true;
  } else if (listing.sellerId === session.userId) {
    allowed = true;
  } else {
    const purchase = await prisma.purchase.findFirst({
      where: {
        buyerId: session.userId,
        listingId,
        status: "PAID",
      },
      select: { id: true },
    });

    allowed = !!purchase;
  }

  if (!allowed) {
    return NextResponse.json({ error: "You do not own this file" }, { status: 403 });
  }

  const downloadToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 1000);

  await prisma.downloadToken.create({
    data: {
      token: downloadToken,
      expiresAt,
      userId: session.userId,
      listingId,
    },
  });

  return NextResponse.json({ ok: true, token: downloadToken });
}