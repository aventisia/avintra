import { useCrudDialogDirty } from "@avplatform/ui/data-table";
import { useCheckAvailability } from "@avplatform/ui/hooks";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { ISelectOption } from "@avplatform/ui/types";
import { type CrudActionType } from "@avplatform/ui/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { CrudActionTypeConverter } from "@/react-toolkit/utils";
import { getMergedQueryData } from "@/utils/get-merged-query-data.util";

import { isNameAvailable } from "../apis/queues-table-apis";
import { getVaultCredentialSelectOptions } from "../apis/vault-credential-select.apis";
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

  // Example work item schema shown when creating a new queue. The schema is a JSON array,
  // where each element describes one field of the work item.
  const defaultSchema = [
    {
      name: "requestId",
      description: "Unique identifier for the request",
      label: "Request ID",
      type: "string",
      isRequired: true,
      isUsedForUniqueIdentifier: true,
    },
    {
      name: "amount",
      description: "Monetary amount of the request",
      label: "Amount",
      type: "int",
      isRequired: true,
      isUsedForUniqueIdentifier: false,
    },
    {
      name: "submittedOn",
      description: "Date the request was submitted",
      label: "Submitted On",
      type: "Date",
      isRequired: false,
      isUsedForUniqueIdentifier: false,
    },
    {
      name: "notes",
      description: "Free-form notes attached to the request",
      label: "Notes",
      type: "string",
      isRequired: false,
      isUsedForUniqueIdentifier: false,
    },
    {
      name: "tags",
      description: "List of labels attached to the request",
      label: "Tags",
      type: "Array",
      isRequired: false,
      isUsedForUniqueIdentifier: false,
    },
  ];

  // Example disposition status structure shown when creating a new queue.
  const defaultStatuses = JSON.stringify(
    [
      {
        name: "Approved",
        label: "Approved",
        color: "#22c55e",
        routeQueue: "",
      },
      {
        name: "Rejected",
        label: "Rejected",
        color: "#ef4444",
        routeQueue: "",
      },
    ],
    null,
    2,
  );

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
      statuses: defaultStatuses,
      routeToQueues: [],
      processingMode: "Manual",
      credentialName: "",
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
  // queryKey already includes the current space id.
  const { queryKey } = useTableTab();

  // Credential select options state
  const [selectOptions, setSelectOptions] = useState<ISelectOption[]>([]);
  const [isOptionsLoading, setIsOptionsLoading] = useState(true);

  // Fetch M365 credentials list once when the dialog opens.
  useEffect(() => {
    setIsOptionsLoading(true);

    getVaultCredentialSelectOptions("M365")
      .then((data) => {
        setSelectOptions(data?.data as ISelectOption[]);
        setIsOptionsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch credentials", err);
        setIsOptionsLoading(false);
      });
  }, []);

  // Fetch queue data when rowId changes
  useEffect(() => {
    // Get queues data from the merged Personal/Shared lists in the cache
    const queuesData = getMergedQueryData<QueuesTableDto>(queryClient, queryKey);

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
      processingMode: queueData?.processingMode || "Manual",
      credentialName: queueData?.credentialName || "",
      isUniqueReferencesEnforced: queueData?.isUniqueReferencesEnforced,
      isStoredEncrypted: queueData?.isStoredEncrypted,
      // shouldRetryFailedItems: queueData?.shouldRetryFailedItems,
      // shouldRetryAbandonedItems: queueData?.shouldRetryAbandonedItems,
      // maximumRetryAttempts: queueData?.maximumRetryAttempts,
      inputSchema:
        JSON.stringify(queueData?.inputSchema, null, 2) ?? JSON.stringify(defaultSchema, null, 2),
      statuses: JSON.stringify(queueData?.statuses, null, 2) ?? defaultStatuses,
      // outputDataSchemaFile: undefined,

      isDisabled: queueData?.isDisabled,
      // Read (view) only fields
      createdBy: queueData?.createdBy ?? userSession?.firstName + " " + userSession?.lastName,
      createdOn: queueData?.createdOn ? new Date(queueData?.createdOn) : new Date(),
      lastModifiedBy:
        queueData?.lastModifiedBy ?? userSession?.firstName + " " + userSession?.lastName,
      lastModifiedOn: queueData?.lastModifiedOn ? new Date(queueData?.lastModifiedOn) : new Date(),
    });
  }, [
    rowId,
    form,
    queryClient,
    userSession,
    crudAction,
    queryKey,
    selectOptions,
    isOptionsLoading,
  ]);

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
      statuses: JSON.parse(formData.statuses),
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
    selectOptions,
    isOptionsLoading,
  };
};
