import { useAvailableIntegrationsDialogStore } from "@/features/05-tenant-admin/app-integrations/store/available-integrations-dialog";

import { LoadingSpinner, Separator } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";
import { Form, InputField } from "@aventisia/ui/form";
import { ScrollArea } from "@aventisia/ui/scroll";
import { FormProvider } from "react-hook-form";
import { z } from "zod";

import {
  apiKeyProps,
  baseURLProps,
  organizationIdProps,
} from "../constants/openai-field-props";
import { openAIIntegrationZodSchema } from "../constants/openai-zod-schema";
import { useOpenAIForm } from "../hooks/useOpenAIForm";

const OpenAIForm = () => {
  const { form, isDirty, isSubmitting } = useOpenAIForm();
  const { setOpen } = useAvailableIntegrationsDialogStore();

  async function submitHandler(
    formData: z.infer<typeof openAIIntegrationZodSchema>,
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
            <InputField {...apiKeyProps} />
            <InputField {...organizationIdProps} />
            <InputField {...baseURLProps} />
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

export default OpenAIForm;
