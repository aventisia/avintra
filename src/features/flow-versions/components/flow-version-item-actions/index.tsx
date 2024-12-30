import { DropdownMenuContent } from "@/react-toolkit/ui/dropdown-menu";
import { DropdownMenu } from "@/react-toolkit/ui/dropdown-menu/DropdownMenu";
import { FVIViewAction } from "./FVIViewAction";
import { FVIActionsTrigger } from "./FVIActionsTrigger";
import { FVIDraftAction } from "./FVIDraftAction";

interface FlowVersionItemActionsProps {
  flowId: string;
  isView: boolean;
  versionID: string;
}

/**
 * Renders the actions dropdown menu for a flow Version item.
 */
export const FlowVersionItemActions = ({
  flowId,
  isView,
  versionID,
}: FlowVersionItemActionsProps) => {
  return (
    <DropdownMenu>
      <FVIActionsTrigger />
      <DropdownMenuContent align="end" className="w-[8rem] min-w-[6rem]">
        <FVIViewAction flowId={flowId} />
        {!isView && <FVIDraftAction versionID={versionID} />}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
