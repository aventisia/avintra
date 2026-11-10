import { SubmitButton } from "@avplatform/ui/buttons";
import { CrudDialogActions, useCrudDialogDirty } from "@avplatform/ui/crud-dialog";
import { Form, InputField, SelectField, SwitchField } from "@avplatform/ui/form";
import { useListOptimisticMutation } from "@avplatform/ui/hooks";
import { type CrudActionType } from "@avplatform/ui/types";
import { useEffect } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { z } from "zod";

import { creditOptimisticMutationFn } from "../../apis/credit-plans-table-apis.ee";
import { CREDIT_PLANS_QUERY_KEY } from "../../constants";
import {
  creditsProps,
  isDisabledProps,
  oneUnitProps,
  serviceTypeProps,
  unitTypeProps,
} from "../../constants/credit-plans-form-field-props.constant.ee";
import { creditPlansZodSchema } from "../../constants/credit-plans-zod-schema.ee";
import { CreditPlansTableDto } from "../../dtos/credit-plans-table-dto.ee";
import { ServiceTypeEnum } from "../../enums/service-type-enum.ee";
import { useDefineCreditPlansForm } from "../../hooks/useDefineCreditPlansForm.ee";

interface CreditPlansCrudFormProps {
  rowId: string;
  crudAction: CrudActionType;
}

const DecimalField = ({
  name,
  label,
  description,
}: {
  name: "oneUnit" | "credits";
  label: string;
  description: string;
}) => {
  const { control } = useFormContext<z.infer<typeof creditPlansZodSchema>>();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <InputField
          value={field.value ?? ""}
          label={label}
          description={description}
          type="number"
          step="any"
          onChange={(e) => {
            const value = parseFloat(e.target.value);
            field.onChange(isNaN(value) ? 0 : value);
          }}
          onBlur={field.onBlur}
          name={field.name}
          isRequired
          min={0}
        />
      )}
    />
  );
};

export const CreditPlansCrudForm = ({ rowId, crudAction }: CreditPlansCrudFormProps) => {
  const { onCloseConfirmed } = useCrudDialogDirty();

  const { form, isDirty, refineFormData } = useDefineCreditPlansForm({ rowId, crudAction });

  const {
    mutate: mutateModel,
    isPending,
    isSuccess,
  } = useListOptimisticMutation<
    CreditPlansTableDto,
    CreditPlansTableDto | boolean,
    CreditPlansTableDto
  >([rowId], creditOptimisticMutationFn, CREDIT_PLANS_QUERY_KEY);

  const onSubmit = (formData: z.infer<typeof creditPlansZodSchema>) => {
    mutateModel({
      payload: refineFormData(formData) as unknown as CreditPlansTableDto,
      crudAction: crudAction,
    });

    if (crudAction !== "create") onCloseConfirmed();
  };

  useEffect(() => {
    if (crudAction === "create" && isSuccess) onCloseConfirmed();
  }, [isSuccess, crudAction, onCloseConfirmed]);

  const serviceType = form.watch("serviceType");

  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(onSubmit)}
      recordName={ServiceTypeEnum[serviceType as keyof typeof ServiceTypeEnum] ?? serviceType ?? ""}
    >
      <SelectField {...serviceTypeProps} />
      <SelectField {...unitTypeProps} />
      <div className="grid grid-cols-2 gap-3">
        <DecimalField {...oneUnitProps} />
        <DecimalField {...creditsProps} />
      </div>
      {crudAction !== "create" && <SwitchField {...isDisabledProps} />}
      <CrudDialogActions>
        <SubmitButton
          className="min-w-[5rem]"
          primaryText={crudAction === "create" ? "Create credit plan" : "Save changes"}
          secondaryText={crudAction === "create" ? "Creating..." : "Saving..."}
          isPending={isPending}
          disabled={!isDirty}
        />
      </CrudDialogActions>
    </Form>
  );
};
