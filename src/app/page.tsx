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
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="px-6 pt-12 pb-10">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-3xl shadow p-8 md:p-12">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Sell digital files with a premium storefront.
              </h1>
              <p className="text-gray-600 mt-4 text-lg">
                Conq helps creators upload, showcase, and sell digital files —
                with secure downloads, a marketplace, and admin moderation.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <Link
                  href="/sell"
                  className="bg-black text-white px-6 py-3 rounded-2xl text-center"
                >
                  Start selling
                </Link>
                <Link
                  href="/market"
                  className="px-6 py-3 rounded-2xl border bg-white hover:bg-gray-50 text-center"
                >
                  Browse marketplace
                </Link>
              </div>

              <div className="grid sm:grid-cols-3 gap-3 mt-8 text-sm text-gray-700">
                <div className="bg-gray-50 rounded-2xl p-4">
                  <div className="font-semibold">Secure downloads</div>
                  <div className="text-gray-600 mt-1">
                    Signed short-lived links.
                  </div>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4">
                  <div className="font-semibold">Creator tools</div>
                  <div className="text-gray-600 mt-1">
                    Upload, edit, archive listings.
                  </div>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4">
                  <div className="font-semibold">Admin moderation</div>
                  <div className="text-gray-600 mt-1">
                    Manage users & listings.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="px-6 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">Featured</h2>
              <p className="text-gray-600 mt-1">
                Latest files from the marketplace.
              </p>
            </div>

            <Link className="underline" href="/market">
              View all →
            </Link>
          </div>

          {featured.length === 0 ? (
            <div className="bg-white rounded-2xl shadow p-6 mt-6">
              No listings yet. Be the first to sell!
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {featured.map((l) => (
                <Link
                  key={l.id}
                  href={`/market/${l.id}`}
                  className="bg-white rounded-2xl shadow hover:shadow-md transition p-4"
                >
                  <div className="w-full aspect-video rounded-xl bg-gray-100 overflow-hidden">
                    {l.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={l.thumbnailUrl}
                        alt={l.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                        No thumbnail
                      </div>
                    )}
                  </div>

                  <div className="mt-3">
                    <div className="font-semibold line-clamp-2">{l.title}</div>

                    <div className="text-sm text-gray-600 mt-1">
                      {l.priceCents === 0
                        ? "Free"
                        : `$${(l.priceCents / 100).toFixed(2)}`}
                      {l.seller?.displayName ? ` • ${l.seller.displayName}` : ""}
                    </div>

                    <div className="text-xs text-gray-500 mt-2">
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