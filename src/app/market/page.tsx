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
  const priceFilter = typeof sp.price === "string" ? sp.price : "all"; // all|free|paid
  const sort = typeof sp.sort === "string" ? sp.sort : "new"; // new|plh|phl

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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Marketplace</h1>
            <p className="text-gray-600 mt-1">Search and filter listings.</p>
          </div>

          <Link
            href="/dashboard"
            className="bg-black text-white px-4 py-2 rounded-xl"
          >
            Dashboard
          </Link>
        </div>

        <form className="bg-white rounded-2xl shadow p-4 mt-6 flex flex-col md:flex-row gap-3 md:items-center">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search title..."
            className="border rounded-xl px-3 py-2 w-full"
          />

          <select
            name="price"
            defaultValue={priceFilter}
            className="border rounded-xl px-3 py-2"
          >
            <option value="all">All</option>
            <option value="free">Free</option>
            <option value="paid">Paid</option>
          </select>

          <select
            name="sort"
            defaultValue={sort}
            className="border rounded-xl px-3 py-2"
          >
            <option value="new">Newest</option>
            <option value="plh">Price: low → high</option>
            <option value="phl">Price: high → low</option>
          </select>

          <button className="bg-gray-900 text-white px-4 py-2 rounded-xl">
            Apply
          </button>

          <Link href="/market" className="text-sm underline md:ml-auto">
            Reset
          </Link>
        </form>

        {listings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-6 mt-6">
            No listings found.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {listings.map((l) => (
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
    </div>
  );
}