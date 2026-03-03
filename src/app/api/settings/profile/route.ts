import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifySessionToken } from "@/lib/auth";

const Schema = z.object({
  displayName: z.string().min(1).max(40),
});

export async function POST(req: Request) {
  const token = (await cookies()).get("session")?.value;
  if (!token) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const session = await verifySessionToken(token);

  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid display name" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.userId },
    data: { displayName: parsed.data.displayName },
  });

  return NextResponse.json({ ok: true });
}