"use client";

import { useState } from "react";


import { useRouter } from "next/navigation";export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Login failed");
      return;
    }

    window.location.href = "/dashboard";
  }

  return (
    <div className="page-shell grid-bg">
      <section className="conq-section">
        <div className="container-conq" style={{ maxWidth: 620 }}>
          <div className="glow-card p-8 md:p-10" style={{ position: "relative", overflow: "hidden" }}>
            <div
              style={{
                position: "absolute",
                right: -80,
                top: -80,
                width: 240,
                height: 240,
                borderRadius: 9999,
                background: "radial-gradient(circle, rgba(127,255,212,0.16), transparent 70%)",
                pointerEvents: "none",
              }}
            />

            <div className="conq-badge">Welcome back</div>
            <h1 className="conq-heading-lg mt-5">Login to Conq</h1>
            <p className="conq-text-muted mt-4" style={{ fontSize: 18 }}>
              Access your dashboard, listings, downloads, and account settings.
            </p>

            <form onSubmit={handleSubmit} style={{ marginTop: 28 }}>
              <div style={{ display: "grid", gap: 14 }}>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

              {error ? (
                <div
                  style={{
                    marginTop: 14,
                    borderRadius: 14,
                    padding: "12px 14px",
                    background: "rgba(255,92,122,0.1)",
                    border: "1px solid rgba(255,92,122,0.18)",
                    color: "#ff9aae",
                  }}
                >
                  {error}
                </div>
              ) : null}

              <div style={{ marginTop: 18, display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button className="conq-btn conq-btn-primary" disabled={loading}>
                  {loading ? "Logging in..." : "Login"}
                </button>
              </div>
            </form>

            <div className="conq-text-muted" style={{ marginTop: 22 }}>
              No account yet?{" "}
              <a href="/signup" style={{ color: "var(--brand)", fontWeight: 700 }}>
                Sign up
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}