import { cn } from "@avplatform/ui/lib";
import { EyeIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { RocketIcon } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { FlowVersionDto } from "../../dtos/flow-version-dto";
import { useFlowsVersionsStore } from "../../stores/flow-versions-store";
import { FlowVersionItemActions } from "../flow-version-item-actions";

interface FVItemProps {
  flowVersion: FlowVersionDto;
}

const FVItem = ({ flowVersion }: FVItemProps) => {
  // Get store state and actions
  const { versionID } = useFlowsVersionsStore(
    useShallow((state) => ({
      versionID: state.versionID,
      setVersion: state.setVersion,
    })),
  );
  const { id, isPublished, versionNumber, createdOn, flowId } = flowVersion;
  // Format date
  const getFormattedDate = (date: Date) => format(date, "MMM d, h:mm a");

  const isView = id == versionID;
  return (
    <div className={cn("mb-2 flex w-full items-center gap-3 px-1 py-0.5 last:mb-0")}>
      {/* User thumbnail */}

      {isPublished ? (
        <RocketIcon className="h-4 w-4 text-[--icon-color]" />
      ) : (
        <PencilSquareIcon className="h-4 w-4 text-[--icon-color]" />
      )}
      {/* Content container */}
      <div className="flex grow flex-col gap-0">
        {/* Agent name */}
        <span className="truncate text-xs font-medium leading-5">{`Version ${versionNumber}`}</span>

        {/* Time container */}
        <div className="mt-[1px] flex items-center text-2xs text-muted-foreground">
          {isPublished && "Published on "} {createdOn && getFormattedDate(createdOn)}
        </div>
      </div>

      <div className="flex w-12 items-center justify-end gap-1">
        {isView && <EyeIcon className="h-3.5 w-3.5" />}
        {/* Actions container */}
        <FlowVersionItemActions
          flowId={flowId}
          isPublished={!!isPublished}
          versionId={id || ""}
          versionNumber={versionNumber || null}
        />
      </div>
    </div>
  );
};

export default FVItem;
