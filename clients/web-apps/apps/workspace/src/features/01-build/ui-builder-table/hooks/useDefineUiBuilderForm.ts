import { useCrudDialogDirty } from "@avplatform/ui/data-table";
import { useCheckAvailability } from "@avplatform/ui/hooks";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { type CrudActionType } from "@avplatform/ui/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { getMergedQueryData } from "@/utils/get-merged-query-data.util";

import { isUiBuilderNameAvailable } from "../apis/ui-builder-table-apis";
import { UI_BUILDER_QUERY_KEY } from "../constants";
import { uiBuilderNameSchema, uiBuilderZodSchema } from "../constants/ui-builder-zod-schema";
import { UiBuilderTableDto } from "../dtos/ui-builder-table-dto";

interface UseDefineUiBuilderFormOptions {
  rowId: string;
  crudAction: CrudActionType;
}

/**
 * Custom hook for defining a custom UI builder project form.
 */
export const useDefineUiBuilderForm = ({ rowId, crudAction }: UseDefineUiBuilderFormOptions) => {
  const [projectName, setProjectName] = useState("");

  const { setIsDirty } = useCrudDialogDirty();

  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  const queryClient = useQueryClient();

  /* IMPORTANT NOTE: It is important to set default value to all fields to avoid error - "A component is changing an uncontrolled input to be controlled". */
  const form = useForm<z.infer<typeof uiBuilderZodSchema>>({
    resolver: zodResolver(uiBuilderZodSchema),
    defaultValues: {
      id: "",
      name: "",
      description: "",
      isTenantWideAccess: false,
      isDisabled: false,
      createdBy: userSession?.firstName + " " + userSession?.lastName,
      createdOn: new Date(),
      lastModifiedBy: userSession?.firstName + " " + userSession?.lastName,
      lastModifiedOn: new Date(),
    },
  });

  const {
    formState: { isDirty },
  } = form;

  useEffect(() => {
    const projectsData = getMergedQueryData<UiBuilderTableDto>(queryClient, UI_BUILDER_QUERY_KEY);
    const projectData = projectsData?.data.find((item) => item.id === rowId);

    setProjectName(projectData?.name ?? "");

    form.reset({
      id: rowId,
      name: projectData?.name ?? "",
      description: projectData?.description ?? "",
      isTenantWideAccess: projectData?.isTenantWideAccess ?? false,
      isDisabled: projectData?.isDisabled ?? false,
      createdBy: projectData?.createdBy ?? userSession?.firstName + " " + userSession?.lastName,
      createdOn: projectData?.createdOn ? new Date(projectData?.createdOn) : new Date(),
      lastModifiedBy:
        projectData?.lastModifiedBy ?? userSession?.firstName + " " + userSession?.lastName,
      lastModifiedOn: projectData?.lastModifiedOn
        ? new Date(projectData?.lastModifiedOn)
        : new Date(),
    });

    setTimeout(() => {
      form.setFocus("name", { shouldSelect: false });
    }, 0);
  }, [rowId, form, queryClient, userSession]);

  const {
    isAvailable,
    isCheckPending,
    handleInputChange,
    availabilityMessage,
    setAvailabilityMessage,
  } = useCheckAvailability<z.infer<typeof uiBuilderZodSchema>, z.ZodString>({
    defaultInputValue: projectName,
    fieldName: "name",
    form,
    fieldSchema: uiBuilderNameSchema,
    checkAvailabilityAPIFn: isUiBuilderNameAvailable,
  });

  const refineFormData = (formData: z.infer<typeof uiBuilderZodSchema>) => {
    return {
      ...formData,
      lastModifiedBy: userSession?.email ?? "",
      lastModifiedOn: new Date().toISOString(),
    };
  };

  useEffect(() => {
    setIsDirty(isDirty);
  }, [isDirty, setIsDirty]);

  useEffect(() => {
    return () => {
      setAvailabilityMessage(null);
    };
  }, [setAvailabilityMessage]);

  return {
    form,
    isDirty,
    crudAction,
    refineFormData,
    isAvailable,
    availabilityMessage,
    isCheckPending,
    handleInputChange,
  };
};
