import { Switch } from "@avplatform/ui";
import { type CrudCustomDialogProps, useCrudDialogDirty } from "@avplatform/ui/crud-dialog";
import { useListOptimisticMutation } from "@avplatform/ui/hooks";
import { IconTile } from "@avplatform/ui/icon-tile";
import { cn } from "@avplatform/ui/lib";
import { KeyIcon } from "@phosphor-icons/react";
import { useEffect, useId } from "react";
import { Controller } from "react-hook-form";
import { z } from "zod";

import { AvailabilityHint } from "@/components/card-dialog/AvailabilityHint";
import { CardDialog } from "@/components/card-dialog/CardDialog";
import { CardDialogButton } from "@/components/card-dialog/CardDialogButton";
import { FormField } from "@/components/card-dialog/FormField";
import { StatusLine } from "@/components/card-dialog/StatusLine";
import { getFieldInputClassName } from "@/components/card-dialog/field-input.util";
import { JsonEditor } from "@/components/json-editor/JsonEditor";

import { configStoreOptimisticMutationFn } from "../../apis/config-stores-table-apis";
import { isDisabledProps } from "../../constants/config-store-form-field-props";
import { configStoreZodSchema } from "../../constants/config-store-zod-schema";
import { ConfigStoresTableDto } from "../../dtos/config-stores-table-dto";
import { useDefineConfigStoreForm } from "../../hooks/useDefineConfigStoreForm";
import { useTableTab } from "../../hooks/useTableTab";
import { KeyTypePicker } from "./KeyTypePicker";

const KEY_NAME_MAX_LENGTH = 255;

const EYEBROWS = { create: "New key store", update: "Edit key store", read: "Key store" } as const;

/**
 * Create, edit or view a key store in the card dialog style.
 */
