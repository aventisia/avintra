import { Button } from "@aventisia/ui/buttons";
import { ScrollArea } from "@aventisia/ui/scroll";
import { Copy } from "lucide-react";
import ReactJson from "react-json-view";
import { useFlowExecutionActions } from "../../hooks/useFlowExecutionActions";

interface FELInputOutputProps {
  jsonData: string;
  title: string;
}
const FELInputOutput = ({ jsonData, title }: FELInputOutputProps) => {
  const { handleCopy } = useFlowExecutionActions({
    jsonData,
    title,
  });

  const safeParse = (str: string, fallback = {}) => {
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
      <div className="border-dividers flex items-center justify-center border-b border-solid">
        <div className="ml-2 flex-grow items-center justify-center">
          <span className="text-sm">{title}</span>
        </div>
        <div className="flex items-center px-0.5">
          {/* <Button
            variant={"ghost"}
            size={"icon6"}
            onClick={() => handleDownload()}
          >
            <Download className="h-3 w-3" />
          </Button> */}
          <Button variant={"ghost"} size={"icon6"} onClick={() => handleCopy()}>
            <Copy className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <ScrollArea className="h-[40.5vh] w-full p-1">
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
