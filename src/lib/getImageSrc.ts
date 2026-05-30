// src/lib/getImageSrc.ts

export function getImageSrc(relPath?: string): string {
  if (!relPath) {
    return "/placeholder.svg";
  }
  // If it already starts with "http://..." or "https://...", return it:
  if (/^https?:\/\//.test(relPath)) {
    return relPath;
  }
  // Otherwise, assume this is a plain filename or "/<filename>" that lives under your /uploads route:
  const clean = relPath.startsWith("/") ? relPath : `/${relPath}`;
  // Prepend your backend’s base URL, then "/uploads"
  const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5001";
  return `${base}/uploads${clean}`;
}
