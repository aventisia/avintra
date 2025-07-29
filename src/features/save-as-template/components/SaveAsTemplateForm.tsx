import { SelectField } from "@/shared/select-field/SelectField";

import { LoadingSpinner, Separator, TagInput } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";
import {
  AutosizeTextareaField,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  InputField,
  MultiSelectField,
} from "@aventisia/ui/form";
import { ScrollArea } from "@aventisia/ui/scroll";
import { FormProvider } from "react-hook-form";
import { z } from "zod";

import {
  accessLevelFieldProps,
  descriptionProps,
  templateNameProps,
  worcspacesFieldProps,
} from "../constants/save-as-template-field-props";
import { saveAsTemplateZodSchema } from "../constants/save-as-template-zod-schema";
import { useSaveAsTemplateForm } from "../hooks/useSaveAsTemplateForm";
import { useSaveAsTemplateDialogStore } from "../store/useSaveAsTemplateDialog";

const SaveAsTemplateForm = () => {
  const {
    form,
    isSubmitting,
    publishModelTemplate,
    isPublishTemplatePending,
    isDirty,
  } = useSaveAsTemplateForm();
  const accessLevelValue = form.watch("accessType");
  const { setOpen } = useSaveAsTemplateDialogStore();

  async function submitHandler(
    formData: z.infer<typeof saveAsTemplateZodSchema>,
  ) {
    await publishModelTemplate(formData);
    setOpen(false);
  }

  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(submitHandler)}
      disabled={isSubmitting}
    >
      <FormProvider {...form}>
        <ScrollArea className="h-[calc(100vh-26.5rem)]">
          <div className="p-6 space-y-4">
            <InputField {...templateNameProps} />
            <AutosizeTextareaField {...descriptionProps} />
            <SelectField {...accessLevelFieldProps} />
            {accessLevelValue === "Space" && (
              <MultiSelectField {...worcspacesFieldProps} />
            )}
            <FormField
              name="tags"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="ml-1">Tags (optional)</FormLabel>{" "}
                  <FormControl>
                    <TagInput
                      {...field}
                      value={field.value ?? []}
                      onChange={field.onChange}
                      placeholder=""
                      className="!shadow-none"
                    />
                  </FormControl>
                  <FormMessage />{" "}
                  {/* ✅ Validation error shown here if applicable */}
                </FormItem>
              )}
            />
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
          className="w-16"
        >
          {isSubmitting || isPublishTemplatePending ? (
            <LoadingSpinner className="h-4 w-4" />
          ) : (
            "Save"
          )}
        </Button>
      </div>
    </Form>
  );
};

export default SaveAsTemplateForm;
