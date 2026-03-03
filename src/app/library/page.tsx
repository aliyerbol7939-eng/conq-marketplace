import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifySessionToken } from "@/lib/auth";

export default async function LibraryPage() {
  const token = (await cookies()).get("session")?.value;
  if (!token) return notFound();

  const session = await verifySessionToken(token);

  const purchases = await prisma.purchase.findMany({
    where: { buyerId: session.userId, status: "PAID" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      listing: {
        select: {
          id: true,
          title: true,
          thumbnailUrl: true,
          priceCents: true,
          seller: { select: { displayName: true } },
        },
      },
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Purchases</h1>
          <div className="flex gap-3">
            <Link className="underline" href="/market">
              Marketplace
            </Link>
            <Link className="underline" href="/dashboard">
              Dashboard
            </Link>
          </div>
        </div>

        {purchases.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-6 mt-6">
            No purchases yet.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {purchases.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl shadow p-4">
                <div className="w-full aspect-video rounded-xl bg-gray-100 overflow-hidden">
                  {p.listing.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.listing.thumbnailUrl}
                      alt={p.listing.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                      No thumbnail
                    </div>
                  )}
                </div>

                <div className="mt-3 font-semibold line-clamp-2">
                  {p.listing.title}
                </div>

                <div className="text-sm text-gray-600 mt-1">
                  {(p.listing.priceCents / 100).toFixed(2) !== "0.00"
                    ? `$${(p.listing.priceCents / 100).toFixed(2)}`
                    : "Free"}{" "}
                  {p.listing.seller?.displayName
                    ? ` • ${p.listing.seller.displayName}`
                    : ""}
                </div>

                <div className="text-xs text-gray-500 mt-2">
                  Bought: {new Date(p.createdAt).toLocaleString()}
                </div>

                <form
                  action={`/api/download-go/${p.listing.id}`}
                  method="post"
                  className="mt-4"
                >
                  <button className="w-full bg-black text-white py-2 rounded-xl">
                    Download again
                  </button>
                </form>

                <p className="text-xs text-gray-500 mt-2">
                  Tip: this creates a fresh, short-lived download link.
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}