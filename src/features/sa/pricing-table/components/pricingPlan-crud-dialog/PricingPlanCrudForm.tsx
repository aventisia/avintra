import { z } from "zod";

import { useListOptimisticMutation } from "@/react-toolkit/hooks/useListOptimisticMutation";
import { Button } from "@/react-toolkit/ui/buttons/Button";
import { IconInputField } from "@/react-toolkit/ui/form/fields/IconInputField";
import { InputField } from "@/react-toolkit/ui/form/fields/InputField";
import { SelectField } from "@/react-toolkit/ui/form/fields/SelectField";
import { SwitchField } from "@/react-toolkit/ui/form/fields/SwitchField";
import { TenantSelectField } from "@/react-toolkit/ui/form/fields/TenantSelectField";
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
  tenantNameProps,
  tenantTypeProps,
  unitPriceTypeProps,
} from "../../constants/pricingPlan-form-field-props";
import { pricingPlanZodSchema } from "../../constants/pricingPlan-zod-schema";
import { PricingPlansTableDto } from "../../dtos/pricingPlans-table-dto";
import { useDefinePricingPlanForm } from "../../hooks/useDefinePricingPlanForm";

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
      {form.getValues("tenantType") || crudAction === "create" ? (
        <SelectField {...tenantTypeProps} />
      ) : null}

      {/* name of tenant */}
      {form.getValues("tenantName") || crudAction === "create" ? (
        <TenantSelectField {...tenantNameProps} />
      ) : null}

      {/* pricingComponent name fo the plan */}
      {form.getValues("name") || crudAction === "create" ? (
        <SelectField {...pricingComponentTypeProps} />
      ) : null}

      {/* currency */}
      {form.getValues("currency") || crudAction === "create" ? (
        <SelectField {...currencyTypeProps} />
      ) : null}

      {/* unitPrice */}
      <InputField {...unitPriceTypeProps} />

      {/* frequency */}
      {form.getValues("frequency") || crudAction === "create" ? (
        <SelectField {...frequencyTypeProps} />
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
