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
  SelectField,
} from "@aventisia/ui/form";
import { ScrollArea } from "@aventisia/ui/scroll";
import { LoadingSpinner, TagInput } from "@aventisia/ui";

import { useDefineSATForm } from "../hooks/useDefineSATForm";

import {
  accessLevelProps,
  descriptionProps,
  saveAsProps,
  spacesProps,
  templateNameProps,
} from "../constants/save-as-template-feild-props";

/**
 * SaveAsTemplateForm Component
 *
 * A dynamic form that allows users to define and submit a template.
 * Uses a custom form hook and UI component library.
 */
export const SaveAsTemplateForm = () => {
  // Destructure form methods and UI state from custom hook
  const { form, onSubmit, showSpaces, isPending } = useDefineSATForm();

  return (
    // Scrollable container to handle long forms
    <ScrollArea className="h-[calc(100vh-22rem)]">
      <Form
        methods={form}
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 p-4"
      >
        {/* Dropdown for selecting 'Save As' type */}
        <SelectField {...saveAsProps} />

        {/* Input for template name */}
        <InputField {...templateNameProps} />

        {/* Resizable text area for template description */}
        <AutosizeTextareaField {...descriptionProps} />

        {/* Only show access level dropdown in non-production environments */}
        {import.meta.env.MODE !== "production" ? (
          <SelectField {...accessLevelProps} />
        ) : null}

        {/* Optional multi-select field for selecting spaces */}
        {showSpaces && <MultiSelectField {...spacesProps} />}

        {/* Custom tag input for optional tags */}
        <FormField
          name="tags"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="ml-1">Tags (optional)</FormLabel>
              <FormControl>
                <TagInput
                  {...field}
                  value={field.value ?? []}
                  onChange={field.onChange}
                  placeholder=""
                  className="!shadow-none"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit button, disabled during submission */}
        <div className="flex items-center justify-end">
          <Button disabled={isPending} type="submit">
            {isPending ? <LoadingSpinner className="mr-2 h-4 w-4" /> : null}
            Save
          </Button>
        </div>
      </Form>
    </ScrollArea>
  );
};
