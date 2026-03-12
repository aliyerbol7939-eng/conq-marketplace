import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function SellerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const seller = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      displayName: true,
      email: true,
      isDeleted: true,
      listings: {
        where: { status: "PUBLISHED" },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          priceCents: true,
          thumbnailUrl: true,
          createdAt: true,
        },
      },
    },
  });

  if (!seller || seller.isDeleted) return notFound();

  const name = seller.displayName || seller.email.split("@")[0];

  return (
    <div className="page-shell grid-bg">
      <section className="conq-section">
        <div className="container-conq">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
              marginBottom: 24,
            }}
          >
            <Link href="/market" className="conq-btn conq-btn-dark">
              ← Marketplace
            </Link>

            <Link href="/dashboard" className="conq-btn conq-btn-primary">
              Dashboard
            </Link>
          </div>

          <div className="glow-card p-8 md:p-10">
            <div className="conq-badge">Creator profile</div>
            <h1 className="conq-heading-lg mt-5">{name}</h1>
            <p className="conq-text-muted mt-4" style={{ fontSize: 18 }}>
              Published listings: {seller.listings.length}
            </p>
          </div>

          {seller.listings.length === 0 ? (
            <div className="glow-card p-7" style={{ marginTop: 24 }}>
              <div className="conq-text-muted">No published listings yet.</div>
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
              {seller.listings.map((l) => (
                <Link
                  key={l.id}
                  href={`/market/${l.id}`}
                  className="glow-card p-4 block"
                >
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
                      {l.title}
                    </div>

                    <div className="conq-text-muted" style={{ marginTop: 10 }}>
                      {l.priceCents === 0
                        ? "Free"
                        : `$${(l.priceCents / 100).toFixed(2)}`}
                    </div>

                    <div
                      className="conq-text-muted"
                      style={{ marginTop: 8, fontSize: 13 }}
                    >
                      {new Date(l.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}