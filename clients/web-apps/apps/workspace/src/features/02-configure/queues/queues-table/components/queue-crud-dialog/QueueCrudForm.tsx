import { Input } from "@avplatform/ui";
import { Button, SubmitButton } from "@avplatform/ui/buttons";
import { CrudDialogActions, useCrudDialogDirty } from "@avplatform/ui/crud-dialog";
import {
  AutherCard,
  Form,
  FormLabelExt,
  InputField,
  SelectField,
  SwitchField,
  TextareaField,
} from "@avplatform/ui/form";
import { useListOptimisticMutation } from "@avplatform/ui/hooks";
import { type CrudActionType } from "@avplatform/ui/types";
import { useEffect, useRef } from "react";
import { z } from "zod";

import { JsonEditorField } from "@/components/json-editor/JsonEditorField";

import { queueOptimisticMutationFn } from "../../apis/queues-table-apis";
import {
  descriptionProps,
  idProps,
  isDisabledProps,
  maxRetriesProps,
  nameProps,
  processingModeProps,
  typeProps,
} from "../../constants/queue-form-field-props";
import { queueZodSchema } from "../../constants/queue-zod-schema";
import { QueuesTableDto } from "../../dtos/queues-table-dto";
import { useDefineQueueForm } from "../../hooks/useDefineQueueForm";
import { useTableTab } from "../../hooks/useTableTab";

interface QueueCrudFormProps {
  rowId: string;
  crudAction: CrudActionType;
}

