
export const MAX_EXPIRY = 300; // 5 minutes
export const MAX_PARTS = 10000;
export const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024 * 1024; // 5TB
export const MULTIPART_THRESHOLD = 20 * 1024 * 1024; // 20 MB → switch to multipart
export const MIN_PART_SIZE = 10 * 1024 * 1024; // 10 MB per part
export const ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "video/mp4",
  "application/pdf",
];