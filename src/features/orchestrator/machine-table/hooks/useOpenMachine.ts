import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { DATA_QUERY_KEY } from "../constants";
import { MachineTableDto } from "../dtos/machine-table-dto";

/**
 * Custom hook to handle opening a machine.
 *
 * @returns A function to handle opening the machine.
 */
export const useOpenMachine = () => {
  // Get the navigate function
  const navigate = useNavigate();

  // Get query client
  const queryClient = useQueryClient();

  // Handle open machine action
  const handleOpenMachineAction = (rowId: string) => {
    // Get machines data from query client
    const machinesData = queryClient.getQueryData<{
      data: MachineTableDto[];
    }>(DATA_QUERY_KEY);

    // Get machines data by id
    const machineData = machinesData?.data.find((item) => item.id === rowId);

    // Navigate to machine flows page
    navigate(`/project/flows?p=${rowId}&pn=${machineData?.name}`);
  };

  // Return the handle open machine action function
  return handleOpenMachineAction;
};
