"use client";

import { useState } from "react";

export default function ReportButton({ listingId }: { listingId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("Copyright / stolen content");
  const [details, setDetails] = useState("");
  const [msg, setMsg] = useState("");

  async function submit() {
    setMsg("Sending...");
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
    setOpen(false);
    setDetails("");
  }

  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen(true)}
        className="text-sm text-red-600 hover:underline"
      >
        Report listing
      </button>

      {open && (
        <div className="mt-3 border rounded-2xl p-4 bg-white">
          <div className="font-semibold">Report</div>

          <select
            className="mt-3 w-full border rounded-xl p-2"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          >
            <option>Copyright / stolen content</option>
            <option>Malware / unsafe file</option>
            <option>Misleading description</option>
            <option>Hate / harassment</option>
            <option>Other</option>
          </select>

          <textarea
            className="mt-3 w-full border rounded-xl p-2"
            rows={3}
            placeholder="Details (optional)"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
          />

          <div className="flex gap-2 mt-3">
            <button
              onClick={submit}
              className="bg-black text-white px-4 py-2 rounded-xl"
            >
              Send
            </button>
            <button
              onClick={() => setOpen(false)}
              className="px-4 py-2 rounded-xl border"
            >
              Cancel
            </button>
          </div>

          {msg && <div className="text-sm text-gray-600 mt-2">{msg}</div>}
        </div>
      )}
    </div>
  );
}