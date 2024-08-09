import { activitiesList } from "@/data/activities-list";
import { useAddNode } from "@/hooks/add-node";
import { CommandItem } from "@/react-toolkit/ui/command";
import { NodeToSelect } from "./node-to-select";
import { PopoverClose } from "@/react-toolkit/ui/popover/Popover";
import { NodeSelectorOriginType } from "./node-selector-origin-type";
import { triggersList } from "@/data/triggers-list";

interface NodeListProps {
  origin: NodeSelectorOriginType;
}

export const NodeList = ({ origin }: NodeListProps) => {
  // Get addNode handler
  const addNodeHandler = useAddNode();

  const nodeList = origin === "ReplaceTrigger" ? triggersList : activitiesList;

  // Return the component
  return (
    <>
      {nodeList.map((item, index) => (
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
