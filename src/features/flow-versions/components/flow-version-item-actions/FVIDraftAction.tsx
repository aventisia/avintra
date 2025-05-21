import { SimpleDDMenuItem } from "@aventisia/ui/dropdown-menu";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { useFlowsVersionsStore } from "../../stores/flow-versions-store";
import { useShallow } from "zustand/react/shallow";

interface FVIDraftActionProps {
  versionID: string;
}

/**
 * Renders a dropdown menu item for opening a flow.
 */
export const FVIDraftAction = ({ versionID }: FVIDraftActionProps) => {
  // Get store state and actions
  const { setVersionID } = useFlowsVersionsStore(
    useShallow((state) => ({
      setVersionID: state.setVersionID,
    })),
  );

  // Return the component
  return (
    <SimpleDDMenuItem
      size="sm"
      content="Use as draft"
      Icon={PencilSquareIcon}
      onClick={() => {
        setVersionID(versionID);
      }}
    />
  );
};
