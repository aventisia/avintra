import { LoadingSpinner, TagInput } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  InputField,
  SelectField,
  TextareaField,
} from "@avplatform/ui/form";
import { ScrollArea } from "@avplatform/ui/scroll";

import {
  accessLevelProps,
  descriptionProps,
  templateNameProps,
} from "../constants/save-as-template-feild-props";
import { useDefineSATForm } from "../hooks/useDefineSATForm";

// import DeleteTemplate from "./DeleteTemplate";
// import { StatusAlert } from "./StatusAlert";

/**
 * SaveAsTemplateForm Component
 *
 * A dynamic form that allows users to define and submit a template.
 * Uses a custom form hook and UI component library.
 */
export const SaveAsTemplateForm = () => {
  // Destructure form logic and state from custom hook
  const {
    form,
    onSubmit,
    isPending,
    // isUpdatePending,
    // status,
    viewMode,
    // templateId,
    // templateRemark,
    // lastModifiedBy,
  } = useDefineSATForm();

  return (
    // Scrollable container to support long forms within the viewport
    <ScrollArea className="h-[calc(100vh-3rem)]">
      <Form
        methods={form}
        disabled={viewMode}
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 p-4"
      >
        {/* Show approval status if validation passes */}
        {/* {
          <StatusAlert
            status={status}
            remark={templateRemark}
            approvedBy={lastModifiedBy}
          />
        } */}

        <div className="grid grid-cols-1 gap-3.5 xs:grid-cols-2">
          {/* Template name input field */}
          <InputField {...templateNameProps} />

          {/* Access level dropdown  */}
          <SelectField {...accessLevelProps} />
        </div>

        <TextareaField {...descriptionProps} />

        {/* Optional tag input */}
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

        {/* Submit button and delete action, only in edit mode */}
        {!viewMode && (
          <div className="flex items-center justify-end gap-4 pb-4">
            {/* {templateId && <DeleteTemplate id={templateId || ""} />} */}

            <Button disabled={isPending} size={"sm"} type="submit">
              {isPending ? <LoadingSpinner className="mr-2 h-4 w-4" /> : null}
              Submit For Approval
            </Button>
          </div>
        )}
      </Form>
    </ScrollArea>
  );
};
