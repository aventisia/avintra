import {
  FileText,
  FileImage,
  FileSpreadsheet,
  FileArchive,
  FileCode,
  FileAudio,
  FileVideo,
  FileJson,
  File,
} from "lucide-react";

interface FileTypeIconProps {
  fileType: string;
  className?: string;
}

const extensionIconMap: Record<string, React.ElementType> = {
  pdf: FileText,
  doc: FileText,
  docx: FileText,
  txt: FileText,

  xls: FileSpreadsheet,
  xlsx: FileSpreadsheet,
  csv: FileSpreadsheet,

  png: FileImage,
  jpg: FileImage,
  jpeg: FileImage,
  gif: FileImage,
  svg: FileImage,

  zip: FileArchive,
  rar: FileArchive,
  tar: FileArchive,
  gz: FileArchive,

  js: FileCode,
  ts: FileCode,
  jsx: FileCode,
  tsx: FileCode,
  html: FileCode,
  css: FileCode,
  json: FileJson,

  mp3: FileAudio,
  wav: FileAudio,
  ogg: FileAudio,

  mp4: FileVideo,
  mov: FileVideo,
  avi: FileVideo,
};

export const FileTypeIcon: React.FC<FileTypeIconProps> = ({
  fileType,
  className = "h-7 w-7 text-muted-foreground stroke-1",
}) => {
  const ext = fileType?.toLowerCase() || "";
  const Icon = extensionIconMap[ext] || File; // fallback icon

  return <Icon className={className} />;
};
