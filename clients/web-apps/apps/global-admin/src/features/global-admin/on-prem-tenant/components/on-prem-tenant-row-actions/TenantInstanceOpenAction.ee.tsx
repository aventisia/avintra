import { SimpleDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { ArrowSquareOutIcon } from "@phosphor-icons/react";

import { useNavigateToTenant } from "../../hooks/useNavigateToTenant.ee";

interface TenantInstanceOpenActionProps {
  rowId: string;
  cellValue: string;
}

export const TenantInstanceOpenAction = ({ rowId, cellValue }: TenantInstanceOpenActionProps) => {
  const { handleOpenTenant } = useNavigateToTenant();

  // Return the component
  return (
    <SimpleDDMenuItem
      content="Open"
      Icon={ArrowSquareOutIcon}
      onClick={() => handleOpenTenant(rowId, cellValue)}
    />
  );
};
