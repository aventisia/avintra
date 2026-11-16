import { cn } from "@avplatform/ui/lib";
import { useMemo } from "react";

import { diffUiBuilderSources } from "../utils/ui-builder-diff.util";

type UiBuilderDiffViewProps = {
  before: string;
  after: string;
};

const LINE_STYLES = {
  context: "text-slate-600",
  added: "bg-emerald-50 text-emerald-900",
  removed: "bg-rose-50 text-rose-900",
  gap: "bg-slate-50 text-slate-400",
} as const;

const LINE_MARKERS = { context: " ", added: "+", removed: "-", gap: "" } as const;

/** Unified line diff between two versions of the interface code. */
export const UiBuilderDiffView = ({ before, after }: UiBuilderDiffViewProps) => {
  const diff = useMemo(() => diffUiBuilderSources(before, after), [before, after]);

  if (diff.tooLarge) {
    return (
      <p className="p-4 text-xs text-muted-foreground">
        These versions differ too much to compare line by line.
      </p>
    );
  }
  if (diff.lines.length === 0) {
    return <p className="p-4 text-xs text-muted-foreground">The code is identical.</p>;
  }

  return (
    <div className="min-w-max font-mono text-[11px] leading-5">
      <p className="sticky top-0 z-10 border-b border-slate-200 bg-white px-3 py-1 font-sans text-2xs text-slate-500">
        <span className="font-semibold text-emerald-700">+{diff.added}</span>{" "}
        <span className="font-semibold text-rose-700">-{diff.removed}</span> lines
      </p>
      {diff.lines.map((line, index) =>
        line.kind === "gap" ? (
          <div key={index} className={cn("px-3 text-center", LINE_STYLES.gap)}>
            ⋯
          </div>
        ) : (
          <div key={index} className={cn("flex whitespace-pre", LINE_STYLES[line.kind])}>
            <span className="w-10 shrink-0 select-none pr-2 text-right text-slate-400">
              {line.oldNumber ?? ""}
            </span>
            <span className="w-10 shrink-0 select-none pr-2 text-right text-slate-400">
              {line.newNumber ?? ""}
            </span>
            <span className="w-4 shrink-0 select-none">{LINE_MARKERS[line.kind]}</span>
            <span>{line.text}</span>
          </div>
        ),
      )}
    </div>
  );
};
