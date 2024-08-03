import { triggersList } from "@/data/triggers-list";
import { useReplaceNode } from "@/hooks/useReplaceNode";
import { CommandItem } from "@/react-toolkit/ui/command";
import { TriggerToSelect } from "./trigger-to-select";
import { PopoverClose } from "@radix-ui/react-popover";

export const TriggerNodeList = () => {
  // Get replace node handler
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
            {/* Trigger item */}
            <TriggerToSelect data={item} />
          </CommandItem>
        </PopoverClose>
      ))}
    </>
  );
};
