import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

export async function saveUploadToDisk(
  file: File,
  folder: "files" | "thumbs" | "videos"
) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const ext = path.extname(file.name || "");
  const fileName = `${crypto.randomBytes(16).toString("hex")}${ext}`;

  const uploadDir = path.join(process.cwd(), "uploads", folder);
  await fs.mkdir(uploadDir, { recursive: true });

  const absPath = path.join(uploadDir, fileName);
  await fs.writeFile(absPath, buffer);

  return {
    fileName,
    absPath,
    urlPath: `/uploads/${folder}/${fileName}`,
    originalName: file.name,
    sizeBytes: buffer.length,
  };
}