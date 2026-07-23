import { SubmitButton } from "@avplatform/ui/buttons";
import { Form, InputField, SelectField, SwitchField, TextareaField } from "@avplatform/ui/form";
import { useListOptimisticMutation } from "@avplatform/ui/hooks";
import { useEffect } from "react";
import { z } from "zod";

import { onPremLLMOptimisticMutationFn } from "../../apis/on-prem-llm-table-apis";
import { ONPREM_LLM_QUERY_KEY } from "../../constants";
import {
  descriptionProps,
  displayNameProps,
  idProps,
  isDisabledProps,
  modelNameProps,
  providerTypeProps,
  providerUrlProps,
  statusProps,
} from "../../constants/on-prem-llm-form-field-props";
import { onPremLLMZodSchema } from "../../constants/on-prem-llms-zod-schema";
import { OnPremModelDto } from "../../dtos/on-prem-llm-table-dto";
import { useDefineOnPremLLMForm } from "../../hooks/useDefineOnPremLLMForm";

export const OnPremCrudForm = () => {
  const {
    form,
    rowId,
    isDirty,
    crudAction,
    isAvailable,
    availabilityMessage,
    isCheckPending,
    handleInputChange,
    setShowDialog,
    refineFormData,
  } = useDefineOnPremLLMForm();

  // Define optimistic mutation to crete or update the on prem model
  const {
    mutate: mutateFlow,
    isPending,
    isSuccess,
  } = useListOptimisticMutation<OnPremModelDto, OnPremModelDto | boolean, OnPremModelDto>(
    [rowId],
    onPremLLMOptimisticMutationFn,
    ONPREM_LLM_QUERY_KEY,
  );

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof onPremLLMZodSchema>) => {
    // Create or update the on prem model
    mutateFlow({
      payload: refineFormData(formData) as unknown as OnPremModelDto,
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
      {/* Flow Id */}
      {isReadMode && <InputField {...idProps} />}

      {/* Name */}
      <InputField
        {...displayNameProps}
        onChangeCapture={(e) => handleInputChange(e.currentTarget.value)}
        nonErrorMessage={availabilityMessage}
      />

      {/* Type. TODO: Select field doesn't update. Applied workaround for now */}
      {crudAction === "create" ? (
        <SelectField {...providerTypeProps} />
      ) : (
        form.getValues("providerType") !== "" && <SelectField {...providerTypeProps} />
      )}

      <InputField {...providerUrlProps} />

      <InputField {...modelNameProps} />

      <SelectField {...statusProps} />

      {/* Description */}
      <TextareaField {...descriptionProps} />

      {/* Is Disabled */}
      {crudAction !== "create" && <SwitchField {...isDisabledProps} />}

      {/* Submit button */}
      {!isReadMode && (
        <div className="!mt-5 flex w-full justify-end">
          <SubmitButton
            className="min-w-[5rem]"
            primaryText={crudAction === "create" ? "Add" : "Save changes"}
            secondaryText="Adding..."
            isPending={isPending}
            disabled={!isDirty || !isAvailable || isCheckPending}
          />
        </div>
      )}
    </Form>
  );
};
