import { FLILastModifiedOn, FLIName, FLIThumbnail, FlowsTableDto } from "@/features/flows-popover";
import { cn } from "@/react-toolkit/lib";

interface FlowsTableCellProps {
  flowData: FlowsTableDto;
}

/**
 * Renders a table cell for the flows table.
 */
export const FlowListItem = ({ flowData }: FlowsTableCellProps) => {
  // Return the component
  return (
    <div
      className={cn(
        "group flex w-auto items-center gap-3 px-0.5 py-0.5",
      )}
    >
      {/* Flow thumbnail */}
      <FLIThumbnail />

      {/* Content container */}
      <div className="flex grow flex-col gap-0">
        {/* Flow name */}
        <FLIName flowData={flowData} />

        {/* Time container */}
        <FLILastModifiedOn flowData={flowData} />
      </div>
    </div>
  );
};
