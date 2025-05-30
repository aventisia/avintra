import { DropdownMenuContent } from "@aventisia/ui/dropdown-menu";
import { DropdownMenu } from "@aventisia/ui/dropdown-menu";
import { FVIViewAction } from "./FVIViewAction";
import { FVIActionsTrigger } from "./FVIActionsTrigger";
import { FVIDraftAction } from "./FVIDraftAction";
import { FVIDeleteAction } from "./FVIDeleteAction";

interface FlowVersionItemActionsProps {
  flowId: string;
  isPublished: boolean;
  versionId: string;
  versionNumber: number | null;
}

/**
 * Renders the actions dropdown menu for a flow Version item.
 */
export const FlowVersionItemActions = ({
  flowId,
  isPublished,
  versionId,
  versionNumber,
}: FlowVersionItemActionsProps) => {
  return (
    <DropdownMenu>
      <FVIActionsTrigger />
      <DropdownMenuContent align="end" className="w-[8rem] min-w-[6rem]">
        <FVIViewAction
          flowId={flowId}
          versionId={versionId}
          versionNumber={versionNumber}
        />
        {isPublished && <FVIDraftAction flowId={flowId} />}
        {!isPublished && <FVIDeleteAction versionId={versionId} />}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
