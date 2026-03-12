import Link from "next/link";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySessionToken } from "@/lib/auth";

export default async function DashboardPage() {
  const token = (await cookies()).get("session")?.value;

  if (!token) {
    return (
      <div className="page-shell grid-bg">
        <section className="conq-section">
          <div className="container-conq">
            <div className="glow-card p-8 md:p-10">
              <h1 className="conq-heading-lg">Not logged in</h1>
              <p className="conq-text-muted mt-4">
                Please log in to access your dashboard.
              </p>
              <div className="mt-6">
                <Link href="/login" className="conq-btn conq-btn-primary">
                  Go to login
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const session = await verifySessionToken(token);

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { email: true, displayName: true, role: true },
  });

  const listingsCount = await prisma.listing.count({
    where: { sellerId: session.userId },
  });

  const purchasesCount = await prisma.purchase.count({
    where: { buyerId: session.userId },
  });

  const salesStats = await prisma.purchase.aggregate({
    where: {
      listing: { sellerId: session.userId },
      status: "PAID",
    },
    _sum: {
      amountCents: true,
      sellerNetCents: true,
      platformFeeCents: true,
    },
    _count: true,
  });

  const listings = await prisma.listing.findMany({
    where: { sellerId: session.userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      priceCents: true,
      thumbnailUrl: true,
      status: true,
      createdAt: true,
    },
  });

  return (
    <div className="page-shell grid-bg">
      <section className="conq-section">
        <div className="container-conq">
          <div className="glow-card p-8 md:p-10">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 20,
                alignItems: "flex-start",
                flexWrap: "wrap",
              }}
            >
              <div>
                <div className="conq-badge">Dashboard</div>
                <h1 className="conq-heading-lg mt-5">
                  Welcome{user?.displayName ? `, ${user.displayName}` : ""} 👋
                </h1>
                <p className="conq-text-muted mt-4" style={{ fontSize: 18 }}>
                  {user?.email}
                </p>
                <p className="conq-text-muted mt-2">
                  Role: <span style={{ color: "var(--foreground)", fontWeight: 700 }}>{user?.role}</span>
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <Link href="/market" className="conq-btn conq-btn-dark">
                  Marketplace
                </Link>
                <Link href="/library" className="conq-btn conq-btn-dark">
                  Library
                </Link>
                <Link href="/settings" className="conq-btn conq-btn-primary">
                  Settings
                </Link>
              </div>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 16,
              marginTop: 24,
            }}
          >
            <div className="glow-card p-6">
              <div className="conq-text-muted">Your listings</div>
              <div style={{ fontSize: 44, fontWeight: 800, marginTop: 12 }}>
                {listingsCount}
              </div>
            </div>

            <div className="glow-card p-6">
              <div className="conq-text-muted">Your purchases</div>
              <div style={{ fontSize: 44, fontWeight: 800, marginTop: 12 }}>
                {purchasesCount}
              </div>
            </div>

            <div className="glow-card p-6">
              <div className="conq-text-muted">Sales</div>
              <div style={{ fontSize: 44, fontWeight: 800, marginTop: 12 }}>
                {salesStats._count || 0}
              </div>
            </div>

            <div className="glow-card p-6">
              <div className="conq-text-muted">Earned (90%)</div>
              <div style={{ fontSize: 44, fontWeight: 800, marginTop: 12 }}>
                ${((salesStats._sum.sellerNetCents || 0) / 100).toFixed(2)}
              </div>
            </div>
          </div>

          <div className="glow-card p-5" style={{ marginTop: 16 }}>
            <span className="conq-text-muted">Platform fee earned from your sales: </span>
            <span style={{ fontWeight: 700 }}>
              ${((salesStats._sum.platformFeeCents || 0) / 100).toFixed(2)}
            </span>
          </div>

          {user?.role === "ADMIN" && (
            <div className="glow-card p-7" style={{ marginTop: 20 }}>
              <div className="conq-badge">Admin access</div>
              <h2 style={{ fontSize: 32, fontWeight: 800, marginTop: 18 }}>
                Control center
              </h2>
              <p className="conq-text-muted mt-3">
                Review users, listings, reports, and moderation activity.
              </p>
              <div className="mt-6">
                <Link href="/admin" className="conq-btn conq-btn-primary">
                  Go to admin
                </Link>
              </div>
            </div>
          )}

          <div className="glow-card p-7" style={{ marginTop: 20 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 16,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <div>
                <div className="conq-badge">Your listings</div>
                <h2 style={{ fontSize: 32, fontWeight: 800, marginTop: 16 }}>
                  Manage your products
                </h2>
              </div>

              <Link href="/sell" className="conq-btn conq-btn-primary">
                + New listing
              </Link>
            </div>

            {listings.length === 0 ? (
              <div className="conq-text-muted" style={{ marginTop: 24 }}>
                No listings yet.
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
                  gap: 18,
                  marginTop: 24,
                }}
              >
                {listings.map((l) => (
                  <div
                    key={l.id}
                    className="glow-card p-4"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 16,
                      alignItems: "flex-start",
                    }}
                  >
                    <div style={{ display: "flex", gap: 16, flex: 1 }}>
                      <div
                        style={{
                          width: 96,
                          height: 96,
                          borderRadius: 18,
                          overflow: "hidden",
                          flexShrink: 0,
                          background: "#0b1412",
                          border: "1px solid rgba(127,255,212,0.08)",
                        }}
                      >
                        {l.thumbnailUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={l.thumbnailUrl}
                            alt={l.title}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              display: "block",
                            }}
                          />
                        ) : null}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 24, fontWeight: 800 }}>{l.title}</div>
                        <div className="conq-text-muted" style={{ marginTop: 8 }}>
                          {l.priceCents === 0
                            ? "Free"
                            : `$${(l.priceCents / 100).toFixed(2)}`}
                          {" • "}
                          <span style={{ color: "var(--foreground)" }}>{l.status}</span>
                        </div>
                        <div className="conq-text-muted" style={{ marginTop: 8, fontSize: 13 }}>
                          {new Date(l.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                        alignItems: "flex-end",
                      }}
                    >
                      <Link
                        href={`/sell/${l.id}/edit`}
                        className="conq-btn conq-btn-dark"
                        style={{ padding: "10px 14px" }}
                      >
                        Edit
                      </Link>

                      <form action={`/api/listings/delete/${l.id}`} method="post">
                        <button
                          className="conq-btn"
                          style={{
                            padding: "10px 14px",
                            background: "rgba(255,92,122,0.12)",
                            color: "#ff7a93",
                            border: "1px solid rgba(255,92,122,0.2)",
                          }}
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}