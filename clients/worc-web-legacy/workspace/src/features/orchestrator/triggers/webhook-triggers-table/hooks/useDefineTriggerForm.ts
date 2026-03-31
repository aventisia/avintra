import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";

// import { useCheckAvailability } from "@aventisia/ui/hooks";
import { useDTCrudDialogStore } from "@aventisia/ui/stores";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

// import { isNameAvailable } from "../apis/triggers-table-apis";
import { DATA_QUERY_KEY } from "../constants";
import {
  // triggerNameSchema,
  triggerZodSchema,
} from "../constants/trigger-zod-schema";
import { WebhookTriggerDto } from "../dtos/webhook-trigger-dto";

/**
 * Custom hook for defining a trigger form.
 */
export const useDefineTriggerForm = () => {
  // Trigger name state for availability check
  // const [triggerName, setTriggerName] = useState("");
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

  // Define form with Zod schema
  const form = useForm<z.infer<typeof triggerZodSchema>>({
    resolver: zodResolver(triggerZodSchema),
    defaultValues: {
      id: "",
      name: "",
      agent: [],
      apiKey: "",
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

  // Fetch trigger data when rowId changes
  useEffect(() => {
    // Get triggers data from query client
    const triggersData = queryClient.getQueryData<{
      data: WebhookTriggerDto[];
    }>(DATA_QUERY_KEY);

    // Find the trigger by rowId
    const triggerData = triggersData?.data.find((item) => item.id === rowId);

    // Set trigger name for availability check
    // setTriggerName(triggerData?.name ?? "");

    // Reset form with fetched trigger data
    form.reset({
      id: rowId,
      name: triggerData?.name ?? "",
      agent: triggerData?.agent ? objectToArray(triggerData?.agent) : [],
      webhookUrl:
        triggerData?.webhookUrl ??
        `${window.location.origin}${import.meta.env.VITE_WORC_API_PATH}webhook/${rowId}`,
      apiKey: triggerData?.apiKey ?? "",

      callbackUrl: triggerData?.callbackUrl ?? "",
      expectedPayloadSchema: triggerData?.expectedPayloadSchema ?? "",
      isDisabled: triggerData?.isDisabled ?? false,
    });
  }, [rowId, form, queryClient, userSession]);

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
      agent: arrayToObject(formData.agent),
    };
  };

  // Save the form dirty state
  useEffect(() => {
    toggleFormDirty(isDirty);
  }, [isDirty, toggleFormDirty]);

  // Reset availability message and invalidate agents list when dialog closes
  useEffect(() => {
    if (!showDialog) {
      // setAvailabilityMessage(null);
      queryClient.invalidateQueries({
        queryKey: ["select-trigger-agent", rowId],
      });
    }
  }, [queryClient, rowId, showDialog]);

  // Return form, validation state, and methods
  return {
    form,
    isDirty,
    rowId,
    crudAction,
    setShowDialog,
    refineFormData,
    // isAvailable,
    // availabilityMessage,
    // isCheckPending,
    // handleInputChange,
  };
};
