import { CommandItem } from "@avplatform/ui/command";
import { useCurrentFlowStore } from "@/stores/current-flow-store";
import { useShallow } from "zustand/react/shallow";
import { FlowsTableDto } from "../../dtos/flows-table-dto";
import { useOpenFlow } from "../../hooks/useOpenFlow";
import { useFlowsPopoverStore } from "../../stores/flows-popover-store";
import { FlowListItem } from "../flow-list-item";

interface FPCFlowListProps {
  flowsList: FlowsTableDto[] | undefined;
}

export const FPCFlowsList = ({ flowsList }: FPCFlowListProps) => {
  // Get store state and actions
  const { togglePopoverOpen } = useFlowsPopoverStore(
    useShallow((state) => ({
      togglePopoverOpen: state.togglePopoverOpen,
    })),
  );

  // Get global store state and actions
  const { currentFlow } = useCurrentFlowStore(
    useShallow((state) => ({
      currentFlow: state.currentFlow,
    })),
  );

  // Get handle function to open flow
  const handleOpenFlowAction = useOpenFlow();

  return (
    <>
      {flowsList?.map((item) => (
        <CommandItem
          key={item.id}
          value={item.name}
          onSelect={() => {
            // If the flow is already opened, do nothing
            if (currentFlow.id === item.id) return;

            // Open the flow
            handleOpenFlowAction(item.id || "flowId");

            // Close the popover
            togglePopoverOpen(false);
          }}
          className="group/CommandItem cursor-pointer rounded-lg p-1"
        >
          {/* flow item */}
          <FlowListItem flowData={item} />
        </CommandItem>
      ))}
    </>
  );
};
