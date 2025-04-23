import { useEffect, useState } from "react";
import { z } from "zod";

import { getTenantDetails } from "@/features/sa/tenants-table/apis/tenants-table-apis";
import { useListOptimisticMutation } from "@/react-toolkit/hooks/useListOptimisticMutation";
import { cn } from "@/react-toolkit/lib/utils";
import { Button } from "@/react-toolkit/ui/buttons/Button";
import { AsyncSelectField } from "@/react-toolkit/ui/form/fields/AsyncSelectField";
import { IconInputField } from "@/react-toolkit/ui/form/fields/IconInputField";
import { InputField } from "@/react-toolkit/ui/form/fields/InputField";
import { SearchSelectField } from "@/react-toolkit/ui/form/fields/SearchSelectField";
import { SelectField } from "@/react-toolkit/ui/form/fields/SelectField";
import { SwitchField } from "@/react-toolkit/ui/form/fields/SwitchField";
import { Form } from "@/react-toolkit/ui/form/Form";
import { AutherCard } from "@/react-toolkit/ui/form/non-field/AutherCard";

import { pricingPlanOptimisticMutationFn } from "../../apis/pricingPlans-table-apis";
import { DATA_QUERY_KEY } from "../../constants";
import {
  colaTypeProps,
  currencyTypeProps,
  frequencyTypeProps,
  idProps,
  isDisabledProps,
  pricingComponentTypeProps,
  tenantSelectProps,
  tenantTypeProps,
  unitPriceTypeProps,
} from "../../constants/pricingPlan-form-field-props";
import { pricingPlanZodSchema } from "../../constants/pricingPlan-zod-schema";
import { PricingPlansTableDto } from "../../dtos/pricingPlans-table-dto";
import { useDefinePricingPlanForm } from "../../hooks/useDefinePricingPlanForm";

export const PricingPlanCrudForm = () => {
  // Define pricingplan form
  const {
    form,
    isDirty,
    watch,
    rowId,
    crudAction,
    setShowDialog,
    refineFormData,
  } = useDefinePricingPlanForm();
  const [pricingComponent] = watch(["pricingComponent"]);

  // Define optimistic mutation to crete or update the pricingplan
  const { mutate: mutatePricingPlan } = useListOptimisticMutation<
    PricingPlansTableDto,
    PricingPlansTableDto | boolean,
    PricingPlansTableDto
  >([rowId], pricingPlanOptimisticMutationFn, DATA_QUERY_KEY);

  const [currency, setCurrency] = useState<string>();

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof pricingPlanZodSchema>) => {
    // Create or update the pricingplan
    mutatePricingPlan({
      payload: refineFormData(formData) as unknown as PricingPlansTableDto,
      crudAction: crudAction,
    });

    // Close the dialog
    setShowDialog(false);
  };

  const [tenantId] = watch(["tenantId"]);

  useEffect(() => {
    const getTenant = async () => {
      if (!tenantId) {
        form.setValue("currency", "");
        setCurrency(undefined);
        return;
      }
      const tenantDetails = await getTenantDetails(tenantId);
      if (tenantDetails?.data.currency) {
        form.setValue("currency", tenantDetails?.data.currency);
        setCurrency(tenantDetails?.data.currency);
      }
    };
    getTenant();
  }, [form, tenantId]);

  // Is form in read mode
  const isReadMode = crudAction === "read";

  // Return the form
  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(onSubmit)}
      className="px-2.5 pb-5"
      disabled={isReadMode}
    >
      {/* PricingPlan Id */}
      {isReadMode && <InputField {...idProps} />}

      {/* type */}
      {form.getValues("tenantType") || crudAction === "create" ? (
        <SelectField {...tenantTypeProps} />
      ) : null}

      {/* name of tenant */}
      <AsyncSelectField {...tenantSelectProps} />
      {/* pricingComponent name fo the plan */}
      {form.getValues("pricingComponent") || crudAction === "create" ? (
        <SelectField {...pricingComponentTypeProps} />
      ) : null}

      <div className="relative grid grid-cols-3 items-center rounded-lg shadow-sm">
        <span className="col-span-2">
          {/* unitPrice */}
          <InputField
            className="col-span-2 rounded-r-none"
            {...unitPriceTypeProps}
          />
        </span>
        <span
          className={cn(
            form.getFieldState("unitPrice").invalid ? "mt-0" : "mt-5",
          )}
        >
          {/* currency */}
          <SearchSelectField
            {...currencyTypeProps}
            className="mr-4 !w-fit"
            disabled={!!currency}
            getDisplayValue={(option) => (
              <div className="flex items-center gap-2">
                <div className="flex flex-col">
                  <div className="font-medium">{option.value}</div>
                  <div className="text-xs text-muted-foreground">
                    {option.description}
                  </div>
                </div>
              </div>
            )}
          />
        </span>
      </div>

      {/* frequency */}
      {(form.getValues("frequency") || crudAction === "create") &&
      pricingComponent != "GPUCompute" ? (
        <SelectField
          {...frequencyTypeProps}
          isRequired={pricingComponent !== "GPUCompute"}
        />
      ) : null}

      {/* cola */}
      <IconInputField {...colaTypeProps} />

      {/* Is Disabled */}
      {crudAction !== "create" && <SwitchField {...isDisabledProps} />}

      {/* AutherCard */}
      {isReadMode && (
        <AutherCard
          createdBy={form.getValues("createdBy")}
          createdOn={form.getValues("createdOn")}
          lastModifiedBy={form.getValues("lastModifiedBy")}
          lastModifiedOn={form.getValues("lastModifiedOn")}
        />
      )}

      {/* Submit button */}
      {!isReadMode && (
        <div className="!mt-5 flex w-full justify-end">
          <Button type="submit" disabled={!isDirty} className="min-w-[5rem]">
            {crudAction === "create" ? "Create Plan" : "Save changes"}
          </Button>
        </div>
      )}
    </Form>
  );
};
