import fs from "fs/promises";
import crypto from "crypto";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";
import { prisma } from "@/lib/prisma";

const execFileAsync = promisify(execFile);

export type ModerationDecision = "ALLOW" | "REVIEW" | "REJECT";

export type ModerationResult = {
  decision: ModerationDecision;
  reasons: string[];
  avStatus: "CLEAN" | "INFECTED" | "UNAVAILABLE" | "SKIPPED";
  fileSha256?: string;
  thumbSha256?: string;
};

const BLOCKED_WORDS = [
  "nude",
  "porn",
  "sex",
  "rape",
  "terrorist",
  "kill",
  "murder",
  "drugs",
  "cocaine",
  "meth",
  "heroin",
  "scam",
  "malware",
  "virus",
  "trojan",
  "ransomware",
  "stolen account",
  "cracked",
  "pirated",
  "leak",
  "doxx",
];

const HARD_BLOCKED_EXTENSIONS = [
  ".exe",
  ".msi",
  ".bat",
  ".cmd",
  ".scr",
  ".com",
  ".pif",
  ".vbs",
  ".js",
  ".jar",
  ".ps1",
  ".sh",
  ".apk",
  ".dll",
  ".sys",
  ".reg",
];

const REVIEW_EXTENSIONS = [
  ".zip",
  ".rar",
  ".7z",
  ".iso",
  ".bin",
  ".dmg",
  ".pkg",
  ".docm",
  ".xlsm",
  ".pptm",
];

function normalizeText(input: string) {
  return input.toLowerCase().replace(/\s+/g, " ").trim();
}

function containsBlockedWords(text: string) {
  const normalized = normalizeText(text);
  return BLOCKED_WORDS.filter((w) => normalized.includes(w));
}

function extOf(filename: string) {
  return path.extname(filename || "").toLowerCase();
}

async function sha256File(filePath: string) {
  const buf = await fs.readFile(filePath);
  return crypto.createHash("sha256").update(buf).digest("hex");
}

function decideFromReasons(reasons: string[]): ModerationDecision {
  const hardRejectSignals = [
    "Blocked title word",
    "Blocked description word",
    "Blocked file extension",
    "Virus detected",
    "Thumbnail looks suspicious",
  ];

  if (reasons.some((r) => hardRejectSignals.some((s) => r.includes(s)))) {
    return "REJECT";
  }

  if (reasons.length > 0) {
    return "REVIEW";
  }

  return "ALLOW";
}

/**
 * Real AV scan if clamdscan exists.
 * If unavailable, returns UNAVAILABLE instead of pretending the file is clean.
 */
async function runVirusScan(filePath: string): Promise<{
  status: "CLEAN" | "INFECTED" | "UNAVAILABLE";
  reason?: string;
}> {
  try {
    const { stdout, stderr } = await execFileAsync("clamdscan", [
      "--no-summary",
      filePath,
    ]);

    const text = `${stdout}\n${stderr}`.toUpperCase();

    if (text.includes("FOUND")) {
      return { status: "INFECTED", reason: "Virus detected by ClamAV" };
    }

    return { status: "CLEAN" };
  } catch {
    return { status: "UNAVAILABLE", reason: "ClamAV unavailable" };
  }
}

/**
 * This is NOT true image AI moderation yet.
 * It does practical thumbnail checks now.
 * Later you can plug in a real image moderation API here.
 */
async function scanThumbnailSafety(
  thumbPath: string | null,
  thumbOriginalName: string | null
): Promise<{ reasons: string[]; thumbSha256?: string }> {
  if (!thumbPath || !thumbOriginalName) return { reasons: [] };

  const reasons: string[] = [];
  const thumbExt = extOf(thumbOriginalName);
  const allowedImageExts = [".png", ".jpg", ".jpeg", ".webp"];

  if (!allowedImageExts.includes(thumbExt)) {
    reasons.push(`Thumbnail looks suspicious: unsupported extension ${thumbExt}`);
  }

  const badWords = containsBlockedWords(thumbOriginalName);
  for (const word of badWords) {
    reasons.push(`Thumbnail looks suspicious: blocked word "${word}" in image name`);
  }

  const thumbSha256 = await sha256File(thumbPath);

  const dup = await prisma.listing.findFirst({
    where: { thumbSha256 },
    select: { id: true },
  });

  if (dup) {
    reasons.push("Thumbnail duplicate detected");
  }

  return { reasons, thumbSha256 };
}

export async function moderateListingInput(args: {
  title: string;
  description: string;
  originalFileName: string;
  filePath: string;
  thumbPath?: string | null;
  thumbOriginalName?: string | null;
}) : Promise<ModerationResult> {
  const reasons: string[] = [];

  const titleBad = containsBlockedWords(args.title);
  for (const word of titleBad) {
    reasons.push(`Blocked title word: "${word}"`);
  }

  const descriptionBad = containsBlockedWords(args.description);
  for (const word of descriptionBad) {
    reasons.push(`Blocked description word: "${word}"`);
  }

  const fileExt = extOf(args.originalFileName);

  if (HARD_BLOCKED_EXTENSIONS.includes(fileExt)) {
    reasons.push(`Blocked file extension: ${fileExt}`);
  } else if (REVIEW_EXTENSIONS.includes(fileExt)) {
    reasons.push(`Suspicious file extension: ${fileExt}`);
  }

  const fileSha256 = await sha256File(args.filePath);

  const duplicateFile = await prisma.listing.findFirst({
    where: { fileSha256 },
    select: { id: true },
  });

  if (duplicateFile) {
    reasons.push("Duplicate file detected");
  }

  const av = await runVirusScan(args.filePath);
  if (av.status === "INFECTED") {
    reasons.push("Virus detected");
  } else if (av.status === "UNAVAILABLE") {
    reasons.push("Virus scanner unavailable; send to admin review");
  }

  const thumbScan = await scanThumbnailSafety(
    args.thumbPath || null,
    args.thumbOriginalName || null
  );

  reasons.push(...thumbScan.reasons);

  const decision = decideFromReasons(reasons);

  return {
    decision,
    reasons,
    avStatus: av.status,
    fileSha256,
    thumbSha256: thumbScan.thumbSha256,
  };
}