import { DropdownMenuSeparator } from "@avplatform/ui/dropdown-menu";
import { TableCNRowActionsMenu } from "@avplatform/ui/table-cn";

import ApproveTemplateRowAction from "./ApproveTemplateRowAction";
import OpenTemplateRowAction from "./OpenTemplateRowAction";
import RejectTemplateRowAction from "./RejectTemplateRowAction";
import ViewTemplateRowAction from "./ViewTemplateRowAction";

interface PendingTemplatesRowActionsProps {
  rowId: string;
  refId?: string;
  accessPath?: string;
}

/**
 * Dropdown menu for row-level actions in the Templates Approval table.
 *
 * Provides options to:
 * - Open the original flow in AgentBuilder
 * - View the template in read-only mode
 * - Approve the template
 * - Reject the template with a remark
 *
 * @param rowId - The unique ID of the template row
 * @param accessPath - Optional path used to open the original flow
 */
export const PendingTemplatesRowActions = ({
  rowId,
  accessPath = "",
}: PendingTemplatesRowActionsProps) => {
  return (
    <TableCNRowActionsMenu ariaLabel="Open templates approval actions">
      {/* Opens the original flow in a new tab (AgentBuilder) */}
      {import.meta.env.MODE !== "production" && <OpenTemplateRowAction accessPath={accessPath} />}

      {/* Opens the view of the template */}
      <ViewTemplateRowAction rowId={rowId} />

      {/* Approves the template */}
      <ApproveTemplateRowAction rowId={rowId} />

      <DropdownMenuSeparator />

      {/* Rejects the template with optional remarks */}
      <RejectTemplateRowAction rowId={rowId} />
    </TableCNRowActionsMenu>
  );
};
