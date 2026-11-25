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

import { isNameAvailable } from "../apis/triggers-table-apis";
import {
  triggerNameSchema,
  triggerZodSchema,
  updateTriggerZodSchema,
} from "../constants/trigger-zod-schema";
import { MessageTriggerDto } from "../dtos/message-trigger-dto";
import { useTableTab } from "./useTableTab";

/**
 * Custom hook for defining a trigger form.
 */
export const useDefineTriggerForm = ({
  rowId,
  crudAction,
}: {
  rowId: string;
  crudAction?: CrudActionType;
}) => {
  // Trigger name state for availability check
  const [triggerName, setTriggerName] = useState("");

  // Get user session
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );
  // const defaultFrequency = (val: string) =>
  //   ["30", "90", "180", "365"].includes(val);
  const { setIsDirty } = useCrudDialogDirty();

  // Get query client
  const queryClient = useQueryClient();

  // Define form with Zod schema
  const form = useForm<z.infer<typeof triggerZodSchema>>({
    resolver: zodResolver(crudAction === "update" ? updateTriggerZodSchema : triggerZodSchema),
    defaultValues: {
      id: "",
      name: "",
      agents: [],
      timezone: "",
      expiryDateTime: (() => {
        const d = new Date();
        d.setHours(d.getHours() + 24);
        return d;
      })(),
      credentialName: "",
      resource: "/chats/getAllMessages",
      reference: "",
      provider: "M365",
      resubscribeEnabled: false,
      resubscribeFrequency: "60",
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
    const triggersData = getMergedQueryData<MessageTriggerDto>(queryClient, queryKey);

    // Find the trigger by rowId
    const triggerData = triggersData?.data.find((item) => item.id === rowId);

    // Set trigger name for availability check
    setTriggerName(triggerData?.name ?? "");
    const datePlus24h = new Date();
    datePlus24h.setHours(datePlus24h.getHours() + 24);

    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Reset form with fetched trigger data
    form.reset({
      id: rowId,
      name: triggerData?.name ?? "",
      agents: triggerData?.agents ?? [],
      timezone: triggerData?.timezone ?? userTimeZone ?? "",
      reference: triggerData?.reference ?? "",
      expiryDateTime: triggerData?.expiryDateTime
        ? new Date(triggerData.expiryDateTime)
        : datePlus24h,

      resubscribeFrequency: triggerData?.resubscribeFrequency?.toString() ?? "60",

      credentialName: triggerData?.credentialName ?? triggerData?.credentialId ?? "",
      resource: triggerData?.resource ?? "/chats/getAllMessages",
      provider: triggerData?.provider ?? "M365",
      resubscribeEnabled: triggerData?.resubscribeEnabled ?? false,
      isDisabled: triggerData?.isDisabled ?? false,
    });
  }, [rowId, form, queryClient, userSession, queryKey]);

  // Get check availability state and methods
  const { isAvailable, isCheckPending, handleInputChange, availabilityMessage } =
    useCheckAvailability<z.infer<typeof triggerZodSchema>, z.ZodString>({
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
      expiryDateTime: formData.expiryDateTime,
      resubscribeFrequency: Number(formData.resubscribeFrequency),
    };
  };

  // Save the form dirty state
  useEffect(() => {
    setIsDirty(isDirty);
  }, [isDirty, setIsDirty]);

  // Return form, validation state, and methods
  return {
    form,
    isDirty,
    refineFormData,
    isAvailable,
    availabilityMessage,
    isCheckPending,
    handleInputChange,
  };
};
