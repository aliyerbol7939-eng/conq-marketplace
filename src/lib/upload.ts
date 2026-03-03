import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

export async function saveUploadToDisk(file: File, folder: string) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const ext = path.extname(file.name) || "";
  const safeName = crypto.randomBytes(16).toString("hex") + ext;

  const uploadDir = path.join(process.cwd(), "uploads", folder);
  await fs.mkdir(uploadDir, { recursive: true });

  const fullPath = path.join(uploadDir, safeName);
  await fs.writeFile(fullPath, buffer);

  // URL we’ll serve later (Step 9)
  const urlPath = `/uploads/${folder}/${safeName}`;

  return {
    urlPath,
    originalName: file.name,
    sizeBytes: buffer.length,
  };
}