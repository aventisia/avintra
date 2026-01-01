import { SimpleDDMenuItem } from "@aventisia/ui/dropdown-menu";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

interface TenantInstanceOpenActionProps {
  rowId: string;
}

export const TenantInstanceOpenAction = ({
  rowId,
}: TenantInstanceOpenActionProps) => {
  const navigate = useNavigate();

  // Return the component
  return (
    <SimpleDDMenuItem
      content="Open"
      Icon={ArrowTopRightOnSquareIcon}
      onClick={() => navigate(rowId)}
    />
  );
};
