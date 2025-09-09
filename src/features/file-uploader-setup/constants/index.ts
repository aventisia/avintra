const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_FILE_TYPES = [
  // --- Documents ---
  "application/pdf", // PDF
  "application/msword", // DOC
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX
  "application/vnd.ms-excel", // XLS
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // XLSX
  "application/vnd.ms-powerpoint", // PPT
  "application/vnd.openxmlformats-officedocument.presentationml.presentation", // PPTX
  "application/rtf", // RTF
  "text/plain", // TXT
  "text/csv", // CSV
  "application/json", // JSON
  "application/xml", // XML
  "text/xml", // XML (alternative MIME type)
  "application/x-yaml", // YAML
  "text/yaml", // YAML (alternative)

  // --- OpenDocument Formats ---
  "application/vnd.oasis.opendocument.text", // ODT
  "application/vnd.oasis.opendocument.spreadsheet", // ODS
  "application/vnd.oasis.opendocument.presentation", // ODP

  // --- Images ---
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif", // GIF
  "image/svg+xml", // SVG

  // --- Audio ---
  "audio/mpeg", // MP3
  "audio/wav", // WAV
  "audio/ogg", // OGG / OGA
  "audio/aac", // AAC
  "audio/opus", // Opus
  "audio/webm", // WebM Audio

  // --- Archives ---
  "application/zip", // ZIP
  "application/x-tar", // TAR
  "application/x-7z-compressed", // 7z
  "application/x-rar-compressed", // RAR
  "application/gzip", // GZ

  // --- Code / Config Files ---
  "application/javascript", // JS
  "application/x-sh", // Shell scripts
  "text/x-python", // Python
  "text/x-java-source", // Java
  "text/x-csrc", // C
  "text/x-c++src", // C++
  "text/x-shellscript", // Shell script
  "text/markdown", // Markdown
];

export { MAX_FILE_SIZE, ALLOWED_FILE_TYPES };
