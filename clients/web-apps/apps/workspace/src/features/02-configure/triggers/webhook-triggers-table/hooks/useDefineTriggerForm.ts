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

import { getMergedQueryData } from "@/utils/get-merged-query-data.util";

import { isNameAvailable } from "../apis/triggers-table-apis";
import { triggerNameSchema, triggerZodSchema } from "../constants/trigger-zod-schema";
import { WebhookTriggerDto } from "../dtos/webhook-trigger-dto";
import { useTableTab } from "./useTableTab";

/**
 * Custom hook for defining a trigger form.
 */
export const useDefineTriggerForm = ({ rowId }: { rowId: string; crudAction: CrudActionType }) => {
  // Trigger name state for availability check
  const [triggerName, setTriggerName] = useState("");
  function arrayToObject<T>(arr: T[]): T | undefined {
    return arr?.[0];
  }

  function objectToArray<T>(obj: T | undefined | null): T[] {
    return obj ? [obj] : [];
  }
  // Get user session
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );
  // Get crud dialog dirty state
  const { setIsDirty } = useCrudDialogDirty();

  // Get query client
  const queryClient = useQueryClient();

  // Define form with Zod schema
  const form = useForm<z.infer<typeof triggerZodSchema>>({
    resolver: zodResolver(triggerZodSchema),
    defaultValues: {
      id: "",
      name: "",
      agent: [],
      webhookUrl: "",
      expectedPayloadSchema: "",
      callbackUrl: "",
      isDisabled: false,
    },
  });

  // Destructor form values and methods
  const {
    formState: { isDirty },
  } = form;

  // Use this in place DATA_QUERY_KEY to handle Personal/Shared tabs list
  const { queryKey } = useTableTab();

  // Fetch trigger data when rowId changes
  useEffect(() => {
    // Get triggers data from the merged Personal/Shared lists in the cache
    const triggersData = getMergedQueryData<WebhookTriggerDto>(queryClient, queryKey);

    // Find the trigger by rowId
    const triggerData = triggersData?.data.find((item) => item.id === rowId);

    // Set trigger name for availability check
    setTriggerName(triggerData?.name ?? "");

    // Reset form with fetched trigger data
    form.reset({
      id: rowId,
      name: triggerData?.name ?? "",
      agent: triggerData?.agent ? objectToArray(triggerData?.agent) : [],
      webhookUrl:
        triggerData?.webhookUrl ??
        `${window.location.origin}${import.meta.env.VITE_WORKSPACE_API_PATH}/execute-flow/webhook`,

      callbackUrl: triggerData?.callbackUrl ?? "",
      expectedPayloadSchema: triggerData?.expectedPayloadSchema ?? "",
      isDisabled: triggerData?.isDisabled ?? false,
    });
  }, [rowId, form, queryClient, userSession]);

  // Get check availability state and methods
  const {
    isAvailable,
    isCheckPending,
    handleInputChange,
    availabilityMessage,
    setAvailabilityMessage,
  } = useCheckAvailability<z.infer<typeof triggerZodSchema>, z.ZodString>({
    defaultInputValue: triggerName,
    fieldName: "name",
    form,
    fieldSchema: triggerNameSchema,
    checkAvailabilityAPIFn: isNameAvailable,
  });

  // Refine form data before submission
  const refineFormData = (formData: z.infer<typeof triggerZodSchema>) => {
    return {
      ...formData,
      lastModifiedBy: userSession?.email ?? "",

      lastModifiedOn: new Date().toISOString(),
      agent: arrayToObject(formData.agent),
    };
  };

  // Save the form dirty state
  useEffect(() => {
    setIsDirty(isDirty);
  }, [isDirty, setIsDirty]);

  // Reset availability message and invalidate agents list when dialog closes
  useEffect(() => {
    setAvailabilityMessage(null);
    queryClient.invalidateQueries({
      queryKey: ["select-trigger-agent", rowId],
    });
  }, [queryClient, rowId, setAvailabilityMessage]);

  // Return form, validation state, and methods
  return {
    form,
    isDirty,
    refineFormData,
    queryClient,
    objectToArray,
    isAvailable,
    availabilityMessage,
    isCheckPending,
    handleInputChange,
  };
};
