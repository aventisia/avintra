import FileDeleteButton from "./FileDeleteButton";
import FileViewerSelect from "./FileViewerSelect";

interface FileViewerHeaderProps {
  children?: React.ReactNode;
}

export default function FileViewerHeader({ children }: FileViewerHeaderProps) {
  return (
    <div className="p-3 flex justify-between items-center h-16 border-b">
      <FileViewerSelect />
      {children}
      <FileDeleteButton />
    </div>
  );
}
