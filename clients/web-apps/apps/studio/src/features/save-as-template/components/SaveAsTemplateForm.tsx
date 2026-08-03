import { LoadingSpinner, TagInput } from "@avplatform/ui";
import { Alert } from "@avplatform/ui/alert";
import { Button } from "@avplatform/ui/buttons";
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
} from "@avplatform/ui/form";
import { ScrollArea } from "@avplatform/ui/scroll";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { XCircleIcon } from "lucide-react";
import { Controller } from "react-hook-form";

import MarkdownContainer from "@/components/markdown/MarkdownContainer";
import FileUploadList from "@/features/file-uploader-setup/components/FileUploadList";

import {
  accessLevelProps,
  spacesProps,
  templateNameProps,
} from "../constants/save-as-template-feild-props";
import { ValidateTemplateDto } from "../dto/validate-template-dto";
import { useDefineSATForm } from "../hooks/useDefineSATForm";
import DeleteTemplate from "./DeleteTemplate";
import GenerateButton from "./GenerateButton";
import { StatusAlert } from "./StatusAlert";

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
    showSpaces,
    isPending,
    isUpdatePending,
    status,
    viewMode,
    templateId,
    templateRemark,
    lastModifiedBy,
    validationStatus,
  } = useDefineSATForm();

  // Helper to check if all templates are approved
  function areAllTemplatesApproved(items: ValidateTemplateDto[]): boolean {
    return items.every((item) => item.isApprovedTemplate);
  }

  const invalidNodes =
    validationStatus
      ?.filter((item) => !item.isApprovedTemplate)
      ?.map((item) => {
        return { name: item.name, type: item.type };
      }) ?? [];

  const isPublic = form.watch("accessType") == "Public";

  return (
    // Scrollable container to support long forms within the viewport
    <ScrollArea className="h-[calc(100vh-3rem)]">
      <Form
        methods={form}
        disabled={viewMode}
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 p-4"
      >
        {/* Show a warning if validation fails */}
        {!areAllTemplatesApproved(validationStatus) && (
          <Alert
            variant="warning"
            icon={ExclamationCircleIcon}
            title="Ensure all child Agents Blocks and AI Nodes are published and approved as templates."
            children={
              <>
                <div className="mt-2 flex flex-wrap gap-3">
                  {invalidNodes.map((item) => (
                    <p className="flex items-center gap-1">
                      <XCircleIcon className="h-3.5 w-3.5" /> {`${item.name} (${item.type})`}
                    </p>
                  ))}
                </div>
              </>
            }
          />
        )}

        {/* Show approval status if validation passes */}
        {areAllTemplatesApproved(validationStatus) && (
          <StatusAlert status={status} remark={templateRemark} approvedBy={lastModifiedBy} />
        )}

        <div className="grid grid-cols-1 gap-3.5 xs:grid-cols-2">
          {/* Template name input field */}
          <InputField {...templateNameProps} />

          {/* Access level dropdown (hidden in production) */}
          <SelectField {...accessLevelProps} />
        </div>

        {/* Optional multi-select for choosing spaces */}
        {showSpaces && <MultiSelectField {...spacesProps} />}

        {/* Markdown-based instruction field */}
        <Controller
          control={form.control}
          name="instruction"
          render={({ field }) => (
            <div>
              <FormLabelExt
                label="Description"
                description="Instructions for setting up and using the template"
              />
              <div className="mt-1 rounded-lg border p-2">
                <MarkdownContainer
                  textValue={field.value || ""}
                  setTextValue={field.onChange}
                  children={<GenerateButton setVal={form.setValue} />}
                />
              </div>
            </div>
          )}
        />

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

        {/* File upload section */}
        <FileUploadList isPublic={isPublic} />

        {/* Submit button and delete action, only in edit mode */}
        {!viewMode && (
          <div className="flex items-center justify-end gap-4 pb-4">
            {templateId && <DeleteTemplate id={templateId || ""} />}

            <Button disabled={isPending || isUpdatePending || !validationStatus} type="submit">
              {isPending || isUpdatePending ? <LoadingSpinner className="mr-2 h-4 w-4" /> : null}
              Submit For Approval
            </Button>
          </div>
        )}
      </Form>
    </ScrollArea>
  );
};
