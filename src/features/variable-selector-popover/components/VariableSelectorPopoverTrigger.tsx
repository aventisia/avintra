import { cn } from "@aventisia/ui/lib";
import { buttonVariants } from "@aventisia/ui/buttons";
import { PopoverTrigger } from "@aventisia/ui/popover";

const VariableSelectorPopoverTrigger = () => {
  return (
    <PopoverTrigger
      className={cn(
        buttonVariants({ variant: "ghost" }),
        "group flex h-full max-w-[15rem]",
        "bg-secondary-light p-1",
      )}
    >
      {`{X}`}
    </PopoverTrigger>
  );
};

export default VariableSelectorPopoverTrigger;
