import { Button } from "@/react-toolkit/components/ui";
import { useOpenProject } from "../hooks/useOpenProject";
import { cn } from "@/react-toolkit/lib";

interface ProjectsTableCellLinkProps {
  /** The ID of the project to open. */
  rowId: string;

  /** The cell value to display. */
  cellValue: string;
}

export const ProjectsTableCellLink = ({
  rowId,
  cellValue,
}: ProjectsTableCellLinkProps) => {
  // Get handle open project action function
  const handleOpenProjectAction = useOpenProject();

  // Return the component
  return (
    <Button
      onClick={() => handleOpenProjectAction(rowId)}
      variant={"link"}
      className={cn(
        "!h-8 w-auto truncate font-medium text-foreground hover:text-primary",
      )}
    >
      {cellValue}
    </Button>
  );
};
