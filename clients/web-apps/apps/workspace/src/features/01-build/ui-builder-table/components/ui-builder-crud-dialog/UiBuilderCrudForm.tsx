import { SubmitButton } from "@avplatform/ui/buttons";
import { useCrudDialogDirty } from "@avplatform/ui/crud-dialog";
import { Form, InputField, SwitchField, TextareaField } from "@avplatform/ui/form";
import { useListOptimisticMutation } from "@avplatform/ui/hooks";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@avplatform/ui/select";
import { type CrudActionType } from "@avplatform/ui/types";
import { useEffect, useState } from "react";
import { z } from "zod";

import { uiBuilderOptimisticMutationFn } from "../../apis/ui-builder-table-apis";
import { UI_BUILDER_QUERY_KEY } from "../../constants";
import {
  descriptionProps,
  idProps,
  isDisabledProps,
  nameProps,
} from "../../constants/ui-builder-form-field-props";
import { uiBuilderZodSchema } from "../../constants/ui-builder-zod-schema";
import { UiBuilderTableDto } from "../../dtos/ui-builder-table-dto";
import { useDefineUiBuilderForm } from "../../hooks/useDefineUiBuilderForm";
import {
  useCloneUiBuilderMutation,
  useFetchUiBuilderTemplates,
} from "../../hooks/useUiBuilderTemplates";

const BLANK_TEMPLATE = "blank";

interface UiBuilderCrudFormProps {
  rowId: string;
  crudAction: CrudActionType;
}

export const UiBuilderCrudForm = ({ rowId, crudAction }: UiBuilderCrudFormProps) => {
  const { onCloseConfirmed } = useCrudDialogDirty();

  const {
    form,
    isDirty,
    isAvailable,
    availabilityMessage,
    isCheckPending,
    handleInputChange,
    refineFormData,
  } = useDefineUiBuilderForm({ rowId, crudAction });

  const {
    mutate: mutateProject,
    isPending,
    isSuccess,
  } = useListOptimisticMutation<
    UiBuilderTableDto,
    UiBuilderTableDto | boolean | number,
    UiBuilderTableDto
  >([rowId], uiBuilderOptimisticMutationFn, UI_BUILDER_QUERY_KEY);

  const isCreate = crudAction === "create";
  const [templateId, setTemplateId] = useState(BLANK_TEMPLATE);
  const templatesQuery = useFetchUiBuilderTemplates(isCreate);
  const templates = templatesQuery.data?.data ?? [];
  const cloneMutation = useCloneUiBuilderMutation();

  const onSubmit = (formData: z.infer<typeof uiBuilderZodSchema>) => {
    if (isCreate && templateId !== BLANK_TEMPLATE) {
      cloneMutation.mutate(
        { templateId, project: refineFormData(formData) as unknown as UiBuilderTableDto },
        { onSuccess: () => onCloseConfirmed() },
      );
      return;
    }

    mutateProject({
      payload: refineFormData(formData) as unknown as UiBuilderTableDto,
      crudAction: crudAction,
    });

    if (crudAction !== "create") onCloseConfirmed();
  };

  useEffect(() => {
    if (crudAction === "create" && isSuccess) onCloseConfirmed();
  }, [isSuccess, crudAction, onCloseConfirmed]);

  const isReadMode = crudAction === "read";

  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(onSubmit)}
      className="px-2.5 pb-5"
      disabled={isReadMode}
    >
      {/* Project Id */}
      {isReadMode && <InputField {...idProps} />}

      {/* Name */}
      <InputField
        {...nameProps}
        onChangeCapture={(e) => handleInputChange(e.currentTarget.value)}
        nonErrorMessage={availabilityMessage}
      />

      {/* Description */}
      <TextareaField {...descriptionProps} />

      {isCreate && templates.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-sm font-medium">Start from</span>
          <Select value={templateId} onValueChange={setTemplateId}>
            <SelectTrigger aria-label="Start from">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={BLANK_TEMPLATE}>Blank project</SelectItem>
              {templates.map((template) => (
                <SelectItem key={template.id} value={template.id ?? ""}>
                  {template.name}
                  {template.createdBy ? ` · ${template.createdBy}` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {templateId === BLANK_TEMPLATE
              ? "Start with an empty interface."
              : (templates.find((template) => template.id === templateId)?.description ??
                "Copies the template's newest version, instructions, theme, and images. Data connections are not copied.")}
          </p>
        </div>
      )}

      {/* Is Disabled */}
      {crudAction !== "create" && <SwitchField {...isDisabledProps} />}

      {/* Submit button */}
      {!isReadMode && (
        <div className="!mt-5 flex w-full justify-end">
          <SubmitButton
            className="min-w-[5rem]"
            primaryText={crudAction === "create" ? "Create" : "Save changes"}
            secondaryText="Creating..."
            isPending={isPending || cloneMutation.isPending}
            disabled={!isDirty || !isAvailable || isCheckPending}
          />
        </div>
      )}
    </Form>
  );
};
