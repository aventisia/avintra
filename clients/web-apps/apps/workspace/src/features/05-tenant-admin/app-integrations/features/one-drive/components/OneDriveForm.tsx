import { Button, SubmitButton } from "@avplatform/ui/buttons";
import { CrudDialogActions } from "@avplatform/ui/crud-dialog";
import { Form, InputField } from "@avplatform/ui/form";
import { toast } from "@avplatform/ui/sonner";
import { CopyIcon } from "@phosphor-icons/react";
import { z } from "zod";

import { useAvailableIntegrationsDialogStore } from "@/features/05-tenant-admin/app-integrations/store/available-integrations-dialog";

import {
  accessTokenURLProps,
  authorizationURLProps,
  clientIdURLProps,
  clientSecretProps,
  oAuthRedirectURLProps,
} from "../constants/onedrive-field-props";
import { oneDriveIntegrationZodSchema } from "../constants/onedrive-zod-schema";
import { useOneDriveIntegrationForm } from "../hooks/useOneDriveForm";

const OneDriveForm = () => {
  const { form, isDirty, isSubmitting } = useOneDriveIntegrationForm();
  const { setOpen } = useAvailableIntegrationsDialogStore();

  async function submitHandler(formData: z.infer<typeof oneDriveIntegrationZodSchema>) {
    console.log(formData);
    setOpen(false);
  }

  return (
    <Form methods={form} onSubmit={form.handleSubmit(submitHandler)} disabled={isSubmitting}>
      <div className="relative">
        <InputField {...oAuthRedirectURLProps} />
        <Button
          variant={"ghost"}
          size={"icon6"}
          type="button"
          className="absolute bottom-2 right-2"
          onClick={() => {
            navigator.clipboard.writeText(form.getValues("oAuthRedirectURL"));
            toast.success("Redirect URL copied to clipboard");
          }}
        >
          <CopyIcon />
        </Button>
      </div>
      <InputField {...authorizationURLProps} />
      <InputField {...accessTokenURLProps} />
      <InputField {...clientIdURLProps} />
      <InputField {...clientSecretProps} />

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

export default OneDriveForm;