export const ConfigStoreFormDialog = ({
  isOpen,
  crudAction,
  rowId,
  onClose,
  banner,
}: CrudCustomDialogProps) => {
  const { onCloseConfirmed } = useCrudDialogDirty();
  const {
    form,
    isDirty,
    isAvailable,
    availabilityMessage,
    isCheckPending,
    handleInputChange,
    refineFormData,
  } = useDefineConfigStoreForm({ rowId, crudAction });

  // Use this in place DATA_QUERY_KEY to handle Personal/Shared tabs list
  const { queryKey } = useTableTab();

  const {
    mutate: mutateConfigStore,
    isPending,
    isSuccess,
  } = useListOptimisticMutation<
    ConfigStoresTableDto,
    ConfigStoresTableDto | boolean,
    ConfigStoresTableDto
  >([rowId], configStoreOptimisticMutationFn, queryKey);

  const isCreating = crudAction === "create";
  const isReadMode = crudAction === "read";
  const isSaving = isCreating && isPending;

  useEffect(() => {
    if (isCreating && isSuccess) onCloseConfirmed();
  }, [isSuccess, isCreating, onCloseConfirmed]);

  const { errors } = form.formState;
  const name = form.watch("name");
  const keyType = form.watch("type");
  const isDisabled = form.watch("isDisabled");
  const trimmedName = name.trim();
  const canSave = isDirty && isAvailable && !isCheckPending && !isSaving;

  const fieldId = useId();
  const formId = `${fieldId}-form`;
  const keyIdId = `${fieldId}-key-id`;
  const nameId = `${fieldId}-name`;
  const valueId = `${fieldId}-value`;
  const descriptionId = `${fieldId}-description`;
  const disabledId = `${fieldId}-disabled`;

  const handleSubmit = form.handleSubmit((formData: z.infer<typeof configStoreZodSchema>) => {
    mutateConfigStore({
      payload: refineFormData(formData) as unknown as ConfigStoresTableDto,
      crudAction,
    });
    if (!isCreating) onCloseConfirmed();
  });

  const status = isReadMode ? (
    <StatusLine tone="idle">View only</StatusLine>
  ) : isCreating ? (
    <StatusLine tone="idle">The name can’t be changed after creation</StatusLine>
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
      mark={<IconTile Icon={KeyIcon} size="lg" className="size-12 rounded-lg [&>svg]:size-6" />}
      eyebrow={EYEBROWS[crudAction]}
      title={
        <span className={cn(!trimmedName && "text-muted-foreground")}>
          {trimmedName || "Untitled key store"}
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
                {isSaving ? "Creating" : isCreating ? "Create key" : "Save changes"}
              </CardDialogButton>
            )}
          </div>
        </>
      }
    >
      {banner}
      <form id={formId} onSubmit={handleSubmit} noValidate className="space-y-4">
        <fieldset disabled={isReadMode} className="min-w-0 space-y-4">
          {isReadMode && (
            <FormField htmlFor={keyIdId} label="Key ID">
              <input
                id={keyIdId}
                disabled
                value={form.getValues("id")}
                readOnly
                className={cn(getFieldInputClassName(false), "h-11")}
              />
            </FormField>
          )}

          <FormField
            htmlFor={nameId}
            label="Unique name"
            length={name.length}
            maxLength={KEY_NAME_MAX_LENGTH}
            error={errors.name?.message}
            hint={<AvailabilityHint message={availabilityMessage} />}
          >
            <input
              id={nameId}
              data-autofocus
              autoComplete="off"
              maxLength={KEY_NAME_MAX_LENGTH}
              placeholder="Enter a unique name"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? `${nameId}-error` : undefined}
              {...form.register("name", {
                onChange: (event) => handleInputChange(event.target.value),
              })}
              disabled={crudAction !== "create"}
              className={cn(getFieldInputClassName(Boolean(errors.name)), "h-11")}
            />
          </FormField>

          <KeyTypePicker
            selectedType={keyType}
            registration={form.register("type")}
            disabled={isReadMode}
          />

          {keyType === "JSON" && (
            <Controller
              name="value"
              control={form.control}
              render={({ field }) => (
                <FormField htmlFor={valueId} label="Value" error={errors.value?.message}>
                  <JsonEditor value={field.value} onChange={field.onChange} disabled={isReadMode} />
                </FormField>
              )}
            />
          )}

          {keyType === "TEXT" && (
            <FormField htmlFor={valueId} label="Value" error={errors.value?.message}>
              <input
                id={valueId}
                autoComplete="off"
                placeholder="Enter the key value"
                aria-invalid={Boolean(errors.value)}
                aria-describedby={errors.value ? `${valueId}-error` : undefined}
                {...form.register("value")}
                className={cn(getFieldInputClassName(Boolean(errors.value)), "h-11")}
              />
            </FormField>
          )}

          {keyType === "BOOLEAN" && (
            <FormField htmlFor={valueId} label="Value" error={errors.value?.message}>
              <select
                id={valueId}
                aria-invalid={Boolean(errors.value)}
                {...form.register("value")}
                className={cn(getFieldInputClassName(Boolean(errors.value)), "h-11")}
              >
                <option value="true">True</option>
                <option value="false">False</option>
              </select>
            </FormField>
          )}

          <FormField
            htmlFor={descriptionId}
            label="Description"
            isOptional
            error={errors.description?.message}
          >
            <textarea
              id={descriptionId}
              rows={3}
              placeholder="A short summary of what the key is used for"
              aria-invalid={Boolean(errors.description)}
              {...form.register("description")}
              className={cn(
                getFieldInputClassName(Boolean(errors.description)),
                "block resize-none py-2.5 leading-5",
              )}
            />
          </FormField>

          {!isCreating && (
            <div className="flex items-center justify-between gap-4 rounded-md bg-sunken/80 px-3.5 py-3 ring-1 ring-line">
              <label htmlFor={disabledId} className="min-w-0">
                <span className="block text-[13px] font-semibold text-ink">
                  {isDisabledProps.label}
                </span>
                <span className="block text-[12px] text-muted-foreground">
                  {isDisabledProps.description}
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
