import { CaretRightIcon } from "@phosphor-icons/react";
import { useMemo } from "react";

import { iconMapper } from "@/components/icon-mapper";

import { CUSTOM_TOOLS_L1_LABEL } from "../constants/custom-tools.constant";
import { useNodeSelectorStore } from "../stores/action-selector-store";
import { PrimaryCategoryType } from "../types/primary-category-type";
import { FallbackImageIcon } from "./FallbackImageIcon";

interface PrimaryCategoryProps {
  data: PrimaryCategoryType;
}

export const PrimaryCategory = ({ data }: PrimaryCategoryProps) => {
  const totalActions = useMemo(
    () => data.actionCategories.reduce((sum, category) => sum + (category.actions?.length ?? 0), 0),
    [data.actionCategories],
  );

  const isDisabled = data.disabled;
  const isCustomToolsL1 = data.label === CUSTOM_TOOLS_L1_LABEL;
  const customToolNodesCount = useNodeSelectorStore((state) => state.customToolNodesCount);

  const countLabel = isCustomToolsL1
    ? customToolNodesCount === null
      ? "…"
      : String(customToolNodesCount)
    : String(totalActions);

  return (
    <>
      <span
        aria-hidden="true"
        className={
          isDisabled
            ? "grid size-10 shrink-0 place-items-center rounded-lg bg-sunken text-muted-foreground ring-1 ring-line [&_svg]:size-5 [&_svg]:text-current [&>div]:bg-transparent"
            : "grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary-text ring-1 ring-primary/15 transition-colors duration-150 group-hover:bg-primary group-hover:text-primary-foreground group-hover:ring-primary group-focus-visible:bg-primary group-focus-visible:text-primary-foreground group-focus-visible:ring-primary [&_svg]:size-5 [&_svg]:text-current [&>div]:bg-transparent"
        }
      >
        {data.icon ? (
          iconMapper[data.icon]
        ) : (
          <FallbackImageIcon className="h-5 w-5" src={data.img} />
        )}
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex items-center gap-2">
          <span className="truncate text-[14px]/5 font-semibold tracking-[-0.01em] text-ink">
            {data.label}
          </span>
          {isDisabled ? (
            <span className="shrink-0 rounded-full bg-warn/10 px-1.5 text-[11px]/[18px] font-medium text-warn">
              Coming soon
            </span>
          ) : (
            <span
              className="shrink-0 rounded-full bg-sunken px-1.5 font-mono text-[11px]/[18px] tabular-nums text-ink-2 ring-1 ring-line"
              aria-label={`${countLabel} nodes`}
            >
              {countLabel}
            </span>
          )}
        </span>
        <span className="line-clamp-2 text-[12.5px]/[18px] text-muted-foreground">
          {data.description}
        </span>
      </span>

      {!isDisabled && (
        <CaretRightIcon
          aria-hidden="true"
          className="size-4 shrink-0 -translate-x-1 text-muted-foreground opacity-0 transition duration-150 group-hover:translate-x-0 group-hover:text-primary-text group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:text-primary-text group-focus-visible:opacity-100 motion-reduce:transition-none"
        />
      )}
    </>
  );
};
