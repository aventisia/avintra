import { useCrudDialogDirty } from "@avplatform/ui/data-table";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { type CrudActionType } from "@avplatform/ui/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { numbersToWeekdays, weekdaysToNumbers } from "../constants/form-utils";
import { triggerZodSchema } from "../constants/trigger-zod-schema";
import { TimeTriggerDto } from "../dtos/time-trigger-dto";
import { useTableTab } from "./useTableTab";

/**
 * Manages the state, validation, and data transformations for the Time Trigger form.
 * Handles synchronizing Data Table selections with the form inputs and preparing payloads.
 */
export const useDefineTriggerForm = ({ rowId }: { rowId: string; crudAction: CrudActionType }) => {
  // Get user session
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  const { setIsDirty } = useCrudDialogDirty();

  // Get query client
  const queryClient = useQueryClient();

  // Use this in place DATA_QUERY_KEY to handle Personal/Shared tabs list
  const { queryKey } = useTableTab();

  // Tracks if the trigger has already started, used to lock schedule inputs in the UI
  const [isEffectivePassed, setIsEffectivePassed] = useState(false);

  // Define form with Zod schema
  const form = useForm<z.infer<typeof triggerZodSchema>>({
    resolver: zodResolver(triggerZodSchema),
    defaultValues: {
      id: "",
      name: "",
      agents: [],
      timezone: "",
      effectiveDate: new Date(new Date().getTime() + 15 * 60000), // Default to 15 minutes ahead
      frequency: "MinuteByMinute", // Default frequency to "MinuteByMinute"
      atTime: "00:00",
      interval: "1",
      weekdays: [],
      monthDays: [],
      endDate: null,
      exceptionHours: [],
      exceptionWeekdays: [],
      exceptionDates: [],
      isDisabled: false,
      nextTriggerTime: null,
    },
  });

  // Destructor form values and methods
  const {
    formState: { isDirty },
  } = form;

  /**
   * Data Hydration Effect:
   * Triggers whenever the selected rowId changes. Fetches the existing trigger data
   * from the query cache and populates the form, mapping backend formats to UI structures.
   */
  useEffect(() => {
    const triggersData = queryClient.getQueryData<{ data: TimeTriggerDto[] }>(queryKey);
    const triggerData = triggersData?.data.find((item) => item.id === rowId);

    // Evaluate the historical start date against current time to lock UI fields if necessary
    if (triggerData?.effectiveDate) {
      const originalEffective = new Date(triggerData.effectiveDate);
      setIsEffectivePassed(originalEffective < new Date());
    } else {
      setIsEffectivePassed(false);
    }

    form.reset({
      id: rowId,
      name: triggerData?.name ?? "",
      agents: triggerData?.agents ?? [],
      timezone: triggerData?.timezone ?? "",
      effectiveDate: triggerData?.effectiveDate
        ? new Date(triggerData.effectiveDate)
        : new Date(new Date().getTime() + 15 * 60000),
      interval: triggerData?.interval?.toString() ?? "1",
      frequency: triggerData?.frequency ?? "Daily",
      atTime: triggerData?.atTime?.slice(0, 5) ?? "00:00",
      weekdays: numbersToWeekdays(triggerData?.weekdays) ?? [],
      monthDays: triggerData?.monthDays?.map((v) => v.toString()) ?? [],
      endDate: triggerData?.endDate ? new Date(triggerData.endDate) : null,
      exceptionHours: triggerData?.exceptionHours?.map((v) => v.toString()) ?? [],
      exceptionWeekdays: numbersToWeekdays(triggerData?.exceptionWeekdays) ?? [],
      exceptionDates: triggerData?.exceptionDates ?? [],
      isDisabled: triggerData?.isDisabled ?? false,
      nextTriggerTime: triggerData?.nextTriggerTime ?? null,
    });
  }, [rowId, form, queryClient, userSession, queryKey]);

  /**
   * Transforms form state back into the required DTO format for the backend API.
   * Merges independent Date and Time fields into strict ISO date formats.
   */
  const refineFormData = (formData: z.infer<typeof triggerZodSchema>) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { nextTriggerTime, ...payloadData } = formData;
    return {
      ...payloadData,
      lastModifiedBy: userSession?.email ?? "",
      lastModifiedOn: new Date().toISOString(),
      atTime: formData.atTime ? formData.atTime + ":00" : null, // Append seconds for BE compliance
      weekdays: weekdaysToNumbers(formData.weekdays),
      monthDays: formData.monthDays?.map((v) => Number(v)),
      exceptionHours: formData.exceptionHours?.map((v) => Number(v)),
      exceptionWeekdays: weekdaysToNumbers(formData.exceptionWeekdays),

      endDate: formData.endDate ? formData.endDate : null,
    };
  };

  // Syncs the internal React Hook Form dirty state with the global global store
  useEffect(() => {
    setIsDirty(isDirty);
  }, [isDirty, setIsDirty]);

  // Clean up and invalidate related queries when the dialog is closed
  useEffect(() => {
    queryClient.invalidateQueries({
      queryKey: ["select-trigger-agent", rowId],
    });
  }, [queryClient, rowId]);

  return {
    form,
    isDirty,
    refineFormData,
    isEffectivePassed,
  };
};
