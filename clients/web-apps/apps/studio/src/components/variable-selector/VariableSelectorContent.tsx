import { NoContentMessage } from "@avplatform/ui";
import { Command, CommandEmpty, CommandInput, CommandList } from "@avplatform/ui/command";
import { ScrollArea } from "@avplatform/ui/scroll";
import { VariableIcon } from "@heroicons/react/24/outline";
import { useShallow } from "zustand/react/shallow";

import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";

import { VariableItem } from "./VariableItem";

export const VariableSelectorContent = () => {
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
      {/* Search Box */}
      <div className="mx-3 rounded-lg bg-slate-100">
        <CommandInput className="h-9 text-xs" placeholder="Search variables..." autoFocus />
      </div>

      {/* No content message */}
      <CommandEmpty className="h-full">
        <NoContentMessage
          className="mt-5"
          Icon={VariableIcon}
          primaryMessage="No Variables found"
          secondaryMessage="Try a different search term or set a new variable."
        />
      </CommandEmpty>

      <ScrollArea>
        <CommandList className="px-4 py-2">
          {uniqueOutputs?.map((item, index) => (
            <VariableItem key={index} value={item} />
          ))}
        </CommandList>
      </ScrollArea>
    </Command>
  );
};
