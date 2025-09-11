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
import { useValidateTemplateMutation } from "./useValidateTemplateMutation";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { getRelevantNodeIds } from "../utils/getRelevantNodeIds";
import { NodeDataType } from "@/types/node-data-type";
import { Node } from "@xyflow/react";
import { useSaveAsTemplateStore } from "../stores/save-as-template-store";

/**
 * useDefineSATForm
 *
 * Custom hook to manage the "Save As Template" form.
 * Integrates schema validation, default values, and submit logic.
 */
export const useDefineSATForm = () => {
  // Get the current flow store
  const { currentFlow } = useCurrentFlowStore(
    useShallow((state) => ({
      currentFlow: state.currentFlow,
    })),
  );

  // Get the current flow store
  const { nodes } = useReactFlowExtStore(
    useShallow((state) => ({
      nodes: state.nodes,
    })),
  );

  // Get user session from user session store
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  // Get state and actions from the  store
  const { validationStatus, setValidationStatus } = useSaveAsTemplateStore(
    useShallow((state) => ({
      validationStatus: state.validationStatus,
      setValidationStatus: state.setValidationStatus,
    })),
  );

  // File upload state
  const { filesToUpload, initializeFilesToUpload } = useFileStore(
    useShallow((state) => ({
      filesToUpload: state.filesToUpload,
      initializeFilesToUpload: state.initializeFilesToUpload,
    })),
  );

  // Fetch template details
  const { data } = useFetchTemplateDetails();

  const { mutate: validateTemplate } = useValidateTemplateMutation();

  useEffect(() => {
    const childIds = getRelevantNodeIds(nodes as Node<NodeDataType>[]);
    const obj = childIds?.map((i) => {
      return { refId: i };
    });
    if (obj?.length > 0) validateTemplate(obj);
    else setValidationStatus(true);
  }, []);

  // Mutation for creating a new template
  const { mutate, isPending } = useSaveAsTemplateMutation();

  // Mutation for updating an existing template
  const { mutate: updateTemplate, isPending: isUpdatePending } =
    useUpdateTemplateMutation();

  const form = useForm<z.infer<typeof saveAsTemplateSchema>>({
    resolver: zodResolver(saveAsTemplateSchema), // Zod schema validation
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
    if (data?.data) {
      form.reset({
        name: data?.data.name ?? currentFlow.name,
        description: data?.data.description ?? "",
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
        type: currentFlow.type,
        description: formData.description,
        tags: formData.tags,
        resources: filesToUpload.length > 0 ? filesToUpload : null,
        lastModifiedBy: userSession?.firstName + " " + userSession?.lastName,
        lastModifiedOn: new Date(),
      });
    } else {
      // If creating a new template
      mutate({
        accessType: formData.accessType,
        name: formData.name,
        refId: currentFlow.versionId,
        type: currentFlow.type,
        description: formData.description,
        tags: formData.tags,
        resources: filesToUpload.length > 0 ? filesToUpload : null,
        createdBy: userSession?.firstName + " " + userSession?.lastName,
        createdOn: new Date(),
      });
    }
  };

  // Show the "Spaces" input only when access type is set to "Spaces"
  const showSpaces = form.watch("accessType") === "Spaces";

  // Get current status of the template
  const status = data?.data?.status;

  // Disable form if access type is view
  const viewMode = currentFlow.accessType == "View";

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
    validationStatus,
    onSubmit,
  };
};
