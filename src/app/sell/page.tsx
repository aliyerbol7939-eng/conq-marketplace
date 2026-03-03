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

    setMsg("✅ Listing created");
    setTitle("");
    setDescription("");
    setPrice(0);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow">
        <h1 className="text-2xl font-bold mb-6">Create listing</h1>

        <form onSubmit={submit} className="space-y-4">
          <input
            placeholder="Title"
            className="w-full border p-3 rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <textarea
            placeholder="Description"
            className="w-full border p-3 rounded"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <input
            type="number"
            placeholder="Price (0 = free)"
            className="w-full border p-3 rounded"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
          />

          <div>
            <label className="text-sm">File to sell</label>
            <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} required />
          </div>

          <div>
            <label className="text-sm">Thumbnail image</label>
            <input type="file" accept="image/*" onChange={(e) => setThumb(e.target.files?.[0] || null)} />
          </div>

          <div>
            <label className="text-sm">Preview video (optional)</label>
            <input type="file" accept="video/*" onChange={(e) => setVideo(e.target.files?.[0] || null)} />
          </div>

          <button className="bg-black text-white px-5 py-3 rounded-xl">
            Publish listing
          </button>

          {msg && <div className="text-sm">{msg}</div>}
        </form>
      </div>
    </div>
  );
}