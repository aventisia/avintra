import { triggersList } from "@/data/triggers-list";
import { useReplaceNode } from "@/hooks/useReplaceNode";
import { CommandItem } from "@/react-toolkit/ui/command";
import { PopoverClose } from "@/react-toolkit/ui/popover";
import { NodeToSelect } from "./node-to-select";

export const TriggerList = () => {
  // Get addNode handler
  const replaceNodeHandler = useReplaceNode();

  // Return the component
  return (
    <>
      {triggersList.map((item, index) => (
        <PopoverClose key={index} className="w-full text-left">
          <CommandItem
            value={item.label}
            onSelect={() => {
              replaceNodeHandler(item);
            }}
            className="rounded-lg p-1"
          >
            {/* Node item */}
            <NodeToSelect data={item} />
          </CommandItem>
        </PopoverClose>
      ))}
    </>
  );
};
