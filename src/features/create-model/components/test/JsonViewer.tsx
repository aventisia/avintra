import { ScrollArea, ScrollBar } from "@aventisia/ui/scroll";
import ReactJson from "react-json-view";

interface JsonViewerProps {
  jsonData: string;
}
const JsonViewer = ({ jsonData }: JsonViewerProps) => {
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
    <div className="border-dividers overflow-hidden rounded-lg border border-solid">
      <ScrollArea className="h-[calc(65vh)] w-full p-1">
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
