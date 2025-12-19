import { Button } from "@aventisia/ui/buttons";
import { cn } from "@aventisia/ui/lib";
import { ScrollArea, ScrollBar } from "@aventisia/ui/scroll";
import { toast } from "@aventisia/ui/sonner";
import { CopyIcon } from "lucide-react";
import ReactJson from "react-json-view";

interface JsonViewerProps {
  jsonData: string;
  enableCopy?: boolean;
  className?: string;
}
export const JsonViewer = ({
  jsonData = "{}",
  enableCopy,
  className,
}: JsonViewerProps) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(jsonData, null, 2));
    toast.info("Copied to clipboard");
  };

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
    <ScrollArea className={cn("h-72 w-full p-1 pt-2", className)}>
      <div className="relative">
        {enableCopy && (
          <div className="absolute right-1 top-1 z-10">
            <Button
              variant={"outline"}
              size={"xs"}
              type="button"
              className="flex items-center gap-1 text-slate-600"
              onClick={() => handleCopy()}
            >
              <CopyIcon className="h-3 w-3" />
              Copy
            </Button>
          </div>
        )}
        <ReactJson
          style={{
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
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};
