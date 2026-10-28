import { Badge } from "@avplatform/ui/badge";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
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
  const { totalActions } = useMemo(() => {
    let totalActions = 0;

    for (const category of data.actionCategories) {
      totalActions += category.actions?.length ?? 0;
    }

    return {
      totalActions,
    };
  }, [data.actionCategories]);

  const isDisabled = data.disabled;

  const isCustomToolsL1 = data.label === CUSTOM_TOOLS_L1_LABEL;
  const customToolNodesCount = useNodeSelectorStore((state) => state.customToolNodesCount);

  return (
    <>
      <div className="flex w-full items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-md border border-line bg-sunken text-ink-2 [&_svg]:text-ink-2">
            {data.icon ? (
              iconMapper[data.icon]
            ) : (
              <FallbackImageIcon className="h-6 w-6" src={data.img} />
            )}
          </div>

          <div className="flex flex-col items-start gap-1">
            <h2
              className={`text-[15px]/5 font-semibold tracking-[-0.01em] text-ink transition-colors ${
                isDisabled
                  ? ""
                  : "group-hover:text-primary-text group-focus-visible:text-primary-text"
              }`}
            >
              {data.label}
            </h2>
            {isDisabled && <Badge variant="review">Coming soon</Badge>}
          </div>
        </div>

        <ArrowRightIcon
          className={`stroke-1.5 size-4 shrink-0 transition-colors ${
            isDisabled
              ? "text-muted-foreground/60"
              : "text-muted-foreground group-hover:text-primary-text group-focus-visible:text-primary-text"
          }`}
        />
      </div>

      <p
        className={`text-body-sm ${
          isDisabled ? "text-muted-foreground/80" : "text-muted-foreground"
        }`}
      >
        {data.description}
      </p>

      <div className="flex items-center gap-2">
        <span className="font-mono text-[11.5px] text-muted-foreground">
          {isCustomToolsL1
            ? customToolNodesCount === null
              ? "…"
              : `${customToolNodesCount} nodes`
            : isDisabled
              ? "Coming soon"
              : `${totalActions} nodes`}
        </span>
      </div>
    </>
  );
};
