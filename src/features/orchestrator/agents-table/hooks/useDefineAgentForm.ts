import { useDTCrudDialogStore } from "@/react-toolkit/stores/dt-crud-dialog-store";
import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";
import { AgentsTableDto } from "../dtos/agents-table-dto";
import { agentZodSchema } from "../constants/agent-zod-schema";
import { DATA_QUERY_KEY } from "../constants";

/**
 * Custom hook for defining a agent form.
 */
export const useDefineAgentForm = () => {
  // Set agent name state (required for avaialbility check)
  const [agentName, setAgentName] = useState("");

  // Get user session
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  // Get data-table crud dialog store state and actions
  const {
    crudDialogOptions: { rowId, crudAction },
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

  // Define form with zod schema
  /* IMPORTANT NOTE: It is important to set default value to all fields to avoid error - "A component is changing an uncontrolled input to be controlled". */
  const form = useForm<z.infer<typeof agentZodSchema>>({
    resolver: zodResolver(agentZodSchema),
    defaultValues: {
      id: "",
      flowId: "",
      name: "",
      isLocked: false,
      isDraft: false,
      isPublished: false,
      isArchived: false,
      createdBy: "",
      createdByUsername: "",
      createdOn: new Date(),
      createdByUserInitials: "",
      versionNumber: 0,
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

    // Get agent data by id
    const agentData = agentsData?.data.find((item) => item.id === rowId);

    // Set agent name
    setAgentName(agentData?.name ?? "");

    // Set agent data to form
    form.reset({
      id: rowId,
      name: agentData?.name ?? "",

      flowId: agentData?.flowId,
      isLocked: agentData?.isLocked,
      isDraft: agentData?.isDraft,
      isPublished: agentData?.isPublished,
      isArchived: agentData?.isArchived,
      versionNumber: agentData?.versionNumber,
      machineCount: agentData?.machineCount,

      createdBy:
        agentData?.createdBy ??
        userSession?.firstName + " " + userSession?.lastName,
      createdOn: agentData?.createdOn
        ? new Date(agentData?.createdOn)
        : new Date(),
    });
  }, [rowId, form, queryClient, userSession]);


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
    toggleFormDirty(isDirty);
  }, [isDirty, toggleFormDirty]);


  // Return form and methods
  return {
    form,
    isDirty,
    agentName,
    rowId,
    crudAction,
    setShowDialog,
    refineFormData,
    toggleFormDirty
  };
};
