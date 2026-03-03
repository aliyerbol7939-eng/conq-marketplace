import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

function getContentType(filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (!ext) return "application/octet-stream";

  const map: Record<string, string> = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
    gif: "image/gif",
    mp4: "video/mp4",
    webm: "video/webm",
    mov: "video/quicktime",
  };

  return map[ext] || "application/octet-stream";
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ path: string[] }> }
) {
  const { path: p } = await ctx.params; // ✅ FIX: await params
  const parts = p || [];

  const folder = parts[0];
  const filename = parts[1];

  // Only allow public media folders
  if (!folder || !filename || !["thumbs", "videos"].includes(folder)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Prevent path traversal
  if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const fullPath = path.join(process.cwd(), "uploads", folder, filename);

  try {
    const data = await fs.readFile(fullPath);
    return new NextResponse(data, {
      headers: {
        "Content-Type": getContentType(filename),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}