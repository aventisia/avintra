import { JsonViewer } from "@avplatform/ui/json-viewer";

interface FELInputOutputProps {
  jsonData: string;
  title: string;
}
const FELInputOutput = ({ jsonData, title }: FELInputOutputProps) => {
  return (
    <div className="overflow-hidden rounded-md border border-line bg-surface">
      <div className="flex h-8 items-center border-b border-line px-3">
        <span className="text-label uppercase text-muted-foreground">{title}</span>
      </div>
      <JsonViewer
        jsonData={jsonData}
        enableValueClipboard
        wrapLongValues={false}
        parseNestedStrings
        className="h-[15rem] w-[27rem] max-w-[27rem] bg-sunken p-1 px-2 font-mono text-code"
      />
    </div>
  );
};

export default FELInputOutput;
