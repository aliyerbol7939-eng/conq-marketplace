import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySessionToken } from "@/lib/auth";

export async function POST(req: Request) {
  const token = (await cookies()).get("session")?.value;
  if (!token) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const session = await verifySessionToken(token);

  await prisma.user.update({
    where: { id: session.userId },
    data: { isDeleted: true },
  });

  // clear session and go to signup
  const res = NextResponse.redirect(new URL("/signup", req.url), { status: 303 });
  res.cookies.set("session", "", { path: "/", maxAge: 0 });
  return res;
}