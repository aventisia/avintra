import { CommandItem } from "@aventisia/ui/command";
import { FlowExecutionLogsDTO } from "../../dtos/flow-execution-log-dto";
import { FELListItem } from "./FELListItem";
import { useFlowExecutionLogStore } from "../../stores/flow-execution-lof-store";
import { useShallow } from "zustand/react/shallow";
import { ScrollArea } from "@/react-toolkit/ui/scroll-area";

interface FELActionListProps {
  executionLogsList: FlowExecutionLogsDTO[] | undefined;
}

/**
 * Renders the content of the Flows execution logs component.
 */

export const FELActionList = ({ executionLogsList }: FELActionListProps) => {
  // Get flow execution store state & actions
  const { selectedActionId, setSelectedActionId } = useFlowExecutionLogStore(
    useShallow((state) => ({
      selectedActionId: state.selectedActionId,
      setSelectedActionId: state.setSelectedActionId,
    })),
  );

  return (
    <ScrollArea className="h-[calc(100vh-9rem)]">
      {executionLogsList?.map((item, index: number) => (
        <>
          <CommandItem
            key={item.id}
            value={item.actionName + item.id}
            onSelect={() => {
              // // If the flow is already opened, do nothing
              if (selectedActionId === item.id) return;
              // Open the flow
              setSelectedActionId(item.id || null);
            }}
            className="mt-3 cursor-pointer rounded-lg p-0"
          >
            <FELListItem flowData={item} index={index + 1} />
          </CommandItem>
        </>
      ))}
    </ScrollArea>
  );
};
