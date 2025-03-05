import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { DATA_QUERY_KEY } from "../constants";
import { ProjectsTableDto } from "../dtos/projects-table-dto";

/**
 * Custom hook to handle opening a project.
 *
 * @returns A function to handle opening the project.
 */
export const useOpenProject = () => {
  // Get the navigate function
  const navigate = useNavigate();

  // Get query client
  const queryClient = useQueryClient();

  // Handle open project action
  const handleOpenProjectAction = (rowId: string) => {
    // Get projects data from query client
    const projectsData = queryClient.getQueryData<{
      data: ProjectsTableDto[];
    }>(DATA_QUERY_KEY);

    // Get project data by id
    const projectData = projectsData?.data.find((item) => item.id === rowId);

    // Navigate to project agents page
    navigate(`/projects/agents?p=${rowId}&pn=${projectData?.name}`);
  };

  // Return the handle open project action function
  return handleOpenProjectAction;
};
