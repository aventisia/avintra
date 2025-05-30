import { useVariableSelectorStore } from "@/stores/variable-selector-store";
import { cn } from "@aventisia/ui/lib";
import {
  Popover,
  PopoverContent,
  PopoverDefaultHeader,
} from "@aventisia/ui/popover";
import { useShallow } from "zustand/react/shallow";
import { VariableSelectorContent } from "./VariableSelectorContent";

interface VariableSelectorWrapperProps
  extends React.ComponentPropsWithoutRef<typeof PopoverContent> {
  /** Name of the input field */
  inputUniqueName?: string;

  /** Additional CSS classes for the wrapper */
  className?: string;

  /** Children to be wrapped */
  children: React.ReactNode;
}

const VariableSelectorWrapper = ({
  inputUniqueName,
  className,
  children,
  ...props
}: VariableSelectorWrapperProps) => {
  // Get variable selector store state and actions
  const { inputName, isOpen, setOpenState } = useVariableSelectorStore(
    useShallow((state) => ({
      inputName: state.inputName,
      isOpen: state.isOpen,
      setOpenState: state.setOpenState,
    })),
  );

  return (
    <Popover
      modal={true}
      open={isOpen && inputUniqueName === inputName}
      onOpenChange={() => setOpenState(!isOpen)}
    >
      {children}
      <PopoverContent
        tabIndex={-1}
        align="end"
        variant={"responsive"}
        className={cn(className, "max-h-96 shadow-sm")}
        {...props}
      >
        <PopoverDefaultHeader
          heading={"Select Variable"}
          className="border-none"
        />
        <VariableSelectorContent />
      </PopoverContent>
    </Popover>
  );
};

export { VariableSelectorWrapper };
