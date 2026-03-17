import { iconMapper } from "@/components/icon-mapper";

import { Badge } from "@aventisia/ui/badge";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { useMemo } from "react";

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
      actionCategoryCount: data.actionCategories.length,
      totalActions,
    };
  }, [data.actionCategories]);

  return (
    <>
      <div className="flex  w-full items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="group-hover:bg-primary/10 group-focus-visible:bg-primary/10 flex h-12 w-12 items-center justify-center rounded-xl bg-accent transition-colors">
            {data.icon ? (
              iconMapper[data.icon]
            ) : (
              <FallbackImageIcon className="h-12 w-12" src={data.img} />
            )}
          </div>
          <h2 className="text-[1rem] font-medium tracking-tight transition-colors group-hover:text-primary group-focus-visible:text-primary">
            {data.label}
          </h2>
        </div>

        <ArrowRightIcon className="stroke-1.5 h-5 w-5 text-foreground transition-colors group-hover:text-primary group-focus-visible:text-primary" />
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {data.description}
      </p>
      <div className="flex items-center gap-2">
        {/* <Badge
            variant={"outline"}
            className="bg-muted font-normal text-muted-foreground"
          >
            {actionCategoryCount} Categories
          </Badge> */}
        <Badge
          variant={"outline"}
          className="bg-muted font-normal text-muted-foreground"
        >
          {totalActions} nodes
        </Badge>
      </div>
    </>
  );
};
