import { SimpleDDMenuItem } from "@aventisia/ui/dropdown-menu";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

import { useNavigateToInstance } from "../../hooks/useNavigateToInstance";

interface TenantInstanceOpenActionProps {
  rowId: string;
  name: string;
}

export const TenantInstanceOpenAction = ({
  rowId,
  name,
}: TenantInstanceOpenActionProps) => {
  const { handleOpenInstance } = useNavigateToInstance();

  // Return the component
  return (
    <SimpleDDMenuItem
      content="Open"
      Icon={ArrowTopRightOnSquareIcon}
      onClick={() => handleOpenInstance(rowId, name)}
    />
  );
};
