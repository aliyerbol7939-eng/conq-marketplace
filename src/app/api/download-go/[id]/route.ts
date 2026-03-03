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
    return NextResponse.redirect(new URL("/library", req.url), { status: 303 });
  }

  // paid listings need user + purchase
  const sessToken = (await cookies()).get("session")?.value;
  if (!sessToken) {
    return NextResponse.redirect(new URL("/login", req.url), { status: 303 });
  }

  const session = await verifySessionToken(sessToken);

  if (listing.priceCents > 0) {
    const purchase = await prisma.purchase.findFirst({
      where: { listingId: listing.id, buyerId: session.userId, status: "PAID" },
      select: { id: true },
    });

    if (!purchase) {
      return NextResponse.redirect(new URL("/library", req.url), { status: 303 });
    }
  }

  const token = await signDownload({ listingId: listing.id, userId: session.userId });
  return NextResponse.redirect(new URL(`/api/dl?t=${encodeURIComponent(token)}`, req.url), {
    status: 303,
  });
}