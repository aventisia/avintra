import { SimpleDDMenuItem } from "@aventisia/ui/dropdown-menu";
import { EyeIcon } from "@heroicons/react/24/outline";
import { useShallow } from "zustand/react/shallow";

import { useOpenModel } from "../../hooks/useOpenModel";
import { useMlModelVersionsStore } from "../../stores/model-versions-store";

interface MVViewActionProps {
  mlModelId: string;
  name?: string;
  versionId?: string;
  versionNumber?: number | null;
}

/**
 * Renders a dropdown menu item for opening a mlModel.
 */
export const MVViewAction = ({
  mlModelId,
  versionId,
  name,
  versionNumber,
}: MVViewActionProps) => {
  // Get handle function to open version
  const handleOpenModelAction = useOpenModel();

  // Get store state and actions
  const { setVersion } = useMlModelVersionsStore(
    useShallow((state) => ({
      setVersion: state.setVersion,
    })),
  );

  // Return the component
  return (
    <SimpleDDMenuItem
      size="sm"
      content="View"
      Icon={EyeIcon}
      onClick={() => {
        handleOpenModelAction(mlModelId, name, versionId);
        setVersion(versionId || "", versionNumber || null);
      }}
    />
  );
};
