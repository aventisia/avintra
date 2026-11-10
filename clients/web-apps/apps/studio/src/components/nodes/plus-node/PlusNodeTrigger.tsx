import { cn } from "@avplatform/ui/lib";
import { PlusIcon } from "@phosphor-icons/react";

export const PlusNodeTrigger = (props: React.ComponentPropsWithoutRef<"div">) => {
  return (
    <div className="group" {...props}>
      <div
        className={cn(
          "flex h-16 w-16 items-center justify-center rounded-md border-2 bg-sunken px-4 py-3.5 cursor-pointer",
          "border-2 border-dashed border-line-strong/60",
          "group-hover:border-line-strong",
          "group-aria-[expanded=true]:border-line-strong",
        )}
      >
        <PlusIcon
          className={cn(
            "h-6 w-6 text-muted-foreground",
            "group-hover:text-primary",
            "group-aria-[expanded=true]:text-primary",
          )}
        />
      </div>
    </div>
  );
};
