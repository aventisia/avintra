import {
  FLILastModifiedOn,
  FLIName,
  FLIThumbnail,
  FlowsTableDto,
} from "@/features/flows-popover";
import { cn } from "@/react-toolkit/lib";
import { FLIActions } from "./actions/FLIActions";

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
