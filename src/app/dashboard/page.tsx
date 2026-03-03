import Link from "next/link";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySessionToken } from "@/lib/auth";

export default async function DashboardPage() {
  const token = (await cookies()).get("session")?.value;

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="mb-4">Not logged in.</p>
          <Link className="underline" href="/login">
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  const session = await verifySessionToken(token);

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { email: true, displayName: true, role: true },
  });

  const listingsCount = await prisma.listing.count({
    where: { sellerId: session.userId },
  });

  const purchasesCount = await prisma.purchase.count({
    where: { buyerId: session.userId },
  });

  const salesStats = await prisma.purchase.aggregate({
    where: {
      listing: { sellerId: session.userId },
      status: "PAID",
    },
    _sum: {
      amountCents: true,
      sellerNetCents: true,
      platformFeeCents: true,
    },
    _count: true,
  });

  const listings = await prisma.listing.findMany({
    where: { sellerId: session.userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      priceCents: true,
      thumbnailUrl: true,
      status: true,
      createdAt: true,
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6 text-black">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow p-6 flex items-start justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome{user?.displayName ? `, ${user.displayName}` : ""} 👋
            </h1>
            <p className="text-gray-600 mt-1">{user?.email}</p>
            <p className="text-sm mt-2">
              Role: <span className="font-semibold">{user?.role}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
                href="/market"
                className="px-4 py-2 rounded-xl border bg-white hover:bg-gray-50"
            >
                Marketplace
            </Link>

            <Link
                href="/library"
                className="px-4 py-2 rounded-xl border bg-white hover:bg-gray-50"
            >
                Library
            </Link>

            <Link
                href="/settings"
                className="px-4 py-2 rounded-xl border bg-white hover:bg-gray-50"
            >
                Settings
            </Link>
        </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded-2xl shadow p-5">
            <div className="text-sm text-black">Your listings</div>
            <div className="text-3xl font-bold mt-2">{listingsCount}</div>
          </div>

          <div className="bg-white rounded-2xl shadow p-5">
            <div className="text-sm text-black">Your purchases</div>
            <div className="text-3xl font-bold mt-2">{purchasesCount}</div>
          </div>

          <div className="bg-white rounded-2xl shadow p-5">
            <div className="text-sm text-black">Sales</div>
            <div className="text-3xl font-bold mt-2">
              {salesStats._count || 0}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow p-5">
            <div className="text-sm text-black">Earned (90%)</div>
            <div className="text-3xl font-bold mt-2">
              ${((salesStats._sum.sellerNetCents || 0) / 100).toFixed(2)}
            </div>
          </div>
        </div>

        <div className="mt-4 bg-white rounded-2xl shadow p-4 text-sm text-gray-700">
          Platform fee earned from your sales:{" "}
          <span className="font-semibold">
            ${((salesStats._sum.platformFeeCents || 0) / 100).toFixed(2)}
          </span>
        </div>

        {user?.role === "ADMIN" && (
          <div className="mt-6 bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-bold">Admin</h2>
            <p className="text-gray-600 mt-1">
              Manage users & listings (we’ll build this next).
            </p>
            <Link className="underline mt-2 inline-block" href="/admin">
              Go to admin →
            </Link>
          </div>
        )}

        <div className="mt-6 bg-white rounded-2xl shadow p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Your listings</h2>
            <Link className="underline" href="/sell">
              + New listing
            </Link>
          </div>

          {listings.length === 0 ? (
            <p className="text-gray-600 mt-3">No listings yet.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              {listings.map((l) => (
                <div
                  key={l.id}
                  className="border rounded-2xl p-4 flex gap-4 items-start justify-between"
                >
                  <div className="flex gap-4 items-start">
                    <div className="w-24 h-24 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                      {l.thumbnailUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={l.thumbnailUrl}
                          alt={l.title}
                          className="w-full h-full object-cover"
                        />
                      ) : null}
                    </div>

                    <div className="flex-1">
                      <div className="font-semibold">{l.title}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        {l.priceCents === 0
                          ? "Free"
                          : `$${(l.priceCents / 100).toFixed(2)}`}
                        {" • "}
                        <span className="uppercase">{l.status}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        {new Date(l.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <Link
                        href={`/sell/${l.id}/edit`}
                        className="text-sm hover:underline"
                    >
                        Edit
                    </Link>

                    <form action={`/api/listings/delete/${l.id}`} method="post">
                        <button className="text-red-600 text-sm hover:underline">Delete</button>
                    </form>
                    </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}