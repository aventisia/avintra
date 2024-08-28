import { activitiesList } from "@/data/activities-list";
import { useAddFirstNodeToBranch } from "@/hooks/useAddFirstNodeToBranch";
import { useAddFirstNodeToFlow } from "@/hooks/useAddFirstNodeToFlow";
import { useAddNodeFromEdge } from "@/hooks/useAddNodeFromEdge";
import { CommandItem, CommandList } from "@/react-toolkit/ui/command";
import { PopoverClose } from "@/react-toolkit/ui/popover";
import { NodeSelectorOriginType } from "@/types/node-selector-origin-type";
import { NodeToSelect } from "../node-to-select";

interface NSCActivitiesListProps {
  origin: NodeSelectorOriginType;
  originId: string;
}

export const NSCActivitiesList = ({
  origin,
  originId,
}: NSCActivitiesListProps) => {
  // Get addNode handlers
  const addFirstNodeToFlow = useAddFirstNodeToFlow();
  const addNodeFromEdge = useAddNodeFromEdge();
  const addFirstNodeToBranch = useAddFirstNodeToBranch();

  // Return the component
  return (
    <CommandList>
      {activitiesList.map((item) => (
        <CommandItem
          key={item.name}
          value={item.label}
          onSelect={() => {
            console.log("origin", origin);
            
            if (origin === "plusFirstNode") {
              addFirstNodeToFlow(item, originId);
            } else if (origin === "PlusEdgeLabel") {
              addNodeFromEdge(item, originId);
            } else if (origin === "plusNode") {
              addFirstNodeToBranch(item, originId);
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
