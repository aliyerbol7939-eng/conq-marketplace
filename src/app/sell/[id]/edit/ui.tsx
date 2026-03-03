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
    <form onSubmit={submit} className="space-y-4">
      <input
        className="w-full border p-3 rounded"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        required
      />

      <textarea
        className="w-full border p-3 rounded"
        rows={4}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
      />

      <input
        className="w-full border p-3 rounded"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        placeholder="Price (0 = free)"
      />

      <div className="text-sm text-gray-600">
        Current thumbnail:{" "}
        {props.initialThumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={props.initialThumb}
            alt="thumb"
            className="mt-2 w-48 rounded-xl border"
          />
        ) : (
          "none"
        )}
      </div>

      <div>
        <label className="text-sm">Replace thumbnail</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setThumb(e.target.files?.[0] || null)}
        />
      </div>

      <div className="text-sm text-gray-600">
        Current video: {props.initialVideo ? "yes" : "none"}
      </div>

      <div>
        <label className="text-sm">Replace preview video</label>
        <input
          type="file"
          accept="video/*"
          onChange={(e) => setVideo(e.target.files?.[0] || null)}
        />
      </div>

      <button className="bg-black text-white px-5 py-3 rounded-xl">
        Save changes
      </button>

      {msg && <div className="text-sm">{msg}</div>}
    </form>
  );
}