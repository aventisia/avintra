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
import { SkillRowDeleteAction } from "./SkillRowDeleteAction";

interface SkillRowActionsProps {
  rowId: string;
  name: string;
  accessLevel: ResourceAccessTypeEnum;
  isTenantWideAccess: boolean;
  isLibrary?: boolean;
}

export const SkillRowActions = ({
  rowId,
  name,
  accessLevel,
  isTenantWideAccess,
  isLibrary: isLibraryRow = false,
}: SkillRowActionsProps) => {
  const navigate = useNavigate();

  const actions = getResourceAccessActions(accessLevel);

  // Get the active tab and the query key used to invalidate the merged skills list
  const { isLibrary: isLibraryTab, queryKey } = useTableTab();

  const readOnly = isLibraryRow || isLibraryTab;

  return (
    // Dropdown menu for skill table row action
    <DataTableRowActions className="w-36 min-w-36">
      {actions?.read && (
        <SimpleDDMenuItem
          Icon={ArrowTopRightOnSquareIcon}
          onClick={(e) => {
            e.stopPropagation();
            navigate(
              `/configure/skills/${rowId}?skill=${name}${
                isLibraryTab ? `&${TABLE_TAB_QUERY_PARAM}=library` : ""
              }`,
            );
          }}
          content="Open"
        />
      )}
      {/* Edit skill details (not available for library skills) */}
      {!readOnly && actions?.update && (
        <DTRowAction rowId={rowId} crudAction="update" entity="skill" />
      )}
      {/* Share Access (not available for library skills) */}
      {!readOnly && actions?.share && (
        <ResourceShareRowAction
          rowId={rowId}
          isTenantWideAccess={isTenantWideAccess}
          resourceType={ResourceTypeEnum.Skill}
          resourceName={name}
        />
      )}
      {/* DropdownMenuSeparator component */}
      <DropdownMenuSeparator />
      {/* Skill delete alert dialog (not available for library skills) */}
      {!readOnly && actions?.delete && <SkillRowDeleteAction rowId={rowId} />}

      {/* Remove the resource from the user's shared list (shown for rows not owned by the user) */}
      {!readOnly && accessLevel !== ResourceAccessTypeEnum.Owner && (
        <RemoveResourceRowAction queryKey={queryKey} rowId={rowId} />
      )}
    </DataTableRowActions>
  );
};
