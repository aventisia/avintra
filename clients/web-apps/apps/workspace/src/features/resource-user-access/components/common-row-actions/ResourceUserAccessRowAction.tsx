import { SimpleDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { UsersIcon } from "@phosphor-icons/react";
import React from "react";
import { useShallow } from "zustand/react/shallow";

import { ResourceTypeEnum } from "@/features/resource-user-access/enums/resource-type-enum";
import { useResourceUserAccessStore } from "@/features/resource-user-access/stores/resource-user-access.store";

interface ResourceUserAccessRowActionProps {
  rowId: string;
  resourceName: string;
  isTenantWideAccess: boolean;
  resourceType: ResourceTypeEnum;
  disabled?: boolean;
}

export const ResourceUserAccessRowAction: React.FC<ResourceUserAccessRowActionProps> = ({
  rowId,
  resourceName,
  isTenantWideAccess,
  resourceType,
  disabled = false,
}) => {
  const { setShowDialog, setResource } = useResourceUserAccessStore(
    useShallow((s) => ({
      setShowDialog: s.setShowDialog,
      setResource: s.setResource,
    })),
  );

  // Return the dropdown menu item
  return (
    <SimpleDDMenuItem
      size="md"
      content="Share"
      Icon={UsersIcon}
      disabled={disabled}
      onClick={() => {
        if (disabled) return;
        setShowDialog(true);
        setResource(rowId, resourceName, resourceType, isTenantWideAccess);
      }}
    />
  );
};
