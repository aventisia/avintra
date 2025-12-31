import { Button } from "@aventisia/ui/buttons";
import { Form, InputField } from "@aventisia/ui/form";
import { FormProvider } from "react-hook-form";
import { z } from "zod";

import {
  apiKeyProps,
  baseUrlProps,
  nameProps,
  orgIdProps,
} from "../constants/create-new-credentials-field-props";
import { createNewCredentailsFormZodSchema } from "../constants/create-new-credentials-zod-schema";
import { useCreateNewCredentialsForm } from "../hooks/use-create-new-credentials-form";
import { useToggleCreateNewCredentialsDialogStore } from "../store/toggle-add-credentials-store";

const CreateNewCredentialsForm = () => {
  const { form, isSubmitting, isDirty } = useCreateNewCredentialsForm();
  const { setShowCreateNewCredentialsDialog } =
    useToggleCreateNewCredentialsDialogStore();

  async function submitHandler(
    formData: z.infer<typeof createNewCredentailsFormZodSchema>,
  ) {
    console.log(formData);
    setShowCreateNewCredentialsDialog(false);
  }

  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(submitHandler)}
      disabled={isSubmitting}
      className="p-5"
    >
      <FormProvider {...form}>
        <InputField {...nameProps} />
        <InputField {...baseUrlProps} />
        <InputField {...apiKeyProps} />
        <InputField {...orgIdProps} />
      </FormProvider>

      <div className="text-right !mt-6">
        <Button
          size="sm"
          className="w-24"
          type="submit"
          disabled={isSubmitting || !isDirty}
        >
          Save
        </Button>
      </div>
    </Form>
  );
};

export default CreateNewCredentialsForm;
