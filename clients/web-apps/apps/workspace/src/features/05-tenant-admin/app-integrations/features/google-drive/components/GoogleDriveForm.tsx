import { Button, SubmitButton } from "@avplatform/ui/buttons";
import { CrudDialogActions } from "@avplatform/ui/crud-dialog";
import { Form, InputField, SelectField, SwitchField } from "@avplatform/ui/form";
import { toast } from "@avplatform/ui/sonner";
import { CopyIcon } from "@phosphor-icons/react";
import { z } from "zod";

import { useAvailableIntegrationsDialogStore } from "@/features/05-tenant-admin/app-integrations/store/available-integrations-dialog";

import {
  clientIdProps,
  clientSecretProps,
  connectUsingProps,
  emailProps,
  httpRequestNodeProps,
  impersonateUserProps,
  oAuthRedirectURLProps,
  privateKeyProps,
  regionProps,
  scopesProps,
  serviceAccountEmailProps,
} from "../constants/google-drive-field-props";
import { googleDriveIntegrationZodSchema } from "../constants/google-drive-zod-schema";
import { useGoogleDriveForm } from "../hooks/useGoogleDriveForm";

const GoogleDriveForm = () => {
  const { form, isDirty, isSubmitting } = useGoogleDriveForm();
  const { setOpen } = useAvailableIntegrationsDialogStore();
  const connectUsingValue = form.watch("connectUsing");
  const impersonateUserValue = form.watch("impersonateUser");
  const httpRequestNodeValue = form.watch("httpRequestNode");

  async function submitHandler(formData: z.infer<typeof googleDriveIntegrationZodSchema>) {
    console.log(formData);
    setOpen(false);
  }

  return (
    <Form methods={form} onSubmit={form.handleSubmit(submitHandler)} disabled={isSubmitting}>
      <SelectField {...connectUsingProps} />

      {connectUsingValue === "OAuth2" && (
        <>
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
          <InputField {...clientIdProps} />
          <InputField {...clientSecretProps} />
        </>
      )}

      {connectUsingValue === "service_account" && (
        <>
          <InputField {...regionProps} />
          <InputField {...serviceAccountEmailProps} />
          <InputField {...privateKeyProps} />
          <SwitchField {...impersonateUserProps} />
          {impersonateUserValue && <InputField {...emailProps} />}
          <SwitchField {...httpRequestNodeProps} />
          {httpRequestNodeValue && <InputField {...scopesProps} />}
        </>
      )}

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

export default GoogleDriveForm;
