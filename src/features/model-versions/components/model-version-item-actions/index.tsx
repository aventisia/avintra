import { DropdownMenuContent } from "@aventisia/ui/dropdown-menu";
import { DropdownMenu } from "@aventisia/ui/dropdown-menu";
import { useSearchParams } from "react-router-dom";

import { MVActionsTrigger } from "./MVActionsTrigger";
import { MVDeleteAction } from "./MVDeleteAction";
import { MVDraftAction } from "./MVDraftAction";
import { MVViewAction } from "./MVViewAction";

interface ModelVersionItemActionsProps {
  mlModelId: string;
  isPublished: boolean;
  versionId: string;
  versionNumber: number | null;
  name?: string;
}

/**
 * Renders the actions dropdown menu for a ml model Version item.
 */
export const ModelVersionItemActions = ({
  mlModelId,
  isPublished,
  versionId,
  versionNumber,
  name,
}: ModelVersionItemActionsProps) => {
  const [searchParams] = useSearchParams();

  const currVersionId = searchParams.get("v") || undefined;

  return (
    <DropdownMenu>
      <MVActionsTrigger />
      <DropdownMenuContent align="end" className="w-[8rem] min-w-[6rem]">
        <MVViewAction
          mlModelId={mlModelId}
          versionId={versionId}
          versionNumber={versionNumber}
          name={name}
        />
        {isPublished && (
          <MVDraftAction
            mlModelId={mlModelId}
            versionId={versionId}
            name={name}
          />
        )}
        {currVersionId == versionId
          ? null
          : !isPublished && <MVDeleteAction versionId={versionId} />}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
