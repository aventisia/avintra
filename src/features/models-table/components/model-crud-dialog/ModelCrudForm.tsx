import { useListOptimisticMutation } from "@/react-toolkit/hooks/useListOptimisticMutation";
import { Button } from "@/react-toolkit/ui/buttons/Button";
import { Form } from "@/react-toolkit/ui/form/Form";
import { InputField } from "@/react-toolkit/ui/form/fields/InputField";
import { SelectField } from "@/react-toolkit/ui/form/fields/SelectField";
import { SwitchField } from "@/react-toolkit/ui/form/fields/SwitchField";
import { TextareaField } from "@/react-toolkit/ui/form/fields/TextareaField";

// import { AutherCard } from "@/react-toolkit/ui/form/non-field/AutherCard";
import { z } from "zod";

import { modelOptimisticMutationFn } from "../../apis/models-table-apis";
import { MODELS_QUERY_KEY } from "../../constants";
import {
  descriptionProps,
  idProps,
  isDisabledProps,
  llmProps,
  nameProps,
  typeProps,
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
    setAvailabilityMessage,
    isCheckPending,
    handleInputChange,
    setShowDialog,
    refineFormData,
  } = useDefineModelForm();

  // Define optimistic mutation to crete or update the model
  const { mutate: mutateModel } = useListOptimisticMutation<
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

    // Reset the availability message
    setAvailabilityMessage(null);

    // Close the dialog
    setShowDialog(false);
  };

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

      {/* Type. TODO: Select field doesn't update. Applied workaround for now */}
      {crudAction === "create" ? (
        <SelectField {...typeProps} />
      ) : (
        form.getValues("type") !== "" && <SelectField {...typeProps} />
      )}

      {/* Type. TODO: Select field doesn't update. Applied workaround for now */}
      {crudAction === "create" ? (
        <SelectField {...llmProps} />
      ) : (
        form.getValues("llm") !== "" && <SelectField {...llmProps} />
      )}

      {/* Description */}
      <TextareaField {...descriptionProps} />

      {/* Is Disabled */}
      {crudAction !== "create" && <SwitchField {...isDisabledProps} />}

      {/* AutherCard */}
      {/* {isReadMode && (
        <AutherCard
          createdBy={form.getValues("createdBy")}
          createdOn={form.getValues("createdOn")}
          lastModifiedBy={form.getValues("lastModifiedBy")}
          lastModifiedOn={form.getValues("lastModifiedOn")}
        />
      )} */}
      {/* Submit button */}
      {!isReadMode && (
        <div className="!mt-5 flex w-full justify-end">
          <Button
            type="submit"
            disabled={!isDirty || !isAvailable || isCheckPending}
            className="min-w-[5rem]"
          >
            {crudAction === "create" ? "Create" : "Save changes"}
          </Button>
        </div>
      )}
    </Form>
  );
};
