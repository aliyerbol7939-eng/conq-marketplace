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
    setMsg("Preparing...");
    const res = await fetch(`/api/download-token/${listingId}`, { method: "POST" });
    const data = await res.json();

    if (!res.ok) {
      setMsg(data.error || "Failed");
      return;
    }

    window.location.href = `/api/dl?t=${encodeURIComponent(data.token)}`;
  }

  return (
    <div className="mt-6">
      <button
        onClick={go}
        className="w-full bg-black text-white py-3 rounded-xl"
      >
        {isFree ? "Download free" : "Buy now"}
      </button>
      {msg && <div className="text-sm text-gray-600 mt-2">{msg}</div>}
    </div>
  );
}