/* eslint-disable @typescript-eslint/no-explicit-any */
// Inspired from: https://nainacodes.com/blog/create-form-from-json-schema
import { FormProvider, useForm } from "react-hook-form";
import { IDynamicFieldSchema, IDynamicFormCategory, renderFormField } from "..";
import { cn } from "@/react-toolkit/lib/utils";
import { Separator } from "@/react-toolkit/ui/separator";
import { Button } from "@/react-toolkit/ui/buttons/Button";
import { SubmitButton } from "@/react-toolkit/ui/buttons/SubmitButton";
import { Form } from "@/react-toolkit/ui/form/Form";
import { ScrollArea } from "@/react-toolkit/ui/scroll-area";

interface DynamicFormProps {
  /** An array of objects defining the form categories and fields. */
  formFieldCategories: IDynamicFormCategory[];
  /** Form fields to watch for any value change, To apply validation on fields which depends on the other fields values. If no dynamic validation required then pass empty array */
  formFieldsToWatch: string[];
  /** Form fields values mainly getting as response from an api and to fill the form to view or update data */
  formFieldValuesToFill?: any;
  /** Optional: To show animation till the time data post to API pending. Default: false.  */
  isMutationPending?: boolean;
  /** Optinal: To style form container. Default: undefined */
  className?: string;
  /** Optional: If form is being used only to view the data then set it to true. Default: false */
  viewOnly?: boolean;
  /** A function to be called when the form is submitted. This function will receive an object containing the form data as its argument. */
  onSubmit: (formData: any) => void;
}

/** A React component that renders a dynamic form based on the provided configuration */
const DynamicForm = ({
  formFieldCategories,
  formFieldsToWatch,
  formFieldValuesToFill,
  isMutationPending = false,
  className,
  viewOnly = false,
  onSubmit,
}: DynamicFormProps) => {
  const form = useForm({ defaultValues: formFieldValuesToFill });

  const {
    // handleSubmit,
    watch,
    formState: { isSubmitting },
  } = form;

  // Submit handler
  function submitHandler(formData: any) {
    // Return if form is only for view information
    if (viewOnly) return;

    // Submit data
    onSubmit(formData);
  }

  // Watch fields to apply changes to registerOptions
  formFieldsToWatch.length > 0 ? watch(formFieldsToWatch) : null;

  // Get single or multiple fields
  function renderFieldInFlexView(fieldsToRender: IDynamicFieldSchema[]) {
    switch (fieldsToRender.length) {
      case 0:
        return null;
      case 1:
        return (
          <div
            className={cn(
              "mt-2.5 w-full",
              fieldsToRender[0].visible ? "block" : "hidden",
            )}
          >
            {renderFormField(fieldsToRender[0], form)}
          </div>
        );
      default: {
        return (
          <div className={cn("flex gap-5")}>
            {fieldsToRender?.map((fData, index) => (
              <div
                className={cn(
                  "mt-2.5 w-full",
                  fData.containerClassName ? fData.containerClassName : "grow",
                  fData.visible ? "block" : "hidden",
                )}
                key={index}
              >
                {renderFormField(fData, form)}
              </div>
            ))}
          </div>
        );
      }
    }
  }

  // Return final form
  return (
    <Form
      methods={form}
      className={cn("", className)}
      onSubmit={form.handleSubmit(submitHandler)}
    >
      <ScrollArea className="h-full flex-1 px-2">
        <FormProvider {...form}>
          {formFieldCategories.length === 1 ? (
            // If form has single category
            <div className="mb-2 pt-2">
              {formFieldCategories[0].formFields?.map((fItem, index) => (
                <div key={index}>{renderFieldInFlexView(fItem)}</div>
              ))}
            </div>
          ) : (
            // If form has multiple categories
            <div className="w-full px-2">
              {formFieldCategories?.map((category, index) => (
                <div key={index} className="pt-2">
                  <div className="flex items-center gap-3 font-medium">
                    {/* <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-sm">
                      {index + 1}
                    </div> */}
                    <h2 className="text-[0.85rem] decoration-1 underline-offset-4 group-hover:underline">
                      {category.title}
                    </h2>
                  </div>
                  <div className="">
                    {category.formFields?.map((fItem, index) => (
                      <div key={index} className="mt-2.5">
                        {renderFieldInFlexView(fItem)}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </FormProvider>
      </ScrollArea>
      <Separator className="my-2 h-[0.5px] w-full" />
      <div className="flex w-full justify-between self-end px-4 pb-3.5">
        <div>
          <Button size={"xs"} variant={"outline"}>
            On error
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button size="xs" variant={"outline"}>
            Cancel
          </Button>
          {!viewOnly && (
            <SubmitButton
              size={"xs"}
              isPending={isMutationPending || isSubmitting}
            />
          )}
        </div>
      </div>
    </Form>
  );
};

export { DynamicForm };
