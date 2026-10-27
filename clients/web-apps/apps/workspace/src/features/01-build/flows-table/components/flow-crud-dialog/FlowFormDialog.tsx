import { Switch } from "@avplatform/ui";
import { type CrudCustomDialogProps, useCrudDialogDirty } from "@avplatform/ui/data-table";
import { useListOptimisticMutation } from "@avplatform/ui/hooks";
import { cn } from "@avplatform/ui/lib";
import { type CustomFormMessage } from "@avplatform/ui/types";
import { CircleCheck, LoaderCircle } from "lucide-react";
import { useEffect, useId } from "react";
import { z } from "zod";

import { AgentAvatar } from "@/components/AgentAvatar";
import { CardDialog } from "@/components/card-dialog/CardDialog";
import { CardDialogButton } from "@/components/card-dialog/CardDialogButton";
import { StatusLine } from "@/components/card-dialog/StatusLine";

import { flowOptimisticMutationFn } from "../../apis/flows-table-apis";
import { FLOWS_QUERY_KEY } from "../../constants";
import { flowZodSchema } from "../../constants/flow-zod-schema";
import { FlowsTableDto } from "../../dtos/flows-table-dto";
import { useDefineFlowForm } from "../../hooks/useDefineFlowForm";
import { useFetchFolders } from "../../hooks/useFetchFolders.hook";
import { getFieldInputClassName } from "../../utils/field-input.util";
import { FormField } from "../folder-dialogs/FormField";
import { FlowTypePicker } from "./FlowTypePicker";

const FLOW_NAME_MAX_LENGTH = 255;
const FLOW_DESCRIPTION_MAX_LENGTH = 500;

const EYEBROWS = { create: "New agent", update: "Edit agent", read: "Agent" } as const;

const AvailabilityHint = ({ message }: { message: CustomFormMessage | null }) => {
  if (!message) return null;

  const isChecking = message.type === "Gray";

  return (
    <span
      className={cn(
        "flex items-center gap-1.5 pt-1.5 text-[12px]",
        isChecking ? "text-muted-foreground" : "text-ok",
      )}
    >
      {isChecking ? (
        <LoaderCircle className="size-3.5 shrink-0 animate-spin" />
      ) : (
        <CircleCheck className="size-3.5 shrink-0" />
      )}
      {message.message}
    </span>
  );
};

/**
 * Create, edit or view an agent's name, type and description in the card dialog style.
 */
