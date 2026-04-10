import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";

import { useCheckAvailability } from "@aventisia/ui/hooks";
import { useDTCrudDialogStore } from "@aventisia/ui/stores";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { isKeystoreNameAvailable } from "../apis/keystores-table-apis";
import { DATA_QUERY_KEY } from "../constants";
import {
  knowledgeBaseNameSchema,
  knowledgeBaseZodSchema,
} from "../constants/knowledge-base-zod-schema";
import { KnowledgeBaseTableDto } from "../dtos/knowledge-base-table-dto";

/**
 * Custom hook for defining a keystore form.
 */
export const useDefineKnowledgeBaseForm = () => {
  // Set keystore name state (required for availability check)
  const [keystoreName, setKeystoreName] = useState("");

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
      vectorStore: "",
      embeddingModel: "",
      isDisabled: false,

      kb: {
        is_byok_enabled: false,
        credential_id: "",
        provider: "",
        model: "",
      },

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

  // Fetch keystore data when rowId changes
  useEffect(() => {
    // Get keystores data from query client
    const keystoresData = queryClient.getQueryData<{
      data: KnowledgeBaseTableDto[];
    }>(DATA_QUERY_KEY);

    // Get keystore data by id
    const keystoreData = keystoresData?.data?.find((item) => item.id === rowId);

    // Set keystore name
    setKeystoreName(keystoreData?.name ?? "");

    // Set keystore data to form
    form.reset({
      id: rowId,
      name: keystoreData?.name ?? "",
      description: keystoreData?.description ?? "",
      vectorStore: keystoreData?.vectorStore ?? "Qdrant",
      embeddingModel: keystoreData?.embeddingModel ?? "text-embedding-3-small",

      kb: {
        is_byok_enabled: keystoreData?.kb?.is_byok_enabled ?? false,
        credential_id: keystoreData?.kb?.credential_id ?? "",
        provider: keystoreData?.kb?.provider ?? "openai",
        model: keystoreData?.kb?.model ?? "text-embedding-3-small",
      },

      isDisabled: keystoreData?.isDisabled,

      createdBy:
        keystoreData?.createdBy ??
        userSession?.firstName + " " + userSession?.lastName,

      createdOn: keystoreData?.createdOn
        ? new Date(keystoreData?.createdOn)
        : new Date(),

      lastModifiedBy:
        keystoreData?.lastModifiedBy ??
        userSession?.firstName + " " + userSession?.lastName,

      lastModifiedOn: keystoreData?.lastModifiedOn
        ? new Date(keystoreData?.lastModifiedOn)
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
  } = useCheckAvailability<z.infer<typeof knowledgeBaseZodSchema>, z.ZodString>(
    {
      defaultInputValue: keystoreName,
      fieldName: "name",
      form,
      fieldSchema: knowledgeBaseNameSchema,
      checkAvailabilityAPIFn: isKeystoreNameAvailable,
    },
  );

  // Refine form data based on crud action
  const refineFormData = (formData: z.infer<typeof knowledgeBaseZodSchema>) => {
    return {
      ...formData,
      lastModifiedBy: userSession?.email ?? "",
      lastModifiedOn: new Date().toISOString(),
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