export const QueueCrudForm = ({ rowId, crudAction }: QueueCrudFormProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { onCloseConfirmed } = useCrudDialogDirty();

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  // Define queue form
  const {
    form,
    isDirty,
    isValid,
    isAvailable,
    availabilityMessage,
    setAvailabilityMessage,
    isCheckPending,
    handleInputChange,
    refineFormData,
    selectOptions,
  } = useDefineQueueForm({ rowId, crudAction });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    // Validate file type
    if (file.type !== "application/json" && !file.name.endsWith(".json")) {
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsedData = JSON.parse(content);
        form.setValue("inputSchema", JSON.stringify(parsedData, null, 2));

        // setJsonData(parsedData);
      } catch (err) {
        console.log(err);
        form.setValue("inputSchema", JSON.stringify([], null, 2));

        // setJsonData([]);
      }
    };

    reader.onerror = () => {};

    reader.readAsText(file);
  };

  // Use this in place DATA_QUERY_KEY to handle Personal/Shared tabs list
  // queryKey already includes the current space id.
  const { queryKey } = useTableTab();

  // Define optimistic mutation to crete or update the queue
  const {
    mutate: mutatequeue,
    isPending,
    isSuccess,
  } = useListOptimisticMutation<QueuesTableDto, QueuesTableDto | boolean, QueuesTableDto>(
    [rowId],
    queueOptimisticMutationFn,
    queryKey,
  );

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof queueZodSchema>) => {
    // Create or update the queue
    mutatequeue({
      payload: refineFormData(formData) as unknown as QueuesTableDto,
      crudAction,
    });

    // Reset the availability message
    setAvailabilityMessage(null);

    // Close the dialog if not creating the record
    if (crudAction !== "create") onCloseConfirmed();
  };

  // Close dialog and reset form when mutation is successful
  useEffect(() => {
    if (crudAction === "create" && isSuccess) onCloseConfirmed();
  }, [isSuccess, crudAction, onCloseConfirmed]);

  // Is form in read mode?
  const isReadMode = crudAction === "read";

  // Return the form
  return (
    <Form methods={form} onSubmit={form.handleSubmit(onSubmit)} disabled={isReadMode}>
      {/* queue Id */}
      {isReadMode && <InputField {...idProps} />}
      <div className="grid grid-cols-2 gap-3">
        {/* Type */}
        {crudAction === "create" ? (
          <SelectField {...typeProps} />
        ) : (
          form.getValues("type") !== "" && <SelectField {...typeProps} />
        )}

        {/* Processing Mode */}
        {crudAction === "create" ? (
          <SelectField {...processingModeProps} />
        ) : (
          form.getValues("processingMode") !== "" && <SelectField {...processingModeProps} />
        )}
      </div>
      {/* Name */}
      <InputField
        {...nameProps}
        onChangeCapture={(e) => handleInputChange(e.currentTarget.value)}
        nonErrorMessage={availabilityMessage}
        autoFocus
        disabled={crudAction !== "create"}
      />
      {/* Description */}
      <TextareaField {...descriptionProps} />
      <SwitchField
        name="isUniqueReferencesEnforced"
        description="Prevents duplicate work items by checking the fields marked as unique identifiers in the work item schema."
        label="Enforce unique references"
      />
      <SwitchField
        name="isStoredEncrypted"
        description="Encrypts the work item data at rest in the database so it cannot be read in plain text."
        label="Store in encrypted format"
      />
      <InputField {...maxRetriesProps} isRequired />
      {/* additional options */}
      <div className="flex flex-col gap-4">
        <Input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
          accept=".json,application/json"
        />

        {/* Raw JSON Preview */}

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <FormLabelExt
              label="Work item schema"
              isRequired
              disabled={isReadMode}
              description={`Define the list of fields that each work item in the queue must contain, as a **JSON array**.

Each element is an object with:

- **name** — the field key
- **description** — optional
- **label** — display text
- **type** — \`string\`, \`int\`, \`Date\` or \`Array\`
- **isRequired** — \`true\` = the field is mandatory on every work item
- **isUsedForUniqueIdentifier** — \`true\` = this field is used to detect duplicate work items

The value must be a JSON array, e.g. \`[{"name":"requestId","type":"string","isRequired":true,"isUsedForUniqueIdentifier":true}]\`.

An example array is pre-filled below — edit or replace it as needed.`}
            />
            <Button
              onClick={handleClick}
              type="button"
              variant="link"
              className="h-auto p-0 text-[12.5px]"
            >
              Browse file
            </Button>
          </div>
          <pre>
            <JsonEditorField name="inputSchema" disabled={isReadMode} />
          </pre>
        </div>

        {/* Disposition Statuses */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <FormLabelExt
              label="Disposition status"
              isRequired={form.watch("type") === "User"}
              disabled={isReadMode}
              description={`Queue-specific disposition statuses (e.g. **Approved**, **Rejected**) in addition to the core **Pending**, **In-progress**, **Completed** and **Failed** statuses.

Required when the **Instance Type** is **User**. An example structure is pre-filled below.

Keys:

- **name** — status value
- **label** — display text
- **color** — badge color, e.g. \`#22c55e\`
- **routeQueue** — name of the destination queue to route the work item to when this status is selected; empty = no routing

Disposition statuses are always terminal (end) states.`}
            />
          </div>
          <pre>
            <JsonEditorField name="statuses" disabled={isReadMode} />
          </pre>
        </div>
      </div>
      <SelectField
        selectOptions={selectOptions ?? []}
        name="credentialName"
        label="Credential"
        disabled={isReadMode}
        description="Optional credential used by this queue. Leave empty if the queue does not need to access external resources."
      />

      {/* Is Disabled */}
      {crudAction !== "create" && <SwitchField {...isDisabledProps} />}
      {/* AutherCard */}
      {isReadMode && (
        <AutherCard
          createdBy={form.getValues("createdBy")}
          createdOn={form.getValues("createdOn")}
          lastModifiedBy={form.getValues("lastModifiedBy")}
          lastModifiedOn={form.getValues("lastModifiedOn")}
        />
      )}
      {/* Submit button */}
      {!isReadMode && (
        <CrudDialogActions>
          <SubmitButton
            className="min-w-[5rem]"
            primaryText={crudAction === "create" ? "Create" : "Save changes"}
            secondaryText={crudAction === "create" ? "Creating..." : "Saving..."}
            isPending={isPending}
            disabled={!isDirty || !isValid || !isAvailable || isCheckPending}
          />
        </CrudDialogActions>
      )}
    </Form>
  );
};
