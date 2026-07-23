import { LoadingSpinner, Separator } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import { Form, InputField, SelectField, SwitchField } from "@avplatform/ui/form";
import { ScrollArea } from "@avplatform/ui/scroll";
import { toast } from "@avplatform/ui/sonner";
import { Copy } from "lucide-react";
import { FormProvider } from "react-hook-form";
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
      <FormProvider {...form}>
        <ScrollArea className="h-[calc(100vh-28rem)]">
          <div className="space-y-4 p-6">
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
                    <Copy />
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
          </div>
        </ScrollArea>
      </FormProvider>

      <Separator className="!mt-0.5" />
      <div className="flex items-center justify-end px-6 pb-4">
        <Button
          size="xs"
          type="submit"
          // disabled={isSubmitting || isPending}
          disabled={isSubmitting || !isDirty}
          className="min-w-20"
        >
          {isSubmitting ? <LoadingSpinner className="h-4 w-4" /> : "Connect"}
        </Button>
      </div>
    </Form>
  );
};

export default GoogleDriveForm;
