export const FILE_TYPE = {
  PDF: "pdf",
  IMAGE: "image",
  UNSUPPORTED: "unsupported",
} as const;

export type FileType = (typeof FILE_TYPE)[keyof typeof FILE_TYPE];

const IMAGE_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "svg",
  "bmp",
  "avif",
  "ico",
  "tiff",
  "tif",
]);

const PDF_EXTENSIONS = new Set(["pdf"]);

// Extend this map as new viewer types are supported
const EXTENSION_TYPE_MAP: Record<string, FileType> = {};

IMAGE_EXTENSIONS.forEach((ext) => {
  EXTENSION_TYPE_MAP[ext] = FILE_TYPE.IMAGE;
});
PDF_EXTENSIONS.forEach((ext) => {
  EXTENSION_TYPE_MAP[ext] = FILE_TYPE.PDF;
});

export function getFileType(extension: string): FileType {
  const ext = extension.toLowerCase().replace(/^\./, "");
  return EXTENSION_TYPE_MAP[ext] ?? FILE_TYPE.UNSUPPORTED;
}

export function isPdf(extension: string) {
  return getFileType(extension) === FILE_TYPE.PDF;
}

export function isImage(extension: string) {
  return getFileType(extension) === FILE_TYPE.IMAGE;
}

/** Human-readable label for a file type, used in UI messaging */
export const FILE_TYPE_LABEL: Record<FileType, string> = {
  [FILE_TYPE.PDF]: "PDF",
  [FILE_TYPE.IMAGE]: "Image",
  [FILE_TYPE.UNSUPPORTED]: "Unsupported",
};
