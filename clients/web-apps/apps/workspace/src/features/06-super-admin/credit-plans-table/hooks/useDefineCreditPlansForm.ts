import { useCrudDialogDirty } from "@avplatform/ui/data-table";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { type CrudActionType } from "@avplatform/ui/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { CREDIT_PLANS_QUERY_KEY } from "../constants";
import { creditPlansZodSchema } from "../constants/credit-plans-zod-schema";
import { CreditPlansTableDto } from "../dtos/credit-plans-table-dto";

interface UseDefineCreditPlansFormOptions {
  rowId: string;
  crudAction: CrudActionType;
}

/**
 * Custom hook for defining a credit plan form.
 */
export const useDefineCreditPlansForm = ({
  rowId,
  crudAction,
}: UseDefineCreditPlansFormOptions) => {
  // Get user session
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  const { setIsDirty } = useCrudDialogDirty();

  // Get query client
  const queryClient = useQueryClient();

  // Define form with zod schema
  /* IMPORTANT NOTE: It is important to set default value to all fields to avoid error - "A component is changing an uncontrolled input to be controlled". */
  const form = useForm<z.infer<typeof creditPlansZodSchema>>({
    resolver: zodResolver(creditPlansZodSchema),
    defaultValues: {
      id: "",
      serviceType: "",
      unitType: "",
      credits: 0,
      oneUnit: 0,
      isDisabled: false,
    },
  });

  // Destructor form values and methods
  const {
    formState: { isDirty },
  } = form;

  // Fetch model data when rowId changes
  useEffect(() => {
    // Get models data from query client
    const creditPlansData = queryClient.getQueryData<{
      data: CreditPlansTableDto[];
    }>(CREDIT_PLANS_QUERY_KEY);

    // Get model data by id
    const creditPlanData = creditPlansData?.data.find((item) => item.id === rowId);

    // Set model data to form
    form.reset({
      id: rowId,
      serviceType: creditPlanData?.serviceType ?? "",
      unitType: creditPlanData?.unitType ?? "",
      oneUnit: creditPlanData?.oneUnit ?? 0,
      credits: creditPlanData?.credits ?? 0,
      isDisabled: creditPlanData?.isDisabled ?? false,
    });

    // Focus the name field after reset.
    if (crudAction === "create") {
      setTimeout(() => {
        form.setFocus("serviceType", { shouldSelect: false });
      }, 0);
    }
  }, [rowId, crudAction, form, queryClient]);

  // Refine form data based on crud action
  const refineFormData = (formData: z.infer<typeof creditPlansZodSchema>) => {
    return formData;
  };

  // Save the form dirty state
  useEffect(() => {
    setIsDirty(isDirty);
  }, [isDirty, setIsDirty]);

  // Return form and methods
  return {
    form,
    isDirty,
    refineFormData,
    userSession,
  };
};
