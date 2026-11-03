import {
  FileAudioIcon,
  FileCodeIcon,
  FileIcon,
  FileImageIcon,
  FileTextIcon,
  FileVideoIcon,
  FileXlsIcon,
  FileZipIcon,
} from "@phosphor-icons/react";

interface FileTypeIconProps {
  fileType: string;
  className?: string;
}

const extensionIconMap: Record<string, React.ElementType> = {
  pdf: FileTextIcon,
  doc: FileTextIcon,
  docx: FileTextIcon,
  txt: FileTextIcon,

  xls: FileXlsIcon,
  xlsx: FileXlsIcon,
  csv: FileXlsIcon,

  png: FileImageIcon,
  jpg: FileImageIcon,
  jpeg: FileImageIcon,
  gif: FileImageIcon,
  svg: FileImageIcon,

  zip: FileZipIcon,
  rar: FileZipIcon,
  tar: FileZipIcon,
  gz: FileZipIcon,

  js: FileCodeIcon,
  ts: FileCodeIcon,
  jsx: FileCodeIcon,
  tsx: FileCodeIcon,
  html: FileCodeIcon,
  css: FileCodeIcon,
  json: FileCodeIcon,

  mp3: FileAudioIcon,
  wav: FileAudioIcon,
  ogg: FileAudioIcon,

  mp4: FileVideoIcon,
  mov: FileVideoIcon,
  avi: FileVideoIcon,
};

export const FileTypeIcon: React.FC<FileTypeIconProps> = ({
  fileType,
  className = "h-7 w-7 text-muted-foreground stroke-1",
}) => {
  const ext = fileType?.toLowerCase() || "";
  const Icon = extensionIconMap[ext] || FileIcon; // fallback icon

  return <Icon className={className} />;
};
