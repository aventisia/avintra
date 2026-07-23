import { SubmitButton } from "@avplatform/ui/buttons";
import { Form, InputField, SelectField, SwitchField } from "@avplatform/ui/form";
import { useListOptimisticMutation } from "@avplatform/ui/hooks";
import { useEffect } from "react";
import { Controller } from "react-hook-form";
import { z } from "zod";

import { creditOptimisticMutationFn } from "../../apis/credit-plans-table-apis";
import { CREDIT_PLANS_QUERY_KEY } from "../../constants";
import {
  idProps,
  isDisabledProps,
  serviceTypeProps,
  unitTypeProps,
} from "../../constants/credit-plans-form-field-props";
import { creditPlansZodSchema } from "../../constants/credit-plans-zod-schema";
import { CreditPlansTableDto } from "../../dtos/credit-plans-table-dto";
import { useDefineCreditPlansForm } from "../../hooks/useDefineCreditPlansForm";

export const CreditPlansCrudForm = () => {
  // Define model form
  const { form, isDirty, rowId, crudAction, setShowDialog, refineFormData } =
    useDefineCreditPlansForm();

  // Define optimistic mutation to crete or update the model
  const {
    mutate: mutateModel,
    isPending,
    isSuccess,
  } = useListOptimisticMutation<
    CreditPlansTableDto,
    CreditPlansTableDto | boolean,
    CreditPlansTableDto
  >([rowId], creditOptimisticMutationFn, CREDIT_PLANS_QUERY_KEY);

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof creditPlansZodSchema>) => {
    // Create or update the model
    mutateModel({
      payload: refineFormData(formData) as unknown as CreditPlansTableDto,
      crudAction: crudAction,
    });

    // Close the dialog if not creating the record
    if (crudAction !== "create") setShowDialog(false);
  };

  // Close dialog and reset form when mutation is successful
  useEffect(() => {
    if (crudAction === "create" && isSuccess) setShowDialog(false);
  }, [isSuccess, crudAction, setShowDialog]);

  // Is form in read mode?
  const isReadMode = crudAction === "read";

  // Return the form
  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(onSubmit)}
      className="px-2.5 pb-5"
      disabled={isReadMode}
    >
      {/* Model Id */}
      {isReadMode && <InputField {...idProps} />}

      {/* Service Type */}
      <SelectField {...serviceTypeProps} />

      {/* Unit Type */}
      <SelectField {...unitTypeProps} />

      {/* One Unit */}
      <Controller
        control={form.control}
        name={`oneUnit`}
        render={({ field }) => (
          <InputField
            value={field.value ?? ""}
            label="One Unit"
            type="number"
            step="any"
            onChange={(e) => {
              // Handle both integer and float values
              const value = parseFloat(e.target.value);
              field.onChange(isNaN(value) ? 0 : value); // Default to 0 if NaN
            }}
            onBlur={field.onBlur}
            name={field.name}
            isRequired={true}
            min={0}
          />
        )}
      />

      {/* Credits */}
      <Controller
        control={form.control}
        name={`credits`}
        render={({ field }) => (
          <InputField
            value={field.value ?? ""}
            label="Credits"
            type="number"
            step="any"
            onChange={(e) => {
              // Handle both integer and float values
              const value = parseFloat(e.target.value);
              field.onChange(isNaN(value) ? 0 : value); // Default to 0 if NaN
            }}
            onBlur={field.onBlur}
            name={field.name}
            isRequired={true}
            min={0}
          />
        )}
      />

      {/* Is Disabled */}
      {crudAction !== "create" && <SwitchField {...isDisabledProps} />}

      {/* Submit button */}
      {!isReadMode && (
        <div className="!mt-5 flex w-full justify-end">
          <SubmitButton
            className="min-w-[5rem]"
            primaryText={crudAction === "create" ? "Create" : "Save changes"}
            secondaryText="Creating..."
            isPending={isPending}
            disabled={!isDirty}
          />
        </div>
      )}
    </Form>
  );
};
