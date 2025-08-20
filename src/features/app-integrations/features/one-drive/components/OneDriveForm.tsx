import React from "react";
import { useOneDriveIntegrationForm } from "../hooks/useOneDriveForm";
import { z } from "zod";
import { oneDriveIntegrationZodSchema } from "../constants/onedrive-zod-schema";
import { Form, InputField } from "@aventisia/ui/form";
import { FormProvider } from "react-hook-form";
import { ScrollArea } from "@aventisia/ui/scroll";
import { LoadingSpinner, Separator } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";
import {
  accessTokenURLProps,
  authorizationURLProps,
  clientIdURLProps,
  clientSecretProps,
  oAuthRedirectURLProps,
} from "../constants/onedrive-field-props";
import { Copy } from "lucide-react";
import { toast } from "@aventisia/ui/sonner";
import { useAvailableIntegrationsDialogStore } from "@/features/app-integrations/hooks/use-available-integrations-dialog";

const OneDriveForm = () => {
  const { form, isDirty, isSubmitting } = useOneDriveIntegrationForm();
  const { setOpen } = useAvailableIntegrationsDialogStore();

  async function submitHandler(
    formData: z.infer<typeof oneDriveIntegrationZodSchema>,
  ) {
    console.log(formData);
    setOpen(false);
  }

  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(submitHandler)}
      disabled={isSubmitting}
    >
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
                  navigator.clipboard.writeText(
                    form.getValues("oAuthRedirectURL"),
                  );
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
