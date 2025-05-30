import { VariableSelectorWrapper } from "@/components/variable-selector/VariableSelectorWrapper";
import { useVariableSelectorStore } from "@/stores/variable-selector-store";
import { buttonVariants } from "@aventisia/ui/buttons";
import { AutosizeTextareaField } from "@aventisia/ui/form";
import { cn } from "@aventisia/ui/lib";
import { PopoverTrigger } from "@aventisia/ui/popover";
import { VariableIcon } from "@heroicons/react/24/outline";
import { useShallow } from "zustand/react/shallow";

interface ConfigPanelAutosizeTextareaFieldProps {
  name: string;
  label?: string;
  description?: string;
}

export default function ConfigPanelAutosizeTextareaField({
  name,
  label,
  description,
}: ConfigPanelAutosizeTextareaFieldProps) {
  // Get variable selector store state and actions
  const { setOpenState, setInputName } = useVariableSelectorStore(
    useShallow((state) => ({
      setOpenState: state.setOpenState,
      setInputName: state.setInputName,
    })),
  );

  const baseProps = {
    name,
    label,
    description,
  };

  return (
    <VariableSelectorWrapper inputUniqueName={name}>
      <div className="group relative">
        <PopoverTrigger
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "absolute right-1.5 h-5 gap-1 rounded-none rounded-t-lg border-none bg-accent px-2 text-xs opacity-0 hover:text-primary group-focus-within:opacity-100",
            "data-[state=open]:opacity-100",
          )}
          onClick={() =>{
            setInputName(name)
            setOpenState(true)
          } }
        >
          <VariableIcon className="h-3 w-3 stroke-[2.4]" />
          Variables
        </PopoverTrigger>
        <AutosizeTextareaField {...baseProps} minHeight={30} size="sm" />
      </div>
    </VariableSelectorWrapper>
  );
}
