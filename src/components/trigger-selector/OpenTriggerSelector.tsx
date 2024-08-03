import { cn } from "@/react-toolkit/lib/utils";
import { buttonVariants } from "@/react-toolkit/ui/buttons/button-variants";
import { PopoverTrigger } from "@/react-toolkit/ui/popover/Popover";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import { memo } from "react";

export const OpenTriggerSelector = memo(() => {
  return (
    <PopoverTrigger
      className={cn(
        buttonVariants({ variant: "outline", size: "icon6" }),
        "z-10 rounded-full opacity-80 hover:opacity-100",
        "aria-[expanded=true]:opacity-100",
      )}
    >
      <EllipsisHorizontalIcon className="h-5 w-5 text-[--icon-color]" />
      <span className="sr-only">Open menu</span>
    </PopoverTrigger>
  );
});
