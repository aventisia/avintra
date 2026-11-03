import { SimpleDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { TableCNRowActionsMenu } from "@avplatform/ui/table-cn";
import { CoinsIcon } from "@phosphor-icons/react";
import { useShallow } from "zustand/react/shallow";

import { useTenantPublishedAgentsStore } from "../../stores/tenant-published-agents-store.ee";

interface TenantPublishedAgentRowActionsProps {
  flowVersionId: string;
}

export const TenantPublishedAgentRowActions = ({
  flowVersionId,
}: TenantPublishedAgentRowActionsProps) => {
  const { setShowFixedCreditsDialog, setFlowVersionId } = useTenantPublishedAgentsStore(
    useShallow((state) => ({
      setShowFixedCreditsDialog: state.setShowFixedCreditsDialog,
      setFlowVersionId: state.setFlowVersionId,
    })),
  );

  return (
    <TableCNRowActionsMenu
      ariaLabel="Open tenant published agent actions"
      contentClassName="w-48 max-w-48"
    >
      <SimpleDDMenuItem
        size="md"
        content="Set fixed credits"
        Icon={CoinsIcon}
        onClick={() => {
          setFlowVersionId(flowVersionId);
          setShowFixedCreditsDialog(true);
        }}
      />
    </TableCNRowActionsMenu>
  );
};
