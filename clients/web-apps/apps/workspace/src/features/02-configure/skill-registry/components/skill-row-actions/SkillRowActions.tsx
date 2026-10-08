import { DTRowAction, DataTableRowActions } from "@avplatform/ui/data-table";
import { DropdownMenuSeparator, SimpleDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

import { useConfigureResourceAccessActions } from "@/features/02-configure/hooks/useConfigureResourceAccessActions.hook";
import { RemoveResourceRowAction } from "@/features/resource-share/components/common-row-actions/RemoveResourceRowAction";
import { ResourceShareRowAction } from "@/features/resource-share/components/common-row-actions/ResourceShareRowAction";
import { ResourceAccessTypeEnum } from "@/features/resource-share/enums/resource-access-type-enum";
import { ResourceTypeEnum } from "@/features/resource-share/enums/resource-type-enum";

import { TABLE_TAB_QUERY_PARAM } from "../../constants";
import { useTableTab } from "../../hooks/useTableTab.hook";
import { SkillRowDeleteAction } from "./SkillRowDeleteAction";

interface SkillRowActionsProps {
  rowId: string;
  name: string;
  accessLevel: ResourceAccessTypeEnum;
  isTenantWideAccess: boolean;
  isPlatformSkill?: boolean;
}

export const SkillRowActions = ({
  rowId,
  name,
  accessLevel,
  isTenantWideAccess,
  isPlatformSkill: isPlatformSkillRow = false,
}: SkillRowActionsProps) => {
  const navigate = useNavigate();

  const { actions, isProd, resourceActions } = useConfigureResourceAccessActions(accessLevel);

  // Get the active tab and the query key used to invalidate the merged skills list
  const { isPlatformTab, queryKey } = useTableTab();

  const readOnly = isPlatformSkillRow || isPlatformTab;

  return (
    // Dropdown menu for skill table row action
    <DataTableRowActions className="w-36 min-w-36">
      {actions?.read && (
        <SimpleDDMenuItem
          Icon={ArrowTopRightOnSquareIcon}
          onClick={(e) => {
            e.stopPropagation();
            navigate(
              `/configure/skill-registry/${rowId}?skill=${name}${
                isPlatformTab ? `&${TABLE_TAB_QUERY_PARAM}=platform` : ""
              }`,
            );
          }}
          content="Open"
        />
      )}
      {/* Edit skill details (not available for platform default skills) */}
      {!readOnly && actions?.update && (
        <DTRowAction rowId={rowId} crudAction="update" entity="skill" />
      )}
      {/* Share Access (not available for platform default skills) */}
      {!readOnly && resourceActions.share && (
        <ResourceShareRowAction
          rowId={rowId}
          isTenantWideAccess={isTenantWideAccess}
          resourceType={ResourceTypeEnum.Skill}
          resourceName={name}
          disabled={isProd}
        />
      )}
      {/* DropdownMenuSeparator component */}
      <DropdownMenuSeparator />
      {/* Skill delete alert dialog (not available for platform default skills) */}
      {!readOnly && resourceActions.delete && <SkillRowDeleteAction rowId={rowId} />}

      {/* Remove the resource from the user's shared list (shown for rows the user doesn't own) */}
      {!readOnly &&
        accessLevel !== ResourceAccessTypeEnum.Owner &&
        accessLevel !== ResourceAccessTypeEnum.Personal && (
          <RemoveResourceRowAction queryKey={queryKey} rowId={rowId} disabled={isProd} />
        )}
    </DataTableRowActions>
  );
};
