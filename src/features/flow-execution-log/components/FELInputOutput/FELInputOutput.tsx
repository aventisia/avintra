import { Button } from "@aventisia/ui/buttons";
import { ScrollArea } from "@aventisia/ui/scroll";
import { Copy, Download } from "lucide-react";
import ReactJson from "react-json-view";
import { useFlowExecutionActions } from "../../hooks/useFlowExecutionActions";

interface FELInputOutputProps {
  jsonData: string;
  title: string;
}
const FELInputOutput = ({ jsonData, title }: FELInputOutputProps) => {
  const { handleCopy, handleDownload } = useFlowExecutionActions({
    jsonData,
    title,
  });
  const safeParse = (str:string, fallback = {}) => {
    try {
      return JSON.parse(str);
    } catch {
      return fallback;
    }
  };
  
  // Usage
  const parsed = safeParse(jsonData);

  return (
    <div className="border-dividers overflow-hidden rounded-lg border border-solid">
      <div className="border-dividers flex items-center justify-center border-b border-solid px-3 py-2">
        <div className="flex-grow items-center justify-center">
          <span className="text-md">{title}</span>
        </div>
        <div className="flex items-center gap-0">
          <Button
            variant={"ghost"}
            size={"sm"}
            onClick={() => handleDownload()}
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button variant={"ghost"} size={"sm"} onClick={() => handleCopy()}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <ScrollArea className="h-[37vh] w-full p-3">
        <ReactJson
          style={{
            // overflowX: "auto",
            padding: "0.5rem",
            fontSize: "0.7rem",
          }}
          enableClipboard={false}
          groupArraysAfterLength={20}
          displayDataTypes={false}
          name={false}
          quotesOnKeys={false}
          src={parsed}
        />
      </ScrollArea>
    </div>
  );
};

export default FELInputOutput;
