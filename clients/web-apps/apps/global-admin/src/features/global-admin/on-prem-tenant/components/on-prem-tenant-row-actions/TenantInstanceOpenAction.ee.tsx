import { SimpleDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

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
      Icon={ArrowTopRightOnSquareIcon}
      onClick={() => handleOpenTenant(rowId, cellValue)}
    />
  );
};
