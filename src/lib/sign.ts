import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.SESSION_SECRET!);

export async function signDownload(payload: {
  listingId: string;
  userId: string | "PUBLIC";
}) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2m")
    .sign(secret);
}

export async function verifyDownload(token: string) {
  const { payload } = await jwtVerify(token, secret);
  return payload as { listingId: string; userId: string | "PUBLIC" };
}