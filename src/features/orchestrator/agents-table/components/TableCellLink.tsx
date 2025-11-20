import { Button } from "@aventisia/ui/buttons";
import { cn } from "@aventisia/ui/lib";

interface TableCellLinkProps {
  /** The agent ID to open. */
  rowId: string;

  /** The version ID */
  versionId: string;

  /** The cell value to display. */
  cellValue: string;

  /** Type of row (Agent/AIProject). */
  type: string;
}

export const TableCellLink = ({
  rowId,
  cellValue,
  type,
  versionId,
}: TableCellLinkProps) => {
  // Function to open agent/model
  const handleOpenAction = (rowId: string) => {
    // Open url based on type
    window.location.href =
      type == "Agent"
        ? `${import.meta.env.VITE_AGENTBUILDER_URL}/agent?f=${rowId}&v=${versionId}`
        : "#"; //TODO:Add model url
  };

  // Return the component
  return (
    <Button
      onClick={() => handleOpenAction(rowId)}
      variant={"link"}
      className={cn(
        "!h-8 w-auto truncate font-medium text-foreground hover:text-primary",
      )}
    >
      {cellValue}
    </Button>
  );
};
