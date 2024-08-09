import { activitiesList } from "@/data/activities-list";
import { useAddNode } from "@/hooks/add-node";
import { CommandItem } from "@/react-toolkit/ui/command";
import { PopoverClose } from "@/react-toolkit/ui/popover/Popover";
import { NodeToSelect } from "./node-to-select";
import { NodeSelectorOriginType } from "@/types/node-selector-origin-type";

interface NodeListProps {
  origin: NodeSelectorOriginType;
  originId: string;
}

export const NodeList = ({ origin, originId }: NodeListProps) => {
  // Get addNode handler
  const addNodeFromPlaceholderNode = useAddNode();

  // Return the component
  return (
    <>
      {activitiesList.map((item, index) => (
        <PopoverClose key={index} className="w-full text-left">
          <CommandItem
            value={item.label}
            onSelect={() => {
              if (origin === "PlaceholderNode") {
                addNodeFromPlaceholderNode(item, originId);
              }
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
