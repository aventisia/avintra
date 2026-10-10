import { DropdownMenuContent } from "@avplatform/ui/dropdown-menu";
import { DropdownMenu } from "@avplatform/ui/dropdown-menu";
import { useSearchParams } from "react-router-dom";

import { FVIActionsTrigger } from "./FVIActionsTrigger";
import { FVIDeleteAction } from "./FVIDeleteAction";
import { FVIDraftAction } from "./FVIDraftAction";
import { FVIViewAction } from "./FVIViewAction";

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
  const [searchParams] = useSearchParams();

  const currVersionId = searchParams.get("v") || undefined;

  return (
    <DropdownMenu>
      <FVIActionsTrigger />
      <DropdownMenuContent align="end" className="w-[8rem] min-w-[6rem]">
        <FVIViewAction flowId={flowId} versionId={versionId} versionNumber={versionNumber} />
        <FVIDraftAction flowId={flowId} versionId={versionId} />
        {currVersionId == versionId
          ? null
          : !isPublished && <FVIDeleteAction versionId={versionId} versionNumber={versionNumber} />}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
