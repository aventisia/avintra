import { ResourceTypeEnum } from "@/features/resource-share/enums/resource-type-enum";
import { useResourceShareStore } from "@/features/resource-share/stores/resource-share-store";

import { SimpleDDMenuItem } from "@aventisia/ui/dropdown-menu";
import { UserIcon } from "lucide-react";
import React from "react";
import { useShallow } from "zustand/react/shallow";

interface ResourceShareRowActionProps {
  rowId: string;
  isTenantWideAccess: boolean;
}

export const ResourceShareRowAction: React.FC<ResourceShareRowActionProps> = ({
  rowId,
  isTenantWideAccess,
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
      content="Share Access"
      Icon={UserIcon}
      onClick={() => {
        setShowDialog(true);
        setResource(rowId, ResourceTypeEnum.KeyStore, isTenantWideAccess);
      }}
    />
  );
};
