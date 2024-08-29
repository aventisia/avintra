import { useAddFirstNodeToBranch } from "@/hooks/useAddFirstNodeToBranch";
import { useAddFirstNodeToFlow } from "@/hooks/useAddFirstNodeToFlow";
import { useAddNodeFromEdge } from "@/hooks/useAddNodeFromEdge";
import { CommandItem, CommandList } from "@/react-toolkit/ui/command";
import { PopoverClose } from "@/react-toolkit/ui/popover";
import { useNodeSelectorStore } from "@/stores/node-selector-store";
import { NodeDataType } from "@/types/node-data-type";
import { useShallow } from "zustand/react/shallow";
import { NodeToSelect } from "../node-to-select";
import { useReplaceNode } from "@/hooks/useReplaceNode";

interface NSCNodesListProps {
  nodesList: NodeDataType[];
}

export const NSCNodesList = ({ nodesList }: NSCNodesListProps) => {
  // Get the origin and originId from the store
  const { origin, originId } = useNodeSelectorStore(
    useShallow((state) => ({
      origin: state.origin,
      originId: state.originId,
    })),
  );

  // Get add/replace Node handlers
  const addFirstNodeToFlow = useAddFirstNodeToFlow();
  const addNodeFromEdge = useAddNodeFromEdge();
  const addFirstNodeToBranch = useAddFirstNodeToBranch();
  const replaceNodeHandler = useReplaceNode();

  // Handle the node selection
  const nodeSelectionHandler = (item: NodeDataType) => {
    switch (origin) {
      case "plusFirstNode":
        addFirstNodeToFlow(item, originId);
        break;
      case "PlusEdgeLabel":
        addNodeFromEdge(item, originId);
        break;
      case "plusNode":
        addFirstNodeToBranch(item, originId);
        break;
      case "ReplaceTrigger":
        replaceNodeHandler(item);
        break;
    }
  };

  // Return the component
  return (
    <CommandList>
      {nodesList.map((item) => (
        <CommandItem
          key={item.name}
          value={item.label}
          onSelect={() => nodeSelectionHandler(item)}
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
