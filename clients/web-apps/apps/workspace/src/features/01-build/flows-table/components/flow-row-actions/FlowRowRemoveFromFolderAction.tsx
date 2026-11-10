import { SimpleDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { FoldersIcon } from "@phosphor-icons/react";

import { useMoveFlowToFolder } from "../../hooks/useMoveFlowToFolder.hook";

type FlowRowRemoveFromFolderActionProps = {
  rowId: string;
  name: string;
};

export const FlowRowRemoveFromFolderAction = ({
  rowId,
  name,
}: FlowRowRemoveFromFolderActionProps) => {
  const { moveFlow } = useMoveFlowToFolder();

  return (
    <SimpleDDMenuItem
      content="Remove from folder"
      Icon={FoldersIcon}
      onClick={() => moveFlow({ flowId: rowId, flowName: name, folder: null })}
    />
  );
};
