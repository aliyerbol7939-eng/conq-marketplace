import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export default async function MarketPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const priceFilter = typeof sp.price === "string" ? sp.price : "all";
  const sort = typeof sp.sort === "string" ? sp.sort : "new";

  const where: Prisma.ListingWhereInput = {
    status: "PUBLISHED",
    ...(q
      ? {
          title: {
            contains: q,
            mode: "insensitive",
          },
        }
      : {}),
    ...(priceFilter === "free" ? { priceCents: 0 } : {}),
    ...(priceFilter === "paid" ? { priceCents: { gt: 0 } } : {}),
  };

  const orderBy: Prisma.ListingOrderByWithRelationInput =
    sort === "plh"
      ? { priceCents: "asc" }
      : sort === "phl"
      ? { priceCents: "desc" }
      : { createdAt: "desc" };

  const listings = await prisma.listing.findMany({
    where,
    orderBy,
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
                <div className="conq-badge">Marketplace</div>
                <h1 className="conq-heading-lg mt-5">Search digital products</h1>
                <p className="conq-text-muted mt-4" style={{ fontSize: 18 }}>
                  Explore premium files from creators on Conq.
                </p>
              </div>

              <Link href="/dashboard" className="conq-btn conq-btn-primary">
                Dashboard
              </Link>
            </div>

            <form
              className="glow-card p-4"
              style={{
                marginTop: 28,
                display: "grid",
                gridTemplateColumns: "minmax(0, 1fr) 180px 180px auto auto",
                gap: 12,
                alignItems: "center",
              }}
            >
              <input
                name="q"
                defaultValue={q}
                placeholder="Search title..."
                style={{
                  width: "100%",
                  borderRadius: 16,
                  border: "1px solid rgba(127,255,212,0.08)",
                  background: "#0a1311",
                  color: "var(--foreground)",
                  padding: "14px 16px",
                  outline: "none",
                }}
              />

              <select
                name="price"
                defaultValue={priceFilter}
                style={{
                  width: "100%",
                  borderRadius: 16,
                  border: "1px solid rgba(127,255,212,0.08)",
                  background: "#0a1311",
                  color: "var(--foreground)",
                  padding: "14px 16px",
                  outline: "none",
                }}
              >
                <option value="all">All</option>
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </select>

              <select
                name="sort"
                defaultValue={sort}
                style={{
                  width: "100%",
                  borderRadius: 16,
                  border: "1px solid rgba(127,255,212,0.08)",
                  background: "#0a1311",
                  color: "var(--foreground)",
                  padding: "14px 16px",
                  outline: "none",
                }}
              >
                <option value="new">Newest</option>
                <option value="plh">Price: low → high</option>
                <option value="phl">Price: high → low</option>
              </select>

              <button className="conq-btn conq-btn-primary">Apply</button>

              <Link href="/market" className="conq-btn conq-btn-dark">
                Reset
              </Link>
            </form>
          </div>

          {listings.length === 0 ? (
            <div className="glow-card p-6" style={{ marginTop: 24 }}>
              <div className="conq-text-muted">No listings found.</div>
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
              {listings.map((l) => (
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