import { cn } from "@avplatform/ui/lib";
import { Popover, PopoverContent } from "@avplatform/ui/popover";
import {
  SEGMENTED_TABS_LIST_CLASS,
  SEGMENTED_TABS_TRIGGER_CLASS,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@avplatform/ui/tabs";
import { BracketsCurlyIcon, GearSixIcon } from "@phosphor-icons/react";
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
        className={cn("max-h-96 p-0 ring-1 ring-line", className)}
        {...props}
      >
        <Tabs defaultValue="variables" className="flex min-h-0 w-full flex-1 flex-col">
          <div className="border-b border-line p-2">
            <TabsList className={cn(SEGMENTED_TABS_LIST_CLASS, "flex w-full")}>
              <TabsTrigger value="variables" className={cn(SEGMENTED_TABS_TRIGGER_CLASS, "flex-1")}>
                <BracketsCurlyIcon className="size-3.5" />
                Variables
              </TabsTrigger>
              <TabsTrigger
                value="configstore"
                className={cn(SEGMENTED_TABS_TRIGGER_CLASS, "flex-1")}
              >
                <GearSixIcon className="size-3.5" />
                Key store
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent
            value="variables"
            className="mt-0 flex min-h-0 flex-1 flex-col overflow-hidden data-[state=inactive]:hidden"
          >
            <VariableSelectorContent />
          </TabsContent>
          <TabsContent
            value="configstore"
            className="mt-0 flex min-h-0 flex-1 flex-col overflow-hidden data-[state=inactive]:hidden"
          >
            <ConfigSelectorContent />
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
};

export { VariableSelectorWrapper };
