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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          <Link className="underline" href="/dashboard">
            ← Back
          </Link>
          <div className="text-sm text-gray-600 uppercase">{listing.status}</div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 mt-4">
          <h1 className="text-2xl font-bold">Edit listing</h1>
          <p className="text-gray-600 mt-1">Update title, price, thumbnail, video.</p>

          <div className="mt-6">
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
      </div>
    </div>
  );
}