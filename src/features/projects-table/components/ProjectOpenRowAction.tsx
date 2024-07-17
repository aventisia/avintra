import {
  DropdownMenuItem,
  buttonVariants,
} from "@/react-toolkit/components/ui";
import { cn } from "@/react-toolkit/lib";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { useOpenProject } from "../hooks/useOpenProject";

/**
 * Props for the OpenRowAction component.
 */
interface OpenRowActionProps {
  /** The ID of the row to open. */
  rowId: string;
}

/**
 * Renders a dropdown menu item for opening a project row.
 *
 * @param {OpenRowActionProps} props - The component props.
 * @param {string} props.rowId - The ID of the row.
 * @returns {JSX.Element} The rendered component.
 */
export const ProjectOpenRowAction = ({ rowId }: OpenRowActionProps) => {
  // Get handle open project action function
  const handleOpenProjectAction = useOpenProject();

  // Return the component
  return (
    <DropdownMenuItem
      className={cn(buttonVariants({ variant: "dropdownItem" }), "h-8")}
      onClick={() => handleOpenProjectAction(rowId)}
    >
      <ArrowTopRightOnSquareIcon className="h-4 w-4 text-[--icon-color]" />
      Open
    </DropdownMenuItem>
  );
};
