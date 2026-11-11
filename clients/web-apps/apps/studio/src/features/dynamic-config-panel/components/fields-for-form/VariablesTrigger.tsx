import { buttonVariants } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { PopoverTrigger } from "@avplatform/ui/popover";
import { VariableIcon } from "@heroicons/react/24/outline";
import { useShallow } from "zustand/react/shallow";

import { useVariableSelectorStore } from "@/stores/variable-selector-store";

/**
 * Hover tab that opens the variable selector for the field `name`; render it inside `VariableSelectorWrapper`.
 */
const VariablesTrigger = ({ name, className }: { name: string; className?: string }) => {
  const { setOpenState, setInputName } = useVariableSelectorStore(
    useShallow((state) => ({
      setOpenState: state.setOpenState,
      setInputName: state.setInputName,
    })),
  );

  return (
    <PopoverTrigger
      className={cn(
        buttonVariants({ variant: "ghost", size: "sm" }),
        "absolute right-1.5 h-5 gap-1 rounded-none rounded-t-lg border-none bg-accent px-2 text-xs opacity-0 hover:text-primary group-focus-within:opacity-100",
        "data-[state=open]:opacity-100",
        className,
      )}
      onClick={() => {
        setInputName(name);
        setOpenState(true);
      }}
    >
      <VariableIcon className="h-3 w-3 stroke-[2.4]" />
      Variables
    </PopoverTrigger>
  );
};

export { VariablesTrigger };
