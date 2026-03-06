import { iconMapper } from "@/components/icon-mapper";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { PrimaryCategoryType } from "../types/primary-category-type";
import { FallbackImageIcon } from "./FallbackImageIcon";

interface PrimaryCategoryProps {
  data: PrimaryCategoryType;
}

export const PrimaryCategory = ({ data }: PrimaryCategoryProps) => {
  return (
    <>
      <div className="flex h-2/5 w-full items-center justify-between">
        <div className="group-hover:bg-primary/10 group-focus-visible:bg-primary/10 flex h-12 w-12 items-center justify-center rounded-xl bg-accent transition-colors">
          {data.icon ? (
            iconMapper[data.icon]
          ) : (
            <FallbackImageIcon className="h-12 w-12" src={data.img} />
          )}
        </div>
        <ArrowRightIcon className="stroke-1.5 h-5 w-5 text-foreground transition-colors group-hover:text-primary group-focus-visible:text-primary" />
      </div>

      <div className="flex h-3/5 flex-col gap-1">
        <h2 className="text-[1rem] font-medium tracking-tight transition-colors group-hover:text-primary group-focus-visible:text-primary">
          {data.label}
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {data.description}
        </p>
      </div>
    </>
  );
};
