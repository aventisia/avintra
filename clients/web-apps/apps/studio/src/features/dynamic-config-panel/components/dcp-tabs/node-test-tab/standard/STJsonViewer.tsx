import { JsonViewer, createCopyJsonAction } from "@avplatform/ui/json-viewer";
import { cn } from "@avplatform/ui/lib";
import { BracketsCurlyIcon } from "@phosphor-icons/react";
import { useMemo } from "react";

import JsonViewerSkeleton from "@/components/json-viewer/JsonViewerSkeleton";

interface STJsonViewerProps {
  jsonData: string | undefined;
  label: string;
  isPending?: boolean;
  viewportClassName?: string;
  className?: string;
}

const parseJson = (jsonData: string | undefined): unknown => {
  try {
    return jsonData ? JSON.parse(jsonData) : undefined;
  } catch {
    return undefined;
  }
};

const countEntries = (value: unknown): number => {
  if (value === null || value === undefined) return 0;
  if (Array.isArray(value)) return value.length;
  if (typeof value === "object") return Object.keys(value).length;
  return 1;
};

const STJsonViewer = ({
  label,
  jsonData,
  isPending = false,
  viewportClassName = "max-h-[34vh]",
  className,
}: STJsonViewerProps) => {
  const parsed = useMemo(() => parseJson(jsonData), [jsonData]);
  const prettyJson = JSON.stringify(parsed ?? null, null, 2);
  const count = countEntries(parsed);

  return (
    <section
      aria-label={label}
      className={cn("overflow-hidden rounded-md bg-popover ring-1 ring-line", className)}
    >
      <div className="flex h-9 items-center gap-2 border-b border-line bg-sunken/70 pl-3.5 pr-1.5">
        <h3 className="font-mono text-label uppercase text-muted-foreground">{label}</h3>
        {!isPending && (
          <span className="rounded-full bg-sunken px-1.5 text-[11px] tabular-nums text-ink-2 ring-1 ring-line">
            {count}
          </span>
        )}
        <div className="ml-auto">{!isPending && count > 0 && createCopyJsonAction(prettyJson)}</div>
      </div>

      {isPending ? (
        <JsonViewerSkeleton className="h-auto rounded-none p-3.5" />
      ) : count === 0 ? (
        <div className="flex flex-col items-center gap-1 px-6 py-6 text-center">
          <BracketsCurlyIcon className="mb-1 size-4 text-muted-foreground" />
          <p className="text-[13px] font-medium text-ink-2">No {label.toLowerCase()}</p>
          <p className="text-[12px] text-muted-foreground">Nothing to show for this node yet.</p>
        </div>
      ) : (
        <JsonViewer
          jsonData={prettyJson}
          enableValueClipboard
          viewportClassName={viewportClassName}
          className="bg-sunken px-3 pt-2 text-ink [--w-rjv-background-color:transparent]"
        />
      )}
    </section>
  );
};

export default STJsonViewer;
