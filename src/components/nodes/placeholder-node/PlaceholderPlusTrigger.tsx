import { cn } from "@/react-toolkit/lib/utils";
import { PopoverTrigger } from "@/react-toolkit/ui/popover";
import { PlusIcon } from "@heroicons/react/24/outline";
import { PopoverAnchor } from "@radix-ui/react-popover";

export const PlaceholderPlusTrigger = () => {
  return (
    <PopoverTrigger className="group">
      <div
        className={cn(
          "flex h-[5.3rem] w-[20rem] items-center justify-center rounded-lg bg-slate-100 px-4 py-3.5",
          "border-2 border-dashed border-slate-400/60",
          "group-hover:border-slate-400",
          "group-aria-[expanded=true]:border-slate-400",
        )}
      >
        <PopoverAnchor>
          <PlusIcon
            className={cn(
              "h-6 w-6 text-slate-400",
              "group-hover:stroke-[2] group-hover:text-primary",
              "group-aria-[expanded=true]:stroke-[2] group-aria-[expanded=true]:text-primary",
            )}
          />
        </PopoverAnchor>
      </div>
    </PopoverTrigger>
  );
};
