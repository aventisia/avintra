import { Check, Copy } from "lucide-react";
import { useState } from "react";

/**
 * Cell component for displaying the file name with copy-to-clipboard functionality.
 * Displays the file name and a copy icon that appears on hover. When the copy icon is clicked,
 * the file name is copied to the clipboard and a "Copied!" tooltip is shown temporarily.
 * @param fileName - The name of the file to display and copy.
 * @returns A JSX element representing the file name cell.
 */
export function FileNameCell({ fileName }: { fileName: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(fileName).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    });
  };

  return (
    <div className="group flex items-center gap-1">
      <div title={fileName} className="w-auto max-w-52 truncate font-medium">
        {fileName}
      </div>
      <button
        onClick={handleCopy}
        className="invisible shrink-0 rounded p-0.5 text-muted-foreground opacity-0 transition-opacity group-hover:visible group-hover:opacity-100 hover:text-foreground"
        title={copied ? "Copied!" : "Copy file name"}
      >
        {copied ? <Check className="h-3.5 w-3.5 text-ok" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}
