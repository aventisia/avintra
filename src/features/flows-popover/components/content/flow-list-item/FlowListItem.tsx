import { FlowsTableDto } from "@/features/flows-popover/dtos/flows-table-dto";
import { cn } from "@/react-toolkit/lib/utils";
import { FLIActions } from "./actions/FLIActions";
import { FLILastModifiedOn } from "./FLILastModifiedOn";
import { FLIName } from "./FLIName";
import { FLIThumbnail } from "./FLIThumbnail";

interface FlowListItemProps {
  flowData: FlowsTableDto;
}

/**
 * Renders a flows list item for the flows list.
 */
export const FlowListItem = ({ flowData }: FlowListItemProps) => {
  // Return the component
  return (
    <div className={cn("flex w-full items-center gap-3 px-0.5 py-0.5")}>
      {/* Flow thumbnail */}
      <FLIThumbnail />

      {/* Content container */}
      <div className="flex grow flex-col gap-0">
        {/* Flow name */}
        <FLIName flowData={flowData} />

        {/* Time container */}
        <FLILastModifiedOn flowData={flowData} />
      </div>

      {/* Actions container */}
      <FLIActions flowId={flowData.id || "flowId"} />
    </div>
  );
};
