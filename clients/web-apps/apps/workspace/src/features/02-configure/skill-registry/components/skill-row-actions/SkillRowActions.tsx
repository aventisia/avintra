import { CrudRowAction } from "@avplatform/ui/crud-dialog";
import { DropdownMenuSeparator, SimpleDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { TableCNRowActionsMenu } from "@avplatform/ui/table-cn";
import { ArrowSquareOutIcon } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";

import { useConfigureResourceAccessActions } from "@/features/02-configure/hooks/useConfigureResourceAccessActions.hook";
import { ResourceFlowAccessRowAction } from "@/features/resource-flow-access/components/common-row-actions/ResourceFlowAccessRowAction";
import { RemoveResourceRowAction } from "@/features/resource-user-access/components/common-row-actions/RemoveResourceRowAction";
import { ResourceUserAccessRowAction } from "@/features/resource-user-access/components/common-row-actions/ResourceUserAccessRowAction";
import { ResourceAccessTypeEnum } from "@/features/resource-user-access/enums/resource-access-type-enum";
import { ResourceTypeEnum } from "@/features/resource-user-access/enums/resource-type-enum";

import { TABLE_TAB_QUERY_PARAM } from "../../constants";
import { useTableTab } from "../../hooks/useTableTab.hook";
import { SkillRowDeleteAction } from "./SkillRowDeleteAction";

interface SkillRowActionsProps {
  rowId: string;
  name: string;
  accessLevel: ResourceAccessTypeEnum;
  isTenantWideAccess: boolean;
  isResourceAccessRestricted: boolean;
  isPlatformSkill?: boolean;
}

export const SkillRowActions = ({
  rowId,
  name,
  accessLevel,
  isTenantWideAccess,
  isResourceAccessRestricted,
  isPlatformSkill: isPlatformSkillRow = false,
}: SkillRowActionsProps) => {
  const navigate = useNavigate();

  const { actions, isProd, resourceActions } = useConfigureResourceAccessActions(accessLevel);

  // Get the active tab and the query key used to invalidate the merged skills list
  const { isPlatformTab, queryKey } = useTableTab();

  const readOnly = isPlatformSkillRow || isPlatformTab;

  return (
    // Dropdown menu for skill table row action
    <TableCNRowActionsMenu ariaLabel="Open skill actions" contentClassName="w-36 min-w-36">
      {actions?.read && (
        <SimpleDDMenuItem
          Icon={ArrowSquareOutIcon}
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
        <CrudRowAction rowId={rowId} crudAction="update" entity="skill" />
      )}
      {!readOnly && actions?.update && (
        <ResourceFlowAccessRowAction
          rowId={rowId}
          resourceName={name}
          resourceType={ResourceTypeEnum.Skill}
          isRestricted={isResourceAccessRestricted}
          disabled={isProd}
        />
      )}
      {/* Share Access (not available for platform default skills) */}
      {!readOnly && resourceActions.share && (
        <ResourceUserAccessRowAction
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
    </TableCNRowActionsMenu>
  );
};
