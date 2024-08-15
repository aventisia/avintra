import { logicNodesList } from "@/data/logic-nodes-list";
import { useAddNode } from "@/hooks/add-node";
import { CommandItem, CommandList } from "@/react-toolkit/ui/command";
import { PopoverClose } from "@/react-toolkit/ui/popover";
import { NodeSelectorOriginType } from "@/types/node-selector-origin-type";
import { NodeToSelect } from "../node-to-select";

interface NSCLogicNodesListProps {
  origin: NodeSelectorOriginType;
  originId: string;
}

export const NSCLogicNodesList = ({
  origin,
  originId,
}: NSCLogicNodesListProps) => {
  // Get addNode handlers
  const { addNodeFromPlusNode, addNodeFromCustomStepEdge } = useAddNode();

  // Return the component
  return (
    <CommandList>
      {logicNodesList.map((item) => (
        <CommandItem
          key={item.name}
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
          {/* Node item with popover close */}
          <PopoverClose className="w-full text-left">
            <NodeToSelect data={item} />
          </PopoverClose>
        </CommandItem>
      ))}
    </CommandList>
  );
};
