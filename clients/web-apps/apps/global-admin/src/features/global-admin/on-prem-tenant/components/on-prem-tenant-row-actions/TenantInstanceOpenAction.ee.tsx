import { SimpleDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { ExternalLinkIcon } from "lucide-react";

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
      Icon={ExternalLinkIcon}
      onClick={() => handleOpenTenant(rowId, cellValue)}
    />
  );
};
