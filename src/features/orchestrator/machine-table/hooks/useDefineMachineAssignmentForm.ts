import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";
import { DATA_QUERY_KEY } from "../constants";
import { machineZodSchema } from "../constants/machine-zod-schema";
import { MachineTableDto } from "../dtos/machine-table-dto";
import { useMachineAssignmentStore } from "../store/machine-assignment-store";
import type { machineAssingmentZodSchema } from "../constants/machine-assingnemt-zod-schema";

/**
 * Custom hook for defining a machine assignment form to assign the flow or agent.
 */
export const useDefineMachineAssignmentForm = () => {

  // Get user session
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  // Get machine assignment dialog store state and actions
  const {
    machineId,
    toggleFormDirty,
    setIsDialogOpen,
  } = useMachineAssignmentStore(
    useShallow((state) => ({
      machineId: state.machineId,
      setIsDialogOpen: state.setIsDialogOpen,
      toggleFormDirty: state.toggleFormDirty,
    })),
  );

  // Get query client
  const queryClient = useQueryClient();

  // Define form with zod schema
  /* IMPORTANT NOTE: It is important to set default value to all fields to avoid error - "A component is changing an uncontrolled input to be controlled". */
  const form = useForm<z.infer<typeof machineAssingmentZodSchema>>({
    resolver: zodResolver(machineZodSchema),
    defaultValues: {
      id: "",
      flowId: "",
      flowCount: 0,
      createdBy: userSession?.firstName + " " + userSession?.lastName,
      createdOn: new Date(),
      lastModifiedBy: userSession?.firstName + " " + userSession?.lastName,
      lastModifiedOn: new Date(),
    },
  });

  // Destructor form values and methods
  const {
    formState: { isDirty },
  } = form;

  // Fetch machine data when rowId changes
  useEffect(() => {
    // Get machines data from query client
    const machinesData = queryClient.getQueryData<{
      data: MachineTableDto[];
    }>(DATA_QUERY_KEY);

    // Get machine data by id
    const machineData = machinesData?.data.find((item) => item.id === machineId);

    // Set machine data to form
    form.reset({
      id: machineId,
      flowId: "",
      // Read (view) only fields
      flowCount: machineData?.flowCount ?? 0,
      createdBy:
        machineData?.createdBy ??
        userSession?.firstName + " " + userSession?.lastName,
      createdOn: machineData?.createdOn
        ? new Date(machineData?.createdOn)
        : new Date(),
      lastModifiedBy:
        machineData?.lastModifiedBy ??
        userSession?.firstName + " " + userSession?.lastName,
      lastModifiedOn: machineData?.lastModifiedOn
        ? new Date(machineData?.lastModifiedOn)
        : new Date(),
    });
  }, [machineId, form, queryClient, userSession]);


  // Refine form data based on crud action
  const refineFormData = (formData: z.infer<typeof machineZodSchema>) => {
    return {
      ...formData,
      lastModifiedBy: userSession?.email ?? "",
      lastModifiedOn: new Date().toISOString(),
    };
  };

  // Save the form dirty state
  useEffect(() => {
    toggleFormDirty(isDirty);
  }, [isDirty, toggleFormDirty]);


  // Return form and methods
  return {
    form,
    isDirty,
    setIsDialogOpen,
    refineFormData,
  };
};
