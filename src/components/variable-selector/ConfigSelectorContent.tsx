import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { NoContentMessage } from "@aventisia/ui";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandList,
} from "@aventisia/ui/command";
import { ScrollArea } from "@aventisia/ui/scroll";
import { useShallow } from "zustand/react/shallow";
import { VariableItem } from "./VariableItem";

export const ConfigSelectorContent = () => {
  // Get ReactFlowExt store state & actions
  const { configVariables } = useReactFlowExtStore(
    useShallow((state) => ({
      configVariables: state.configVariables,
    })),
  );

  return (
    <Command>
      {/* Search Box */}
      <div className="mx-3 rounded-lg bg-slate-100">
        <CommandInput
          className="h-9 text-xs"
          placeholder="Search key..."
          autoFocus
        />
      </div>

      {/* No content message */}
      <CommandEmpty className="h-full">
        <NoContentMessage
          className="mt-5"
          primaryMessage="No key found"
          secondaryMessage="Try a different search term."
        />
      </CommandEmpty>

      <ScrollArea>
        <CommandList className="px-4 py-2">
          {configVariables?.map((item, index) => (
            <VariableItem key={index} value={item} isConfigValue />
          ))}
        </CommandList>
      </ScrollArea>
    </Command>
  );
};
