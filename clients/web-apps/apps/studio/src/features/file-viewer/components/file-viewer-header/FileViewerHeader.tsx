import FileDeleteButton from "./FileDeleteButton";
import FileViewerSelect from "./FileViewerSelect";

interface FileViewerHeaderProps {
  /** The type-specific control panel to render in the center slot */
  controlPanel?: React.ReactNode;
  pageControl?: React.ReactNode;
}

const FileViewerHeader = ({ controlPanel, pageControl }: FileViewerHeaderProps) => (
  <header className="flex h-16 shrink-0 items-center justify-between border-b px-4 gap-4">
    {/* Left slot: file selector */}
    <div className="flex  items-center min-w-0">
      <FileViewerSelect />
    </div>

    {/* Center slot: viewer-specific controls */}
    {pageControl && <div className="flex  items-center justify-center shrink-0">{pageControl}</div>}

    {/* Right slot: file actions */}
    <div className="flex  items-center justify-center shrink-0">
      {controlPanel && (
        <div className="flex  items-center justify-center shrink-0">{controlPanel}</div>
      )}

      <FileDeleteButton />
    </div>
  </header>
);

export default FileViewerHeader;
