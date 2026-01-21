import { SubmitButton } from "@aventisia/ui/buttons";
import {
  Form,
  InputField,
  // SwitchField,
  TextareaField,
} from "@aventisia/ui/form";
import { useListOptimisticMutation } from "@aventisia/ui/hooks";
import { useEffect } from "react";
import { z } from "zod";

import { modelOptimisticMutationFn } from "../../apis/models-table-apis";
import { MODELS_QUERY_KEY } from "../../constants";
import {
  descriptionProps,
  idProps,
  // isDisabledProps,
  nameProps,
} from "../../constants/model-form-field-props";
import { modelZodSchema } from "../../constants/model-zod-schema";
import { ModelsTableDto } from "../../dtos/models-table-dto";
import { useDefineModelForm } from "../../hooks/useDefineModelForm";

export const ModelCrudForm = () => {
  // Define model form
  const {
    form,
    isDirty,
    rowId,
    crudAction,
    isAvailable,
    availabilityMessage,
    isCheckPending,
    handleInputChange,
    setShowDialog,
    refineFormData,
  } = useDefineModelForm();

  // Define optimistic mutation to crete or update the model
  const {
    mutate: mutateModel,
    isPending,
    isSuccess,
  } = useListOptimisticMutation<
    ModelsTableDto,
    ModelsTableDto | boolean,
    ModelsTableDto
  >([rowId], modelOptimisticMutationFn, MODELS_QUERY_KEY);

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof modelZodSchema>) => {
    // Create or update the model
    mutateModel({
      payload: refineFormData(formData) as unknown as ModelsTableDto,
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

      {/* Name */}
      <InputField
        {...nameProps}
        onChangeCapture={(e) => handleInputChange(e.currentTarget.value)}
        nonErrorMessage={availabilityMessage}
      />

      {/* Description */}
      <TextareaField {...descriptionProps} />

      {/* Is Disabled */}
      {/* {crudAction !== "create" && <SwitchField {...isDisabledProps} />} */}

      {/* TODO: Implement AutherCard */}

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
