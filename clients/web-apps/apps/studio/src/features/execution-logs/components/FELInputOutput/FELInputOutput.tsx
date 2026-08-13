import { JsonViewer } from "@/components/json-viewer/JsonViewer";

interface FELInputOutputProps {
  jsonData: string;
  title: string;
}
const FELInputOutput = ({ jsonData, title }: FELInputOutputProps) => {
  return (
    <div className="border-dividers overflow-hidden rounded-lg border border-solid">
      <div className="border-dividers flex items-center justify-center border-b border-solid">
        <div className="ml-2 flex-grow items-center justify-center">
          <span className="text-sm">{title}</span>
        </div>
      </div>
      <JsonViewer
        jsonData={jsonData}
        className="h-[15rem] w-[27rem] max-w-[27rem] p-1"
        enableClipboard
        wrapLongValues={false}
      />
    </div>
  );
};

export default FELInputOutput;
