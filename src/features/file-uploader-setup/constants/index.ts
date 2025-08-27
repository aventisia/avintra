const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const ALLOWED_FILE_TYPES = [
  // Documents
  "application/pdf",

  // Images
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",

  // Audio
  "audio/mpeg", // MP3
  "audio/wav", // WAV
  "audio/ogg", // OGG / OGA
  "audio/aac", // AAC
  "audio/opus", // Opus
];

export { MAX_FILE_SIZE, ALLOWED_FILE_TYPES };
