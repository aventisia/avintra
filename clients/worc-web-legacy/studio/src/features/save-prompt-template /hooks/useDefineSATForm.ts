import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";
import { useCurrentFlowStore } from "@/stores/current-flow-store";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { savePromptTemplateSchema } from "../constants/save-prompt-template-zod-schema";
import { TemplateAccessTypesEnum } from "../enums/template-access-type-enum";
import { ProjectTemplateTypesEnum } from "../enums/template-type-enum";
import { useSavePromptTemplateStore } from "../stores/save-prompt-template-store";
import { buildPromptTemplateSchema } from "../utils/build-prompt-schema";
import { useFetchTemplateDetails } from "./useFetchTemplateDetails";
import { useSaveAsTemplateMutation } from "./useSaveAsTemplateMutation";
import { useUpdateTemplateMutation } from "./useUpdateTemplateMutation";

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

  // Get the prompt template store
  const { formData: promptData, templateId } = useSavePromptTemplateStore(
    useShallow((state) => ({
      formData: state.formData,
      templateId: state.templateId,
    })),
  );

  // Get user session from user session store
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  // Fetch template details
  const { data } = useFetchTemplateDetails(templateId);

  // Mutation for creating a new template
  const { mutate, isPending } = useSaveAsTemplateMutation();

  // Mutation for updating an existing template
  const { mutate: updateTemplate, isPending: isUpdatePending } =
    useUpdateTemplateMutation();

  const form = useForm<z.infer<typeof savePromptTemplateSchema>>({
    resolver: zodResolver(savePromptTemplateSchema), // Zod schema validation
    defaultValues: {
      name: currentFlow.name,
      description: "",
      accessType: "TenantLevel",
      tags: [],
    },
  });

  useEffect(() => {
    if (data?.data) {
      form.reset({
        name: data?.data.name ?? currentFlow.name,
        description: data?.data.description ?? "",
        accessType: data?.data.accessType ?? "TenantLevel",
        tags: data?.data.tags ?? [],
      });
    }
  }, [data?.data]);

  /**
   * Submits form values.
   * Decides between "create" and "update" depending on whether template data exists.
   */
  const onSubmit = (formData: z.infer<typeof savePromptTemplateSchema>) => {
    const templateSchema = promptData
      ? buildPromptTemplateSchema(promptData)
      : {};
    let icons: string[] = [];
    if (templateSchema) {
      icons = [`/brand-img/${templateSchema.modelConfig?.provider}.svg`];
    }

    if (data?.data) {
      // If updating an existing template
      updateTemplate({
        ...data.data,
        accessType: formData.accessType as TemplateAccessTypesEnum,
        name: formData.name,
        type: currentFlow.type as unknown as ProjectTemplateTypesEnum,
        description: formData.description,
        tags: formData.tags,
        icons,
        schema: JSON.stringify(templateSchema),
        lastModifiedBy: userSession?.firstName + " " + userSession?.lastName,
        lastModifiedOn: new Date(),
      });
    } else {
      // If creating a new template
      mutate({
        accessType: formData.accessType as TemplateAccessTypesEnum,
        name: formData.name,
        refId: "00000000-0000-0000-0000-000000000000",
        type: ProjectTemplateTypesEnum.Prompt,
        description: formData.description,
        tags: formData.tags,
        icons,
        schema: JSON.stringify(templateSchema),
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
