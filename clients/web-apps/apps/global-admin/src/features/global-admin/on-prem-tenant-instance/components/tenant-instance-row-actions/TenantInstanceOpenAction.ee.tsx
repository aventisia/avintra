import { SimpleDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { ExternalLinkIcon } from "lucide-react";

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
      Icon={ExternalLinkIcon}
      onClick={() => handleOpenInstance(rowId, name)}
    />
  );
};
