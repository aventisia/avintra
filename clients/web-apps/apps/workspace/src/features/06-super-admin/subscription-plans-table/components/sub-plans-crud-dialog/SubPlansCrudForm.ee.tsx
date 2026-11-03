import { SubmitButton } from "@avplatform/ui/buttons";
import { CrudDialogActions, useCrudDialogDirty } from "@avplatform/ui/crud-dialog";
import { AutherCard, Form, InputField, SelectField, SwitchField } from "@avplatform/ui/form";
import { useListOptimisticMutation } from "@avplatform/ui/hooks";
import { type CrudActionType } from "@avplatform/ui/types";
import { useEffect } from "react";
import { z } from "zod";

import { subPlanOptimisticMutationFn } from "../../apis/sub-plans-table-apis.ee";
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
} from "../../constants/sub-plans-form-field-props.ee";
import { subPlansZodSchema } from "../../constants/sub-plans-zod-schema.ee";
import { SubPlansTableDto } from "../../dtos/sub-plans-table-dto.ee";
import { useDefineSubPlansForm } from "../../hooks/useDefineSubPlansForm.ee";

interface SubPlansCrudFormProps {
  rowId: string;
  crudAction: CrudActionType;
}

export const SubPlansCrudForm = ({ rowId, crudAction }: SubPlansCrudFormProps) => {
  const { onCloseConfirmed } = useCrudDialogDirty();

  // Define Subscription plan form
  const { form, isDirty, refineFormData } = useDefineSubPlansForm({ rowId, crudAction });

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
    if (crudAction !== "create") onCloseConfirmed();
  };

  // Close dialog and reset form when mutation is successful
  useEffect(() => {
    if (crudAction === "create" && isSuccess) onCloseConfirmed();
  }, [isSuccess, crudAction, onCloseConfirmed]);

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
        <CrudDialogActions>
          <SubmitButton
            className="min-w-[5rem]"
            primaryText={crudAction === "create" ? "Create" : "Save changes"}
            secondaryText="Creating..."
            isPending={isPending}
            disabled={!isDirty}
          />
        </CrudDialogActions>
      )}
    </Form>
  );
};
