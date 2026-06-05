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
import {
  getTimeFromDate,
  numbersToWeekdays,
  setTimeToDate,
  weekdaysToNumbers,
} from "../constants/form-utils";
import {
  // triggerNameSchema,
  triggerZodSchema,
} from "../constants/trigger-zod-schema";
import { TimeTriggerDto } from "../dtos/time-trigger-dto";
import { useTableTab } from "./useTableTab";

/**
 * Custom hook for defining a trigger form.
 */
export const useDefineTriggerForm = () => {
  // Trigger name state for availability check
  // const [triggerName, setTriggerName] = useState("");

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
      agents: [],
      timezone: "",
      effectiveDate: new Date(), // Default to current date
      effectiveTime: null,
      frequency: "OneTime", // Default frequency to "OneTime"
      atTime: "00:00",
      interval: "1",
      weekdays: [],
      monthDays: [],
      endDate: null,
      endTime: null,
      exceptionHours: [],
      exceptionWeekdays: [],
      exceptionDates: [],
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
      data: TimeTriggerDto[];
    }>(queryKey);

    // Find the trigger by rowId
    const triggerData = triggersData?.data.find((item) => item.id === rowId);

    // Set trigger name for availability check
    // setTriggerName(triggerData?.name ?? "");

    // Reset form with fetched trigger data
    form.reset({
      id: rowId,
      name: triggerData?.name ?? "",
      agents: triggerData?.agents ?? [],
      timezone: triggerData?.timezone ?? "",
      effectiveDate: triggerData?.effectiveDate
        ? new Date(triggerData.effectiveDate)
        : new Date(),
      effectiveTime: triggerData?.effectiveDate
        ? getTimeFromDate(new Date(triggerData.effectiveDate))
        : getTimeFromDate(new Date(new Date().getTime() + 15 * 60000)), //15min ahead
      interval: triggerData?.interval?.toString() ?? "1",
      frequency: triggerData?.frequency ?? "Daily",
      atTime: triggerData?.atTime?.slice(0, 5) ?? "00:00", // Slice the string from index 0 to 5 (excluding the seconds part)
      weekdays: numbersToWeekdays(triggerData?.weekdays) ?? [],
      monthDays: triggerData?.monthDays?.map((v) => v.toString()) ?? [],
      endDate: triggerData?.endDate ? new Date(triggerData.endDate) : null,
      endTime: triggerData?.endDate
        ? getTimeFromDate(new Date(triggerData.endDate))
        : null,
      exceptionHours:
        triggerData?.exceptionHours?.map((v) => v.toString()) ?? [],
      exceptionWeekdays:
        numbersToWeekdays(triggerData?.exceptionWeekdays) ?? [],
      exceptionDates: triggerData?.exceptionDates ?? [],
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
      atTime: formData.atTime + ":00", //add seconds to match BE time format(HH:MM:SS)
      weekdays: weekdaysToNumbers(formData.weekdays), //convert weekdays to equ numbers
      monthDays: formData.monthDays?.map((v) => Number(v)), //convert string input to number to match DTO
      exceptionHours: formData.exceptionHours?.map((v) => Number(v)), //convert string input to number to match DTO
      exceptionWeekdays: weekdaysToNumbers(formData.exceptionWeekdays), //convert weekdays to equ numbers
      effectiveDate: formData.effectiveTime
        ? setTimeToDate(formData.effectiveDate, formData.effectiveTime)
        : formData.effectiveDate,
      endDate: formData.endDate
        ? formData.endTime
          ? setTimeToDate(formData.endDate, formData.endTime)
          : formData.endDate
        : null,
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
