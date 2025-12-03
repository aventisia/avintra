import { ScrollArea, ScrollBar } from "@aventisia/ui/scroll";
import ReactJson from "react-json-view";

interface JsonViewerProps {
  jsonData: string;
  title: string;
}
const JsonViewer = ({ jsonData, title }: JsonViewerProps) => {
  const safeParse = (str: string, fallback = {}) => {
    try {
      const parsedJson = JSON.parse(str);
      // Additionally parse any stringified JSON within the object
      Object.keys(parsedJson).forEach((key) => {
        if (
          typeof parsedJson[key] === "string" &&
          (parsedJson[key].trim().startsWith("{") ||
            parsedJson[key].trim().startsWith("["))
        ) {
          try {
            parsedJson[key] = JSON.parse(parsedJson[key]);
          } catch {
            // leave as string if not valid JSON
          }
        }
      });
      return parsedJson;
    } catch {
      return fallback;
    }
  };

  // Usage
  const parsed = safeParse(jsonData);

  return (
    <div className="border-dividers overflow-hidden rounded-lg m-2 border border-solid">
      <div className="border-dividers flex items-center justify-center border-b border-solid">
        <div className="ml-2 flex-grow items-center justify-center">
          <span className="text-sm">{title}</span>
        </div>
      </div>
      <ScrollArea className="h-[calc(70vh)] w-full p-1">
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
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default JsonViewer;
