import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";
import { DATA_QUERY_KEY } from "../constants";
import { useMachineFlowStore } from "../store/machine-flow-store";
import { machineFlowZodSchema } from "../constants/machine-flow-zod-schema";
import type { MachineDto } from "../dtos/machine-dto";
import { MachineTaskTypesEnum } from "@/react-toolkit/enums/machine-task-types-enum";
import { MachineStatusTypesEnum } from "@/react-toolkit/enums/machine-status-types-enum";
import { MachineEnvironmentTypesEnum } from "@/react-toolkit/enums/machine-environment-types-enum";

/**
 * Custom hook for defining a machine form.
 */
export const useDefineMachineAssignAgentForm = () => {


  // Get user session
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  // Get data-table crud dialog store state and actions
  const {
    machineId,
    toggleFormDirty,
    setShowDialog,
  } = useMachineFlowStore(
    useShallow((state) => ({
      setShowDialog: state.setIsDialogOpen,
      toggleFormDirty: state.toggleFormDirty,
      isDialogOpen: state.isDialogOpen,
      machineId: state.machineId,
    })),
  );

  // Get query client
  const queryClient = useQueryClient();

  // Define form with zod schema
  /* IMPORTANT NOTE: It is important to set default value to all fields to avoid error - "A component is changing an uncontrolled input to be controlled". */
  const form = useForm<z.infer<typeof machineFlowZodSchema>>({
    resolver: zodResolver(machineFlowZodSchema),
    defaultValues: {
      id: "",
      agentIds: [],
      machineId: "",

      type: "",
      name: "",
      ipAddress: "",
      hostname: "",
      isDisabled: false,
      isAvailable: false,

      environment: "",
      status: "",
      currentTask: "",

      createdBy: userSession?.firstName + " " + userSession?.lastName,
      createdOn: new Date(),
      lastCheckedIn: new Date(),
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
      data: MachineDto[];
    }>(DATA_QUERY_KEY);

    // Get machine data by id
    const machineData = machinesData?.data.find((item) => item.id === machineId);

    // Set machine data to form
    form.reset({
      id: machineId,
      agentIds: [],
      machineId,

      // Read (view) only fields
      name: machineData?.name ?? "",
      type: machineData?.type ?? "",
      ipAddress: machineData?.ipAddress ?? "",
      hostname: machineData?.hostname ?? "",
      isAvailable: machineData?.isAvailable ?? false,
      lastCheckedIn: new Date(),
      isDisabled: machineData?.isDisabled ?? false,
      currentTask: machineData?.currentTask ?? MachineTaskTypesEnum.Flow,
      status: machineData?.status ?? MachineStatusTypesEnum.Ideal,
      environment: machineData?.environment ?? MachineEnvironmentTypesEnum.Development,

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
  const refineFormData = (formData: z.infer<typeof machineFlowZodSchema>) => {
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
    machineId: machineId,
    setShowDialog,
    refineFormData,
  };
};
