import { SimpleDDMenuItem } from "@aventisia/ui/dropdown-menu";
import { PencilSquareIcon } from "@heroicons/react/24/outline";

import { useInsertModelVersionMutation } from "../../hooks/useInsertModelVersionMutation";

interface MVDraftActionProps {
  mlModelId: string;
  versionId: string;
  name?: string;
}

/**
 * Renders a dropdown menu item for creating new version.
 */
export const MVDraftAction = ({
  mlModelId,
  versionId,
  name,
}: MVDraftActionProps) => {
  const { mutate: insertVersion } = useInsertModelVersionMutation({
    mlModelId,
    versionId,
  });

  // Return the component
  return (
    <SimpleDDMenuItem
      size="sm"
      content="Use as draft"
      Icon={PencilSquareIcon}
      onClick={() => {
        insertVersion({ aiProjectId: mlModelId, businessContext: "", name });
      }}
    />
  );
};
