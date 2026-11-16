import { SimpleDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { ArrowSquareOutIcon } from "@phosphor-icons/react";

import { useNavigateToInstance } from "../../hooks/useNavigateToInstance.ee";

interface TenantInstanceOpenActionProps {
  rowId: string;
  name: string;
}

export const TenantInstanceOpenAction = ({ rowId, name }: TenantInstanceOpenActionProps) => {
  const { handleOpenInstance } = useNavigateToInstance();

  // Return the component
  return (
    <SimpleDDMenuItem
      content="Open"
      Icon={ArrowSquareOutIcon}
      onClick={() => handleOpenInstance(rowId, name)}
    />
  );
};
