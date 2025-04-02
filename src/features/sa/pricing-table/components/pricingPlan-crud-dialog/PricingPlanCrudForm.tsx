import { useListOptimisticMutation } from "@/react-toolkit/hooks/useListOptimisticMutation";
import { Button } from "@/react-toolkit/ui/buttons/Button";
import { InputField } from "@/react-toolkit/ui/form/fields/InputField";
import { SwitchField } from "@/react-toolkit/ui/form/fields/SwitchField";
import { Form } from "@/react-toolkit/ui/form/Form";
import { AutherCard } from "@/react-toolkit/ui/form/non-field/AutherCard";
import { z } from "zod";
import { pricingPlanOptimisticMutationFn } from "../../apis/pricingPlans-table-apis";
import { DATA_QUERY_KEY } from "../../constants";
import {
  billingFrequencyTypeProps,
  colaTypeProps,
  currencyTypeProps,
  idProps,
  isDisabledProps,
  pricingComponentTypeProps,
  tenantNameProps,
  tenantTypeProps,
  unitPriceTypeProps,
  unitTypeProps,
} from "../../constants/pricingPlan-form-field-props";
import { pricingPlanZodSchema } from "../../constants/pricingPlan-zod-schema";
import { PricingPlansTableDto } from "../../dtos/pricingPlans-table-dto";
import { useDefinePricingPlanForm } from "../../hooks/useDefinePricingPlanForm";
import { SelectField } from "@/react-toolkit/ui/form/fields/SelectField";
import { IconInputField } from "@/react-toolkit/ui/form/fields/IconInputField";

export const PricingPlanCrudForm = () => {
  // Define pricingplan form
  const { form, isDirty, rowId, crudAction, setShowDialog, refineFormData } =
    useDefinePricingPlanForm();

  // Define optimistic mutation to crete or update the pricingplan
  const { mutate: mutatePricingPlan } = useListOptimisticMutation<
    PricingPlansTableDto,
    PricingPlansTableDto | boolean,
    PricingPlansTableDto
  >([rowId], pricingPlanOptimisticMutationFn, DATA_QUERY_KEY);

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
      <SelectField {...tenantTypeProps} />

      {/* name */}
      <SelectField {...tenantNameProps} />

      {/* pricingComponent */}
      <SelectField {...pricingComponentTypeProps} />

      {/* currency */}
      <SelectField {...currencyTypeProps} />

      {/* unit */}
      <SelectField {...unitTypeProps} />

      {/* unitPrice */}
      <InputField {...unitPriceTypeProps} />

      {/* billingFrequency */}
      <SelectField {...billingFrequencyTypeProps} />

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
