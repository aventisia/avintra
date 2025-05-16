import { Separator } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";
import { AutosizeTextareaField, Form } from "@aventisia/ui/form";
import { ScrollArea } from "@aventisia/ui/scroll";
import { FormProvider } from "react-hook-form";
import { z } from "zod";

import {
  contextProps,
  nodePropmptProps,
} from "../../constants/setiment-analytics-setup-form-field-props";
import { sentimentAnalyticsSetupFormZodSchema } from "../../constants/setiment-analytics-setup-zod-schema";
import { useSentimentAnalyticsSetupForm } from "../../hooks/useSentimentAnalyticsSetupForm";
import CategoriesTable from "./CategoriesTable";

const SentimentAnalyticsForm = () => {
  const {
    form,
    isSubmitting,
    isDirty,
    categoryFields,
    addCategory,
    removeCategory,
  } = useSentimentAnalyticsSetupForm();

  // Submit handler
  function submitHandler(
    formData: z.infer<typeof sentimentAnalyticsSetupFormZodSchema>,
  ) {
    console.log(formData);
  }

  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(submitHandler)}
      disabled={isSubmitting}
    >
      <ScrollArea className="mt-4 flex-grow h-[calc(100vh-14.2rem)]">
        <FormProvider {...form}>
          <div className="space-y-4 px-4 pb-1 w-full">
            {/* Context */}
            <AutosizeTextareaField {...contextProps} />

            {/* Separator */}
            <Separator />

            {/* Data to be extracted */}
            <CategoriesTable
              addCategory={addCategory}
              removeCategory={removeCategory}
              categoryFields={categoryFields}
              form={form}
            />

            {/* Separator */}
            <Separator />

            {/* Prompt */}
            <AutosizeTextareaField {...nodePropmptProps} />
          </div>
        </FormProvider>
      </ScrollArea>

      <Separator className="my-0 h-[0.5px] w-full" />
      <div className="flex items-center justify-end self-end gap-2 px-4 py-1 pb-4">
        <Button size="xs" type="submit" disabled={!isDirty || isSubmitting}>
          Save
        </Button>
      </div>
    </Form>
  );
};

export default SentimentAnalyticsForm;
