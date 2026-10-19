import { SimpleDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { BotIcon } from "lucide-react";
import React from "react";
import { useShallow } from "zustand/react/shallow";

import { ResourceTypeEnum } from "../../enums/resource-type-enum";
import { useResourceFlowAccessStore } from "../../stores/resource-flow-access.store";

type ResourceFlowAccessRowActionProps = {
  rowId: string;
  resourceName: string;
  resourceType: ResourceTypeEnum;
  isRestricted: boolean;
  disabled?: boolean;
};

/**
 * Renders the row action that opens the reusable flow assignment dialog.
 */
export const ResourceFlowAccessRowAction: React.FC<ResourceFlowAccessRowActionProps> = ({
  rowId,
  resourceName,
  resourceType,
  isRestricted,
  disabled = false,
}) => {
  const { setShowDialog, setResource } = useResourceFlowAccessStore(
    useShallow((s) => ({
      setShowDialog: s.setShowDialog,
      setResource: s.setResource,
    })),
  );

  return (
    <SimpleDDMenuItem
      size="md"
      content="Assign Agents"
      Icon={BotIcon}
      disabled={disabled}
      onClick={() => {
        if (disabled) return;
        setShowDialog(true);
        setResource(rowId, resourceName, resourceType, isRestricted);
      }}
    />
  );
};
