import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySessionToken } from "@/lib/auth";

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const token = (await cookies()).get("session")?.value;
  if (!token) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const session = await verifySessionToken(token);
  const { id } = await ctx.params;

  const listing = await prisma.listing.findUnique({
    where: { id },
    select: { sellerId: true },
  });

  if (!listing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (listing.sellerId !== session.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.listing.update({
    where: { id },
    data: { status: "ARCHIVED" }, // soft delete
  });

  return NextResponse.redirect(new URL("/dashboard", _req.url), { status: 303 });
}