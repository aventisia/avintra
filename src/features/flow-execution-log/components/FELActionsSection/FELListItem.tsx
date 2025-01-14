import { FlowExecutionLogsDTO } from "../../dtos/flow-execution-log-dto";
import { CircleCheck, CircleX } from "lucide-react";
import { DocumentTextIcon } from "@heroicons/react/24/outline";

interface FELListItemProps {
  flowData: FlowExecutionLogsDTO;
  index: number;
}

/**
 * Renders a flows list item for the flows list.
 */
export const FELListItem = ({ flowData, index }: FELListItemProps) => {
  return (
    <div className="flex w-full items-center justify-between rounded-lg border p-3">
      <div className="flex items-center gap-2">
        <DocumentTextIcon className="h-4 w-4" />
        <h6 className="text-base">{`${index}. ${flowData.actionName}`}</h6>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-2xs text-muted-foreground">
          {flowData.createdOn.slice(20, 23)}ms
        </span>
        {flowData?.id && +flowData?.id.slice(-1) % 2 === 0 ? (
          <CircleX size={14} color="red" />
        ) : (
          <CircleCheck size={14} color="green" />
        )}
      </div>
    </div>
  );
};
