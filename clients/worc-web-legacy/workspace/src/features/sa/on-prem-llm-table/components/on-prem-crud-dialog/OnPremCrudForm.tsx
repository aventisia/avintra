import { SubmitButton } from "@aventisia/ui/buttons";
import { AutosizeTextareaField, Form, InputField } from "@aventisia/ui/form";
import { useEffect } from "react";
import { z } from "zod";

import {
  descriptionProps,
  displayNamePops,
  idProps,
  llmPops,
} from "../../constants/on-prem-llm-form-field-props";
import { onPremLLMZodSchema } from "../../constants/on-prem-llms-zod-schema";
import { useDefineOnPremLLMForm } from "../../hooks/useDefineOnPremLLMForm";

const OnPremCrudForm = () => {
  const { form, isDirty, crudAction, setShowDialog } = useDefineOnPremLLMForm();

  // Define optimistic mutation to crete or update the model
  //   const {
  //     mutate: mutateModel,
  //     isPending,
  //     isSuccess,
  //   } = useListOptimisticMutation<
  //     CreditPlansTableDto,
  //     CreditPlansTableDto | boolean,
  //     CreditPlansTableDto
  //   >([rowId], creditOptimisticMutationFn, CREDIT_PLANS_QUERY_KEY);

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof onPremLLMZodSchema>) => {
    // Create or update the model
    // mutateModel({
    //   payload: refineFormData(formData) as unknown as CreditPlansTableDto,
    //   crudAction: crudAction,
    // });

    console.log(formData);

    // Close the dialog if not creating the record
    if (crudAction !== "create") setShowDialog(false);
  };

  // Close dialog and reset form when mutation is successful
  useEffect(() => {
    // if (crudAction === "create" && isSuccess) setShowDialog(false);
  }, [crudAction, setShowDialog]);

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

      {/* LLM Name */}
      <InputField disabled={crudAction === "update"} {...llmPops} />

      {/* Display Name */}
      <InputField {...displayNamePops} />

      {/* Display Name */}
      <AutosizeTextareaField {...descriptionProps} />

      {/* Submit button */}
      {!isReadMode && (
        <div className="!mt-5 flex w-full justify-end">
          <SubmitButton
            className="min-w-[5rem]"
            primaryText={crudAction === "create" ? "Create" : "Save changes"}
            secondaryText="Creating..."
            isPending={false}
            disabled={!isDirty}
          />
        </div>
      )}
    </Form>
  );
};

export default OnPremCrudForm;
