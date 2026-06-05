import { JsonEditorField } from "@/components/json-editor/JsonEditorField";

import { Input } from "@aventisia/ui";
import { Button, SubmitButton } from "@aventisia/ui/buttons";
import {
  AutherCard,
  Form,
  FormLabelExt,
  InputField,
  SelectField,
  SwitchField,
  TextareaField,
} from "@aventisia/ui/form";
import { useListOptimisticMutation } from "@aventisia/ui/hooks";
import { useEffect, useRef } from "react";
import { z } from "zod";

import { queueOptimisticMutationFn } from "../../apis/queues-table-apis";
import {
  descriptionProps,
  idProps,
  isDisabledProps,
  nameProps,
  typeProps,
} from "../../constants/queue-form-field-props";
import { queueZodSchema } from "../../constants/queue-zod-schema";
import { QueuesTableDto } from "../../dtos/queues-table-dto";
import { useDefineQueueForm } from "../../hooks/useDefineQueueForm";
import { useTableTab } from "../../hooks/useTableTab";

export const QueueCrudForm = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  // Define queue form
  const {
    form,
    isDirty,
    rowId,
    crudAction,
    isAvailable,
    availabilityMessage,
    setAvailabilityMessage,
    isCheckPending,
    handleInputChange,
    setShowDialog,
    refineFormData,
  } = useDefineQueueForm();

  // const jData = form.watch("inputSchema");

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
  const { queryKey } = useTableTab();

  // Define optimistic mutation to crete or update the queue
  const {
    mutate: mutatequeue,
    isPending,
    isSuccess,
  } = useListOptimisticMutation<
    QueuesTableDto,
    QueuesTableDto | boolean,
    QueuesTableDto
  >([rowId], queueOptimisticMutationFn, queryKey);

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
    if (crudAction !== "create") setShowDialog(false);
  };

  // Close dialog and reset form when mutation is successful
  useEffect(() => {
    if (crudAction === "create" && isSuccess) setShowDialog(false);
  }, [isSuccess, crudAction, setShowDialog]);

  // Is form in read mode?
  const isReadMode = crudAction === "read";

  // Return the form
  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(onSubmit)}
      className="px-2.5 pb-5"
      disabled={isReadMode}
    >
      {/* queue Id */}
      {isReadMode && <InputField {...idProps} />}

      {/* Name */}
      <InputField
        {...nameProps}
        onChangeCapture={(e) => handleInputChange(e.currentTarget.value)}
        nonErrorMessage={availabilityMessage}
      />

      {/* Type */}
      {crudAction === "create" ? (
        <SelectField {...typeProps} />
      ) : (
        form.getValues("type") !== "" && <SelectField {...typeProps} />
      )}
      {/* Description */}
      <TextareaField {...descriptionProps} />
      <SwitchField
        name="hasUniqueRef"
        description="Enforce unique references"
        label="Enforce unique references"
      />
      <SwitchField
        name="isStoredEncrypted"
        description="Store in encrypted format"
        label="Store in encrypted format"
      />

      {/* autor etry  */}
      {/* <div className="flex flex-col gap-2">
        <div className="ml-1 flex justify-between">
          <label htmlFor="shouldRetryFailedItems" className="fm text-sm">
            Failed Items
          </label>
          <CheckboxField
            name="shouldRetryFailedItems"
            id="retryFailed"
            label=""
          />
        </div>
        <div className="ml-1 flex justify-between">
          <label htmlFor="shouldRetryAbandonedItems" className="fm text-sm">
            Abandoned Items
          </label>
          <CheckboxField
            name="shouldRetryAbandonedItems"
            id="retryAbandoned"
            label=""
          />
        </div>

        {form.getValues("shouldRetryAbandonedItems") ||
        form.getValues("shouldRetryFailedItems") ? (
          <div className="mt-4">
            <InputField
              {...maxRetriesProps}
              isRequired={crudAction === "create"}
            />
          </div>
        ) : null}
      </div> */}

      {/* additional options */}
      <div className="flex flex-col gap-3">
        <Input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
          accept=".json,application/json"
        />

        {/* Raw JSON Preview */}

        <div>
          <div className="mb-2 flex items-center justify-between">
            <FormLabelExt
              label="Work Item schema"
              isRequired
              disabled={isReadMode}
            />
            <Button onClick={handleClick} type="button" variant={"link"}>
              Browse File
            </Button>
          </div>
          <pre>
            <JsonEditorField name="inputSchema" disabled={isReadMode} />
          </pre>
        </div>
      </div>

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
        <div className="!mt-5 flex w-full justify-end">
          <SubmitButton
            className="min-w-[5rem]"
            primaryText={crudAction === "create" ? "Create" : "Save changes"}
            secondaryText={
              crudAction === "create" ? "Creating..." : "Saving..."
            }
            isPending={isPending}
            disabled={!isDirty || !isAvailable || isCheckPending}
          />
        </div>
      )}
    </Form>
  );
};
