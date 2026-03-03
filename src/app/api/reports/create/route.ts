import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth";

const Schema = z.object({
  listingId: z.string().min(1),
  reason: z.string().min(2).max(100),
  details: z.string().max(2000).optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid report" }, { status: 400 });
  }

  // Optional reporter
  let reporterId: string | undefined = undefined;
  const token = (await cookies()).get("session")?.value;
  if (token) {
    try {
      const session = await verifySessionToken(token);
      reporterId = session.userId;
    } catch {
      // ignore
    }
  }

  const listing = await prisma.listing.findUnique({
    where: { id: parsed.data.listingId },
    select: { id: true, status: true },
  });

  if (!listing || listing.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.report.create({
    data: {
      listingId: parsed.data.listingId,
      reason: parsed.data.reason,
      details: parsed.data.details,
      reporterId,
    },
  });

  return NextResponse.json({ ok: true });
}