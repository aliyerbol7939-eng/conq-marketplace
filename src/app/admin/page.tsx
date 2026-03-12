import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { verifySessionToken } from "@/lib/auth";

export default async function AdminPage() {
  const token = (await cookies()).get("session")?.value;
  if (!token) return notFound();

  const session = await verifySessionToken(token);
  if (session.role !== "ADMIN") return notFound();

  const pendingModeration = await prisma.listing.findMany({
    where: { status: "REVIEW_PENDING" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      moderationReasons: true,
      avStatus: true,
      createdAt: true,
      seller: { select: { email: true } },
    },
  });

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      displayName: true,
      role: true,
      isDeleted: true,
      createdAt: true,
    },
  });

  const listings = await prisma.listing.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      status: true,
      moderationReasons: true,
      avStatus: true,
      seller: { select: { email: true } },
      createdAt: true,
    },
  });

  const reports = await prisma.report.findMany({
    where: { resolvedAt: null },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      createdAt: true,
      reason: true,
      details: true,
      listing: { select: { id: true, title: true } },
      reporter: { select: { email: true } },
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
                gap: 16,
                alignItems: "flex-end",
                flexWrap: "wrap",
              }}
            >
              <div>
                <div className="conq-badge">Admin</div>
                <h1 className="conq-heading-lg mt-5">Moderation control center</h1>
                <p className="conq-text-muted mt-4" style={{ fontSize: 18 }}>
                  Review users, listings, suspicious uploads, and incoming reports.
                </p>
              </div>

              <Link href="/dashboard" className="conq-btn conq-btn-primary">
                Dashboard
              </Link>
            </div>
          </div>

          <div className="glow-card p-6" style={{ marginTop: 24 }}>
            <div className="conq-badge">Moderation queue</div>
            <h2 style={{ fontSize: 28, fontWeight: 800, marginTop: 16 }}>
              Pending publish review
            </h2>

            {pendingModeration.length === 0 ? (
              <div className="conq-text-muted" style={{ marginTop: 18 }}>
                No listings waiting for review.
              </div>
            ) : (
              <div style={{ marginTop: 20, display: "grid", gap: 14 }}>
                {pendingModeration.map((l) => (
                  <div key={l.id} className="glow-card p-5">
                    <div style={{ fontWeight: 800, fontSize: 18 }}>{l.title}</div>

                    <div className="conq-text-muted" style={{ marginTop: 8 }}>
                      Seller: {l.seller.email}
                    </div>

                    <div className="conq-text-muted" style={{ marginTop: 8 }}>
                      AV: {l.avStatus || "PENDING"}
                    </div>

                    <div className="conq-text-muted" style={{ marginTop: 8, fontSize: 13 }}>
                      {new Date(l.createdAt).toLocaleString()}
                    </div>

                    <div
                      className="conq-text-muted"
                      style={{ marginTop: 12, lineHeight: 1.7, whiteSpace: "pre-wrap" }}
                    >
                      {l.moderationReasons || "No moderation reasons saved"}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: 12,
                        flexWrap: "wrap",
                        marginTop: 16,
                      }}
                    >
                      <form action={`/api/admin/listing-approve/${l.id}`} method="post">
                        <button className="conq-btn conq-btn-primary">Approve</button>
                      </form>

                      <form action={`/api/admin/listing-reject/${l.id}`} method="post">
                        <button
                          className="conq-btn"
                          style={{
                            background: "rgba(255,92,122,0.12)",
                            color: "#ff7a93",
                            border: "1px solid rgba(255,92,122,0.2)",
                          }}
                        >
                          Reject
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
              gap: 20,
              marginTop: 24,
            }}
          >
            <div className="glow-card p-6">
              <div className="conq-badge">Users</div>
              <h2 style={{ fontSize: 28, fontWeight: 800, marginTop: 16 }}>
                Accounts
              </h2>

              <div style={{ marginTop: 20, display: "grid", gap: 14 }}>
                {users.map((u) => (
                  <div key={u.id} className="glow-card p-4">
                    <div style={{ fontWeight: 700, fontSize: 18 }}>
                      {u.displayName || "—"}
                    </div>
                    <div className="conq-text-muted" style={{ marginTop: 6 }}>
                      {u.email}
                    </div>
                    <div className="conq-text-muted" style={{ marginTop: 6, fontSize: 13 }}>
                      {u.role} • {u.isDeleted ? "DELETED" : "ACTIVE"}
                    </div>

                    {!u.isDeleted ? (
                      <form
                        action={`/api/admin/user-delete/${u.id}`}
                        method="post"
                        style={{ marginTop: 14 }}
                      >
                        <button
                          className="conq-btn"
                          style={{
                            background: "rgba(255,92,122,0.12)",
                            color: "#ff7a93",
                            border: "1px solid rgba(255,92,122,0.2)",
                          }}
                        >
                          Disable
                        </button>
                      </form>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            <div className="glow-card p-6">
              <div className="conq-badge">Listings</div>
              <h2 style={{ fontSize: 28, fontWeight: 800, marginTop: 16 }}>
                All products
              </h2>

              <div style={{ marginTop: 20, display: "grid", gap: 14 }}>
                {listings.map((l) => (
                  <div key={l.id} className="glow-card p-4">
                    <div style={{ fontWeight: 700, fontSize: 18 }}>{l.title}</div>

                    <div className="conq-text-muted" style={{ marginTop: 6 }}>
                      {l.seller.email}
                    </div>

                    <div className="conq-text-muted" style={{ marginTop: 6, fontSize: 13 }}>
                      Status: {l.status}
                    </div>

                    {l.avStatus ? (
                      <div className="conq-text-muted" style={{ marginTop: 6, fontSize: 13 }}>
                        AV: {l.avStatus}
                      </div>
                    ) : null}

                    {l.moderationReasons ? (
                      <div
                        className="conq-text-muted"
                        style={{
                          marginTop: 10,
                          fontSize: 13,
                          lineHeight: 1.6,
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {l.moderationReasons}
                      </div>
                    ) : null}

                    {l.status !== "ARCHIVED" ? (
                      <form
                        action={`/api/admin/listing-archive/${l.id}`}
                        method="post"
                        style={{ marginTop: 14 }}
                      >
                        <button
                          className="conq-btn"
                          style={{
                            background: "rgba(255,92,122,0.12)",
                            color: "#ff7a93",
                            border: "1px solid rgba(255,92,122,0.2)",
                          }}
                        >
                          Archive
                        </button>
                      </form>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="glow-card p-6" style={{ marginTop: 24 }}>
            <div className="conq-badge">Reports</div>
            <h2 style={{ fontSize: 28, fontWeight: 800, marginTop: 16 }}>
              Unresolved reports
            </h2>

            {reports.length === 0 ? (
              <div className="conq-text-muted" style={{ marginTop: 18 }}>
                No unresolved reports.
              </div>
            ) : (
              <div style={{ marginTop: 20, display: "grid", gap: 14 }}>
                {reports.map((r) => (
                  <div key={r.id} className="glow-card p-5">
                    <div style={{ fontWeight: 800, fontSize: 18 }}>{r.reason}</div>

                    <div className="conq-text-muted" style={{ marginTop: 8 }}>
                      Listing:{" "}
                      <Link
                        href={`/market/${r.listing.id}`}
                        style={{ color: "var(--brand)", fontWeight: 700 }}
                      >
                        {r.listing.title}
                      </Link>
                    </div>

                    <div className="conq-text-muted" style={{ marginTop: 8, fontSize: 13 }}>
                      Reporter: {r.reporter?.email || "Anonymous"} •{" "}
                      {new Date(r.createdAt).toLocaleString()}
                    </div>

                    {r.details ? (
                      <div
                        className="conq-text-muted"
                        style={{
                          marginTop: 14,
                          whiteSpace: "pre-wrap",
                          lineHeight: 1.7,
                        }}
                      >
                        {r.details}
                      </div>
                    ) : null}

                    <div
                      style={{
                        display: "flex",
                        gap: 12,
                        flexWrap: "wrap",
                        marginTop: 16,
                      }}
                    >
                      <form
                        action={`/api/admin/listing-archive/${r.listing.id}`}
                        method="post"
                      >
                        <button
                          className="conq-btn"
                          style={{
                            background: "rgba(255,92,122,0.12)",
                            color: "#ff7a93",
                            border: "1px solid rgba(255,92,122,0.2)",
                          }}
                        >
                          Archive listing
                        </button>
                      </form>

                      <form
                        action={`/api/admin/report-resolve/${r.id}`}
                        method="post"
                      >
                        <button className="conq-btn conq-btn-dark">
                          Mark resolved
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