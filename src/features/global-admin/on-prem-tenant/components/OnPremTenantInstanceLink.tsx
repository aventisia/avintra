import { Button } from "@aventisia/ui/buttons";
import { cn } from "@aventisia/ui/lib";
import { useNavigate } from "react-router-dom";

interface OnPremTenantInstanceLinkProps {
  /** The ID of the job to open TenantInstance. */
  rowId: string;

  /** The cell value to display. */
  cellValue: string;
}

export const OnPremTenantInstanceLink = ({
  rowId,
  cellValue,
}: OnPremTenantInstanceLinkProps) => {
  const navigate = useNavigate();

  // Return the component
  return (
    <Button
      onClick={() => navigate(`${rowId}`)}
      variant={"link"}
      className={cn(
        "!h-8 w-auto truncate font-medium text-foreground hover:text-primary",
      )}
    >
      {cellValue}
    </Button>
  );
};
