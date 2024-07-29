import { useCheckAvailability } from "@/react-toolkit/hooks/useCheckAvailability";
import { useDTCrudDialogStore } from "@/react-toolkit/stores/dt-crud-dialog-store";
import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";
import { isProjectNameAvailable } from "../apis/projects-table-apis";
import { DATA_QUERY_KEY } from "../constants/constants";
import {
  projectNameSchema,
  projectZodSchema,
} from "../constants/project-zod-schema";
import { ProjectsTableDto } from "../dtos/projects-table-dto";

/**
 * Custom hook for defining a project form.
 */
export const useDefineProjectForm = () => {
  // Set project name state (required for avaialbility check)
  const [projectName, setProjectName] = useState("");

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
  const form = useForm<z.infer<typeof projectZodSchema>>({
    resolver: zodResolver(projectZodSchema),
  });

  // Destructor form values and methods
  const {
    formState: { isDirty },
  } = form;

  // Fetch project data when rowId changes
  useEffect(() => {
    // Get projects data from query client
    const projectsData = queryClient.getQueryData<{
      data: ProjectsTableDto[];
    }>(DATA_QUERY_KEY);

    // Get project data by id
    const projectData = projectsData?.data.find((item) => item.id === rowId);

    // Set project name
    setProjectName(projectData?.name ?? "");

    // Set project data to form
    form.reset({
      id: rowId,
      type: projectData?.type ?? "",
      name: projectData?.name ?? "",
      description: projectData?.description ?? "",
      isDisabled: projectData?.isDisabled ?? false,
      // Read (view) only fields
      flowCount: projectData?.flowCount ?? 0,
      createdBy:
        projectData?.createdBy ??
        userSession?.firstName + " " + userSession?.lastName,
      createdOn: projectData?.createdOn
        ? new Date(projectData?.createdOn)
        : new Date(),
      lastModifiedBy:
        projectData?.lastModifiedBy ??
        userSession?.firstName + " " + userSession?.lastName,
      lastModifiedOn: projectData?.lastModifiedOn
        ? new Date(projectData?.lastModifiedOn)
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
  } = useCheckAvailability<z.infer<typeof projectZodSchema>, z.ZodString>({
    defaultInputValue: projectName,
    fieldName: "name",
    form,
    fieldSchema: projectNameSchema,
    checkAvailabilityAPIFn: isProjectNameAvailable,
  });

  // Refine form data based on crud action
  const refineFormData = (formData: z.infer<typeof projectZodSchema>) => {
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