export const FlowFormDialog = ({ isOpen, crudAction, rowId, onClose }: CrudCustomDialogProps) => {
  const { onCloseConfirmed } = useCrudDialogDirty();
  const {
    form,
    isDirty,
    folderId,
    isAvailable,
    availabilityMessage,
    isCheckPending,
    handleInputChange,
    refineFormData,
  } = useDefineFlowForm({ rowId, crudAction });
  const { folders } = useFetchFolders();
  const fieldId = useId();
  const formId = `${fieldId}-form`;
  const nameId = `${fieldId}-name`;
  const descriptionId = `${fieldId}-description`;
  const disabledId = `${fieldId}-disabled`;

  const {
    mutate: mutateFlow,
    isPending,
    isSuccess,
  } = useListOptimisticMutation<FlowsTableDto, FlowsTableDto | boolean, FlowsTableDto>(
    [rowId],
    flowOptimisticMutationFn,
    FLOWS_QUERY_KEY,
  );

  const isCreating = crudAction === "create";
  const isReadMode = crudAction === "read";
  const isSaving = isCreating && isPending;

  useEffect(() => {
    if (isCreating && isSuccess) onCloseConfirmed();
  }, [isSuccess, isCreating, onCloseConfirmed]);

  const { errors } = form.formState;
  const name = form.watch("name");
  const description = form.watch("description");
  const type = form.watch("type");
  const isDisabled = form.watch("isDisabled");
  const trimmedName = name.trim();
  const canSave = isDirty && isAvailable && !isCheckPending && !isSaving;
  const folderName = folders?.find((folder) => folder.id === folderId)?.name;

  const handleSubmit = form.handleSubmit((formData: z.infer<typeof flowZodSchema>) => {
    mutateFlow({
      payload: refineFormData(formData) as unknown as FlowsTableDto,
      crudAction,
    });
    if (!isCreating) onCloseConfirmed();
  });

  const status = isReadMode ? (
    <StatusLine tone="idle">View only</StatusLine>
  ) : isCreating ? (
    <StatusLine tone="idle">
      {folderName ? `Created inside ${folderName}` : "You can rename it any time"}
    </StatusLine>
  ) : (
    <StatusLine tone={isDirty ? "pending" : "idle"}>
      {isDirty ? "Unsaved changes" : "No changes yet"}
    </StatusLine>
  );

  return (
    <CardDialog
      isOpen={isOpen}
      onClose={onClose}
      isDismissLocked={isSaving}
      isOutsideClickLocked={isDirty}
      mark={<AgentAvatar size="lg" className="size-12 rounded-lg [&>svg]:size-6" />}
      eyebrow={EYEBROWS[crudAction]}
      title={
        <span className={cn(!trimmedName && "text-muted-foreground")}>
          {trimmedName || "Untitled agent"}
        </span>
      }
      footer={
        <>
          {status}
          <div className="flex shrink-0 items-center gap-2">
            <CardDialogButton onClick={onClose} disabled={isSaving}>
              {isReadMode ? "Close" : "Cancel"}
            </CardDialogButton>
            {!isReadMode && (
              <CardDialogButton
                type="submit"
                form={formId}
                variant="primary"
                disabled={!canSave}
                isBusy={isSaving}
              >
                {isSaving ? "Creating" : isCreating ? "Create agent" : "Save changes"}
              </CardDialogButton>
            )}
          </div>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} noValidate className="space-y-4">
        <fieldset disabled={isReadMode} className="space-y-4">
          <FormField
            htmlFor={nameId}
            label="Name"
            length={name.length}
            maxLength={FLOW_NAME_MAX_LENGTH}
            error={errors.name?.message}
            hint={<AvailabilityHint message={availabilityMessage} />}
          >
            <input
              id={nameId}
              data-autofocus
              autoComplete="off"
              maxLength={FLOW_NAME_MAX_LENGTH}
              placeholder="e.g. Invoice processor"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? `${nameId}-error` : undefined}
              {...form.register("name", {
                onChange: (event) => handleInputChange(event.target.value),
              })}
              className={cn(getFieldInputClassName(Boolean(errors.name)), "h-11")}
            />
          </FormField>

          <FlowTypePicker
            selectedType={type}
            registration={form.register("type")}
            isLocked={!isCreating}
          />

          <FormField
            htmlFor={descriptionId}
            label="Description"
            isOptional
            length={description.length}
            maxLength={FLOW_DESCRIPTION_MAX_LENGTH}
            error={errors.description?.message}
          >
            <textarea
              id={descriptionId}
              rows={3}
              maxLength={FLOW_DESCRIPTION_MAX_LENGTH}
              placeholder="What does this agent do?"
              aria-invalid={Boolean(errors.description)}
              {...form.register("description")}
              className={cn(
                getFieldInputClassName(Boolean(errors.description)),
                "block resize-none py-2.5 leading-5",
              )}
            />
          </FormField>

          {!isCreating && (
            <div className="flex items-center justify-between gap-4 rounded-xl bg-sunken/80 px-3.5 py-3 ring-1 ring-line">
              <label htmlFor={disabledId} className="min-w-0">
                <span className="block text-[13px] font-semibold text-ink">Disable agent</span>
                <span className="block text-[12px] text-muted-foreground">
                  Turn it off when it’s outdated or no longer needed
                </span>
              </label>
              <Switch
                id={disabledId}
                size="sm"
                checked={isDisabled}
                disabled={isReadMode}
                onCheckedChange={(checked) =>
                  form.setValue("isDisabled", checked, { shouldDirty: true })
                }
              />
            </div>
          )}
        </fieldset>
      </form>
    </CardDialog>
  );
};
