import { iconMapper } from "@/components/icon-mapper";

import { ArrowRightIcon } from "@heroicons/react/24/outline";

import { PrimaryCategoryType } from "../types/primary-category-type";
import { FallbackImageIcon } from "./FallbackImageIcon";

interface PrimaryCategoryProps {
  data: PrimaryCategoryType;
}

export const PrimaryCategory = ({ data }: PrimaryCategoryProps) => {
  return (
    <div className="flex h-48 w-full cursor-pointer flex-col gap-2 rounded-2xl border border-indigo-100 p-4 hover:border-indigo-200">
      {/* Top section: Icon and Arrow */}
      <div className="flex h-2/5 w-full items-center justify-between">
        {/* Category icon or image */}
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent">
          {data.icon ? (
            iconMapper[data.icon]
          ) : (
            <FallbackImageIcon className="h-12 w-12" src={data.img} />
          )}
        </div>

        {/* Arrow */}
        <ArrowRightIcon className="stroke-1.5 h-5 w-5 text-foreground" />
      </div>

      {/* Bottom section: Text content */}
      <div className="flex h-3/5 flex-col gap-1">
        {/* Category heading */}
        <h2 className="text-[1rem] font-medium tracking-tight text-foreground">
          {data.label}
        </h2>

        {/* Category description */}
        <p className="text-sm leading-relaxed text-muted-foreground">
          {data.description}
        </p>
      </div>
    </div>
  );
};
