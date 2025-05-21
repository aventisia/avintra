import { Separator } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";
import { CheckboxField, Form } from "@aventisia/ui/form";
import { ScrollArea } from "@aventisia/ui/scroll";
import { useEffect, useState } from "react";
import { FormProvider } from "react-hook-form";
import { z } from "zod";

import { submitForFineTuningProps } from "../../constants/question-answer-test-form-field-props";
import { questionAnswerTestFormZodSchema } from "../../constants/question-answer-test-form-zod-schema";
import { useQuestionAnswersTestForm } from "../../hooks/useQuestionAnswerTestForm";
import QuestionAnswerFields from "./question-answer";

const QuestionsAnswersTestForm = () => {
  const { form, refineFormData, questionAnswerFields } =
    useQuestionAnswersTestForm();
  const {
    formState: { isSubmitting, isDirty },
    setValue,
    watch,
  } = form;
  const submitForFinetuningValue = watch("submitForFineTuning");

  function submitHandler(
    formData: z.infer<typeof questionAnswerTestFormZodSchema>,
  ) {
    refineFormData(formData);
    console.log(formData);
  }

  const [userToggled, setUserToggled] = useState<boolean>(false);

  // Update checkbox automatically when form becomes dirty — only if user hasn’t manually toggled
  useEffect(() => {
    if (!userToggled) {
      setValue("submitForFineTuning", isDirty);
    }
  }, [isDirty, userToggled, setValue]);

  // Handler for manual toggle
  const handleToggle = () => {
    setUserToggled(true); // Mark that the user has toggled manually
    setValue("submitForFineTuning", !submitForFinetuningValue);
  };

  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(submitHandler)}
      disabled={isSubmitting}
    >
      <ScrollArea className="mt-4 flex-grow  h-[calc(100vh-14.2rem)]">
        <FormProvider {...form}>
          <div className="space-y-10 px-4 pb-1">
            <QuestionAnswerFields
              form={form}
              questionAnswerFields={questionAnswerFields}
            />
          </div>
        </FormProvider>
      </ScrollArea>

      <Separator />
      <div className="flex items-center justify-between gap-2 px-4 py-1 pb-4">
        <div className="flex items-center gap-1">
          <CheckboxField
            {...submitForFineTuningProps}
            checked={submitForFinetuningValue}
            onCheckedChange={handleToggle}
          />
          <span className="text-sm">Submit for Fine-tuning</span>
        </div>{" "}
        <Button size="xs" type="submit" disabled={!isDirty || isSubmitting}>
          Save & Next
        </Button>
      </div>
    </Form>
  );
};

export default QuestionsAnswersTestForm;
