import { useDTCrudDialogStore } from "@aventisia/ui/stores";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";

import { ONPREM_LLM_QUERY_KEY } from "../constants";
import { onPremLLMZodSchema } from "../constants/on-prem-llms-zod-schema";
import { OnPremLLMTableDTO } from "../dtos/on-prem-llm-table-dto";



/**
 * Custom hook for defining a model form.
 */
export const useDefineOnPremLLMForm = () => {
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
  const form = useForm<z.infer<typeof onPremLLMZodSchema>>({
    resolver: zodResolver(onPremLLMZodSchema),
    defaultValues: {
      id: "",
      llm: "",
      displayName: "",
      description: "",
      status: ""
    },
  });

  // Destructor form values and methods
  const {
    formState: { isDirty },
  } = form;

  // Fetch model data when rowId changes
  useEffect(() => {
    // Get models data from query client
    const onPremLLMsData = queryClient.getQueryData<{
      data: OnPremLLMTableDTO[];
    }>(ONPREM_LLM_QUERY_KEY);

    // Get model data by id
    const onPremLLMData = onPremLLMsData?.data.find((item) => item.id === rowId);


    // Set model data to form
    form.reset({
      id: rowId ?? onPremLLMData?.id ?? "",
      llm: onPremLLMData?.llm ?? "",
      displayName: onPremLLMData?.displayName ?? "",
      description: onPremLLMData?.description ?? "",
      status: onPremLLMData?.status ?? ""
    });

    // Focus the name field after reset.
    setTimeout(() => {
      form.setFocus("llm", { shouldSelect: false });
    }, 0);
  }, [rowId, form, userSession, queryClient]);


  // Refine form data based on crud action
  const refineFormData = (formData: z.infer<typeof onPremLLMZodSchema>) => {
    return formData
  };

  // Save the form dirty state
  useEffect(() => {
    toggleFormDirty(isDirty);
  }, [isDirty, toggleFormDirty]);

  // Return form and methods
  return {
    form,
    isDirty,
    rowId,
    crudAction,
    setShowDialog,
    refineFormData,
  };
};
