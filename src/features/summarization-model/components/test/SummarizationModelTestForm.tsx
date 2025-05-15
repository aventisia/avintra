import { Separator } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";
import { AutosizeTextareaField, Form } from "@aventisia/ui/form";
import { ScrollArea } from "@aventisia/ui/scroll";
import { FormProvider } from "react-hook-form";
import { z } from "zod";

import { summarizedTextProps } from "../../constants/summarization-model-test-form-field-props";
import { summarizationModelTestFormZodSchema } from "../../constants/summarization-model-test-form-zod-schema";
import { useSummarizationModelTestForm } from "../../hooks/useSummarizationModelTestForm";

const SummarizationModelTestForm = () => {
  const { form, isDirty, isSubmitting } = useSummarizationModelTestForm();

  function submitHandler(
    formData: z.infer<typeof summarizationModelTestFormZodSchema>,
  ) {
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
          <div className="space-y-4 px-4 pb-1 ">
            <AutosizeTextareaField
              {...summarizedTextProps}
              name="summarizedText"
              label={`Summarized Text (${form.getValues("totalWords")})`}
              isRequired={true}
            />
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

export default SummarizationModelTestForm;
