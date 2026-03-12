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
      // ignore invalid token
    }
  }

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backdropFilter: "blur(16px)",
        background: "rgba(5, 13, 11, 0.72)",
        borderBottom: "1px solid rgba(127,255,212,0.08)",
      }}
    >
      <div className="container-conq">
        <div
          style={{
            minHeight: 76,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 20,
          }}
        >
          <Link
            href={isAuthed ? "/dashboard" : "/"}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              fontWeight: 800,
              fontSize: 30,
              letterSpacing: "-0.04em",
            }}
          >
            <span
              style={{
                width: 14,
                height: 14,
                borderRadius: 9999,
                background:
                  "linear-gradient(135deg, var(--brand), var(--accent))",
                boxShadow: "0 0 24px rgba(127,255,212,0.45)",
              }}
            />
            <span>Conq</span>
          </Link>

          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            {isAuthed ? (
              <>
                <Link href="/dashboard" className="conq-btn conq-btn-dark">
                  Dashboard
                </Link>

                <Link href="/market" className="conq-btn conq-btn-dark">
                  Market
                </Link>

                <Link href="/sell" className="conq-btn conq-btn-dark">
                  Sell
                </Link>

                <Link href="/library" className="conq-btn conq-btn-dark">
                  Library
                </Link>

                {role === "ADMIN" && (
                  <Link href="/admin" className="conq-btn conq-btn-dark">
                    Admin
                  </Link>
                )}

                <Link href="/settings" className="conq-btn conq-btn-primary">
                  Settings
                </Link>
              </>
            ) : (
              <>
                <Link href="/market" className="conq-btn conq-btn-dark">
                  Marketplace
                </Link>

                <Link href="/login" className="conq-btn conq-btn-dark">
                  Login
                </Link>

                <Link href="/signup" className="conq-btn conq-btn-primary">
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}