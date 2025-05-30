import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { NoContentMessage } from "@aventisia/ui";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandList,
} from "@aventisia/ui/command";
import { ScrollArea } from "@aventisia/ui/scroll";
import { Workflow } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
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
      <div
        className="mx-3 flex w-auto items-center rounded-lg bg-slate-100"
        cmdk-input-wrapper=""
      >
        <CommandInput
          className="flex h-9 min-w-[112%] grow rounded-md border-none bg-transparent py-3 text-xs outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-80"
          placeholder="Search variables..."
          autoFocus
        />
      </div>

      {/* No content message */}
      <CommandEmpty className="h-full">
        <NoContentMessage
          className="-mt-5"
          Icon={Workflow}
          primaryMessage="No Variables found"
          secondaryMessage="Try adding a new variable."
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
