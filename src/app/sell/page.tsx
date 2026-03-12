"use client";

import { useState } from "react";

export default function SellPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [thumb, setThumb] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("Uploading...");

    const form = new FormData();
    form.append("title", title);
    form.append("description", description);
    form.append("price", String(price));
    if (file) form.append("file", file);
    if (thumb) form.append("thumbnail", thumb);
    if (video) form.append("video", video);

    const res = await fetch("/api/listings/create", {
      method: "POST",
      body: form,
    });

    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error || "Failed");
      return;
    }

    if (data.status === "PUBLISHED") {
      setMsg("✅ Listing published");
    } else if (data.status === "REVIEW_PENDING") {
      setMsg("🛡️ Listing sent to admin review");
    } else if (data.status === "REJECTED") {
      setMsg("⛔ Listing rejected by safety system");
    } else {
      setMsg("✅ Listing created");
    }
    setTitle("");
    setDescription("");
    setPrice(0);
    setFile(null);
    setThumb(null);
    setVideo(null);
  }

  return (
    <div className="page-shell grid-bg">
      <section className="conq-section">
        <div className="container-conq" style={{ maxWidth: 920 }}>
          <div className="glow-card p-8 md:p-10">
            <div className="conq-badge">Sell on Conq</div>
            <h1 className="conq-heading-lg mt-5">Publish a new digital product</h1>
            <p className="conq-text-muted mt-4" style={{ fontSize: 18 }}>
              Upload your file, add a thumbnail and preview video, then set your price.
            </p>
          </div>

          <form onSubmit={submit} className="glow-card p-8 md:p-10" style={{ marginTop: 24 }}>
            <div style={{ display: "grid", gap: 18 }}>
              <div>
                <label style={{ display: "block", marginBottom: 10, fontWeight: 700 }}>
                  Title
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Title"
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

              <div>
                <label style={{ display: "block", marginBottom: 10, fontWeight: 700 }}>
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  placeholder="Describe your file..."
                  style={{
                    width: "100%",
                    borderRadius: 16,
                    border: "1px solid rgba(127,255,212,0.08)",
                    background: "#0a1311",
                    color: "var(--foreground)",
                    padding: "14px 16px",
                    outline: "none",
                    resize: "vertical",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: 10, fontWeight: 700 }}>
                  Price
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  placeholder="0 = free"
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

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: 16,
                }}
              >
                <div className="glow-card p-5">
                  <div style={{ fontWeight: 700 }}>Main file</div>
                  <div className="conq-text-muted" style={{ marginTop: 6, fontSize: 14 }}>
                    The digital product buyers will receive.
                  </div>
                  <input
                    type="file"
                    required
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    style={{ marginTop: 16, width: "100%" }}
                  />
                  {file ? (
                    <div className="conq-text-muted" style={{ marginTop: 10, fontSize: 13 }}>
                      {file.name}
                    </div>
                  ) : null}
                </div>

                <div className="glow-card p-5">
                  <div style={{ fontWeight: 700 }}>Thumbnail</div>
                  <div className="conq-text-muted" style={{ marginTop: 6, fontSize: 14 }}>
                    Image shown on cards and product page.
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setThumb(e.target.files?.[0] || null)}
                    style={{ marginTop: 16, width: "100%" }}
                  />
                  {thumb ? (
                    <div className="conq-text-muted" style={{ marginTop: 10, fontSize: 13 }}>
                      {thumb.name}
                    </div>
                  ) : null}
                </div>

                <div className="glow-card p-5">
                  <div style={{ fontWeight: 700 }}>Preview video</div>
                  <div className="conq-text-muted" style={{ marginTop: 6, fontSize: 14 }}>
                    Optional demo for the listing page.
                  </div>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setVideo(e.target.files?.[0] || null)}
                    style={{ marginTop: 16, width: "100%" }}
                  />
                  {video ? (
                    <div className="conq-text-muted" style={{ marginTop: 10, fontSize: 13 }}>
                      {video.name}
                    </div>
                  ) : null}
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <button className="conq-btn conq-btn-primary">Publish listing</button>
                {msg ? <span className="conq-text-muted">{msg}</span> : null}
              </div>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}