import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import DownloadButton from "./DownloadButton";
import ReportButton from "./ReportButton";

export default async function ListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const listing = await prisma.listing.findUnique({
    where: { id },
    select: {
      id: true,
      sellerId: true,
      title: true,
      description: true,
      priceCents: true,
      currency: true,
      thumbnailUrl: true,
      previewVideoUrl: true,
      originalName: true,
      seller: { select: { displayName: true } },
    },
  });

  if (!listing) return notFound();

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
              ← Back to market
            </Link>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link href="/library" className="conq-btn conq-btn-dark">
                Library
              </Link>
              <Link href="/dashboard" className="conq-btn conq-btn-primary">
                Dashboard
              </Link>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.2fr) minmax(320px, 0.8fr)",
              gap: 24,
              alignItems: "start",
            }}
          >
            <div className="glow-card p-5 md:p-6">
              <div
                style={{
                  width: "100%",
                  aspectRatio: "16 / 9",
                  borderRadius: 22,
                  overflow: "hidden",
                  background: "#0b1412",
                  border: "1px solid rgba(127,255,212,0.08)",
                }}
              >
                {listing.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={listing.thumbnailUrl}
                    alt={listing.title}
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

              {listing.previewVideoUrl ? (
                <div style={{ marginTop: 18 }}>
                  <video
                    controls
                    src={listing.previewVideoUrl}
                    style={{
                      width: "100%",
                      borderRadius: 18,
                      border: "1px solid rgba(127,255,212,0.08)",
                      background: "#0a1311",
                    }}
                  />
                </div>
              ) : null}
            </div>

            <div className="glow-card p-6 md:p-7">
              <div className="conq-badge">Product page</div>

              <h1
                style={{
                  fontSize: "clamp(30px, 4vw, 48px)",
                  lineHeight: 1.02,
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  marginTop: 18,
                }}
              >
                {listing.title}
              </h1>

              <div className="conq-text-muted" style={{ marginTop: 14, fontSize: 17 }}>
                {listing.priceCents === 0
                  ? "Free"
                  : `$${(listing.priceCents / 100).toFixed(2)}`}{" "}
                •{" "}
                <Link
                  href={`/u/${listing.sellerId}`}
                  style={{ color: "var(--brand)", fontWeight: 700 }}
                >
                  {listing.seller?.displayName || "Seller"}
                </Link>
              </div>

              <div
                style={{
                  marginTop: 22,
                  padding: "16px 18px",
                  borderRadius: 18,
                  background: "rgba(127,255,212,0.04)",
                  border: "1px solid rgba(127,255,212,0.08)",
                }}
              >
                <div className="conq-text-muted" style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Included file
                </div>
                <div style={{ marginTop: 8, fontWeight: 700, fontSize: 17 }}>
                  {listing.originalName}
                </div>
              </div>

              <div style={{ marginTop: 24 }}>
                <div style={{ fontWeight: 800, fontSize: 20 }}>Description</div>
                <div
                  className="conq-text-muted"
                  style={{
                    marginTop: 12,
                    lineHeight: 1.75,
                    whiteSpace: "pre-wrap",
                    fontSize: 16,
                  }}
                >
                  {listing.description || "No description."}
                </div>
              </div>

              <DownloadButton
                listingId={listing.id}
                isFree={listing.priceCents === 0}
              />

              <ReportButton listingId={listing.id} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}