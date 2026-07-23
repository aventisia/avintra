import { LoadingSpinner, Separator } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import { Form, InputField } from "@avplatform/ui/form";
import { ScrollArea } from "@avplatform/ui/scroll";
import { toast } from "@avplatform/ui/sonner";
import { Copy } from "lucide-react";
import { FormProvider } from "react-hook-form";
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
      <FormProvider {...form}>
        <ScrollArea className="h-[calc(100vh-28rem)]">
          <div className="space-y-4 p-6">
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
            <InputField {...authorizationURLProps} />
            <InputField {...accessTokenURLProps} />
            <InputField {...clientIdURLProps} />
            <InputField {...clientSecretProps} />
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

export default OneDriveForm;
