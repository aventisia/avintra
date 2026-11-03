import { useCrudDialogDirty } from "@avplatform/ui/crud-dialog";
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

import { isKnowledgeBaseNameAvailable } from "../apis/knowledge-base-apis";
import {
  knowledgeBaseNameSchema,
  knowledgeBaseZodSchema,
} from "../constants/knowledge-base-zod-schema";
import { KnowledgeBaseTableDto } from "../dtos/knowledge-base-table-dto";
import { VectorStoreEnum } from "../enums/vector-store-enum";
import { useTableTab } from "./useTableTab";

interface UseDefineKnowledgeBaseFormOptions {
  rowId: string;
  crudAction: CrudActionType;
}

/**
 * Custom hook for defining a knowledge base form.
 */
export const useDefineKnowledgeBaseForm = ({
  rowId,
  crudAction,
}: UseDefineKnowledgeBaseFormOptions) => {
  // Set knowledge base name state (required for availability check)
  const [knowledgeBaseName, setKnowledgeBaseName] = useState("");

  const { setIsDirty } = useCrudDialogDirty();

  // Get user session
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
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
        credentialName: "",
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
    // Get knowledgeBase data from the merged Personal/Shared lists in the cache
    const knowledgeBaseDataList = getMergedQueryData<KnowledgeBaseTableDto>(queryClient, queryKey);

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
        credentialName:
          knowledgeBaseData?.embeddingCredentialName ??
          knowledgeBaseData?.embeddingCredentialId ??
          "",
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
  }, [rowId, form, queryClient, userSession, queryKey]);

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
      embeddingCredentialName: formData.embeddingConfig.credentialName || undefined,
      embeddingCredentialId: undefined,
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
    setIsDirty(isDirty);
  }, [isDirty, setIsDirty]);

  // Reset availability message when dialog closes
  useEffect(() => {
    return () => {
      setAvailabilityMessage(null);
    };
  }, [setAvailabilityMessage]);

  // Return form and methods
  return {
    form,
    isDirty,
    crudAction,
    refineFormData,
    isAvailable,
    availabilityMessage,
    setAvailabilityMessage,
    isCheckPending,
    handleInputChange,
  };
};
