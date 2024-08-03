import { activitiesList } from "@/data/activities-list";
import { useAddNode } from "@/hooks/add-node";
import { CommandItem } from "@/react-toolkit/ui/command";
import { NodeToSelect } from "./node-to-select";
import { PopoverClose } from "@/react-toolkit/ui/popover/Popover";

export const ActivityNodeList = () => {
  // Get addNode handler
  const addNodeHandler = useAddNode();

  // Return the component
  return (
    <>
      {activitiesList.map((item, index) => (
        <PopoverClose key={index} className="w-full text-left">
          <CommandItem
            value={item.label}
            onSelect={() => {
              addNodeHandler(item);
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
