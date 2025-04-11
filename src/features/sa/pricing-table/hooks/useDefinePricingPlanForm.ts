import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { PricingComponentsEnum } from "@/react-toolkit/enums/pricing-components-enum";
import { PricingUnitTypesEnum } from "@/react-toolkit/enums/pricing-unit-types-enum";
import { useDTCrudDialogStore } from "@/react-toolkit/stores/dt-crud-dialog-store";
import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";

import { DATA_QUERY_KEY } from "../constants";
import { pricingPlanZodSchema } from "../constants/pricingPlan-zod-schema";
import { PricingPlansTableDto } from "../dtos/pricingPlans-table-dto";

/**
 * Custom hook for defining a pricingplan form.
 *
 * @returns An object containing the form, form methods, and other related values.
 */
export const useDefinePricingPlanForm = () => {
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
  const form = useForm<z.infer<typeof pricingPlanZodSchema>>({
    resolver: zodResolver(pricingPlanZodSchema),
    defaultValues: {
      id: "",
      pricingComponent: "",
      tenantType: "",
      tenantId: null,
      currency: "",
      unitPrice: undefined,
      frequency: "",
      cola: undefined,
      isDisabled: false,
      createdBy: userSession?.firstName + " " + userSession?.lastName,
      createdOn: new Date(),
      lastModifiedBy: userSession?.firstName + " " + userSession?.lastName,
      lastModifiedOn: new Date(),
    },
  });

  // Destructor form values and methods
  const {
    formState: { isSubmitting, isDirty },
    watch,
  } = form;

  // Fetch pricingplan data when rowId changes
  useEffect(() => {
    // Get pricingplans data from query client
    const pricingplansData = queryClient.getQueryData<{
      data: PricingPlansTableDto[];
    }>(DATA_QUERY_KEY);

    // Get pricingplan data by id
    const data = pricingplansData?.data.find((item) => item.id === rowId);

    // Set pricingplan data to form
    form.reset({
      // Single fields
      id: rowId,
      pricingComponent: data?.pricingComponent ?? "",
      tenantType: data?.tenantType ?? "",
      tenantId: data?.tenantId ?? "",
      currency: data?.currency ?? "",
      unitPrice: data?.unitPrice.toString(),
      frequency: data?.frequency,
      cola: data?.cola.toString(),
      // Single field
      isDisabled: data?.isDisabled ?? false,
      // Group (read-only)
      createdBy:
        data?.createdBy ?? userSession?.firstName + " " + userSession?.lastName,
      createdOn: data?.createdOn ? new Date(data?.createdOn) : new Date(),
      lastModifiedBy:
        data?.lastModifiedBy ??
        userSession?.firstName + " " + userSession?.lastName,
      lastModifiedOn: data?.lastModifiedOn
        ? new Date(data?.lastModifiedOn)
        : new Date(),
    });
  }, [rowId, form, queryClient, userSession]);

  // Refine form data based on crud action
  const refineFormData = (formData: z.infer<typeof pricingPlanZodSchema>) => {
    return {
      ...formData,
      tenantId:
        !!formData.tenantId ||
        formData.tenantId == "00000000-0000-0000-0000-000000000000"
          ? null
          : formData.tenantId,
      unit:
        formData.pricingComponent == PricingComponentsEnum.GpuCompute
          ? PricingUnitTypesEnum.Credit
          : PricingUnitTypesEnum.License,
      frequency:
        formData.pricingComponent == PricingComponentsEnum.GpuCompute
          ? null
          : formData.frequency,
      lastModifiedBy: userSession?.email ?? "",
      lastModifiedOn: new Date().toISOString(),
    };
  };

  const [pricingComponent] = watch(["pricingComponent"]);

  // Save the form dirty state
  useEffect(() => {
    if (pricingComponent === "GpuCompute") form.setValue("frequency", "NA");
  }, [form, isDirty, pricingComponent, toggleFormDirty]);

  // Save the form dirty state
  useEffect(() => {
    toggleFormDirty(isDirty);
  }, [isDirty, toggleFormDirty]);

  // Return form and methods
  return {
    form,
    watch,
    isSubmitting,
    isDirty,
    rowId,
    crudAction,
    setShowDialog,
    refineFormData,
  };
};
