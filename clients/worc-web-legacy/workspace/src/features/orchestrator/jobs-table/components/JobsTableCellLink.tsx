import { Button } from "@aventisia/ui/buttons";
import { cn } from "@aventisia/ui/lib";
import { useNavigate } from "react-router-dom";

interface JobsTableCellLinkProps {
  /** The ID of the job to open execution log. */
  rowId: string;

  /** The cell value to display. */
  cellValue: string;
}

export const JobsTableCellLink = ({
  rowId,
  cellValue,
}: JobsTableCellLinkProps) => {
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
