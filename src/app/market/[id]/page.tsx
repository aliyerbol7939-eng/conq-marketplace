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
      title: true,
      description: true,
      priceCents: true,
      currency: true,
      thumbnailUrl: true,
      previewVideoUrl: true,
      originalName: true,
      seller: { select: { displayName: true } },
      sellerId: true,
    },
  });

  if (!listing) return notFound();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <Link className="underline" href="/market">
            ← Back to market
          </Link>
          <Link className="underline" href="/dashboard">
            Dashboard
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mt-6">
          <div className="bg-white rounded-2xl shadow p-4">
            <div className="w-full aspect-video rounded-xl bg-gray-100 overflow-hidden">
              {listing.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={listing.thumbnailUrl}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                  No thumbnail
                </div>
              )}
            </div>

            {listing.previewVideoUrl ? (
              <div className="mt-4">
                <video
                  controls
                  className="w-full rounded-xl"
                  src={listing.previewVideoUrl}
                />
              </div>
            ) : null}
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <h1 className="text-2xl font-bold">{listing.title}</h1>

            <div className="text-sm text-gray-600 mt-2">
              {listing.priceCents === 0
                ? "Free"
                : `$${(listing.priceCents / 100).toFixed(2)}`}{" "}
              •{" "}
                <Link className="underline" href={`/u/${listing.sellerId}`}>
                {listing.seller?.displayName || "Seller"}
                </Link>
            </div>

            <div className="mt-4 text-gray-800 whitespace-pre-wrap">
              {listing.description || "No description."}
            </div>

            <div className="mt-6 text-sm text-gray-600">
              File: <span className="font-medium">{listing.originalName}</span>
            </div>

            {/* Next step we wire payments + secure downloads */}
            <DownloadButton listingId={listing.id} isFree={listing.priceCents === 0} />

            <ReportButton listingId={listing.id} />

            <p className="text-xs text-gray-500 mt-3">
              Payments + secure download will be added next.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}