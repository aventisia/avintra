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

import { CrudActionTypeConverter } from "@/react-toolkit/utils";

import { isNameAvailable } from "../apis/queues-table-apis";
import { queueNameSchema, queueZodSchema } from "../constants/queue-zod-schema";
import { QueuesTableDto } from "../dtos/queues-table-dto";
import { useTableTab } from "./useTableTab";

interface UseDefineQueueFormOptions {
  rowId: string;
  crudAction: CrudActionType;
}

/**
 * Custom hook for defining a queue form.
 */
export const useDefineQueueForm = ({ rowId, crudAction }: UseDefineQueueFormOptions) => {
  // Set queue name state (required for avaialbility check)
  const [queueName, setqueueName] = useState("");

  const { setIsDirty } = useCrudDialogDirty();

  // Get user session
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  const defaultSchema = [
    {
      name: "userId",
      description: "Unique identifier for the user",
      label: "User ID",
      type: "string",
      isRequired: true,
      isUsedForUniqueIdentifier: true,
    },
    {
      name: "age",
      description: "Age of the user",
      label: "Age",
      type: "int",
      isRequired: false,
      isUsedForUniqueIdentifier: false,
    },
    {
      name: "createdAt",
      description: "Account creation date",
      label: "Created At",
      type: "Date",
      isRequired: false,
      isUsedForUniqueIdentifier: false,
    },
  ];

  // Get query client
  const queryClient = useQueryClient();

  // Define form with zod schema
  /* IMPORTANT NOTE: It is important to set default value to all fields to avoid error - "A component is changing an uncontrolled input to be controlled". */
  const form = useForm<z.infer<typeof queueZodSchema>>({
    resolver: zodResolver(queueZodSchema),
    defaultValues: {
      crudAction: CrudActionTypeConverter(crudAction),
      id: "",
      name: "",
      description: "",
      type: "Agent",

      isUniqueReferencesEnforced: false,
      isStoredEncrypted: false,
      // shouldRetryFailedItems: false,
      // shouldRetryAbandonedItems: false,
      // maximumRetryAttempts: 3,
      inputSchema: "[]",
      routeToQueues: [],
      viewType: "DocumentProcessing",
      credentialId: null,
      // outputDataSchemaFile: undefined,

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

  // Fetch queue data when rowId changes
  useEffect(() => {
    // Get queues data from query client
    const queuesData = queryClient.getQueryData<{
      data: QueuesTableDto[];
    }>(queryKey);

    // Get queue data by id
    const queueData = queuesData?.data.find((item) => item.id === rowId);

    // Set queue name
    setqueueName(queueData?.name ?? "");

    // Set queue data to form
    form.reset({
      crudAction: CrudActionTypeConverter(crudAction),
      id: rowId,
      name: queueData?.name,
      description: queueData?.description,
      type: queueData?.type ?? "Agent",
      routeToQueues: queueData?.routeToQueues ?? [],
      viewType: queueData?.viewType || "DocumentProcessing",
      credentialId: queueData?.credentialId || null,
      isUniqueReferencesEnforced: queueData?.isUniqueReferencesEnforced,
      isStoredEncrypted: queueData?.isStoredEncrypted,
      // shouldRetryFailedItems: queueData?.shouldRetryFailedItems,
      // shouldRetryAbandonedItems: queueData?.shouldRetryAbandonedItems,
      // maximumRetryAttempts: queueData?.maximumRetryAttempts,
      inputSchema: JSON.stringify(queueData?.inputSchema, null, 2) ?? JSON.stringify(defaultSchema),
      // outputDataSchemaFile: undefined,

      isDisabled: queueData?.isDisabled,
      // Read (view) only fields
      createdBy: queueData?.createdBy ?? userSession?.firstName + " " + userSession?.lastName,
      createdOn: queueData?.createdOn ? new Date(queueData?.createdOn) : new Date(),
      lastModifiedBy:
        queueData?.lastModifiedBy ?? userSession?.firstName + " " + userSession?.lastName,
      lastModifiedOn: queueData?.lastModifiedOn ? new Date(queueData?.lastModifiedOn) : new Date(),
    });
  }, [rowId, form, queryClient, userSession, crudAction]);

  // Get check availability state and methods
  const {
    isAvailable,
    isCheckPending,
    handleInputChange,
    availabilityMessage,
    setAvailabilityMessage,
  } = useCheckAvailability<z.infer<typeof queueZodSchema>, z.ZodString>({
    defaultInputValue: queueName,
    fieldName: "name",
    form,
    fieldSchema: queueNameSchema,
    checkAvailabilityAPIFn: isNameAvailable,
  });

  // Refine form data based on crud action
  const refineFormData = (formData: z.infer<typeof queueZodSchema>) => {
    return {
      ...formData,
      inputSchema: JSON.parse(formData.inputSchema),
      lastModifiedBy: userSession?.email ?? "",
      lastModifiedOn: new Date().toISOString(),
    };
  };

  // Save the form dirty state
  useEffect(() => {
    setIsDirty(isDirty);
  }, [isDirty, setIsDirty]);

  // Reset availability message when dialog unmounts
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
