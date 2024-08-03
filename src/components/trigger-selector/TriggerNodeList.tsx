import { triggersList } from "@/data/triggers-list";
import { useAddNode } from "@/hooks/add-node";
import { CommandItem } from "@/react-toolkit/ui/command";
import { TriggerToSelect } from "./trigger-to-select";
import { PopoverClose } from "@radix-ui/react-popover";

export const TriggerNodeList = () => {
  // Get addNode handler
  const addNodeHandler = useAddNode();

  // Return the component
  return (
    <>
      {triggersList.map((item, index) => (
        <PopoverClose key={index} className="w-full text-left">
          <CommandItem
            value={item.label}
            onSelect={() => {
              addNodeHandler(item);
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
