import { useCheckAvailability } from "@aventisia/ui/hooks";
import { useDTCrudDialogStore } from "@aventisia/ui/stores";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";

import { isNameAvailable } from "../apis/triggers-table-apis";
import { DATA_QUERY_KEY } from "../constants";
import {
  triggerNameSchema,
  triggerZodSchema,
} from "../constants/trigger-zod-schema";
import { TriggersTableDto } from "../dtos/triggers-table-dto";
import { useAgentsSelectTableStore } from "../stores/agents-select-table-store";

import { useFetchSelectTableAgents } from "./useFetchSelectAgents";

/**
 * Custom hook for defining a trigger form.
 */
export const useDefineTriggerForm = () => {
  // Set trigger name state (required for avaialbility check)
  const [triggerName, settriggerName] = useState("");

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

  const {
    data: currentAgentsDataResponse,
    isFetching,
    isLoading,
  } = useFetchSelectTableAgents(rowId);

  const { currentAgents, setCurrentAgents, setAllAssigned, setIsReadOnly } =
    useAgentsSelectTableStore(
      useShallow((state) => ({
        currentAgents: state.currentAgents,
        setCurrentAgents: state.setCurrentAgents,
        setAllAssigned: state.setAllAssigned,
        setIsReadOnly: state.setIsReadOnly,
      })),
    );

  useEffect(() => {
    setIsReadOnly(crudAction === "read");
    setCurrentAgents(
      currentAgentsDataResponse?.data.filter(
        (a) => crudAction !== "read" || a.isAssigned,
      ) ?? [],
    );
    if (currentAgentsDataResponse?.data)
      setAllAssigned(
        currentAgentsDataResponse?.data.some((x) => x.isAssigned)
          ? "indeterminate"
          : currentAgentsDataResponse?.data.every((x) => x.isAssigned),
      );
  }, [
    rowId,
    isFetching,
    currentAgentsDataResponse?.data,
    setAllAssigned,
    setCurrentAgents,
    setIsReadOnly,
    crudAction,
  ]);
  // Get query client
  const queryClient = useQueryClient();

  // Define form with zod schema
  /* IMPORTANT NOTE: It is important to set default value to all fields to avoid error - "A component is changing an uncontrolled input to be controlled". */
  const form = useForm<z.infer<typeof triggerZodSchema>>({
    resolver: zodResolver(triggerZodSchema),
    defaultValues: {
      id: "",
      name: "",
      environment: "",
      agentIds: [],

      timezone: "",
      startsOn: undefined,

      frequency: "",

      repeateAt: undefined,
      //day or weekday
      repeateOn: [],
      repeateEvery: 0,

      hasNonWorkingDays: false,
      nonWorkingDays: undefined,

      hasNonWorkingTime: false,
      nonWorkingTimeTo: undefined,
      nonWorkingTimeFrom: undefined,

      isEnds: false,
      endsOn: undefined,

      triggerForNewItem: false,
      triggerForNewEmail: false,
      scheduleAutoDisabling: false,
      generateStuckAlert: false,
      generateFailedAlert: false,

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

  // Fetch trigger data when rowId changes
  useEffect(() => {
    // Get triggers data from query client
    const triggersData = queryClient.getQueryData<{
      data: TriggersTableDto[];
    }>(DATA_QUERY_KEY);

    // Get trigger data by id
    const triggerData = triggersData?.data.find((item) => item.id === rowId);

    // Set trigger name
    settriggerName(triggerData?.name ?? "");

    // Set trigger data to form
    form.reset({
      id: rowId,
      name: triggerData?.name ?? "",
      environment: triggerData?.environment,
      agentIds: triggerData?.agentIds,

      timezone: triggerData?.timezone,
      startsOn: triggerData?.startsOn,
      frequency: triggerData?.frequency,

      repeateAt: triggerData?.repeateAt,
      repeateOn: triggerData?.repeateOn,
      repeateEvery: triggerData?.repeateEvery,

      hasNonWorkingDays: triggerData?.hasNonWorkingDays,
      nonWorkingDays: triggerData?.nonWorkingDays,

      hasNonWorkingTime: triggerData?.hasNonWorkingTime,
      nonWorkingTimeTo: triggerData?.nonWorkingTimeFrom,
      nonWorkingTimeFrom: triggerData?.nonWorkingTimeTo,

      isEnds: triggerData?.isEnds,
      endsOn: triggerData?.endsOn,

      triggerForNewItem: triggerData?.triggerForNewItem,
      triggerForNewEmail: triggerData?.triggerForNewEmail,
      scheduleAutoDisabling: triggerData?.scheduleAutoDisabling,
      generateStuckAlert: triggerData?.generateStuckAlert,
      generateFailedAlert: triggerData?.generateFailedAlert,

      isDisabled: triggerData?.isDisabled ?? false,
      // Read (view) only fields
      createdBy:
        triggerData?.createdBy ??
        userSession?.firstName + " " + userSession?.lastName,
      createdOn: triggerData?.createdOn
        ? new Date(triggerData?.createdOn)
        : new Date(),
      lastModifiedBy:
        triggerData?.lastModifiedBy ??
        userSession?.firstName + " " + userSession?.lastName,
      lastModifiedOn: triggerData?.lastModifiedOn
        ? new Date(triggerData?.lastModifiedOn)
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
  } = useCheckAvailability<z.infer<typeof triggerZodSchema>, z.ZodString>({
    defaultInputValue: triggerName,
    fieldName: "name",
    form,
    fieldSchema: triggerNameSchema,
    checkAvailabilityAPIFn: isNameAvailable,
  });

  // Refine form data based on crud action
  const refineFormData = (formData: z.infer<typeof triggerZodSchema>) => {
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
  }, [setAvailabilityMessage, showDialog, currentAgents]);

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
    currentAgentsDataResponse,
    isFetching,
    isLoading,
    setAvailabilityMessage,
    isCheckPending,
    handleInputChange,
  };
};
