import { SubmitButton } from "@avplatform/ui/buttons";
import { CrudDialogActions, useCrudDialogDirty } from "@avplatform/ui/crud-dialog";
import { Form, InputField, SelectField, SwitchField } from "@avplatform/ui/form";
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
} from "../../constants/sub-plans-form-field-props.constant.ee";
import { subPlansZodSchema } from "../../constants/sub-plans-zod-schema.ee";
import { SubPlansTableDto } from "../../dtos/sub-plans-table-dto.ee";
import { useDefineSubPlansForm } from "../../hooks/useDefineSubPlansForm.ee";

interface SubPlansCrudFormProps {
  rowId: string;
  crudAction: CrudActionType;
}

export const SubPlansCrudForm = ({ rowId, crudAction }: SubPlansCrudFormProps) => {
  const { onCloseConfirmed } = useCrudDialogDirty();

  const { form, isDirty, refineFormData } = useDefineSubPlansForm({ rowId, crudAction });

  const {
    mutate: mutateSubPlan,
    isPending,
    isSuccess,
  } = useListOptimisticMutation<SubPlansTableDto, SubPlansTableDto | boolean, SubPlansTableDto>(
    [rowId],
    subPlanOptimisticMutationFn,
    PLANS_QUERY_KEY,
  );

  const onSubmit = (formData: z.infer<typeof subPlansZodSchema>) => {
    mutateSubPlan({
      payload: refineFormData(formData) as unknown as SubPlansTableDto,
      crudAction: crudAction,
    });

    if (crudAction !== "create") onCloseConfirmed();
  };

  useEffect(() => {
    if (crudAction === "create" && isSuccess) onCloseConfirmed();
  }, [isSuccess, crudAction, onCloseConfirmed]);

  return (
    <Form methods={form} onSubmit={form.handleSubmit(onSubmit)}>
      <InputField {...nameProps} />
      <div className="grid grid-cols-2 gap-3">
        <SelectField {...typeProps} />
        <SelectField {...statusProps} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <InputField {...priceProps} />
        <SelectField {...currencyProps} />
        <SelectField {...frequencyProps} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <InputField {...maxCreditsProps} />
        <InputField {...maxPublishedItemsProps} />
        <InputField {...maxUsersProps} />
        <InputField {...maxSpacesProps} />
        <InputField {...storageLimitMBProps} />
        <InputField {...historyRetentionDaysProps} />
      </div>
      {crudAction !== "create" && <SwitchField {...isDisabledProps} />}
      <CrudDialogActions>
        <SubmitButton
          className="min-w-[5rem]"
          primaryText={crudAction === "create" ? "Create subscription plan" : "Save changes"}
          secondaryText={crudAction === "create" ? "Creating..." : "Saving..."}
          isPending={isPending}
          disabled={!isDirty}
        />
      </CrudDialogActions>
    </Form>
  );
};
