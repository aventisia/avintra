import { Button } from "@aventisia/ui/buttons";
import { cn } from "@aventisia/ui/lib";
import { ScrollArea, ScrollBar } from "@aventisia/ui/scroll";
import { toast } from "@aventisia/ui/sonner";
import JsonView from "@uiw/react-json-view";
import { CopyIcon } from "lucide-react";

interface JsonViewerProps {
  jsonData: string;
  /** Add a copy button to copy complete json */
  enableCopy?: boolean;
  /** The user can copy objects and arrays to clipboard by clicking on the clipboard icon. */
  enableClipboard?: boolean;
  className?: string;
}

export const JsonViewer = ({
  jsonData = "{}",
  enableCopy,
  enableClipboard = false,
  className,
}: JsonViewerProps) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(parsed, null, 2));
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
    <ScrollArea className={cn("relative h-72 w-full p-1 pt-2", className)}>
      {enableCopy && (
        <div className="absolute right-2 top-2 z-10">
          <Button
            variant="outline"
            size="xs"
            type="button"
            className="flex items-center gap-1 text-slate-600"
            onClick={handleCopy}
          >
            <CopyIcon className="h-3 w-3" />
            Copy
          </Button>
        </div>
      )}

      <JsonView
        value={parsed}
        style={{
          padding: "0.5rem",
          fontSize: "0.75rem",
          fontFamily: "monospace",
        }}
        enableClipboard={enableClipboard}
        displayDataTypes={false}
        indentWidth={18}
        highlightUpdates={false}
      />

      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};
