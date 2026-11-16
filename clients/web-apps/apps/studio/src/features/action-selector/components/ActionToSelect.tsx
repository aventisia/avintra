import { MonitorIcon, PlusIcon } from "@phosphor-icons/react";

import { iconMapper } from "@/components/icon-mapper";
import { NodeDataType } from "@/types/node-data-type";

import { useNodeSelectorStore } from "../stores/action-selector-store";
import { FallbackImageIcon } from "./FallbackImageIcon";
import { HighlightMatch } from "./HighlightMatch";

interface ActionToSelectProps {
  data: NodeDataType;
}

const ActionTag = ({
  children,
  tone,
}: {
  children: string;
  tone: "primary" | "warn" | "muted";
}) => (
  <span
    className={
      tone === "primary"
        ? "shrink-0 rounded px-1 text-[10px]/4 font-semibold tracking-[0.02em] text-primary-text ring-1 ring-primary/25"
        : tone === "warn"
          ? "shrink-0 rounded px-1 text-[10px]/4 font-semibold tracking-[0.02em] text-warn ring-1 ring-warn/30"
          : "shrink-0 rounded px-1 text-[10px]/4 font-semibold tracking-[0.02em] text-muted-foreground ring-1 ring-line"
    }
  >
    {children}
  </span>
);

export const ActionToSelect = ({ data }: ActionToSelectProps) => {
  const query = useNodeSelectorStore((state) => state.query);
  const isWindowsOnly =
    data.supportedPlatforms?.length === 1 && data.supportedPlatforms?.includes("windows");

  return (
    <div className="flex w-full items-center gap-3 px-2 py-2">
      <span
        aria-hidden="true"
        className="grid size-8 shrink-0 place-items-center rounded-md bg-surface text-ink-2 ring-1 ring-line transition-colors group-hover:ring-line-strong group-aria-selected:ring-primary/40 [&_img]:size-4 [&_svg]:size-4 [&_svg]:text-ink-2"
      >
        {data.iconUrl ? (
          <FallbackImageIcon className="h-4 w-4" src={data.iconUrl} />
        ) : data.icon ? (
          iconMapper[data.icon]
        ) : (
          <FallbackImageIcon className="h-4 w-4" src={data.img} />
        )}
      </span>

      <span className="flex min-w-0 flex-1 flex-col">
        <span className="flex min-w-0 items-center gap-1.5">
          <span className="min-w-0 truncate text-[13.5px]/5 font-medium text-ink">
            <HighlightMatch text={data.label} query={query} />
          </span>
          {data.badge && <ActionTag tone="primary">{data.badge}</ActionTag>}
          {data.isVerified === false && <ActionTag tone="warn">Unverified</ActionTag>}
          {data.disabled && data.isVerified !== false && (
            <ActionTag tone="muted">Coming soon</ActionTag>
          )}
          {isWindowsOnly && (
            <MonitorIcon
              className="size-3.5 shrink-0 text-muted-foreground"
              aria-label="Windows only"
            />
          )}
        </span>
        {data.description && (
          <span className="truncate text-[12px]/4 text-muted-foreground">{data.description}</span>
        )}
      </span>

      <span
        aria-hidden="true"
        className="grid size-6 shrink-0 place-items-center rounded-md text-primary-text opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 group-aria-selected:opacity-100 group-disabled:hidden"
      >
        <PlusIcon className="size-3.5" weight="bold" />
      </span>
    </div>
  );
};
