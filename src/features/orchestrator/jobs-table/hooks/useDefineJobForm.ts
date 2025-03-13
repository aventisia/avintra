import { useCheckAvailability } from "@/react-toolkit/hooks/useCheckAvailability";
import { useDTCrudDialogStore } from "@/react-toolkit/stores/dt-crud-dialog-store";
import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";
import { isNameAvailable } from "../apis/jobs-table-apis";
import { DATA_QUERY_KEY } from "../constants";
import {
  jobNameSchema,
  jobZodSchema,
} from "../constants/job-zod-schema";
import { JobsTableDto } from "../dtos/jobs-table-dto";

/**
 * Custom hook for defining a job form.
 */
export const useDefineJobForm = () => {
  // Set job name state (required for avaialbility check)
  const [jobName, setjobName] = useState("");

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

  // Get query client
  const queryClient = useQueryClient();

  // Define form with zod schema
  /* IMPORTANT NOTE: It is important to set default value to all fields to avoid error - "A component is changing an uncontrolled input to be controlled". */
  const form = useForm<z.infer<typeof jobZodSchema>>({
    resolver: zodResolver(jobZodSchema),
    defaultValues: {
      id: "",
      name: "",
      isDisabled: false,
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

  // Fetch job data when rowId changes
  useEffect(() => {
    // Get jobs data from query client
    const jobsData = queryClient.getQueryData<{
      data: JobsTableDto[];
    }>(DATA_QUERY_KEY);

    // Get job data by id
    const jobData = jobsData?.data.find((item) => item.id === rowId);

    // Set job name
    setjobName(jobData?.name ?? "");

    // Set job data to form
    form.reset({
      id: rowId,
      name: jobData?.name ?? "",
      isDisabled: jobData?.isDisabled ?? false,
      // Read (view) only fields
      createdBy:
        jobData?.createdBy ??
        userSession?.firstName + " " + userSession?.lastName,
      createdOn: jobData?.createdOn
        ? new Date(jobData?.createdOn)
        : new Date(),
      lastModifiedBy:
        jobData?.lastModifiedBy ??
        userSession?.firstName + " " + userSession?.lastName,
      lastModifiedOn: jobData?.lastModifiedOn
        ? new Date(jobData?.lastModifiedOn)
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
  } = useCheckAvailability<z.infer<typeof jobZodSchema>, z.ZodString>({
    defaultInputValue: jobName,
    fieldName: "name",
    form,
    fieldSchema: jobNameSchema,
    checkAvailabilityAPIFn: isNameAvailable,
  });

  // Refine form data based on crud action
  const refineFormData = (formData: z.infer<typeof jobZodSchema>) => {
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
    setShowDialog,
    refineFormData,
    isAvailable,
    availabilityMessage,
    setAvailabilityMessage,
    isCheckPending,
    handleInputChange,
  };
};
