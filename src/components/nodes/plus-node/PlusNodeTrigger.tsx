import { cn } from "@aventisia/ui/lib";
import { PopoverTrigger } from "@aventisia/ui/popover";
import { PlusIcon } from "@heroicons/react/24/outline";
import { DialogTrigger } from "@/react-toolkit/ui/dialog";

export const PlusNodeTrigger = (
  props: React.ComponentPropsWithoutRef<typeof PopoverTrigger>,
) => {
  return (
    <DialogTrigger className="group" {...props}>
      <div
        className={cn(
          "flex h-[5.3rem] w-[19.375rem] items-center justify-center rounded-lg bg-slate-100 px-4 py-3.5",
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
    </DialogTrigger>
  );
};
