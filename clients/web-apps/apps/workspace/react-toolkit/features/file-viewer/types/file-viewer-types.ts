export const FILE_TYPE = {
  PDF: "pdf",
  IMAGE: "image",
  DOCX: "docx",
  XLSX: "xlsx",
  EML: "eml",
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

const DOCX_EXTENSIONS = new Set(["docx", "doc"]);

const XLSX_EXTENSIONS = new Set(["xlsx", "xls", "csv"]);

const EML_EXTENSIONS = new Set(["eml"]);

// Extend this map as new viewer types are supported
const EXTENSION_TYPE_MAP: Record<string, FileType> = {};

IMAGE_EXTENSIONS.forEach((ext) => {
  EXTENSION_TYPE_MAP[ext] = FILE_TYPE.IMAGE;
});
PDF_EXTENSIONS.forEach((ext) => {
  EXTENSION_TYPE_MAP[ext] = FILE_TYPE.PDF;
});
DOCX_EXTENSIONS.forEach((ext) => {
  EXTENSION_TYPE_MAP[ext] = FILE_TYPE.DOCX;
});
XLSX_EXTENSIONS.forEach((ext) => {
  EXTENSION_TYPE_MAP[ext] = FILE_TYPE.XLSX;
});
EML_EXTENSIONS.forEach((ext) => {
  EXTENSION_TYPE_MAP[ext] = FILE_TYPE.EML;
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
  [FILE_TYPE.DOCX]: "Word Document",
  [FILE_TYPE.XLSX]: "Spreadsheet",
  [FILE_TYPE.EML]: "Email",
  [FILE_TYPE.UNSUPPORTED]: "Unsupported",
};
