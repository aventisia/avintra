import { Command, CommandEmpty, CommandList } from "@aventisia/ui/command";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { useShallow } from "zustand/react/shallow";
import { VPCSearchBox } from "./VPCSearchBox";
import { VPCNoContentMessage } from "./VPCNoContentMessage";
import { ScrollArea } from "@aventisia/ui/scroll";
import { VariablesList } from "./VariableList";
import React from "react";

type PopoverContentPops = {
  togglePopover: React.Dispatch<React.SetStateAction<boolean>>;
};

const VariablePopoverContent = ({ togglePopover }: PopoverContentPops) => {
  // Get ReactFlowExt store state & actions
  const { flowVariablesObject } = useReactFlowExtStore(
    useShallow((state) => ({
      flowVariablesObject: state.flowVariablesObject,
    })),
  );

  // Step 1: Flatten the `outputs` arrays into a single array
  const allOutputs = flowVariablesObject.flatMap((item) => item.outputs);

  // Step 2: Use a Set to get unique values
  const uniqueOutputs = [...new Set(allOutputs)];

  return (
    <Command>
      {/* cmdk input Searchbox */}
      <VPCSearchBox />

      {/* No content message */}
      <CommandEmpty className="h-full">
        <VPCNoContentMessage />
      </CommandEmpty>

      <ScrollArea>
        <CommandList className="px-4 py-2">
          <VariablesList
            variableList={[...uniqueOutputs]}
            togglePopover={togglePopover}
          />
        </CommandList>
      </ScrollArea>
    </Command>
  );
};

export default VariablePopoverContent;
