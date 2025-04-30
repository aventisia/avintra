import { getTenantDetails } from "@/features/sa/tenants-table/apis/tenants-table-apis";
import { useListOptimisticMutation } from "@/react-toolkit/hooks/useListOptimisticMutation";
import { Button } from "@/react-toolkit/ui/buttons/Button";
import { Form } from "@/react-toolkit/ui/form/Form";
import { AsyncSelectField } from "@/react-toolkit/ui/form/fields/AsyncSelectField";
import { IconInputField } from "@/react-toolkit/ui/form/fields/IconInputField";
import { InputField } from "@/react-toolkit/ui/form/fields/InputField";
import { RadioCardGroupField } from "@/react-toolkit/ui/form/fields/RadioCardGroupField";
import { SelectField } from "@/react-toolkit/ui/form/fields/SelectField";
import { SwitchField } from "@/react-toolkit/ui/form/fields/SwitchField";
import { SelectAndInputComboField } from "@/react-toolkit/ui/form/fields/combo/SelectAndInputComboField";
import { AutherCard } from "@/react-toolkit/ui/form/non-field/AutherCard";

import { useEffect, useState } from "react";
import { z } from "zod";

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
    fetchingData?: boolean;
  }>();

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof pricingPlanZodSchema>) => {
    console.log(formData);

    const p = pricingPlanZodSchema.parse(formData);

    console.log(p);

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
      setformStateData({
        ...formStateData,
        fetchingData: true,
      });
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
      setformStateData({
        ...formStateData,
        fetchingData: false,
      });
    };
    getTenant();
  }, [form, tenantId, type]);

  // Is form in read mode
  const isReadMode = crudAction === "read";

  useEffect(() => {
    if (crudAction !== "update") return;

    const setFields = async () => {
      const tenantDetails = await getTenantDetails(tenantId);
      setformStateData({
        ...formStateData,
        fetchingData: true,
      });
      if (tenantDetails?.data.currency) {
        form.resetField("currency", {
          defaultValue: tenantDetails?.data.currency.toLocaleLowerCase(),
        });
        setformStateData({
          ...formStateData,
          currency: tenantDetails?.data.currency,
        });
      }

      if (tenantDetails?.data.type) {
        form.resetField("tenantType", {
          defaultValue: tenantDetails?.data.type,
        });
        setformStateData({
          ...formStateData,
          tenantType: tenantDetails?.data.type,
        });
      }
      setformStateData({
        ...formStateData,
        fetchingData: false,
      });
    };
    setFields();
  }, []);

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

      <RadioCardGroupField
        name="type"
        label="Plan Type"
        isRequired={true}
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
        isRequired={type === "tenant"}
        {...deploymentTypeProps}
      />
      {/* pricingComponent name fo the plan */}
      {crudAction === "create" || form.getValues("pricingComponent") ? (
        <SelectField {...pricingComponentTypeProps} />
      ) : null}

      <SelectAndInputComboField
        inputFieldProps={unitPriceTypeProps}
        selectFieldProps={{
          ...currencyTypeProps,
          disabled: type === "tenant",
          getDisplayValue: (option) => (
            <div className="flex items-center gap-2">
              <div className="flex flex-col">
                <div className="font-medium">{option.value}</div>
                <div className="text-xs text-muted-foreground">
                  {option.description}
                </div>
              </div>
            </div>
          ),
        }}
      />

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
          <Button
            type="submit"
            disabled={formStateData?.fetchingData || !isDirty}
            className="min-w-[5rem]"
          >
            {crudAction === "create" ? "Create Plan" : "Save changes"}
          </Button>
        </div>
      )}
    </Form>
  );
};
