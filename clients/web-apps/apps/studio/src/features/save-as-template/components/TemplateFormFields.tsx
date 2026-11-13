import { TagInput } from "@avplatform/ui";
import { cn } from "@avplatform/ui/lib";
import { WarningCircleIcon, XCircleIcon } from "@phosphor-icons/react";
import { useId } from "react";
import { Controller, type UseFormReturn } from "react-hook-form";
import { z } from "zod";

import { FormField } from "@/components/card-dialog/FormField";
import { getFieldInputClassName } from "@/components/card-dialog/field-input.util";
import MarkdownContainer from "@/components/markdown/MarkdownContainer";
import FileUploadList from "@/features/file-uploader-setup/components/FileUploadList";

import { saveAsTemplateSchema } from "../constants/save-as-template-zod-schema";
import { StatusType } from "../dto/save-as-template";
import { ValidateTemplateDto } from "../dto/validate-template-dto";
import { AccessLevelPicker } from "./AccessLevelPicker";
import GenerateButton from "./GenerateButton";
import { StatusAlert } from "./StatusAlert";
import { TemplateNotice } from "./TemplateNotice";

type TemplateFormFieldsProps = {
  form: UseFormReturn<z.infer<typeof saveAsTemplateSchema>>;
  isReadOnly: boolean;
  status: StatusType;
  remark?: string;
  approvedBy?: string;
  unapprovedItems: ValidateTemplateDto[];
};

/**
 * Template name, access level, instructions, tags and files, with the approval state above them.
 */
export const TemplateFormFields = ({
  form,
  isReadOnly,
  status,
  remark,
  approvedBy,
  unapprovedItems,
}: TemplateFormFieldsProps) => {
  const fieldId = useId();
  const nameId = `${fieldId}-name`;
  const tagsId = `${fieldId}-tags`;
  const { errors } = form.formState;
  const accessType = form.watch("accessType");

  return (
    <fieldset disabled={isReadOnly} className="min-w-0 space-y-5">
      {unapprovedItems.length > 0 ? (
        <TemplateNotice
          tone="warn"
          Icon={WarningCircleIcon}
          title="Child agents and AI nodes must be approved templates first"
        >
          <ul className="mt-1.5 space-y-1">
            {unapprovedItems.map((item) => (
              <li key={`${item.name}-${item.type}`} className="flex items-center gap-1.5">
                <XCircleIcon className="size-3.5 shrink-0 text-bad" />
                <span className="truncate">
                  <span className="font-medium text-ink-2">{item.name}</span> · {item.type}
                </span>
              </li>
            ))}
          </ul>
        </TemplateNotice>
      ) : (
        <StatusAlert status={status} remark={remark} approvedBy={approvedBy} />
      )}

      <FormField htmlFor={nameId} label="Template name" error={errors.name?.message}>
        <input
          id={nameId}
          data-autofocus
          autoComplete="off"
          placeholder="e.g. Invoice processor"
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? `${nameId}-error` : undefined}
          {...form.register("name")}
          className={cn(getFieldInputClassName(Boolean(errors.name)), "h-11")}
        />
      </FormField>

      <AccessLevelPicker selectedValue={accessType} registration={form.register("accessType")} />

      <div>
        <p className="text-[12.5px] font-semibold text-ink-2">Instructions</p>
        <p className="mb-2 text-[12px] text-muted-foreground">How to set up and use the template</p>
        <Controller
          control={form.control}
          name="instruction"
          render={({ field }) => (
            <MarkdownContainer textValue={field.value || ""} setTextValue={field.onChange}>
              {!isReadOnly && <GenerateButton setVal={form.setValue} />}
            </MarkdownContainer>
          )}
        />
      </div>

      <div>
        <label htmlFor={tagsId} className="mb-1.5 block text-[12.5px] font-semibold text-ink-2">
          Tags
          <span className="ml-1.5 font-normal text-muted-foreground">Optional</span>
        </label>
        <Controller
          control={form.control}
          name="tags"
          render={({ field }) => (
            <TagInput
              {...field}
              id={tagsId}
              value={field.value ?? []}
              onChange={field.onChange}
              disabled={isReadOnly}
              placeholder="Type a tag and press Enter"
              className="!shadow-none"
            />
          )}
        />
      </div>

      <FileUploadList isPublic={accessType === "Public"} isDisabled={isReadOnly} />
    </fieldset>
  );
};
