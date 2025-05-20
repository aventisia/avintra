import { Button } from "@aventisia/ui/buttons";
import { Command, CommandEmpty, CommandList } from "@aventisia/ui/command";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { FELActionList } from "./FELActionList";
import { useFlowExecutionLogStore } from "../../stores/flow-execution-lof-store";
import { useShallow } from "zustand/react/shallow";
import { FlowExecutionLogsDTO } from "../../dtos/flow-execution-log-dto";
import { Tooltip } from "@/react-toolkit/ui/custom/Tooltip";
import FELSearchBox from "./FELSearchBox";
import { NoContentMessage } from "@aventisia/ui";

interface FELActionsSectionProps {
  actionList: FlowExecutionLogsDTO[];
}

const FELActionsSection = ({ actionList }: FELActionsSectionProps) => {
  // Get flow execution store state & actions
  const { setFlowExecutionLogId } = useFlowExecutionLogStore(
    useShallow((state) => ({
      setFlowExecutionLogId: state.setFlowExecutionLogId,
    })),
  );

  return (
    <Command>
      <div className="flex w-full items-center justify-between gap-1 pr-1">
        <Tooltip content="Back">
          <Button
            variant={"ghost"}
            size={"sm"}
            onClick={() => setFlowExecutionLogId(null)}
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
        </Tooltip>
        <FELSearchBox />
      </div>
      {/* No content message */}
      <CommandEmpty className="h-full">
        <NoContentMessage
          className="-mt-5"
          primaryMessage="No Execution logs found"
        />
      </CommandEmpty>
      <CommandList>
        {actionList.length > 0 && (
          <FELActionList executionLogsList={actionList} />
        )}
      </CommandList>
    </Command>
  );
};

export default FELActionsSection;
