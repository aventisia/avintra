import { useCrudDialogDirty } from "@avplatform/ui/crud-dialog";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { type CrudActionType } from "@avplatform/ui/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { DATA_QUERY_KEY } from "../constants";
import { spaceZodSchema } from "../constants/space-zod-schema";
import { SpacesTableDto } from "../dtos/spaces-table-dto";

interface UseDefineSpaceFormOptions {
  rowId: string;
  crudAction: CrudActionType;
}

/**
 * Custom hook for defining a space form.
 */
export const useDefineSpaceForm = ({ rowId }: UseDefineSpaceFormOptions) => {
  // Get user session
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  const { setIsDirty } = useCrudDialogDirty();

  // Get query client
  const queryClient = useQueryClient();

  // Define form with zod schema
  /* IMPORTANT NOTE: It is important to set default value to all fields to avoid error - "A component is changing an uncontrolled input to be controlled". */
  const form = useForm<z.infer<typeof spaceZodSchema>>({
    resolver: zodResolver(spaceZodSchema),
    defaultValues: {
      id: "",
      name: "",
      description: "",
      isDisabled: false,
      isDefault: false,
      totalUsers: 0,
      totalPublishedAgents: 0,
      totalExecutionTime: 0,
      totalMachinesAttached: 0,
      createdBy: userSession?.firstName + " " + userSession?.lastName,
      createdOn: new Date(),
      lastModifiedBy: userSession?.firstName + " " + userSession?.lastName,
      lastModifiedOn: new Date(),
    },
  });

  // Desctructure form's methods
  const {
    formState: { isDirty },
  } = form;

  // Fetch space data when rowId changes
  useEffect(() => {
    // Get spaces data from query client
    const spacesData = queryClient.getQueryData<{
      data: SpacesTableDto[];
    }>(DATA_QUERY_KEY);

    // Get space data by id
    const spaceData = spacesData?.data.find((item) => item.id === rowId);

    // Set space data to form
    form.reset({
      id: rowId,
      name: spaceData?.name ?? "",
      description: spaceData?.description ?? "",
      isDisabled: spaceData?.isDisabled ?? false,
      isDefault: spaceData?.isDefault ?? false,
      totalUsers: spaceData?.totalUsers ?? 0,
      totalPublishedAgents: spaceData?.totalPublishedAgents ?? 0,
      totalExecutionTime: spaceData?.totalExecutionTime ?? 0,
      totalMachinesAttached: spaceData?.totalMachinesAttached ?? 0,
      createdBy: spaceData?.createdBy ?? userSession?.firstName + " " + userSession?.lastName,
      createdOn: spaceData?.createdOn ? new Date(spaceData?.createdOn) : new Date(),
      lastModifiedBy:
        spaceData?.lastModifiedBy ?? userSession?.firstName + " " + userSession?.lastName,
      lastModifiedOn: spaceData?.lastModifiedOn ? new Date(spaceData?.lastModifiedOn) : new Date(),
    });
  }, [rowId, form, queryClient, userSession]);

  // Refine form data based on crud action
  const refineFormData = (formData: z.infer<typeof spaceZodSchema>) => {
    return {
      ...formData,
      lastModifiedBy: userSession?.email ?? "",
      lastModifiedOn: new Date().toISOString(),
    };
  };

  // Save the form dirty state
  useEffect(() => {
    setIsDirty(isDirty);
  }, [isDirty, setIsDirty]);

  // Return form and methods
  return {
    form,
    isDirty,
    refineFormData,
  };
};
