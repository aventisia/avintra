import { cn } from "@avplatform/ui/lib";
import { PlusIcon } from "@heroicons/react/24/outline";

export const PlusNodeTrigger = (props: React.ComponentPropsWithoutRef<"div">) => {
  return (
    <div className="group" {...props}>
      <div
        className={cn(
          "flex h-16 w-16 items-center justify-center rounded-lg border-2 bg-slate-100 px-4 py-3.5 cursor-pointer",
          "border-2 border-dashed border-slate-400/60",
          "group-hover:border-slate-400",
          "group-aria-[expanded=true]:border-slate-400",
        )}
      >
        <PlusIcon
          className={cn(
            "h-6 w-6 text-slate-400",
            "group-hover:stroke-[2] group-hover:text-primary",
            "group-aria-[expanded=true]:stroke-[2] group-aria-[expanded=true]:text-primary",
          )}
        />
      </div>
    </div>
  );
};
