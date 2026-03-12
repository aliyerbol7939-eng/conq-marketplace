"use client";

import { useState } from "react";

export default function DownloadButton({
  listingId,
  isFree,
}: {
  listingId: string;
  isFree: boolean;
}) {
  const [msg, setMsg] = useState("");

  async function go() {
    setMsg("Preparing secure access...");

    const res = await fetch(`/api/download-token/${listingId}`, {
      method: "POST",
    });

    const data = await res.json();

    if (!res.ok) {
      setMsg(data.error || "Failed");
      return;
    }

    window.location.href = `/api/dl?t=${encodeURIComponent(data.token)}`;
  }

  return (
    <div style={{ marginTop: 24 }}>
      <button
        onClick={go}
        className="conq-btn conq-btn-primary"
        style={{
          width: "100%",
          justifyContent: "center",
          minHeight: 54,
          fontSize: 16,
          fontWeight: 800,
        }}
      >
        {isFree ? "Download free" : "Buy now"}
      </button>

      {msg ? (
        <div className="conq-text-muted" style={{ marginTop: 10, fontSize: 14 }}>
          {msg}
        </div>
      ) : null}
    </div>
  );
}