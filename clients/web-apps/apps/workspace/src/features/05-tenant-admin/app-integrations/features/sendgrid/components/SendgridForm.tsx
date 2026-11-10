import { SubmitButton } from "@avplatform/ui/buttons";
import { CrudDialogActions } from "@avplatform/ui/crud-dialog";
import { Form, InputField } from "@avplatform/ui/form";
import { z } from "zod";

import { useAvailableIntegrationsDialogStore } from "@/features/05-tenant-admin/app-integrations/store/available-integrations-dialog";

import { apiKeyProps } from "../constants/sendgrid-field-props";
import { sendgridIntegrationZodSchema } from "../constants/sendgrid-zod-schema";
import { useSendgridIntegrationForm } from "../hooks/useSendgridForm";

const SendgridForm = () => {
  const { form, isDirty, isSubmitting } = useSendgridIntegrationForm();
  const { setOpen } = useAvailableIntegrationsDialogStore();

  async function submitHandler(formData: z.infer<typeof sendgridIntegrationZodSchema>) {
    console.log(formData);
    setOpen(false);
  }

  return (
    <Form methods={form} onSubmit={form.handleSubmit(submitHandler)} disabled={isSubmitting}>
      <InputField {...apiKeyProps} />

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

export default SendgridForm;
