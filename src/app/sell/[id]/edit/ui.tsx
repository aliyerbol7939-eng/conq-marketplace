"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EditListingForm(props: {
  listingId: string;
  initialTitle: string;
  initialDescription: string;
  initialPrice: string;
  initialThumb: string;
  initialVideo: string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(props.initialTitle);
  const [description, setDescription] = useState(props.initialDescription);
  const [price, setPrice] = useState(props.initialPrice);
  const [thumb, setThumb] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("Saving...");

    const form = new FormData();
    form.append("title", title);
    form.append("description", description);
    form.append("price", price);
    if (thumb) form.append("thumbnail", thumb);
    if (video) form.append("video", video);

    const res = await fetch(`/api/listings/update/${props.listingId}`, {
      method: "POST",
      body: form,
    });

    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error || "Failed");
      return;
    }

    setMsg("✅ Saved");
    router.refresh();
  }

  return (
    <form onSubmit={submit}>
      <div style={{ display: "grid", gap: 18 }}>
        <div>
          <label style={{ display: "block", marginBottom: 10, fontWeight: 700 }}>
            Title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
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
            value={price}
            onChange={(e) => setPrice(e.target.value)}
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
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
          }}
        >
          <div className="glow-card p-5">
            <div style={{ fontWeight: 700 }}>Current thumbnail</div>
            {props.initialThumb ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={props.initialThumb}
                alt="thumb"
                style={{
                  marginTop: 14,
                  width: "100%",
                  maxWidth: 260,
                  borderRadius: 18,
                  border: "1px solid rgba(127,255,212,0.08)",
                }}
              />
            ) : (
              <div className="conq-text-muted" style={{ marginTop: 12 }}>
                None
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setThumb(e.target.files?.[0] || null)}
              style={{ marginTop: 16, width: "100%" }}
            />
          </div>

          <div className="glow-card p-5">
            <div style={{ fontWeight: 700 }}>Preview video</div>
            <div className="conq-text-muted" style={{ marginTop: 10 }}>
              {props.initialVideo ? "Current preview exists" : "No preview video"}
            </div>

            <input
              type="file"
              accept="video/*"
              onChange={(e) => setVideo(e.target.files?.[0] || null)}
              style={{ marginTop: 16, width: "100%" }}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <button className="conq-btn conq-btn-primary">Save changes</button>
          {msg ? <span className="conq-text-muted">{msg}</span> : null}
        </div>
      </div>
    </form>
  );
}