import { LoadingSpinner } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";
import { Form, InputField } from "@aventisia/ui/form";
import { toast } from "@aventisia/ui/sonner";
import { FormProvider } from "react-hook-form";
import { z } from "zod";

import { updateAPIKeyZodSchema } from "../../constants/update-api-key-zod-schema";
import { useFetchApiKeys } from "../../hooks/useFetchAPIKeys";
import { useUpdateAPIKeyForm } from "../../hooks/useUpdateApiKeyForm";
import { useUpdateApiKeyDialogStore } from "../../store/update-api-key-dialog-store";

const UpdateAPIKeyForm = () => {
  const { form, isSubmitting, isDirty, updateApiKey, isUpdatePending } =
    useUpdateAPIKeyForm();

  const { setOpen } = useUpdateApiKeyDialogStore();
  const { refetch } = useFetchApiKeys();

  async function submitHandler(
    formData: z.infer<typeof updateAPIKeyZodSchema>,
  ) {
    try {
      await updateApiKey(formData);
      refetch();
      setOpen(false);
      toast.success("API Key successfully updated.");
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(submitHandler)}
      disabled={isSubmitting}
      className="p-5"
    >
      <FormProvider {...form}>
        <InputField
          className="text-sm"
          name="name"
          isRequired={true}
          label="API Key Name"
        />
      </FormProvider>

      <div className="text-right !mt-6">
        <Button
          size="sm"
          className="w-24"
          type="submit"
          disabled={isSubmitting || !isDirty}
        >
          {isUpdatePending ? (
            <LoadingSpinner className="h-5 w-5" />
          ) : (
            "Update Key"
          )}
        </Button>
      </div>
    </Form>
  );
};

export default UpdateAPIKeyForm;
