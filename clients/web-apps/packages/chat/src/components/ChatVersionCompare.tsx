import { Skeleton } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import { FIELD_SURFACE, cn } from "@avplatform/ui/lib";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";

import { type LoadedVersionText, useVersionText } from "../hooks/useVersionText.hook";
import {
  type VersionDiffRow,
  diffVersionTexts,
  isTooLargeToCompare,
  sortVersions,
} from "../utils/chat-version-diff.util";
import type { ChatPreviewVersion } from "./ChatFilePreview";

const STACK_BELOW_PX = 560;

type ChatVersionCompareProps = {
  versions: readonly ChatPreviewVersion[];
  leftId: string;
  rightId: string;
  onChange: (pair: { leftId: string; rightId: string }) => void;
  loadVersionText: (id: string) => Promise<string | null>;
};

const useIsNarrow = (ref: React.RefObject<HTMLElement>) => {
  const [isNarrow, setIsNarrow] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) =>
      setIsNarrow(entry.contentRect.width < STACK_BELOW_PX),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return isNarrow;
};

const Cell = ({
  side,
  tint,
  isNarrow,
}: {
  side: VersionDiffRow["left"];
  tint: string | false;
  isNarrow: boolean;
}) => {
  if (!side && isNarrow) return null;
  return (
    <div className={cn("flex min-h-6 gap-3 px-3", side ? tint : "bg-line/20")}>
      {side && (
        <>
          <span className="w-10 shrink-0 select-none text-right text-muted-foreground">
            {side.line}
          </span>
          <span className="min-w-0 flex-1 whitespace-pre-wrap break-words">{side.text}</span>
        </>
      )}
    </div>
  );
};

const SideStatus = ({
  label,
  loaded,
  onRetry,
}: {
  label: string;
  loaded: LoadedVersionText | null;
  onRetry: () => void;
}) => {
  if (!loaded)
    return (
      <div role="status" aria-label={`Loading ${label}`} className="space-y-3 p-6">
        <Skeleton className="h-6 w-1/2 rounded" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  if (loaded.status === "failed")
    return (
      <div className="flex flex-col items-start gap-3 p-6 text-sm text-muted-foreground">
        <p>Couldn&apos;t load {label}</p>
        <Button variant="outline" size="sm" onClick={onRetry}>
          Retry
        </Button>
      </div>
    );
  if (loaded.status === "unavailable")
    return <p className="p-6 text-sm text-muted-foreground">{label} can&apos;t be compared.</p>;
  return (
    <pre className="whitespace-pre-wrap break-words p-3 font-mono text-[13px] leading-6 text-ink">
      {loaded.text}
    </pre>
  );
};

/** Two versions of a text file side by side, with changed lines tinted. */
export const ChatVersionCompare = ({
  versions,
  leftId,
  rightId,
  onChange,
  loadVersionText,
}: ChatVersionCompareProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const isNarrow = useIsNarrow(rootRef);
  const left = useVersionText(leftId, loadVersionText);
  const right = useVersionText(rightId, loadVersionText);
  const sorted = useMemo(() => sortVersions(versions), [versions]);
  const labelOf = (id: string) =>
    `v${versions.find((version) => version.id === id)?.versionNumber}`;

  const leftText = left.loaded?.status === "ready" ? left.loaded.text : null;
  const rightText = right.loaded?.status === "ready" ? right.loaded.text : null;
  const isOverCap =
    leftText !== null && rightText !== null && isTooLargeToCompare(leftText, rightText);
  const rows = useMemo(
    () =>
      leftText !== null && rightText !== null && !isOverCap
        ? diffVersionTexts(leftText, rightText)
        : null,
    [leftText, rightText, isOverCap],
  );
  const isTooLarge = isOverCap || (leftText !== null && rightText !== null && rows === null);
  const hasChanges = !!rows?.some((row) => row.kind !== "same");

  const select = (value: string, label: string, onPick: (id: string) => void) => (
    <select
      value={value}
      onChange={(event) => onPick(event.target.value)}
      aria-label={label}
      title={label}
      className={cn(FIELD_SURFACE, "h-8 shrink-0 px-1 text-xs")}
    >
      {sorted.map((version) => (
        <option key={version.id} value={version.id}>
          v{version.versionNumber}
        </option>
      ))}
    </select>
  );

  const body = () => {
    if (isTooLarge)
      return (
        <p className="p-6 text-sm text-muted-foreground">
          These versions are too large to compare.
        </p>
      );
    if (!rows)
      return (
        <div className={cn("grid", isNarrow ? "grid-cols-1" : "grid-cols-2")}>
          <SideStatus label={labelOf(leftId)} loaded={left.loaded} onRetry={left.retry} />
          <SideStatus label={labelOf(rightId)} loaded={right.loaded} onRetry={right.retry} />
        </div>
      );
    if (!hasChanges)
      return (
        <p className="p-6 text-sm text-muted-foreground">
          No differences between {labelOf(leftId)} and {labelOf(rightId)}.
        </p>
      );
    const leftTint = (row: VersionDiffRow) =>
      (row.kind === "removed" || row.kind === "changed") && "bg-bad/10";
    const rightTint = (row: VersionDiffRow) =>
      (row.kind === "added" || row.kind === "changed") && "bg-ok/10";
    if (isNarrow)
      return (
        <div className="py-2 font-mono text-[13px] leading-6 text-ink">
          {(
            [
              { id: leftId, side: "left", tint: leftTint },
              { id: rightId, side: "right", tint: rightTint },
            ] as const
          ).map(({ id, side, tint }) => (
            <section key={side} aria-label={labelOf(id)} className="pb-3">
              <h3 className="px-3 pb-1 font-sans text-xs font-medium text-muted-foreground">
                {labelOf(id)}
              </h3>
              {rows.map((row, index) => (
                <Cell key={index} side={row[side]} tint={tint(row)} isNarrow />
              ))}
            </section>
          ))}
        </div>
      );
    return (
      <div className="grid grid-cols-2 py-2 font-mono text-[13px] leading-6 text-ink">
        {rows.map((row, index) => (
          <Fragment key={index}>
            <Cell side={row.left} tint={leftTint(row)} isNarrow={false} />
            <Cell side={row.right} tint={rightTint(row)} isNarrow={false} />
          </Fragment>
        ))}
      </div>
    );
  };

  return (
    <div ref={rootRef} className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center gap-2 border-b border-line px-4 py-2 text-xs text-muted-foreground">
        {select(leftId, "Compare version", (id) => onChange({ leftId: id, rightId }))}
        <span>with</span>
        {select(rightId, "With version", (id) => onChange({ leftId, rightId: id }))}
      </div>
      <div role="region" aria-label="Version comparison" className="min-h-0 flex-1 overflow-auto">
        {body()}
      </div>
    </div>
  );
};
