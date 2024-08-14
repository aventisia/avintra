import { triggersList } from "@/data/triggers-list";
import { useReplaceNode } from "@/hooks/useReplaceNode";
import { CommandItem, CommandList } from "@/react-toolkit/ui/command";
import { PopoverClose } from "@/react-toolkit/ui/popover";
import { NodeToSelect } from "../node-to-select";

export const NSCTriggersList = () => {
  // Get handler for replacing node
  const replaceNodeHandler = useReplaceNode();

  // Return the component
  return (
    <CommandList>
      {triggersList.map((item) => (
        <CommandItem
          key={item.name}
          value={item.label}
          onSelect={() => {
            replaceNodeHandler(item);
          }}
          className="rounded-lg p-1"
        >
          {/* Node item with popover close */}
          <PopoverClose className="w-full text-left">
            <NodeToSelect data={item} />
          </PopoverClose>
        </CommandItem>
      ))}
    </CommandList>
  );
};
