import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { DATA_QUERY_KEY } from "../constants";
import { MachineTableDto } from "../dtos/machine-table-dto";
import { useShallow } from "zustand/react/shallow";
import { useDTCrudDialogStore } from "@/react-toolkit/stores/dt-crud-dialog-store";
import { useMachineAssignmentStore, type assignmentType } from "../store/machine-assignment-store";

/**
 * Custom hook to handle opening a machine.
 *
 * @returns A function to handle opening the machine.
 */
export const useMachineAssignment = () => {
  // Get the navigate function
  const navigate = useNavigate();

  // Get query client
  const queryClient = useQueryClient();

  // Get store state and actions
  const { setCrudDialogOptions } = useDTCrudDialogStore(
    useShallow((state) => ({
      setCrudDialogOptions: state.setCrudDialogOptions,
    })),
  );

  const { setTypeOfAssignment, setMachineId, setIsDialogOpen } = useMachineAssignmentStore(
    useShallow((state) => ({
      setTypeOfAssignment: state.setTypeOfAssignment,
      setMachineId: state.setMachineId,
      setIsDialogOpen: state.setIsDialogOpen,
    })),
  );


  // Handle open machine action
  const handleMachineAssignmentAction = (rowId: string, typeOfAssignment: assignmentType) => {
    setCrudDialogOptions({
      showDialog: true,
      rowId: rowId,
      crudAction: "update",
    });

    setTypeOfAssignment(typeOfAssignment);
    setMachineId(rowId);
    setIsDialogOpen(true);

    return
    // Get machines data from query client
    const machinesData = queryClient.getQueryData<{
      data: MachineTableDto[];
    }>(DATA_QUERY_KEY);

    // Get machines data by id
    const machineData = machinesData?.data.find((item) => item.id === rowId);
    // // Navigate to machine flows page
    navigate(`/project/flows?p=${rowId}&pn=${machineData?.name}`);
  };

  // Return the handle open machine action function
  return handleMachineAssignmentAction;
};
