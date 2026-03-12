"use client";

import { useState } from "react";

export default function ReportButton({ listingId }: { listingId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("Copyright / stolen content");
  const [details, setDetails] = useState("");
  const [msg, setMsg] = useState("");

  async function submit() {
    setMsg("Sending report...");

    const res = await fetch("/api/reports/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId, reason, details }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMsg(data.error || "Failed");
      return;
    }

    setMsg("✅ Report sent");
    setDetails("");
    setOpen(false);
  }

  return (
    <div style={{ marginTop: 14 }}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="conq-btn conq-btn-dark"
        style={{ width: "100%", justifyContent: "center" }}
      >
        Report listing
      </button>

      {open ? (
        <div className="glow-card p-4" style={{ marginTop: 14 }}>
          <div style={{ fontWeight: 800, fontSize: 18 }}>Report this listing</div>

          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            style={{
              width: "100%",
              marginTop: 14,
              borderRadius: 16,
              border: "1px solid rgba(127,255,212,0.08)",
              background: "#0a1311",
              color: "var(--foreground)",
              padding: "14px 16px",
              outline: "none",
            }}
          >
            <option>Copyright / stolen content</option>
            <option>Malware / unsafe file</option>
            <option>Misleading description</option>
            <option>Hate / harassment</option>
            <option>Other</option>
          </select>

          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={4}
            placeholder="Details (optional)"
            style={{
              width: "100%",
              marginTop: 14,
              borderRadius: 16,
              border: "1px solid rgba(127,255,212,0.08)",
              background: "#0a1311",
              color: "var(--foreground)",
              padding: "14px 16px",
              outline: "none",
              resize: "vertical",
            }}
          />

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
            <button onClick={submit} className="conq-btn conq-btn-primary">
              Send report
            </button>

            <button
              onClick={() => setOpen(false)}
              className="conq-btn conq-btn-dark"
              type="button"
            >
              Cancel
            </button>
          </div>

          {msg ? (
            <div className="conq-text-muted" style={{ marginTop: 12 }}>
              {msg}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}