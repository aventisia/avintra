import { SubmitButton } from "@avplatform/ui/buttons";
import { useCrudDialogDirty } from "@avplatform/ui/data-table";
import { Form, InputField, SwitchField, TextareaField } from "@avplatform/ui/form";
import { useListOptimisticMutation } from "@avplatform/ui/hooks";
import { type CrudActionType } from "@avplatform/ui/types";
import { useEffect } from "react";
import { z } from "zod";

import { uiBuilderOptimisticMutationFn } from "../../apis/ui-builder-table-apis";
import { UI_BUILDER_QUERY_KEY } from "../../constants";
import {
  descriptionProps,
  idProps,
  isDisabledProps,
  nameProps,
} from "../../constants/ui-builder-form-field-props";
import { uiBuilderZodSchema } from "../../constants/ui-builder-zod-schema";
import { UiBuilderTableDto } from "../../dtos/ui-builder-table-dto";
import { useDefineUiBuilderForm } from "../../hooks/useDefineUiBuilderForm";

interface UiBuilderCrudFormProps {
  rowId: string;
  crudAction: CrudActionType;
}

export const UiBuilderCrudForm = ({ rowId, crudAction }: UiBuilderCrudFormProps) => {
  const { onCloseConfirmed } = useCrudDialogDirty();

  const {
    form,
    isDirty,
    isAvailable,
    availabilityMessage,
    isCheckPending,
    handleInputChange,
    refineFormData,
  } = useDefineUiBuilderForm({ rowId, crudAction });

  const {
    mutate: mutateProject,
    isPending,
    isSuccess,
  } = useListOptimisticMutation<
    UiBuilderTableDto,
    UiBuilderTableDto | boolean | number,
    UiBuilderTableDto
  >([rowId], uiBuilderOptimisticMutationFn, UI_BUILDER_QUERY_KEY);

  const onSubmit = (formData: z.infer<typeof uiBuilderZodSchema>) => {
    mutateProject({
      payload: refineFormData(formData) as unknown as UiBuilderTableDto,
      crudAction: crudAction,
    });

    if (crudAction !== "create") onCloseConfirmed();
  };

  useEffect(() => {
    if (crudAction === "create" && isSuccess) onCloseConfirmed();
  }, [isSuccess, crudAction, onCloseConfirmed]);

  const isReadMode = crudAction === "read";

  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(onSubmit)}
      className="px-2.5 pb-5"
      disabled={isReadMode}
    >
      {/* Project Id */}
      {isReadMode && <InputField {...idProps} />}

      {/* Name */}
      <InputField
        {...nameProps}
        onChangeCapture={(e) => handleInputChange(e.currentTarget.value)}
        nonErrorMessage={availabilityMessage}
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
