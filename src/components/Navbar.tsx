import Link from "next/link";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth";

export default async function Navbar() {
  const token = (await cookies()).get("session")?.value;

  let isAuthed = false;
  let role: "USER" | "ADMIN" | null = null;

  if (token) {
    try {
      const s = await verifySessionToken(token);
      isAuthed = true;
      role = s.role;
    } catch {
      // ignore
    }
  }

  return (
    <header className="bg-white border-b">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href={isAuthed ? "/dashboard" : "/market"} className="font-bold text-xl">
          Conq
        </Link>

        <nav className="flex items-center gap-3">
          {isAuthed ? (
            <>
              <Link className="text-sm hover:underline" href="/dashboard">
                Dashboard
              </Link>
              <Link className="text-sm hover:underline" href="/sell">
                Sell
              </Link>
              {role === "ADMIN" && (
                <Link className="text-sm hover:underline" href="/admin">
                  Admin
                </Link>
              )}
              <Link
                className="text-sm px-3 py-1.5 rounded-xl border bg-white hover:bg-gray-50"
                href="/settings"
              >
                Settings
              </Link>
            </>
          ) : (
            <>
              <Link className="text-sm hover:underline" href="/market">
                Marketplace
              </Link>
              <Link className="text-sm hover:underline" href="/login">
                Login
              </Link>
              <Link
                className="text-sm px-3 py-1.5 rounded-xl bg-black text-white"
                href="/signup"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}