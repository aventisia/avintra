import { SimpleDDMenuItem } from "@/react-toolkit/ui/dropdown-menu/SimpleDDMenuItem";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { useOpenProject } from "../../hooks/useOpenProject";

interface ProjectRowOpenActionProps {
  rowId: string;
}

export const ProjectRowOpenAction = ({ rowId }: ProjectRowOpenActionProps) => {
  // Get handle function to open project
  const handleOpenProjectAction = useOpenProject();

  // Return the component
  return (
    <SimpleDDMenuItem
      content="Open"
      Icon={ArrowTopRightOnSquareIcon}
      onClick={() => handleOpenProjectAction(rowId)}
    />
  );
};
