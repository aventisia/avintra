import { useCrudDialogDirty } from "@avplatform/ui/crud-dialog";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { type CrudActionType } from "@avplatform/ui/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { DATA_QUERY_KEY } from "../constants";
import { agentZodSchema } from "../constants/agent-zod-schema";
import { AgentsTableDto } from "../dtos/agents-table-dto";
import { useMachinesSelectTableStore } from "../stores/machines-select-table-store";
import { useFetchMachines } from "./useFetchMachines";

interface UseDefineAgentFormOptions {
  rowId: string;
  crudAction: CrudActionType;
}

/**
 * Custom hook for defining a agent form.
 */
export const useDefineAgentForm = ({ rowId, crudAction }: UseDefineAgentFormOptions) => {
  // Set agent name state (required for avaialbility check)
  const [agentName, setAgentName] = useState("");

  // Get user session
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  const { setIsDirty, onCloseConfirmed } = useCrudDialogDirty();

  // Get query client
  const queryClient = useQueryClient();

  const { data, isFetching } = useFetchMachines(rowId);

  // Get store state and actions
  const { setCurrentMachines, setAllAssigned, setIsReadOnly, setIsFetching } =
    useMachinesSelectTableStore(
      useShallow((state) => ({
        setCurrentMachines: state.setCurrentMachines,
        setAllAssigned: state.setAllAssigned,
        setIsFetching: state.setIsFetching,
        setIsReadOnly: state.setIsReadOnly,
      })),
    );

  // Define form with zod schema
  /* IMPORTANT NOTE: It is important to set default value to all fields to avoid error - "A component is changing an uncontrolled input to be controlled". */
  const form = useForm<z.infer<typeof agentZodSchema>>({
    resolver: zodResolver(agentZodSchema),
    defaultValues: {
      id: "",
      flowId: "",
      name: "",
      licenseId: "",
      machineCount: 0,
      versionNumber: 0,

      // isLocked: false,
      // isDraft: false,
      // isPublished: false,
      // isArchived: false,

      createdBy: "",
      createdOn: new Date(),
    },
  });

  // Destructor form values and methods
  const {
    formState: { isDirty },
  } = form;

  // Fetch agent data when rowId changes
  useEffect(() => {
    // Get agents data from query client
    const agentsData = queryClient.getQueryData<{
      data: AgentsTableDto[];
    }>(DATA_QUERY_KEY);

    setIsFetching(isFetching);
    setIsReadOnly(crudAction === "read");
    setCurrentMachines(data?.data.filter((m) => crudAction !== "read" || m.isAssigned) ?? []);
    if (data?.data)
      setAllAssigned(
        data?.data.some((x) => x.isAssigned)
          ? "indeterminate"
          : data?.data.every((x) => x.isAssigned),
      );

    // Get agent data by id
    const agentData = agentsData?.data.find((item) => item.id === rowId);

    // Set agent name
    setAgentName(agentData?.name ?? "");

    // Set agent data to form
    form.reset({
      id: rowId,
      flowId: agentData?.refId,
      name: agentData?.name ?? "",
      licenseId: agentData?.licenseId ?? "",
      versionNumber: agentData?.versionNumber,
      machineCount: agentData?.machineCount,

      // isLocked: agentData?.isLocked,
      // isDraft: agentData?.isDraft,
      // isPublished: agentData?.isPublished,
      // isArchived: agentData?.isArchived,

      createdBy: agentData?.createdBy ?? userSession?.firstName + " " + userSession?.lastName,
      createdOn: agentData?.createdOn ? new Date(agentData?.createdOn) : new Date(),
      lastModifiedBy:
        agentData?.lastModifiedBy ?? userSession?.firstName + " " + userSession?.lastName,
      lastModifiedOn: agentData?.lastModifiedOn ? new Date(agentData?.lastModifiedOn) : new Date(),
    });
    setIsFetching(isFetching);
  }, [
    rowId,
    form,
    queryClient,
    userSession,
    setIsFetching,
    isFetching,
    setCurrentMachines,
    data?.data,
    setAllAssigned,
    setIsReadOnly,
    crudAction,
  ]);

  // Refine form data based on crud action
  const refineFormData = (formData: z.infer<typeof agentZodSchema>) => {
    return {
      ...formData,
      lastModifiedBy: userSession?.email ?? "",
      lastModifiedOn: new Date().toISOString(),
    };
  };

  // Save the form dirty state
  useEffect(() => {
    setIsDirty(isDirty);
  }, [isDirty, setIsDirty]);

  // Return form and methods
  return {
    form,
    isDirty,
    agentName,
    refineFormData,
    onCloseConfirmed,
  };
};
