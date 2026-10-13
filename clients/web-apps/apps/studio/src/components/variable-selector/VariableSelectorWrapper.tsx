import { cn } from "@avplatform/ui/lib";
import { Popover, PopoverContent } from "@avplatform/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@avplatform/ui/tabs";
import { useShallow } from "zustand/react/shallow";

import { useVariableSelectorStore } from "@/stores/variable-selector-store";

import { ConfigSelectorContent } from "./ConfigSelectorContent";
import { VariableSelectorContent } from "./VariableSelectorContent";

interface VariableSelectorWrapperProps extends React.ComponentPropsWithoutRef<
  typeof PopoverContent
> {
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
        <Tabs defaultValue="variables" className="flex h-full w-full flex-col">
          <TabsList className="w-full">
            <TabsTrigger value="variables" className="w-full">
              Variables
            </TabsTrigger>
            <TabsTrigger value="keystore" className="w-full">
              Key Store
            </TabsTrigger>
          </TabsList>
          <TabsContent
            value="variables"
            className="flex flex-1 flex-col overflow-hidden min-h-0 data-[state=inactive]:hidden"
          >
            <VariableSelectorContent />
          </TabsContent>
          <TabsContent
            value="keystore"
            className="flex flex-1 flex-col overflow-hidden min-h-0 data-[state=inactive]:hidden"
          >
            <ConfigSelectorContent />
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
};

export { VariableSelectorWrapper };
