import { useCrudDialogDirty } from "@avplatform/ui/data-table";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { getMachine } from "../apis/machines-table-apis";
import { machineZodSchema } from "../constants/machine-zod-schema";

interface UseDefineMachineFormOptions {
  rowId: string;
}

/**
 * Custom hook for defining a machine edit form.
 * Machines are registered through the desktop app, so this form is used only
 * for updating an existing machine (assigned flow versions and disabled state).
 */
export const useDefineMachineForm = ({ rowId }: UseDefineMachineFormOptions) => {
  const { setIsDirty } = useCrudDialogDirty();

  // Define form with zod schema
  /* IMPORTANT NOTE: It is important to set default value to all fields to avoid error - "A component is changing an uncontrolled input to be controlled". */
  const form = useForm<z.infer<typeof machineZodSchema>>({
    resolver: zodResolver(machineZodSchema),
    mode: "onChange",
    defaultValues: {
      id: "",
      hostname: "",
      flowVersionIds: [],
      isDisabled: false,
      name: "",
    },
  });

  // Destructor form values and methods
  const {
    formState: { isDirty, isValid },
  } = form;

  // Fetch machine data when rowId changes
  useEffect(() => {
    let isActive = true;

    const resetMachineForm = async () => {
      if (!rowId) {
        return;
      }

      try {
        const machineRecordResponse = await getMachine(rowId);

        if (!isActive) {
          return;
        }

        const machineData = machineRecordResponse?.data;

        form.reset({
          id: machineData?.id ?? rowId,
          hostname: machineData?.hostname ?? "",
          flowVersionIds: machineData?.machineFlowVersions ?? [],
          isDisabled: machineData?.isDisabled ?? false,
          name: machineData?.name ?? "",
        });
      } catch {
        if (!isActive) {
          return;
        }

        form.reset();
      }
    };

    resetMachineForm();

    return () => {
      isActive = false;
    };
  }, [rowId, form]);

  // Save the form dirty state
  useEffect(() => {
    setIsDirty(isDirty);
  }, [isDirty, setIsDirty]);

  // Return form and methods
  return {
    form,
    isDirty,
    isValid,
  };
};
