import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { saveAsTemplateSchema } from "../constants/save-as-template-zod-schema";

import { useShallow } from "zustand/react/shallow";

import { useCurrentFlowStore } from "@/stores/current-flow-store";

import { useSaveAsTemplateMutation } from "./useSaveAsTemplateMutation";

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

  // Initialize mutation for saving the template
  const { mutate, isPending } = useSaveAsTemplateMutation();

  /**
   * Form submission handler
   *
   * Maps form values to DTO format and triggers mutation
   */
  const onSubmit = (formData: z.infer<typeof saveAsTemplateSchema>) => {
    mutate({
      accessType: formData.accessLevel,
      name: formData.name,
      refId: currentFlow.versionId,
      type: formData.saveAs,
      description: formData.description,
      tags: formData.tags,
    });
  };

  // Initialize the form with validation and default values
  const form = useForm<z.infer<typeof saveAsTemplateSchema>>({
    resolver: zodResolver(saveAsTemplateSchema),
    defaultValues: {
      name: currentFlow.name,
      description: currentFlow.description,
      accessLevel: "TenantLevel",
      saveAs: "Agent",
      saveAsTemplate: true,
      spaces: [],
      tags: [],
    },
  });

  // Show "spaces" field only if access level is set to "Spaces"
  const showSpaces = form.watch("accessLevel") === "Spaces";

  // Expose form state and helpers
  return {
    form,
    isPending,
    showSpaces,
    onSubmit,
  };
};
