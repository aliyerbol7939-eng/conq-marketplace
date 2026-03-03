"use client";

import { useEffect, useState } from "react";

type Me = {
  id: string;
  email: string;
  displayName: string | null;
  role: "USER" | "ADMIN";
};

export default function SettingsPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  const [displayName, setDisplayName] = useState("");
  const [profileMsg, setProfileMsg] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passMsg, setPassMsg] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      setMe(data.user);
      setDisplayName(data.user?.displayName || "");
      setLoading(false);
    })();
  }, []);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileMsg("Saving...");

    const res = await fetch("/api/settings/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName }),
    });

    const data = await res.json();
    if (!res.ok) {
      setProfileMsg(data.error || "Failed");
      return;
    }

    setProfileMsg("✅ Updated");
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPassMsg("Saving...");

    const res = await fetch("/api/settings/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const data = await res.json();
    if (!res.ok) {
      setPassMsg(data.error || "Failed");
      return;
    }

    setPassMsg("✅ Password changed");
    setCurrentPassword("");
    setNewPassword("");
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold">Settings</h1>

        <div className="bg-white rounded-2xl shadow p-6 mt-6">
          <h2 className="text-xl font-bold">Account</h2>

          {loading ? (
            <p className="text-gray-600 mt-3">Loading...</p>
          ) : me ? (
            <div className="mt-3 text-sm text-gray-700 space-y-1">
              <div>
                Email: <span className="font-medium">{me.email}</span>
              </div>
              <div>
                Role: <span className="font-medium">{me.role}</span>
              </div>
            </div>
          ) : (
            <p className="text-gray-600 mt-3">Not logged in.</p>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow p-6 mt-6">
          <h2 className="text-xl font-bold">Profile</h2>
          <form onSubmit={saveProfile} className="mt-4 space-y-3">
            <input
              className="w-full border p-3 rounded"
              placeholder="Display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
            <button className="bg-black text-white px-5 py-3 rounded-xl">
              Save profile
            </button>
            {profileMsg && <div className="text-sm text-gray-600">{profileMsg}</div>}
          </form>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 mt-6">
          <h2 className="text-xl font-bold">Change password</h2>
          <form onSubmit={changePassword} className="mt-4 space-y-3">
            <input
              className="w-full border p-3 rounded"
              placeholder="Current password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            <input
              className="w-full border p-3 rounded"
              placeholder="New password (min 8)"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <button className="bg-black text-white px-5 py-3 rounded-xl">
              Change password
            </button>
            {passMsg && <div className="text-sm text-gray-600">{passMsg}</div>}
          </form>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 mt-6">
          <h2 className="text-xl font-bold">Logout</h2>
          <form action="/api/auth/logout" method="post" className="mt-4">
            <button className="w-full bg-black text-white py-3 rounded-xl">
              Logout
            </button>
          </form>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 mt-6 border border-red-200">
          <h2 className="text-xl font-bold text-red-700">Danger zone</h2>
          <p className="text-sm text-gray-600 mt-2">
            This will disable your account (soft delete). You will be logged out.
          </p>

          <form
            action="/api/settings/delete-account"
            method="post"
            className="mt-4"
            onSubmit={(e) => {
              if (!confirm("Are you sure? This disables your account.")) {
                e.preventDefault();
              }
            }}
          >
            <button className="w-full bg-red-600 text-white py-3 rounded-xl">
              Delete my account
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}