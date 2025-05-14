import { Separator } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";
import { Form } from "@aventisia/ui/form";
import { ScrollArea } from "@aventisia/ui/scroll";
import { FormProvider } from "react-hook-form";
import { z } from "zod";

import { classificationModelTestFormZodSchema } from "../../constants/classification-model-test-form-zod-schema";
import { useClassificationModelTestForm } from "../../hooks/useClassificationModelTestForm";
import CategoryFields from "./categories";

const ClassificationModelTestForm = () => {
  const { form, refineFormData, categoryFields } =
    useClassificationModelTestForm();
  const {
    formState: { isSubmitting, isDirty },
  } = form;

  function submitHandler(
    formData: z.infer<typeof classificationModelTestFormZodSchema>,
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

export default ClassificationModelTestForm;
