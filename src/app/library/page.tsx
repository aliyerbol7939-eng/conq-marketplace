import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifySessionToken } from "@/lib/auth";

export default async function LibraryPage() {
  const token = (await cookies()).get("session")?.value;
  if (!token) return notFound();

  const session = await verifySessionToken(token);

  const purchases = await prisma.purchase.findMany({
    where: { buyerId: session.userId, status: "PAID" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      listing: {
        select: {
          id: true,
          title: true,
          thumbnailUrl: true,
          priceCents: true,
          seller: { select: { displayName: true } },
        },
      },
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
                alignItems: "flex-end",
                flexWrap: "wrap",
              }}
            >
              <div>
                <div className="conq-badge">Library</div>
                <h1 className="conq-heading-lg mt-5">Your purchased files</h1>
                <p className="conq-text-muted mt-4" style={{ fontSize: 18 }}>
                  Access and re-download everything you bought on Conq.
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
                <Link href="/dashboard" className="conq-btn conq-btn-primary">
                  Dashboard
                </Link>
              </div>
            </div>
          </div>

          {purchases.length === 0 ? (
            <div className="glow-card p-7" style={{ marginTop: 24 }}>
              <div className="conq-badge">Empty</div>
              <h2 style={{ fontSize: 30, fontWeight: 800, marginTop: 18 }}>
                No purchases yet
              </h2>
              <p className="conq-text-muted mt-3">
                Buy a file from the marketplace and it will appear here.
              </p>
              <div className="mt-6">
                <Link href="/market" className="conq-btn conq-btn-primary">
                  Explore marketplace
                </Link>
              </div>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: 20,
                marginTop: 24,
              }}
            >
              {purchases.map((p) => (
                <div key={p.id} className="glow-card p-4">
                  <div
                    style={{
                      width: "100%",
                      aspectRatio: "16 / 9",
                      borderRadius: 18,
                      overflow: "hidden",
                      background: "#0b1412",
                      border: "1px solid rgba(127,255,212,0.08)",
                    }}
                  >
                    {p.listing.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.listing.thumbnailUrl}
                        alt={p.listing.title}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    ) : (
                      <div
                        className="conq-text-muted"
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        No thumbnail
                      </div>
                    )}
                  </div>

                  <div style={{ marginTop: 16 }}>
                    <div
                      style={{
                        fontWeight: 800,
                        fontSize: 22,
                        lineHeight: 1.3,
                      }}
                    >
                      {p.listing.title}
                    </div>

                    <div className="conq-text-muted" style={{ marginTop: 10 }}>
                      {p.listing.priceCents === 0
                        ? "Free"
                        : `$${(p.listing.priceCents / 100).toFixed(2)}`}
                      {p.listing.seller?.displayName
                        ? ` • ${p.listing.seller.displayName}`
                        : ""}
                    </div>

                    <div
                      className="conq-text-muted"
                      style={{ marginTop: 8, fontSize: 13 }}
                    >
                      Bought: {new Date(p.createdAt).toLocaleString()}
                    </div>

                    <form
                      action={`/api/download-go/${p.listing.id}`}
                      method="post"
                      style={{ marginTop: 16 }}
                    >
                      <button className="conq-btn conq-btn-primary">
                        Download again
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}