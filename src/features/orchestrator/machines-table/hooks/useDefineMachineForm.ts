import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";

import { useCheckAvailability } from "@aventisia/ui/hooks";
import { useDTCrudDialogStore } from "@aventisia/ui/stores";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { isMachineNameAvailable } from "../apis/machines-table-apis";
import { DATA_QUERY_KEY } from "../constants";
import {
  machineNameSchema,
  machineZodSchema,
} from "../constants/machine-zod-schema";
import { MachinesTableDto } from "../dtos/machines-table-dto";
import { useAgentsSelectTableStore } from "../stores/agents-select-table-store";
import { useFetchSelectTableAgents } from "./useFetchSelectAgents";

/**
 * Custom hook for defining a machine form.
 */
export const useDefineMachineForm = () => {
  // Set machine name state (required for avaialbility check)
  const [machineName, setMachineName] = useState("");

  // Get user session
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  // Get data-table crud dialog store state and actions
  const {
    crudDialogOptions: { showDialog, rowId, crudAction },
    toggleFormDirty,
    setShowDialog,
  } = useDTCrudDialogStore(
    useShallow((state) => ({
      crudDialogOptions: state.crudDialogOptions,
      setShowDialog: state.setShowDialog,
      toggleFormDirty: state.toggleFormDirty,
    })),
  );

  const {
    data: currentAgentsDataResponse,
    isFetching,
    isLoading,
  } = useFetchSelectTableAgents(rowId);

  // Get store state and actions
  const { currentAgents, setCurrentAgents, setAllAssigned, setIsReadOnly } =
    useAgentsSelectTableStore(
      useShallow((state) => ({
        currentAgents: state.currentAgents,
        setCurrentAgents: state.setCurrentAgents,
        setAllAssigned: state.setAllAssigned,
        setIsReadOnly: state.setIsReadOnly,
      })),
    );

  useEffect(() => {
    setIsReadOnly(crudAction === "read");
    setCurrentAgents(
      currentAgentsDataResponse?.data.filter(
        (a) => crudAction !== "read" || a.isAssigned,
      ) ?? [],
    );
    if (currentAgentsDataResponse?.data)
      setAllAssigned(
        currentAgentsDataResponse?.data.some((x) => x.isAssigned)
          ? "indeterminate"
          : currentAgentsDataResponse?.data.every((x) => x.isAssigned),
      );
  }, [
    rowId,
    isFetching,
    currentAgentsDataResponse?.data,
    setAllAssigned,
    setCurrentAgents,
    setIsReadOnly,
    crudAction,
  ]);

  // Get query client
  const queryClient = useQueryClient();

  // Define form with zod schema
  /* IMPORTANT NOTE: It is important to set default value to all fields to avoid error - "A component is changing an uncontrolled input to be controlled". */
  const form = useForm<z.infer<typeof machineZodSchema>>({
    resolver: zodResolver(machineZodSchema),
    defaultValues: {
      id: "",
      name: "",
      type: "",
      licenseId: "",
      environment: "",
      ipAddress: "",
      hostname: "",
      isDisabled: false,
      createdBy: userSession?.firstName + " " + userSession?.lastName,
      createdOn: new Date(),
      lastModifiedBy: userSession?.firstName + " " + userSession?.lastName,
      lastModifiedOn: new Date(),
    },
  });

  //TODO - isDirty state whenever the assign agent select table changes
  // Select agents table is not updating the selection on edit machine.
  // Destructor form values and methods
  const {
    formState: { isDirty },
  } = form;

  // Fetch machine data when rowId changes
  useEffect(() => {
    // Get machines data from query client
    const machinesData = queryClient.getQueryData<{
      data: MachinesTableDto[];
    }>(DATA_QUERY_KEY);

    // Get machine data by id
    const machineData = machinesData?.data.find((item) => item.id === rowId);

    // Set machine name
    setMachineName(machineData?.name ?? "");

    // Set machine data to form
    form.reset({
      id: rowId,
      name: machineData?.name ?? "",
      type: machineData?.type ?? "",
      licenseId: machineData?.licenseId ?? "",
      environment: machineData?.environment,
      ipAddress: machineData?.ipAddress,
      hostname: machineData?.hostname,

      isDisabled: machineData?.isDisabled,
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
  }, [rowId, form, queryClient, userSession]);

  // Get check availability state and methods
  const {
    isAvailable,
    isCheckPending,
    handleInputChange,
    availabilityMessage,
    setAvailabilityMessage,
  } = useCheckAvailability<z.infer<typeof machineZodSchema>, z.ZodString>({
    defaultInputValue: machineName,
    fieldName: "name",
    form,
    fieldSchema: machineNameSchema,
    checkAvailabilityAPIFn: isMachineNameAvailable,
  });

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
  }, [isDirty, toggleFormDirty, currentAgents]);

  // Reset availability message when dialog closes
  useEffect(() => {
    if (!showDialog) setAvailabilityMessage(null);
  }, [setAvailabilityMessage, showDialog]);

  // Return form and methods
  return {
    form,
    isDirty,
    rowId,
    crudAction,
    isFetching,
    isLoading,
    setShowDialog,
    refineFormData,
    isAvailable,
    availabilityMessage,
    setAvailabilityMessage,
    isCheckPending,
    handleInputChange,
  };
};
