import { Button } from "@aventisia/ui/buttons";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormLabelExt,
  FormMessage,
  InputField,
  MultiSelectField,
  SelectField,
} from "@aventisia/ui/form";
import { ScrollArea } from "@aventisia/ui/scroll";
import { LoadingSpinner, TagInput } from "@aventisia/ui";
import { Controller } from "react-hook-form";

import { useDefineSATForm } from "../hooks/useDefineSATForm";

import {
  accessLevelProps,
  spacesProps,
  templateNameProps,
} from "../constants/save-as-template-feild-props";
import FileUploadList from "@/features/file-uploader-setup/components/FileUploadList";
import MarkdownContainer from "@/components/markdown/MarkdownContainer";
import { StatusAlert } from "./StatusAlert";
import DeleteTemplate from "./DeleteTemplate";

/**
 * SaveAsTemplateForm Component
 *
 * A dynamic form that allows users to define and submit a template.
 * Uses a custom form hook and UI component library.
 */
export const SaveAsTemplateForm = () => {
  // Destructure form methods and UI state from custom hook
  const {
    form,
    onSubmit,
    showSpaces,
    isPending,
    isUpdatePending,
    status,
    viewMode,
    templateId,
    templateRemark,
    lastModifiedBy,
  } = useDefineSATForm();

  return (
    // Scrollable container to handle long forms
    <ScrollArea className="h-[calc(100vh-3rem)]">
      <Form
        methods={form}
        disabled={viewMode}
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 p-4"
      >
        {
          <StatusAlert
            status={status}
            remark={templateRemark}
            approvedBy={lastModifiedBy}
          />
        }
        <div className="grid grid-cols-1 gap-3.5 xs:grid-cols-2">
          {/* Input for template name */}
          <InputField {...templateNameProps} />

          {/* Only show access level dropdown in non-production environments */}
          {import.meta.env.MODE !== "production" ? (
            <SelectField {...accessLevelProps} />
          ) : null}
        </div>

        {/* Optional multi-select field for selecting spaces */}
        {showSpaces && <MultiSelectField {...spacesProps} />}

        {/* Markdown description */}
        <Controller
          control={form.control}
          name="description"
          render={({ field }) => (
            <div>
              <FormLabelExt
                label="Description"
                description="Instruction to how to setup and use the template"
              />
              <div className="mt-1 rounded-lg border p-2">
                <MarkdownContainer
                  textValue={field.value || ""}
                  setTextValue={field.onChange}
                />
              </div>
            </div>
          )}
        />

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

        {/* File uploader */}
        <FileUploadList />

        {/* Submit button, disabled during submission */}
        {!viewMode && (
          <div className="flex items-center justify-end gap-4 pb-4">
            {templateId && <DeleteTemplate id={templateId || ""} />}

            <Button disabled={isPending || isUpdatePending} type="submit">
              {isPending || isUpdatePending ? (
                <LoadingSpinner className="mr-2 h-4 w-4" />
              ) : null}
              Submit For Approval
            </Button>
          </div>
        )}
      </Form>
    </ScrollArea>
  );
};
