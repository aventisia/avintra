import { SubmitButton } from "@avplatform/ui/buttons";
import { CrudDialogActions, useCrudDialogDirty } from "@avplatform/ui/crud-dialog";
import { Form, InputField, SwitchField, TextareaField } from "@avplatform/ui/form";
import { useListOptimisticMutation } from "@avplatform/ui/hooks";
import { useEffect } from "react";
import { z } from "zod";

import { skillOptimisticMutationFn } from "../../apis/skill-registry.apis";
import {
  descriptionProps,
  isDisabledProps,
  nameProps,
} from "../../constants/skill-form-field-props.constant";
import { skillZodSchema } from "../../constants/skill-zod-schema.constant";
import { SkillTableDto } from "../../dtos/skill-table.dto";
import { useDefineSkillForm } from "../../hooks/useDefineSkillForm.hook";
import { useTableTab } from "../../hooks/useTableTab.hook";

interface SkillCrudFormProps {
  rowId: string;
  crudAction: "create" | "update";
}

export const SkillCrudForm = ({ rowId, crudAction }: SkillCrudFormProps) => {
  const { onCloseConfirmed } = useCrudDialogDirty();

  // Define skill form
  const {
    form,
    isDirty,
    isAvailable,
    availabilityMessage,
    setAvailabilityMessage,
    isCheckPending,
    handleInputChange,
    refineFormData,
  } = useDefineSkillForm({ rowId, crudAction });

  // Use this in place DATA_QUERY_KEY to handle Personal/Shared tabs list
  const { queryKey } = useTableTab();

  // Define optimistic mutation to create or update the skill
  const {
    mutate: mutateSkill,
    isPending,
    isSuccess,
  } = useListOptimisticMutation<SkillTableDto, SkillTableDto | boolean, SkillTableDto>(
    [rowId],
    skillOptimisticMutationFn,
    queryKey,
  );

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof skillZodSchema>) => {
    // Create or update the skill
    mutateSkill({
      payload: refineFormData(formData) as unknown as SkillTableDto,
      crudAction: crudAction,
    });

    // Reset the availability message
    setAvailabilityMessage(null);

    // Close the dialog if not creating the record
    if (crudAction !== "create") onCloseConfirmed();
  };

  // Close dialog and reset form when mutation is successful
  useEffect(() => {
    if (crudAction === "create" && isSuccess) onCloseConfirmed();
  }, [isSuccess, crudAction, onCloseConfirmed]);

  return (
    <Form methods={form} onSubmit={form.handleSubmit(onSubmit)}>
      <InputField
        {...nameProps}
        onChangeCapture={(e) => handleInputChange(e.currentTarget.value)}
        nonErrorMessage={availabilityMessage}
        disabled={crudAction !== "create"}
      />
      <TextareaField {...descriptionProps} />
      {crudAction !== "create" && <SwitchField {...isDisabledProps} />}
      <CrudDialogActions>
        <SubmitButton
          primaryText={crudAction === "create" ? "Create skill" : "Save changes"}
          secondaryText={crudAction === "create" ? "Creating..." : "Saving..."}
          isPending={isPending}
          disabled={!isDirty || !isAvailable || isCheckPending}
        />
      </CrudDialogActions>
    </Form>
  );
};
