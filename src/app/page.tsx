import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const featured = await prisma.listing.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    take: 6,
    select: {
      id: true,
      title: true,
      priceCents: true,
      thumbnailUrl: true,
      createdAt: true,
      seller: { select: { displayName: true } },
    },
  });

  return (
    <div className="page-shell grid-bg">
      <section className="conq-section">
        <div className="container-conq">
          <div className="glow-card p-8 md:p-12 overflow-hidden relative">
            <div className="absolute inset-0 pointer-events-none opacity-60">
              <div
                style={{
                  position: "absolute",
                  width: 420,
                  height: 420,
                  right: -80,
                  top: -80,
                  borderRadius: "9999px",
                  background:
                    "radial-gradient(circle, rgba(127,255,212,0.18), transparent 65%)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  width: 320,
                  height: 320,
                  left: "42%",
                  bottom: -120,
                  borderRadius: "9999px",
                  background:
                    "radial-gradient(circle, rgba(139,92,246,0.18), transparent 70%)",
                }}
              />
            </div>

            <div className="relative z-10 max-w-4xl">
              <div className="conq-badge">Creator marketplace</div>

              <h1 className="conq-heading-xl mt-6">
                Sell digital files with a futuristic storefront.
              </h1>

              <p
                className="conq-text-muted"
                style={{
                  fontSize: "clamp(18px, 2vw, 24px)",
                  lineHeight: 1.6,
                  maxWidth: 820,
                  marginTop: 24,
                }}
              >
                Conq helps creators upload, protect, showcase, and sell digital
                products with secure delivery, moderation tools, and premium
                presentation.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <Link href="/sell" className="conq-btn conq-btn-primary">
                  Start selling
                </Link>
                <Link href="/market" className="conq-btn conq-btn-dark">
                  Browse marketplace
                </Link>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mt-10">
                <div className="glow-card p-5">
                  <div className="font-semibold text-lg">Secure downloads</div>
                  <div className="conq-text-muted mt-2">
                    Expiring access and protected delivery flow.
                  </div>
                </div>

                <div className="glow-card p-5">
                  <div className="font-semibold text-lg">Creator tools</div>
                  <div className="conq-text-muted mt-2">
                    Upload, edit, archive, analyze, and manage listings.
                  </div>
                </div>

                <div className="glow-card p-5">
                  <div className="font-semibold text-lg">Moderation ready</div>
                  <div className="conq-text-muted mt-2">
                    Reports, admin controls, and safety review pipeline.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="container-conq">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="conq-badge">Featured</div>
              <h2 className="conq-heading-lg mt-4">Latest marketplace drops</h2>
              <p className="conq-text-muted mt-3">
                New files from creators using Conq.
              </p>
            </div>

            <Link href="/market" className="conq-btn conq-btn-dark">
              View all
            </Link>
          </div>

          {featured.length === 0 ? (
            <div className="glow-card p-6 mt-8 conq-text-muted">
              No listings yet. Be the first creator to publish on Conq.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
              {featured.map((l) => (
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
                        fontWeight: 700,
                        fontSize: 18,
                        lineHeight: 1.35,
                      }}
                    >
                      {l.title}
                    </div>

                    <div className="conq-text-muted" style={{ marginTop: 8 }}>
                      {l.priceCents === 0
                        ? "Free"
                        : `$${(l.priceCents / 100).toFixed(2)}`}
                      {l.seller?.displayName ? ` • ${l.seller.displayName}` : ""}
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