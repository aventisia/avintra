import { DTRowAction, DataTableRowActions } from "@avplatform/ui/data-table";
import { DropdownMenuSeparator, SimpleDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

import { RemoveResourceRowAction } from "@/features/resource-share/components/common-row-actions/RemoveResourceRowAction";
import { ResourceShareRowAction } from "@/features/resource-share/components/common-row-actions/ResourceShareRowAction";
import { ResourceAccessTypeEnum } from "@/features/resource-share/enums/resource-access-type-enum";
import { ResourceTypeEnum } from "@/features/resource-share/enums/resource-type-enum";
import { getResourceAccessActions } from "@/features/resource-share/utils/resource-access-actions";

import { TABLE_TAB_QUERY_PARAM } from "../../constants";
import { useTableTab } from "../../hooks/useTableTab";
import { KBRowDeleteAction } from "./KBRowDeleteAction";

interface KBRowActionsProps {
  rowId: string;
  name: string;
  accessLevel: ResourceAccessTypeEnum;
  isTenantWideAccess: boolean;
}

export const KBRowActions = ({
  rowId,
  name,
  accessLevel,
  isTenantWideAccess,
}: KBRowActionsProps) => {
  const navigate = useNavigate();

  const actions = getResourceAccessActions(accessLevel);

  // Use this in place DATA_QUERY_KEY to handle Personal/Shared tabs list
  const { isShared, queryKey, currentTab } = useTableTab();

  return (
    // Dropdown menu for config table row action
    <DataTableRowActions className="w-36 min-w-36">
      {actions?.read && (
        <SimpleDDMenuItem
          Icon={ArrowTopRightOnSquareIcon}
          onClick={() => {
            navigate(
              `/configure/knowledge-base/${rowId}?kb=${name}&${TABLE_TAB_QUERY_PARAM}=${currentTab}`,
            );
          }}
          content="Open"
        />
      )}
      {/* Edit KB details */}
      {actions?.update && <DTRowAction rowId={rowId} crudAction="update" entity="knowledgeBase" />}
      {/* Share Access */}
      {actions?.share && (
        <ResourceShareRowAction
          rowId={rowId}
          isTenantWideAccess={isTenantWideAccess}
          resourceType={ResourceTypeEnum.KnowledgeBase}
          resourceName={name}
        />
      )}
      {/* DropdownMenuSeparator component */}
      <DropdownMenuSeparator />
      {/* Triggers Config delete alert dialog  */}
      {actions?.delete && <KBRowDeleteAction rowId={rowId} />}{" "}
      {isShared && <RemoveResourceRowAction queryKey={queryKey} rowId={rowId} />}
    </DataTableRowActions>
  );
};
