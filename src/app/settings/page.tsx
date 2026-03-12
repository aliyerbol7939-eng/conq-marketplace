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
    <div className="page-shell grid-bg">
      <section className="conq-section">
        <div className="container-conq" style={{ maxWidth: 980 }}>
          <div className="glow-card p-8 md:p-10">
            <div className="conq-badge">Settings</div>
            <h1 className="conq-heading-lg mt-5">Account control center</h1>
            <p className="conq-text-muted mt-4" style={{ fontSize: 18 }}>
              Manage your profile, account security, and access.
            </p>
          </div>

          <div className="glow-card p-7" style={{ marginTop: 24 }}>
            <div className="conq-badge">Account</div>
            <h2 style={{ fontSize: 28, fontWeight: 800, marginTop: 18 }}>
              Your identity
            </h2>

            {loading ? (
              <p className="conq-text-muted mt-4">Loading...</p>
            ) : me ? (
              <div
                style={{
                  marginTop: 18,
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 16,
                }}
              >
                <div className="glow-card p-5">
                  <div className="conq-text-muted">Email</div>
                  <div style={{ marginTop: 10, fontWeight: 700, fontSize: 18 }}>
                    {me.email}
                  </div>
                </div>

                <div className="glow-card p-5">
                  <div className="conq-text-muted">Role</div>
                  <div style={{ marginTop: 10, fontWeight: 700, fontSize: 18 }}>
                    {me.role}
                  </div>
                </div>
              </div>
            ) : (
              <p className="conq-text-muted mt-4">Not logged in.</p>
            )}
          </div>

          <div className="glow-card p-7" style={{ marginTop: 24 }}>
            <div className="conq-badge">Profile</div>
            <h2 style={{ fontSize: 28, fontWeight: 800, marginTop: 18 }}>
              Public display name
            </h2>

            <form onSubmit={saveProfile} style={{ marginTop: 20 }}>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Display name"
                required
                style={{
                  width: "100%",
                  borderRadius: 16,
                  border: "1px solid rgba(127,255,212,0.08)",
                  background: "#0a1311",
                  color: "var(--foreground)",
                  padding: "14px 16px",
                  outline: "none",
                }}
              />

              <div style={{ marginTop: 16, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <button className="conq-btn conq-btn-primary">Save profile</button>
                {profileMsg ? (
                  <span className="conq-text-muted">{profileMsg}</span>
                ) : null}
              </div>
            </form>
          </div>

          <div className="glow-card p-7" style={{ marginTop: 24 }}>
            <div className="conq-badge">Security</div>
            <h2 style={{ fontSize: 28, fontWeight: 800, marginTop: 18 }}>
              Change password
            </h2>

            <form onSubmit={changePassword} style={{ marginTop: 20 }}>
              <div style={{ display: "grid", gap: 14 }}>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Current password"
                  required
                  style={{
                    width: "100%",
                    borderRadius: 16,
                    border: "1px solid rgba(127,255,212,0.08)",
                    background: "#0a1311",
                    color: "var(--foreground)",
                    padding: "14px 16px",
                    outline: "none",
                  }}
                />

                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password (min 8)"
                  required
                  style={{
                    width: "100%",
                    borderRadius: 16,
                    border: "1px solid rgba(127,255,212,0.08)",
                    background: "#0a1311",
                    color: "var(--foreground)",
                    padding: "14px 16px",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ marginTop: 16, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <button className="conq-btn conq-btn-primary">Change password</button>
                {passMsg ? <span className="conq-text-muted">{passMsg}</span> : null}
              </div>
            </form>
          </div>

          <div className="glow-card p-7" style={{ marginTop: 24 }}>
            <div className="conq-badge">Session</div>
            <h2 style={{ fontSize: 28, fontWeight: 800, marginTop: 18 }}>
              Logout
            </h2>
            <p className="conq-text-muted mt-3">
              End your current session on this device.
            </p>

            <form action="/api/auth/logout" method="post" style={{ marginTop: 20 }}>
              <button className="conq-btn conq-btn-dark">Logout</button>
            </form>
          </div>

          <div
            className="glow-card p-7"
            style={{
              marginTop: 24,
              border: "1px solid rgba(255,92,122,0.18)",
              boxShadow: "0 10px 40px rgba(255,92,122,0.08)",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                borderRadius: 9999,
                padding: "8px 12px",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: "#ff8ba0",
                border: "1px solid rgba(255,92,122,0.18)",
                background: "rgba(255,92,122,0.08)",
              }}
            >
              Danger zone
            </div>

            <h2 style={{ fontSize: 28, fontWeight: 800, marginTop: 18, color: "#fff2f4" }}>
              Delete account
            </h2>
            <p className="conq-text-muted mt-3">
              This disables your account and logs you out.
            </p>

            <form
              action="/api/settings/delete-account"
              method="post"
              style={{ marginTop: 20 }}
              onSubmit={(e) => {
                if (!confirm("Are you sure? This disables your account.")) {
                  e.preventDefault();
                }
              }}
            >
              <button
                className="conq-btn"
                style={{
                  background: "linear-gradient(135deg, #ff4f77, #ff244f)",
                  color: "white",
                  fontWeight: 700,
                  border: "1px solid rgba(255,92,122,0.22)",
                }}
              >
                Delete my account
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}