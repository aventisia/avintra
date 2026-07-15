import { useDTCrudDialogStore } from "@aventisia/ui/stores";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { EnvironmentTypesEnum } from "@/react-toolkit/enums/machine-environment-types-enum";
import { OsTypesEnum } from "@/react-toolkit/enums/machine-os-types-enum";

import { DATA_QUERY_KEY } from "../constants";
import { machineZodSchema } from "../constants/machine-zod-schema";
import { MachinesTableDto } from "../dtos/machines-table-dto";
import { buildMachineNamePreview } from "../utils/build-machine-name-util";

/**
 * Custom hook for defining a machine form.
 */
export const useDefineMachineForm = () => {
  // Get data-table crud dialog store state and actions
  const {
    crudDialogOptions: { rowId, crudAction },
    toggleFormDirty,
    setShowDialog,
  } = useDTCrudDialogStore(
    useShallow((state) => ({
      crudDialogOptions: state.crudDialogOptions,
      setShowDialog: state.setShowDialog,
      toggleFormDirty: state.toggleFormDirty,
    })),
  );

  // Get query client
  const queryClient = useQueryClient();

  // Define form with zod schema
  /* IMPORTANT NOTE: It is important to set default value to all fields to avoid error - "A component is changing an uncontrolled input to be controlled". */
  const form = useForm<z.infer<typeof machineZodSchema>>({
    resolver: zodResolver(machineZodSchema),
    defaultValues: {
      id: "",
      environment: EnvironmentTypesEnum.Development,
      operatingSystem: OsTypesEnum.Windows,
      osID: "",
      username: "",
      hostname: "",
      ipAddress: "0.0.0.0",
      isDisabled: false,
      name: "",
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
      data: MachinesTableDto[];
    }>(DATA_QUERY_KEY);

    // Get machine data by id
    const machineData = machinesData?.data.find((item) => item.id === rowId);

    // Set machine data to form
    form.reset({
      id: rowId,
      environment: machineData?.environment ?? EnvironmentTypesEnum.Development,
      operatingSystem: machineData?.operatingSystem ?? OsTypesEnum.Windows,
      osID: machineData?.osID ?? "",
      username: machineData?.username ?? "",
      hostname: machineData?.hostname ?? "",
      ipAddress: machineData?.ipAddress ?? "0.0.0.0",
      isDisabled: machineData?.isDisabled ?? false,
      name: machineData?.name ?? "",
    });

    // Focus first editable field after reset.
    setTimeout(() => {
      form.setFocus("osID", { shouldSelect: false });
    }, 0);
  }, [rowId, form, queryClient]);

  const [environment, operatingSystem, osID, username] = useWatch({
    control: form.control,
    name: ["environment", "operatingSystem", "osID", "username"],
  });

  // Keep read-only name in sync with backend naming format for user preview.
  useEffect(() => {
    const namePreview = buildMachineNamePreview({
      environment: environment ?? "",
      operatingSystem: operatingSystem ?? "",
      osID: osID ?? "",
      username: username ?? "",
    });

    form.setValue("name", namePreview, {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });
  }, [environment, operatingSystem, osID, username, form]);

  // Save the form dirty state
  useEffect(() => {
    toggleFormDirty(isDirty);
  }, [isDirty, toggleFormDirty]);

  // Return form and methods
  return {
    form,
    isDirty,
    rowId,
    crudAction,
    setShowDialog,
  };
};
