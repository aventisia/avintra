import { SimpleDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { UsersIcon } from "lucide-react";
import React from "react";
import { useShallow } from "zustand/react/shallow";

import { ResourceTypeEnum } from "@/features/resource-share/enums/resource-type-enum";
import { useResourceShareStore } from "@/features/resource-share/stores/resource-share-store";

interface ResourceShareRowActionProps {
  rowId: string;
  resourceName: string;
  isTenantWideAccess: boolean;
  resourceType: ResourceTypeEnum;
  disabled?: boolean;
}

export const ResourceShareRowAction: React.FC<ResourceShareRowActionProps> = ({
  rowId,
  resourceName,
  isTenantWideAccess,
  resourceType,
  disabled = false,
}) => {
  const { setShowDialog, setResource } = useResourceShareStore(
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
