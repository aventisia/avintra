import { ProjectMetaDataDto } from "@/dtos/project-meta-data-dto";
import { useLabelDataStore } from "@/features/label-data/stores/label-data-store";
import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { saveAsTemplateSchema } from "../constants/save-as-template-zod-schema";
import { useFileStore } from "../stores/file-uploader-store";
import { getLLMIconPaths } from "../utils/getLLMIconPaths";
import { useFetchTemplateDetails } from "./useFetchTemplateDetails";
import { useFileDelete } from "./useFileDelete";
import { useSaveAsTemplateMutation } from "./useSaveAsTemplateMutation";
import { useUpdateTemplateMutation } from "./useUpdateTemplateMutation";

/**
 * useDefineSATForm
 *
 * Custom hook to manage the "Save As Template" form.
 * Integrates schema validation, default values, and submit logic.
 */
export const useDefineSATForm = () => {
  const [imgPaths, setImgPaths] = useState<string[]>([]);

  const queryClient = useQueryClient();

  // Get the model data store
  const { modelName, versionId, modelId } = useLabelDataStore(
    useShallow((state) => ({
      modelName: state.modelName,
      versionId: state.versionId,
      modelId: state.modelId,
    })),
  );

  // Get user session from user session store
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  // File upload state
  const { filesToUpload, filesToDelete, removeFile, initializeFilesToUpload } =
    useFileStore(
      useShallow((state) => ({
        filesToUpload: state.filesToUpload,
        filesToDelete: state.filesToDelete,
        initializeFilesToUpload: state.initializeFilesToUpload,
        removeFile: state.removeFile,
      })),
    );

  // Fetch template details
  const { data } = useFetchTemplateDetails();

  // Get models data from query client
  const modelData = queryClient.getQueryData<{
    data: ProjectMetaDataDto;
  }>(["project", modelId]);

  // Mutation for creating a new template
  const { mutate, isPending } = useSaveAsTemplateMutation();

  // Mutation for updating an existing template
  const { mutate: updateTemplate, isPending: isUpdatePending } =
    useUpdateTemplateMutation();

  const form = useForm<z.infer<typeof saveAsTemplateSchema>>({
    resolver: zodResolver(saveAsTemplateSchema), // Zod schema validation
    defaultValues: {
      name: modelName,
      instruction: "",
      accessType: "TenantLevel",
      spaces: [],
      tags: [],
      resources: [],
    },
  });
  const { mutate: deleteFile } = useFileDelete({
    removeFile,
    isPublic: form.watch("accessType") == "Public",
  });

  useEffect(() => {
    if (modelData?.data && modelData?.data?.llMs) {
      setImgPaths(getLLMIconPaths(modelData?.data?.llMs));
    }
  }, [modelData?.data]);

  useEffect(() => {
    if (data?.data) {
      form.reset({
        name: data?.data.name ?? modelName,
        instruction: data?.data.instruction ?? "",
        accessType: data?.data.accessType ?? "TenantLevel",
        spaces: [], // Not yet handled
        tags: data?.data.tags ?? [],
        resources: data?.data.resources ?? [],
      });

      // Load existing resources into file store
      if (data?.data?.resources) {
        initializeFilesToUpload(data?.data?.resources);
      }
    }
  }, [data?.data]);

  /**
   * Submits form values.
   * Decides between "create" and "update" depending on whether template data exists.
   */
  const onSubmit = (formData: z.infer<typeof saveAsTemplateSchema>) => {
    if (data?.data) {
      // If updating an existing template
      updateTemplate({
        ...data.data,
        accessType: formData.accessType,
        name: formData.name,
        type: "AIProject",
        description: "",
        instruction: formData.instruction ?? "",
        tags: formData.tags,
        icons: imgPaths,
        resources: filesToUpload.length > 0 ? filesToUpload : null,
        lastModifiedBy: userSession?.firstName + " " + userSession?.lastName,
        lastModifiedOn: new Date(),
      });
    } else {
      // If creating a new template
      mutate({
        accessType: formData.accessType,
        name: formData.name,
        refId: versionId,
        type: "AIProject",
        instruction: formData.instruction ?? "",
        description: "",
        tags: formData.tags,
        icons: imgPaths,
        resources: filesToUpload.length > 0 ? filesToUpload : null,
        createdBy: userSession?.firstName + " " + userSession?.lastName,
        createdOn: new Date(),
      });
    }
    filesToDelete.forEach((file) => {
      deleteFile(file);
    });
  };

  // Show the "Spaces" input only when access type is set to "Spaces"
  const showSpaces = form.watch("accessType") === "Spaces";

  // Get current status of the template
  const status = data?.data?.status;

  // Disable form if access type is view
  const viewMode = false; // need access type

  // ID of current template
  const templateId = data?.data?.id;

  // template remark
  const templateRemark = data?.data?.remark;

  // template lastModifiedBy
  const lastModifiedBy = data?.data?.lastModifiedBy;

  return {
    form,
    isPending,
    isUpdatePending,
    showSpaces,
    status,
    templateId,
    viewMode,
    templateRemark,
    lastModifiedBy,
    onSubmit,
  };
};
