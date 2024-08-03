import { activitiesList } from "@/data/activities-list";
import { useAddNode } from "@/hooks/add-node";
import { CommandItem } from "@/react-toolkit/ui/command";
import { useNodeSelectorStore } from "@/stores/node-selector-store";
import { useShallow } from "zustand/react/shallow";
import { NodeToSelect } from "./node-to-select";

export const ActivityNodeList = () => {
  // Get store state and actions
  const { togglePopoverOrigin } = useNodeSelectorStore(
    useShallow((state) => ({
      togglePopoverOrigin: state.togglePopoverOrigin,
    })),
  );

  // Get addNode handler
  const addNodeHandler = useAddNode();

  // Return the component
  return (
    <>
      {activitiesList.map((item, index) => (
        <CommandItem
          key={index}
          value={item.label}
          onSelect={() => {
            addNodeHandler(item);
            togglePopoverOrigin("Closed");
          }}
          className="rounded-lg p-1"
        >
          {/* Node item */}
          <NodeToSelect data={item} />
        </CommandItem>
      ))}
    </>
  );
};
