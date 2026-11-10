import { CopyButton } from "@avplatform/ui/buttons";
import { useCopyToClipboard } from "@avplatform/ui/hooks";
import { toast } from "@avplatform/ui/sonner";
import { TerminalIcon } from "@phosphor-icons/react";

const PLACEHOLDER_PATTERN = /(<[A-Z_]+>)/;

/** Copyable PowerShell snippet; `<PLACEHOLDER>` tokens are highlighted for the reader to replace. */
export const CommandBlock = ({ command }: { command: string }) => {
  const { isCopied, copy } = useCopyToClipboard({ successDuration: 1500 });

  const handleCopy = async () => {
    if (isCopied || (await copy(command))) return;
    toast.error("Couldn't copy. Select the command and copy it instead.");
  };
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-sunken">
      <div className="flex items-center justify-between border-b border-line py-1 pl-3 pr-1.5">
        <span className="flex items-center gap-1.5 text-hint text-muted-foreground">
          <TerminalIcon className="size-3.5" aria-hidden="true" />
          PowerShell
        </span>
        <CopyButton isCopied={isCopied} onClick={handleCopy} className="hover:bg-hover" />
      </div>
      <pre className="overflow-x-auto whitespace-pre-wrap break-all px-4 py-3 font-mono text-code text-ink">
        <code>
          {command.split(PLACEHOLDER_PATTERN).map((part, index) =>
            PLACEHOLDER_PATTERN.test(part) ? (
              <mark key={index} className="rounded-sm bg-warn/15 px-0.5 text-warn">
                {part}
              </mark>
            ) : (
              part
            ),
          )}
        </code>
      </pre>
    </div>
  );
};
