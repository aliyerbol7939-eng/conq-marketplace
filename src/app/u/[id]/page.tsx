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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <Link className="underline" href="/market">
            ← Marketplace
          </Link>
          <Link className="underline" href="/dashboard">
            Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 mt-6">
          <h1 className="text-3xl font-bold">{name}</h1>
          <p className="text-gray-600 mt-1">Creator profile</p>
          <div className="text-sm text-gray-500 mt-3">
            Listings: <span className="font-semibold">{seller.listings.length}</span>
          </div>
        </div>

        {seller.listings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-6 mt-6">
            No published listings yet.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {seller.listings.map((l) => (
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