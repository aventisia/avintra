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
import { IFormValuesToFill } from "../types/dynamic-form-types";
import { ChevronDown, ChevronUp } from "lucide-react";
// import { PopoverClose } from "@radix-ui/react-popover";
// import OnErrorTabs from "./OnErrorTabs";

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
  /** A function to close the dialog. */
  closeDialog: () => void;
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
  closeDialog,
}: DynamicFormProps) => {
  const outputRegex = /^o_/i;
  const finalFormFieldValuesToFill = formFieldValuesToFill
    ? formFieldValuesToFill.reduce(
        (
          acc: Record<string, string | number | any>,
          { key, value }: IFormValuesToFill,
        ) => {
          acc[key] = value;
          return acc;
        },
        {} as Record<string, string | number | any>,
      )
    : formFieldValuesToFill;

  const form = useForm({ defaultValues: finalFormFieldValuesToFill });

  const {
    // handleSubmit,
    watch,
    formState: { isSubmitting },
    getValues,
  } = form;

  // Submit handler
  function submitHandler(e: any) {
    e.preventDefault();

    // Return if form is only for view information
    if (viewOnly) return;

    // Submit data
    onSubmit(getValues());
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
          <div className={cn("w-full")}>
            {renderFormField(fieldsToRender[0], form)}
          </div>
        );
      default: {
        return (
          <div className={cn("flex gap-5")}>
            {fieldsToRender?.map((fData, index) => (
              <div
                className={cn(
                  "w-full",
                  fData.containerClassName ? fData.containerClassName : "grow",
                  "h-auto",
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

  function renderOutputFields(fieldsToRender: IDynamicFieldSchema[]) {
    return (
      <div
        className={cn(
          "flex items-center justify-between rounded-lg",
          fieldsToRender[0].visible ? "border px-3 py-4" : "",
        )}
      >
        {fieldsToRender?.map((fData, index) => (
          <div
            className={cn(
              fData.containerClassName ? fData.containerClassName : "grow",
            )}
            key={index}
          >
            {renderFormField(fData, form)}
          </div>
        ))}
      </div>
    );
  }

  // Return final form
  return (
    <Form
      methods={form}
      className={cn("space-y-4", className)}
      // onSubmit={form.handleSubmit(submitHandler)}
      noValidate
    >
      {/* <div>
        <VariableSelectorPopover className="max-h-80" />
      </div> */}
      {/* Scrollable input fields container using ScrollArea */}
      <ScrollArea className="mt-4 flex-grow px-4">
        <FormProvider {...form}>
          {/*Form basic category */}
          <div className="mt-2.5">
            {formFieldCategories[0].formFields?.map((fItem, index) => (
              <div key={index} className="mb-4 mt-3 px-0.5 first:mt-0">
                {outputRegex.test(fItem[0].name)
                  ? renderOutputFields(fItem)
                  : renderFieldInFlexView(fItem)}
              </div>
            ))}
          </div>
          {/* If form has multiple categories add those to accordion */}
          {formFieldCategories.length > 1 && (
            <div className="w-full">
              {/* Custom Accordion */}
              {/* Exclude basic category */}
              {formFieldCategories?.slice(1).map((category) => (
                <div key={category.title} className="mb-3 w-full">
                  {/* Accordion Item Wrapper */}
                  <input
                    type="checkbox"
                    id={`accordion-toggle-${category.title}`}
                    className="peer hidden"
                  />
                  <label
                    htmlFor={`accordion-toggle-${category.title}`}
                    className="flex w-full cursor-pointer items-center gap-3 rounded-lg bg-muted px-2.5 py-2.5 text-sm font-medium hover:underline peer-checked:rounded-b-none"
                  >
                    {/* Accordion Title */}
                    {category.title}

                    {/* Chevron Icon (Down or Up depending on state) */}
                    <div className="ml-auto">
                      <ChevronDown
                        size={14}
                        className="transform transition-transform duration-200 peer-checked:hidden"
                      />
                      <ChevronUp className="hidden transform transition-transform duration-200 peer-checked:block" />
                    </div>
                  </label>

                  <div
                    className={`max-h-0 w-full overflow-hidden rounded-b-lg border-none bg-muted shadow-none transition-all duration-700 ease-in-out peer-checked:max-h-[1250px]`}
                  >
                    <div className="space-y-4 p-3 pb-4">
                      {/* Accordion Content */}
                      {category.formFields?.map((fItem, index) => (
                        <div key={index}>
                          {outputRegex.test(fItem[0].name)
                            ? renderOutputFields(fItem)
                            : renderFieldInFlexView(fItem)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              {/* To Do
                To Be Implemented Later
              */}
              {/* <Accordion
                type="single"
                collapsible
                className="w-full rounded-lg bg-slate-100 px-2.5"
              >
                <AccordionItem value={"error"} className="border-none">
                  <AccordionTrigger className="py-2">
                    <div className="flex w-full gap-3 text-sm">On Error</div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <OnErrorTabs />
                  </AccordionContent>
                </AccordionItem> 
              </Accordion> */}
            </div>
          )}
        </FormProvider>
      </ScrollArea>
      <Separator className="my-0 h-[0.5px] w-full" />
      <div className="flex w-full items-center justify-end gap-2 px-4 pb-4">
        <Button
          onClick={closeDialog}
          size="xs"
          type="button"
          variant={"outline"}
        >
          Cancel
        </Button>
        {!viewOnly && (
          <SubmitButton
            size="xs"
            isPending={isMutationPending || isSubmitting}
            primaryText="Save"
            onClick={submitHandler}
          />
        )}
      </div>
    </Form>
  );
};

export { DynamicForm };
