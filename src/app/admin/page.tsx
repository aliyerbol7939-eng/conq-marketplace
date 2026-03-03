import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { verifySessionToken } from "@/lib/auth";
type AdminUser = {
  id: string; // change to number if your Prisma id is Int
  email: string;
  displayName: string | null;
  role: string;
  isDeleted: boolean;
  createdAt: Date;
};

export default async function AdminPage() {
  const token = (await cookies()).get("session")?.value;
  if (!token) return notFound();

  const session = await verifySessionToken(token);
  if (session.role !== "ADMIN") return notFound();

  const users: AdminUser[] = await prisma.user.findMany({
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Admin</h1>
          <Link href="/dashboard" className="underline">
            Dashboard
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mt-6">
          {/* USERS */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-bold">Users</h2>

            <div className="mt-4 space-y-3">
              {users.map((u: AdminUser) => (
                <div
                  key={u.id}
                  className="border rounded-xl p-3 flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium">{u.displayName || "—"}</div>
                    <div className="text-sm text-gray-600">{u.email}</div>
                    <div className="text-xs text-gray-500">
                      {u.role} • {u.isDeleted ? "DELETED" : "ACTIVE"}
                    </div>
                  </div>

                  {!u.isDeleted && (
                    <form
                      action={`/api/admin/user-delete/${u.id}`}
                      method="post"
                    >
                      <button className="text-red-600 text-sm hover:underline">
                        Disable
                      </button>
                    </form>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* LISTINGS */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-bold">Listings</h2>

            <div className="mt-4 space-y-3">
              {listings.map((l) => (
                <div
                  key={l.id}
                  className="border rounded-xl p-3 flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium">{l.title}</div>
                    <div className="text-sm text-gray-600">
                      {l.seller.email}
                    </div>
                    <div className="text-xs text-gray-500">
                      {l.status}
                    </div>
                  </div>

                  {l.status !== "ARCHIVED" && (
                    <form
                      action={`/api/admin/listing-archive/${l.id}`}
                      method="post"
                    >
                      <button className="text-red-600 text-sm hover:underline">
                        Archive
                      </button>
                    </form>
                  )}
                </div>
              ))}

            </div>
          </div>

          <div className="bg-white rounded-2xl shadow p-6 mt-6">
            <h2 className="text-xl font-bold">Reports</h2>

            {reports.length === 0 ? (
                <p className="text-gray-600 mt-3">No reports.</p>
            ) : (
                <div className="mt-4 space-y-3">
                {reports.map((r) => (
                    <div key={r.id} className="border rounded-xl p-3">
                    <div className="font-medium">{r.reason}</div>
                    <div className="text-sm text-gray-600 mt-1">
                        Listing:{" "}
                        <Link className="underline" href={`/market/${r.listing.id}`}>
                        {r.listing.title}
                        </Link>
                    </div>
                    
                    <div className="text-xs text-gray-500 mt-1">
                        Reporter: {r.reporter?.email || "Anonymous"} •{" "}
                        {new Date(r.createdAt).toLocaleString()}
                    </div>
                    {r.details ? (
                        <div className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">
                        {r.details}
                        </div>
                    
                    ) : null}

                    <form
                        className="mt-3"
                        action={`/api/admin/listing-archive/${r.listing.id}`}
                        method="post"
                    >
                        <button className="text-red-600 text-sm hover:underline">
                        Archive listing
                        </button>
                    </form>
                    <form
                      className="mt-2"
                      action={`/api/admin/report-resolve/${r.id}`}
                      method="post"
                    >
                    <button className="text-sm hover:underline">Mark resolved</button>
                    </form>
                    </div>
                
                ))}
                </div>
            )}
            </div>
          
        </div>
      </div>
    </div>
  );
}