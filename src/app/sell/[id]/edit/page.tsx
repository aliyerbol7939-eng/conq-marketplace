import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifySessionToken } from "@/lib/auth";
import EditListingForm from "./ui";

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const token = (await cookies()).get("session")?.value;
  if (!token) return notFound();

  const session = await verifySessionToken(token);

  const listing = await prisma.listing.findUnique({
    where: { id },
    select: {
      id: true,
      sellerId: true,
      title: true,
      description: true,
      priceCents: true,
      thumbnailUrl: true,
      previewVideoUrl: true,
      status: true,
    },
  });

  if (!listing) return notFound();
  if (listing.sellerId !== session.userId) return notFound();

  return (
    <div className="page-shell grid-bg">
      <section className="conq-section">
        <div className="container-conq" style={{ maxWidth: 980 }}>
          <div className="glow-card p-8 md:p-10">
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
                <div className="conq-badge">Edit listing</div>
                <h1 className="conq-heading-lg mt-5">Refine your product page</h1>
                <p className="conq-text-muted mt-4" style={{ fontSize: 18 }}>
                  Update title, description, pricing, and media.
                </p>
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Link href="/dashboard" className="conq-btn conq-btn-dark">
                  Dashboard
                </Link>
                <div className="conq-btn conq-btn-primary">{listing.status}</div>
              </div>
            </div>
          </div>

          <div className="glow-card p-8 md:p-10" style={{ marginTop: 24 }}>
            <EditListingForm
              listingId={listing.id}
              initialTitle={listing.title}
              initialDescription={listing.description || ""}
              initialPrice={(listing.priceCents / 100).toFixed(2)}
              initialThumb={listing.thumbnailUrl || ""}
              initialVideo={listing.previewVideoUrl || ""}
            />
          </div>
        </div>
      </section>
    </div>
  );
}