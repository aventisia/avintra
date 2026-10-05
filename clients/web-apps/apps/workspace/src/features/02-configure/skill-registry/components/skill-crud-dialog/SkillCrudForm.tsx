import { SubmitButton } from "@avplatform/ui/buttons";
import { useCrudDialogDirty } from "@avplatform/ui/data-table";
import { Form, InputField, SwitchField, TextareaField } from "@avplatform/ui/form";
import { useListOptimisticMutation } from "@avplatform/ui/hooks";
import { type CrudActionType } from "@avplatform/ui/types";
import { useEffect } from "react";
import { z } from "zod";

import { skillOptimisticMutationFn } from "../../apis/skill-registry.apis";
import {
  descriptionProps,
  idProps,
  isDisabledProps,
  nameProps,
} from "../../constants/skill-form-field-props.constant";
import { skillZodSchema } from "../../constants/skill-zod-schema.constant";
import { SkillTableDto } from "../../dtos/skill-table.dto";
import { useDefineSkillForm } from "../../hooks/useDefineSkillForm.hook";
import { useTableTab } from "../../hooks/useTableTab.hook";

interface SkillCrudFormProps {
  rowId: string;
  crudAction: CrudActionType;
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
      {/* Skill Id */}
      {isReadMode && <InputField {...idProps} />}

      {/* Name */}
      <InputField
        {...nameProps}
        onChangeCapture={(e) => handleInputChange(e.currentTarget.value)}
        nonErrorMessage={availabilityMessage}
        disabled={crudAction !== "create"}
      />

      {/* Description */}
      <TextareaField {...descriptionProps} />

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
            disabled={!isDirty || !isAvailable || isCheckPending}
          />
        </div>
      )}
    </Form>
  );
};
