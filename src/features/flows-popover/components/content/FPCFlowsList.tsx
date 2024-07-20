import {
  FlowListItem,
  FlowsTableDto,
  useFlowsPopoverStore,
  useOpenFlow,
} from "@/features/flows-popover";
import { CommandItem } from "@/react-toolkit/components/ui";
import { useCurrentFlowStore } from "@/stores";
import { useShallow } from "zustand/react/shallow";

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
          value={item.id}
          onSelect={() => {
            // If the flow is already opened, do nothing
            if (currentFlow.id === item.id) return;

            // Open the flow
            handleOpenFlowAction(item.id || "flowId");

            // Close the popover
            togglePopoverOpen(false);
          }}
          className="cursor-pointer group/CommandItem rounded-lg p-1"
        >
          {/* flow item */}
          <FlowListItem flowData={item} />
        </CommandItem>
      ))}
    </>
  );
};
