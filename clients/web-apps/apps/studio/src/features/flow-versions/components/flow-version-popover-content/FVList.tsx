import { CommandItem } from "@avplatform/ui/command";
import { FlowVersionDto } from "../../dtos/flow-version-dto";
import FVItem from "./FVItem";
import { useOpenFlow } from "@/features/flows-popover/hooks/useOpenFlow";
import { useShallow } from "zustand/react/shallow";
import { useFlowVersionPopoverStore } from "../../stores/flow-version-popover-store";

interface FVListProps {
  flowVersionsList: FlowVersionDto[] | undefined;
}

export const FVList = ({ flowVersionsList }: FVListProps) => {
  // Get store state and actions
  const { togglePopoverOpen } = useFlowVersionPopoverStore(
    useShallow((state) => ({
      togglePopoverOpen: state.togglePopoverOpen,
    })),
  );
  // Get handle function to open flow
  const handleOpenFlowAction = useOpenFlow();

  return (
    <>
      {flowVersionsList?.map((item) => (
        <CommandItem
          key={item.id}
          value={`Version ${item.versionNumber}`}
          className="group/CommandItem cursor-pointer rounded-lg p-1"
          onSelect={() => {
            handleOpenFlowAction(item.flowId, item.id);
            // Close the popover
            togglePopoverOpen(false);
          }}
        >
          {/* flow item */}
          <FVItem flowVersion={item} />
        </CommandItem>
      ))}
    </>
  );
};
