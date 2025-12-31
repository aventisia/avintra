import { AllowedFileType } from "../types";

export const ALLOWED_FILE_TYPES: AllowedFileType[] = [
  {
    category: "documents",
    extensions: [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
      "application/msword",
      "application/vnd.oasis.opendocument.text",
      "text/markdown",
      "text/plain",
    ],
    maxSizeMB: 20,
  },
  {
    category: "audio",
    extensions: [
      "audio/mpeg",
      "audio/aac",
      "audio/wav",
      "audio/ogg",
      "audio/opus",
    ],
    maxSizeMB: 50,
  },
  {
    category: "images",
    extensions: [
      "image/jpeg",
      "image/png",
      "image/bmp",
      "image/tiff",
      "image/webp",
    ],
    maxSizeMB: 50,
  },
  {
    category: "videos",
    extensions: ["video/avi", "video/mp4", "video/mpeg", "video/webm"],
    maxSizeMB: 100,
  },
];
