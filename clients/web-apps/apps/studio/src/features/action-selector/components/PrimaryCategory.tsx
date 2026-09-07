import { Badge } from "@avplatform/ui/badge";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { useMemo } from "react";

import { iconMapper } from "@/components/icon-mapper";

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

  return (
    <>
      <div className="flex w-full items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div
            className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl transition-colors ${
              isDisabled
                ? "bg-muted"
                : "bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary group-hover:to-primary-600 group-hover:text-primary-foreground"
            }`}
          >
            {data.icon ? (
              iconMapper[data.icon]
            ) : (
              <FallbackImageIcon className="h-12 w-12" src={data.img} />
            )}
          </div>

          <div className="flex flex-col items-start gap-1">
            <h2
              className={`text-[1rem] font-semibold leading-tight tracking-tight transition-colors ${
                isDisabled
                  ? "text-foreground"
                  : "text-foreground group-hover:text-primary group-focus-visible:text-primary"
              }`}
            >
              {data.label}
            </h2>
            {isDisabled && (
              <Badge
                variant="outline"
                className="bg-amber-100/70 text-3xs font-medium text-amber-700 ring-amber-200"
              >
                Coming soon
              </Badge>
            )}
          </div>
        </div>

        <ArrowRightIcon
          className={`stroke-1.5 h-5 w-5 shrink-0 transition-colors ${
            isDisabled
              ? "text-muted-foreground/60"
              : "text-foreground/70 group-hover:text-primary group-focus-visible:text-primary"
          }`}
        />
      </div>

      <p
        className={`text-sm leading-relaxed ${
          isDisabled ? "text-muted-foreground/80" : "text-muted-foreground"
        }`}
      >
        {data.description}
      </p>

      <div className="flex items-center gap-2">
        <Badge
          variant={"outline"}
          className={
            isDisabled
              ? "bg-muted/50 font-normal text-muted-foreground/70"
              : "bg-muted font-normal text-muted-foreground"
          }
        >
          {isDisabled ? "Coming soon" : `${totalActions} nodes`}
        </Badge>
      </div>
    </>
  );
};
