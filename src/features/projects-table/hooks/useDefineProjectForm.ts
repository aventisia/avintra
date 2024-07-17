import { useForm } from "react-hook-form";
import { z } from "zod";
import { projectZodSchema } from "../constants/project-zod-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProjectsTableDto } from "../dtos/projects-table-dto";
import { DATA_QUERY_KEY } from "../constants/constants";
import { useShallow } from "zustand/react/shallow";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useUserSessionStore } from "@/react-toolkit/stores";
import { useDTCrudDialogStore } from "@/react-toolkit/components/data-table";

/**
 * Custom hook for defining a project form.
 *
 * @returns An object containing the form, form methods, and other related values.
 */
export const useDefineProjectForm = () => {
  // 1. Get user session
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  // 2. Get crud dialog store state and actions
  const {
    crudDialogOptions: { rowId, crudAction },
    setShowDialog,
  } = useDTCrudDialogStore(
    useShallow((state) => ({
      crudDialogOptions: state.crudDialogOptions,
      setShowDialog: state.setShowDialog,
    })),
  );

  // 3. Get query client
  const queryClient = useQueryClient();

  // 4. Define form with zod schema
  const form = useForm<z.infer<typeof projectZodSchema>>({
    resolver: zodResolver(projectZodSchema),
  });

  // 5. Destructor form values and methods
  const {
    formState: { isSubmitting, isDirty },
  } = form;

  // 6. Fetch project data when rowId changes
  useEffect(() => {
    // Get projects data from query client
    const projectsData = queryClient.getQueryData<{
      data: ProjectsTableDto[];
    }>(DATA_QUERY_KEY);

    // Get project data by id
    const projectData = projectsData?.data.find((item) => item.id === rowId);

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

  // 7. Refine form data based on crud action
  const refineFormData = (formData: z.infer<typeof projectZodSchema>) => {
    return {
      ...formData,
      lastModifiedBy: userSession?.email ?? "",
      lastModifiedOn: new Date().toISOString(),
    };
  };

  // 8. Return form and methods
  return {
    form,
    isSubmitting,
    isDirty,
    rowId,
    crudAction,
    setShowDialog,
    refineFormData,
  };
};
