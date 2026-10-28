import { JsonViewer } from "@avplatform/ui/json-viewer";
import { cn } from "@avplatform/ui/lib";

interface STJsonViewerProps {
  jsonData: string;
  label: string;
  className?: string;
}
const STJsonViewer = ({ label, jsonData, className }: STJsonViewerProps) => {
  return (
    <div className={cn("relative rounded-lg border", className)}>
      {/* Label*/}
      <div className="absolute -top-3 left-2.5">
        <span className="rounded-full bg-fill px-1.5 py-1 text-xs font-medium text-ink-2">
          {label}
        </span>
      </div>

      {/* JsonViewer */}
      <JsonViewer jsonData={jsonData} enableValueClipboard className="h-[34vh]" />
    </div>
  );
};

export default STJsonViewer;
