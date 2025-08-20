import { useGeminiIntegrationForm } from "../hooks/useGeminiForm";
import { useAvailableIntegrationsDialogStore } from "@/features/app-integrations/hooks/use-available-integrations-dialog";
import { z } from "zod";
import { geminiIntegrationZodSchema } from "../constants/gemini-zod-schema";
import { Form, InputField } from "@aventisia/ui/form";
import { FormProvider } from "react-hook-form";
import { ScrollArea } from "@aventisia/ui/scroll";
import { apiKeyProps, hostProps } from "../constants/gemini-field-props";
import { LoadingSpinner, Separator } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";

const GeminiForm = () => {
  const { form, isDirty, isSubmitting } = useGeminiIntegrationForm();
  const { setOpen } = useAvailableIntegrationsDialogStore();

  async function submitHandler(
    formData: z.infer<typeof geminiIntegrationZodSchema>,
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
            <InputField {...hostProps} />
            <InputField {...apiKeyProps} />
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

export default GeminiForm;
