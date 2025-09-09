import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { saveAsTemplateSchema } from "../constants/save-as-template-zod-schema";

import { useShallow } from "zustand/react/shallow";

import { useCurrentFlowStore } from "@/stores/current-flow-store";

import { useSaveAsTemplateMutation } from "./useSaveAsTemplateMutation";
import { useFileStore } from "@/features/file-uploader-setup/stores/file-uploader-store";
import { useEffect } from "react";
import { useFetchTemplateDetails } from "./useFetchTemplateDetails";
import { useUpdateTemplateMutation } from "./useUpdateTemplateMutation";
import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";

/**
 * useDefineSATForm
 *
 * Custom hook to manage the "Save As Template" form.
 * Integrates schema validation, default values, and submit logic.
 */
export const useDefineSATForm = () => {
  // Retrieve current flow from global store
  const { currentFlow } = useCurrentFlowStore(
    useShallow((state) => ({
      currentFlow: state.currentFlow,
    })),
  );

  // Get user session
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  const { filesToUpload, addFilesToUpload } = useFileStore(
    useShallow((state) => ({
      filesToUpload: state.filesToUpload,
      addFilesToUpload: state.addFilesToUpload,
    })),
  );

  const { data } = useFetchTemplateDetails();

  // Initialize mutation for saving the template
  const { mutate, isPending } = useSaveAsTemplateMutation();

  const { mutate: updateTemplate, isPending: isUpdatePending } =
    useUpdateTemplateMutation();

  /**
   * Form submission handler
   *
   * Maps form values to DTO format and triggers mutation
   */
  const onSubmit = (formData: z.infer<typeof saveAsTemplateSchema>) => {
    if (data?.data) {
      updateTemplate({
        ...data.data,
        accessType: formData.accessType,
        name: formData.name,
        type: currentFlow.type,
        description: formData.description,
        tags: formData.tags,
        resources: filesToUpload,
        lastModifiedBy: userSession?.email ?? "",
        lastModifiedOn: new Date(),
      });
    } else
      mutate({
        accessType: formData.accessType,
        name: formData.name,
        refId: currentFlow.versionId,
        type: currentFlow.type,
        description: formData.description,
        tags: formData.tags,
        resources: filesToUpload,
        createdBy: userSession?.firstName + " " + userSession?.lastName,
        createdOn: new Date(),
      });
  };

  // Initialize the form with validation and default values
  const form = useForm<z.infer<typeof saveAsTemplateSchema>>({
    resolver: zodResolver(saveAsTemplateSchema),
    defaultValues: {
      name: currentFlow.name,
      description: "",
      accessType: "TenantLevel",
      spaces: [],
      tags: [],
      resources: [],
    },
  });

  useEffect(() => {
    if (data?.data)
      form.reset({
        name: data?.data.name ?? currentFlow.name,
        description: data?.data.description ?? "",
        accessType: data?.data.accessType ?? "TenantLevel",
        spaces: [],
        tags: data?.data.tags ?? [],
        resources: data?.data.resources ?? [],
      });
    if (data?.data?.resources) addFilesToUpload(data?.data?.resources);
  }, [data?.data]);

  // Show "spaces" field only if access level is set to "Spaces"
  const showSpaces = form.watch("accessType") === "Spaces";

  const status = data?.data.status;

  const viewMode = currentFlow.accessType == "View";

  // Expose form state and helpers
  return {
    form,
    isPending,
    isUpdatePending,
    showSpaces,
    status,
    viewMode,
    onSubmit,
  };
};
