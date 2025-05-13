import { Separator } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";
import { Form } from "@aventisia/ui/form";
import { ScrollArea } from "@aventisia/ui/scroll";
import { FormProvider } from "react-hook-form";
import { z } from "zod";

import { sentimentalAnalyticsTestFormZodSchema } from "../../constants/sentiment-analytics-test-form-zod-schema";
import { useSentimentalAnalyticsTestForm } from "../../hooks/useSentimentAnalyticsTestForm";
import CategoryFields from "./categories";

const SentimentAnalyticsFormTestForm = () => {
  const { form, refineFormData, categoryFields } =
    useSentimentalAnalyticsTestForm();
  const {
    formState: { isSubmitting, isDirty },
  } = form;

  function submitHandler(
    formData: z.infer<typeof sentimentalAnalyticsTestFormZodSchema>,
  ) {
    refineFormData(formData);
    console.log(formData);
  }

  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(submitHandler)}
      disabled={isSubmitting}
    >
      <ScrollArea className="mt-4 flex-grow  h-[calc(100vh-14.2rem)]">
        <FormProvider {...form}>
          <div className="space-y-10 px-4 pb-1">
            <CategoryFields form={form} categoryFields={categoryFields} />
          </div>
        </FormProvider>
      </ScrollArea>

      <Separator />
      <div className="flex items-center justify-end gap-2 px-4 py-1 pb-4">
        <Button size="xs" type="submit" disabled={!isDirty || isSubmitting}>
          Save
        </Button>
      </div>
    </Form>
  );
};

export default SentimentAnalyticsFormTestForm;
