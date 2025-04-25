import { useEffect, useState } from "react";
import { z } from "zod";

import { getTenantDetails } from "@/features/sa/tenants-table/apis/tenants-table-apis";
import { useListOptimisticMutation } from "@/react-toolkit/hooks/useListOptimisticMutation";
import { cn } from "@/react-toolkit/lib/utils";
import { Button } from "@/react-toolkit/ui/buttons/Button";
import { AsyncSelectField } from "@/react-toolkit/ui/form/fields/AsyncSelectField";
import { IconInputField } from "@/react-toolkit/ui/form/fields/IconInputField";
import { InputField } from "@/react-toolkit/ui/form/fields/InputField";
import { RadioCardGroupField } from "@/react-toolkit/ui/form/fields/RadioCardGroupField";
import { SwitchField } from "@/react-toolkit/ui/form/fields/SwitchField";
import { Form } from "@/react-toolkit/ui/form/Form";
import { AutherCard } from "@/react-toolkit/ui/form/non-field/AutherCard";

import { pricingPlanOptimisticMutationFn } from "../../apis/pricingPlans-table-apis";
import { DATA_QUERY_KEY } from "../../constants";
import {
  colaTypeProps,
  currencyTypeProps,
  deploymentTypeProps,
  frequencyTypeProps,
  idProps,
  isDisabledProps,
  pricingComponentTypeProps,
  tenantSelectProps,
  unitPriceTypeProps,
} from "../../constants/pricingPlan-form-field-props";
import { pricingPlanZodSchema } from "../../constants/pricingPlan-zod-schema";
import { PricingPlansTableDto } from "../../dtos/pricingPlans-table-dto";
import { useDefinePricingPlanForm } from "../../hooks/useDefinePricingPlanForm";

export type pricingType = "default" | "tenant";
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

  const [formStateData, setformStateData] = useState<{
    currency?: string;
    tenantType?: string;
    pricingCreateType?: pricingType;
  }>();

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

  const [tenantId, type] = watch(["tenantId", "type"]);

  useEffect(() => {
    const getTenant = async () => {
      if (!tenantId || type === "default") {
        form.setValue("currency", "");
        form.setValue("tenantType", "");
        setformStateData({ ...formStateData, currency: "", tenantType: "" });
        return;
      }
      const tenantDetails = await getTenantDetails(tenantId);
      if (tenantDetails?.data.currency) {
        form.setValue(
          "currency",
          tenantDetails?.data.currency.toLocaleLowerCase(),
          {
            shouldDirty: true,
            shouldValidate: true,
          },
        );
        setformStateData({
          ...formStateData,
          currency: tenantDetails?.data.currency,
        });

        console.log(tenantDetails?.data.currency);
      }

      if (tenantDetails?.data.type) {
        form.setValue("tenantType", tenantDetails?.data.type, {
          shouldDirty: true,
          shouldValidate: true,
        });
        setformStateData({
          ...formStateData,
          tenantType: tenantDetails?.data.type,
        });
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
      {crudAction === "create" ? (
        <RadioCardGroupField
          name="type"
          label="Plan Type"
          isRequired={crudAction === "create"}
          selectOptions={[
            {
              label: "Tenant",
              value: "tenant",
            },
            {
              label: "Default",
              value: "default",
            },
          ]}
        />
      ) : null}
      {/* name of tenant */}
      {!type || type === "tenant" ? (
        <AsyncSelectField
          isRequired={type === "tenant"}
          {...tenantSelectProps}
        />
      ) : null}
      {/* deployment type */}
      <RadioCardGroupField
        disabled={type === "tenant"}
        {...deploymentTypeProps}
      />
      {/* pricingComponent name fo the plan */}
      <AsyncSelectField {...pricingComponentTypeProps} />

      <div className="relative grid grid-cols-3 items-center rounded-lg shadow-sm">
        <span>
          {/* currency */}
          <AsyncSelectField
            {...currencyTypeProps}
            className="ml-28 !w-fit"
            disabled={!!formStateData?.currency}
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
        <span
          className={cn(
            "col-span-2",
            // form.getFieldState("currency").invalid ? "mt-5" : "mt-0",
          )}
        >
          {/* unitPrice */}
          <InputField className="rounded-l-none" {...unitPriceTypeProps} />
        </span>
      </div>
      {/* frequency */}
      {pricingComponent != "GPUCompute" ? (
        <RadioCardGroupField
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
