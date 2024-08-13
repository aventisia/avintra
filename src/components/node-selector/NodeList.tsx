import { activitiesList } from "@/data/activities-list";
import { useAddNode } from "@/hooks/add-node";
import { CommandItem } from "@/react-toolkit/ui/command";
import { PopoverClose } from "@/react-toolkit/ui/popover";
import { NodeToSelect } from "./node-to-select";
import { NodeSelectorOriginType } from "@/types/node-selector-origin-type";

interface NodeListProps {
  origin: NodeSelectorOriginType;
  originId: string;
}

export const NodeList = ({ origin, originId }: NodeListProps) => {
  // Get addNode handler
  const { addNodeFromPlusNode, addNodeFromCustomStepEdge } =
    useAddNode();

  // Return the component
  return (
    <>
      {activitiesList.map((item, index) => (
        <PopoverClose key={index} className="w-full text-left">
          <CommandItem
            value={item.label}
            onSelect={() => {
              if (origin === "PlusNode") {
                addNodeFromPlusNode(item, originId);
              } else if (origin === "CustomStepEdge") {
                addNodeFromCustomStepEdge(item, originId);
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
