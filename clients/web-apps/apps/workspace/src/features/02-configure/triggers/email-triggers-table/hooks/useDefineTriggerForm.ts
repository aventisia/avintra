// import { useCheckAvailability } from "@avplatform/ui/hooks";
import { useCrudDialogDirty } from "@avplatform/ui/data-table";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { type CrudActionType } from "@avplatform/ui/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

// import { isNameAvailable } from "../apis/triggers-table-apis";
import {
  // triggerNameSchema,
  triggerZodSchema,
} from "../constants/trigger-zod-schema";
import { EmailTriggerDto } from "../dtos/email-trigger-dto";
import { useTableTab } from "./useTableTab";

/**
 * Custom hook for defining a trigger form.
 */
export const useDefineTriggerForm = ({ rowId }: { rowId: string; crudAction?: CrudActionType }) => {
  // Trigger name state for availability check
  // const [triggerName, setTriggerName] = useState("");

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
    resolver: zodResolver(triggerZodSchema),
    defaultValues: {
      id: "",
      name: "",
      agents: [],
      timezone: "",
      expiryDateTime: (() => {
        const d = new Date();
        d.setDate(d.getDate() + 30);
        return d;
      })(), // Default to 30 days ahead
      credentialId: "",
      folder: "Inbox",
      mailbox: "",
      provider: "M365",
      resubscribeEnabled: false,
      resubscribeFrequency: "0",
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
    // Get triggers data from query client
    const triggersData = queryClient.getQueryData<{
      data: EmailTriggerDto[];
    }>(queryKey);

    // Find the trigger by rowId
    const triggerData = triggersData?.data.find((item) => item.id === rowId);

    // Set trigger name for availability check
    // setTriggerName(triggerData?.name ?? "");
    const datePlus30 = new Date();
    datePlus30.setDate(datePlus30.getDate() + 30);
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    // Reset form with fetched trigger data
    form.reset({
      id: rowId,
      name: triggerData?.name ?? "",
      agents: triggerData?.agents ?? [],
      timezone: triggerData?.timezone ?? userTimeZone ?? "",
      mailbox: triggerData?.mailbox ?? "",
      expiryDateTime: triggerData?.expiryDateTime
        ? new Date(triggerData.expiryDateTime)
        : datePlus30,

      resubscribeFrequency: triggerData?.resubscribeFrequency?.toString() ?? "1",

      credentialId: triggerData?.credentialId ?? "",
      folder: triggerData?.folder ?? "Inbox",
      provider: triggerData?.provider ?? "M365",
      resubscribeEnabled: triggerData?.resubscribeEnabled ?? false,
      isDisabled: triggerData?.isDisabled ?? false,
    });
  }, [rowId, form, queryClient, userSession, queryKey]);

  // Get check availability state and methods
  // const {
  //   isAvailable,
  //   isCheckPending,
  //   handleInputChange,
  //   availabilityMessage,
  //   setAvailabilityMessage,
  // } = useCheckAvailability<z.infer<typeof triggerZodSchema>, z.ZodString>({
  //   defaultInputValue: triggerName,
  //   fieldName: "name",
  //   form,
  //   fieldSchema: triggerNameSchema,
  //   checkAvailabilityAPIFn: isNameAvailable,
  // });

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

  // Invalidate agents list when the dialog opens for this row.
  useEffect(() => {
    queryClient.invalidateQueries({
      queryKey: ["select-trigger-agent", rowId],
    });
  }, [queryClient, rowId]);

  // Return form, validation state, and methods
  return {
    form,
    isDirty,
    refineFormData,
    // isAvailable,
    // availabilityMessage,
    // isCheckPending,
    // handleInputChange,
  };
};
