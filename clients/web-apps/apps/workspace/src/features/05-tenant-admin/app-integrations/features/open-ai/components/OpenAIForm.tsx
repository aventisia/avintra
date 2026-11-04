import { SubmitButton } from "@avplatform/ui/buttons";
import { CrudDialogActions } from "@avplatform/ui/crud-dialog";
import { Form, InputField } from "@avplatform/ui/form";
import { z } from "zod";

import { useAvailableIntegrationsDialogStore } from "@/features/05-tenant-admin/app-integrations/store/available-integrations-dialog";

import { apiKeyProps, baseURLProps, organizationIdProps } from "../constants/openai-field-props";
import { openAIIntegrationZodSchema } from "../constants/openai-zod-schema";
import { useOpenAIForm } from "../hooks/useOpenAIForm";

const OpenAIForm = () => {
  const { form, isDirty, isSubmitting } = useOpenAIForm();
  const { setOpen } = useAvailableIntegrationsDialogStore();

  async function submitHandler(formData: z.infer<typeof openAIIntegrationZodSchema>) {
    console.log(formData);
    setOpen(false);
  }

  return (
    <Form methods={form} onSubmit={form.handleSubmit(submitHandler)} disabled={isSubmitting}>
      <InputField {...apiKeyProps} />
      <InputField {...organizationIdProps} />
      <InputField {...baseURLProps} />

      <CrudDialogActions>
        <SubmitButton
          className="min-w-20"
          primaryText="Connect"
          secondaryText="Connecting..."
          isPending={isSubmitting}
          disabled={!isDirty}
        />
      </CrudDialogActions>
    </Form>
  );
};

export default OpenAIForm;
