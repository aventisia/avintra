import { cn } from "@aventisia/ui/lib";

import { JsonViewer } from "@/components/json-viewer/JsonViewer";

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
        <span className="rounded-full bg-indigo-100 px-1.5 py-1 text-xs font-medium text-indigo-600">
          {label}
        </span>
      </div>

      {/* JsonViewer */}
      <JsonViewer jsonData={jsonData} enableClipboard className="h-[34vh]" />
    </div>
  );
};

export default STJsonViewer;
