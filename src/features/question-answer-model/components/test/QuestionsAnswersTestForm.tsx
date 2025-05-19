import { Separator } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";
import { Form } from "@aventisia/ui/form";
import { ScrollArea } from "@aventisia/ui/scroll";
import { FormProvider } from "react-hook-form";
import { z } from "zod";

import { questionAnswerTestFormZodSchema } from "../../constants/question-answer-test-form-zod-schema";
import { useQuestionAnswersTestForm } from "../../hooks/useQuestionAnswerTestForm";
import QuestionAnswerFields from "./question-answer";

const QuestionsAnswersTestForm = () => {
  const { form, refineFormData, questionAnswerFields } =
    useQuestionAnswersTestForm();
  const {
    formState: { isSubmitting, isDirty },
  } = form;

  function submitHandler(
    formData: z.infer<typeof questionAnswerTestFormZodSchema>,
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
            <QuestionAnswerFields
              form={form}
              questionAnswerFields={questionAnswerFields}
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

export default QuestionsAnswersTestForm;
