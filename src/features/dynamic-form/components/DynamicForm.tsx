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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/react-toolkit/ui/accordion";
import OnErrorTabs from "./OnErrorTabs";
import { PopoverClose } from "@/react-toolkit/ui/popover";

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
              "w-full",
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
                  "w-full",
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
      className={cn("space-y-4", className)}
      onSubmit={form.handleSubmit(submitHandler)}
    >
      {/* Scrollable input fields container using ScrollArea */}
      <ScrollArea className="mt-4 max-h-[calc(60vh-4rem)] flex-grow px-4">
        <FormProvider {...form}>
          {/*Form basic category */}
          <div className="">
            {formFieldCategories[0].formFields?.map((fItem, index) => (
              <div key={index} className="mt-3 first:mt-0">
                {renderFieldInFlexView(fItem)}
              </div>
            ))}
          </div>
          {/* If form has multiple categories add those to accordion */}
          {formFieldCategories.length > 1 && (
            <div className="w-full">
              {/* Exclude basic category */}
              {formFieldCategories?.slice(1).map((category) => (
                <>
                  <Accordion
                    type="single"
                    collapsible
                    className="mb-3 w-full rounded-lg bg-slate-100 px-2.5 first:mt-3"
                  >
                    <AccordionItem
                      value={category.title}
                      className="border-none"
                    >
                      <AccordionTrigger className="py-2">
                        <div className="flex w-full gap-3 text-sm">
                          {category.title}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        {category.formFields?.map((fItem, index) => (
                          <div key={index} className="mt-3">
                            {renderFieldInFlexView(fItem)}
                          </div>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </>
              ))}
              <Accordion
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
              </Accordion>
            </div>
          )}
        </FormProvider>
      </ScrollArea>
      <Separator className="my-0 h-[0.5px] w-full" />
      <div className="flex w-full items-center justify-end gap-2 px-4 pb-4">
        <PopoverClose>
          <Button size="xs" variant={"outline"}>
            Cancel
          </Button>
        </PopoverClose>

        {!viewOnly && (
          <PopoverClose>
            <SubmitButton
              size="xs"
              isPending={isMutationPending || isSubmitting}
            />
          </PopoverClose>
        )}
      </div>
    </Form>
  );
};

export { DynamicForm };
