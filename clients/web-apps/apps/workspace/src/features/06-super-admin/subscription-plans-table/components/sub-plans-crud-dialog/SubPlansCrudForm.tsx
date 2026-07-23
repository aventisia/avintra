import { SubmitButton } from "@avplatform/ui/buttons";
import { AutherCard, Form, InputField, SelectField, SwitchField } from "@avplatform/ui/form";
import { useListOptimisticMutation } from "@avplatform/ui/hooks";
import { useEffect } from "react";
import { z } from "zod";

import { subPlanOptimisticMutationFn } from "../../apis/sub-plans-table-apis";
import { PLANS_QUERY_KEY } from "../../constants";
import {
  currencyProps,
  frequencyProps,
  historyRetentionDaysProps,
  idProps,
  isDisabledProps,
  maxCreditsProps,
  maxPublishedItemsProps,
  maxSpacesProps,
  maxUsersProps,
  nameProps,
  priceProps,
  statusProps,
  storageLimitMBProps,
  typeProps,
} from "../../constants/sub-plans-form-field-props";
import { subPlansZodSchema } from "../../constants/sub-plans-zod-schema";
import { SubPlansTableDto } from "../../dtos/sub-plans-table-dto";
import { useDefineSubPlansForm } from "../../hooks/useDefineSubPlansForm";

export const SubPlansCrudForm = () => {
  // Define Subscription plan form
  const { form, rowId, isDirty, crudAction, setShowDialog, refineFormData } =
    useDefineSubPlansForm();

  // Define optimistic mutation to crete or update the subscription plan
  const {
    mutate: mutateSubPlan,
    isPending,
    isSuccess,
  } = useListOptimisticMutation<SubPlansTableDto, SubPlansTableDto | boolean, SubPlansTableDto>(
    [rowId],
    subPlanOptimisticMutationFn,
    PLANS_QUERY_KEY,
  );

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof subPlansZodSchema>) => {
    // Create or update the subscription plan
    mutateSubPlan({
      payload: refineFormData(formData) as unknown as SubPlansTableDto,
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
      {/* Plan Id */}
      {isReadMode && <InputField {...idProps} />}

      <SelectField {...currencyProps} />

      <SelectField {...frequencyProps} />

      {/* Name */}
      <InputField {...nameProps} />

      <SelectField {...typeProps} />

      <SelectField {...statusProps} />

      <InputField {...priceProps} />

      {/* No of Credits */}
      <InputField {...maxCreditsProps} />

      {/* Published Agents and ML Models */}
      <InputField {...maxPublishedItemsProps} />

      {/* Insights and workflow history */}
      <InputField {...historyRetentionDaysProps} />

      {/* Spaces */}
      <InputField {...maxSpacesProps} />

      {/* Storage Limit */}
      <InputField {...storageLimitMBProps} />

      {/* Users */}
      <InputField {...maxUsersProps} />

      {/* Is Disabled */}
      {crudAction !== "create" && <SwitchField {...isDisabledProps} />}

      {/* AutherCard: TODO: Hiding till the time we don't have a good design for this */}
      <div className="hidden">
        {crudAction === "read" && (
          <AutherCard
            createdBy={form.getValues("createdBy")}
            createdOn={form.getValues("createdOn")}
            lastModifiedBy={form.getValues("lastModifiedBy")}
            lastModifiedOn={form.getValues("lastModifiedOn")}
          />
        )}
      </div>

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
