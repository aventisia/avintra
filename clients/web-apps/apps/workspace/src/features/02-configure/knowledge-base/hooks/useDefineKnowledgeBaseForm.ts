import { useCheckAvailability } from "@avplatform/ui/hooks";
import { useDTCrudDialogStore } from "@avplatform/ui/stores";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { isKnowledgeBaseNameAvailable } from "../apis/knowledge-base-apis";
import {
  knowledgeBaseNameSchema,
  knowledgeBaseZodSchema,
} from "../constants/knowledge-base-zod-schema";
import { KnowledgeBaseTableDto } from "../dtos/knowledge-base-table-dto";
import { VectorStoreEnum } from "../enums/vector-store-enum";
import { useTableTab } from "./useTableTab";

/**
 * Custom hook for defining a knowledge base form.
 */
export const useDefineKnowledgeBaseForm = () => {
  // Set knowledge base name state (required for availability check)
  const [knowledgeBaseName, setKnowledgeBaseName] = useState("");

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
  const form = useForm<z.infer<typeof knowledgeBaseZodSchema>>({
    resolver: zodResolver(knowledgeBaseZodSchema),
    defaultValues: {
      id: "",
      name: "",
      description: "",
      vectorStore: "pgvector",
      embeddingConfig: {
        isByokEnabled: false,
        provider: "openai",
        credentialId: "",
        model: "",
      },
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

  // Use this in place DATA_QUERY_KEY to handle Personal/Shared tabs list
  const { queryKey } = useTableTab();

  // Fetch knowledge base data when rowId changes
  useEffect(() => {
    // Get knowledgeBase data from query client
    const knowledgeBaseDataList = queryClient.getQueryData<{
      data: KnowledgeBaseTableDto[];
    }>(queryKey);

    // Get knowledge base data by id
    const knowledgeBaseData = knowledgeBaseDataList?.data?.find((item) => item.id === rowId);

    // Set knowledge base name
    setKnowledgeBaseName(knowledgeBaseData?.name ?? "");

    // Set knowledge base data to form
    form.reset({
      id: rowId,
      name: knowledgeBaseData?.name ?? "",
      description: knowledgeBaseData?.description ?? "",
      vectorStore: knowledgeBaseData?.vectorStore ?? "pgvector",
      embeddingConfig: {
        isByokEnabled: knowledgeBaseData?.embeddingCredentialId ? true : false,
        provider: knowledgeBaseData?.embeddingProvider ?? "openai",
        credentialId: knowledgeBaseData?.embeddingCredentialId ?? "",
        model: knowledgeBaseData?.embeddingModel ?? "",
      },
      isDisabled: knowledgeBaseData?.isDisabled ?? false,
      createdBy:
        knowledgeBaseData?.createdBy ?? userSession?.firstName + " " + userSession?.lastName,
      createdOn: knowledgeBaseData?.createdOn ? new Date(knowledgeBaseData?.createdOn) : new Date(),
      lastModifiedBy:
        knowledgeBaseData?.lastModifiedBy ?? userSession?.firstName + " " + userSession?.lastName,
      lastModifiedOn: knowledgeBaseData?.lastModifiedOn
        ? new Date(knowledgeBaseData?.lastModifiedOn)
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
  } = useCheckAvailability<z.infer<typeof knowledgeBaseZodSchema>, z.ZodString>({
    defaultInputValue: knowledgeBaseName,
    fieldName: "name",
    form,
    fieldSchema: knowledgeBaseNameSchema,
    checkAvailabilityAPIFn: isKnowledgeBaseNameAvailable,
  });

  // Refine form data based on crud action
  const refineFormData = (formData: z.infer<typeof knowledgeBaseZodSchema>) => {
    return {
      id: formData.id || undefined,
      name: formData.name,
      description: formData.description,
      vectorStore: formData.vectorStore as VectorStoreEnum,
      embeddingProvider: formData.embeddingConfig.provider,
      embeddingCredentialId: formData.embeddingConfig.credentialId || undefined,
      embeddingModel: formData.embeddingConfig.model,
      isDisabled: formData.isDisabled,
      createdBy: formData.createdBy,
      createdOn: formData.createdOn?.toISOString(),
      lastModifiedBy: formData.lastModifiedBy,
      lastModifiedOn: formData.lastModifiedOn?.toISOString(),
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
