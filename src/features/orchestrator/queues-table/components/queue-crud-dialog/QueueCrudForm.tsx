import { Button } from "@aventisia/ui/buttons";
import {
  AutherCard,
  CheckboxField,
  Form,
  InputField,
  InputFileField,
  SwitchField,
  TextareaField,
} from "@aventisia/ui/form";
import { useListOptimisticMutation } from "@aventisia/ui/hooks";
import { z } from "zod";

import { queueOptimisticMutationFn } from "../../apis/queues-table-apis";
import { DATA_QUERY_KEY } from "../../constants";
import {
  descriptionProps,
  idProps,
  inputJsonSchemaProps,
  isDisabledProps,
  maxRetriesProps,
  nameProps,
  outputJsonSchemaProps,
} from "../../constants/queue-form-field-props";
import { queueZodSchema } from "../../constants/queue-zod-schema";
import { QueueCreateUpdateDto } from "../../dtos/queue-create-update-dto";
import { QueuesTableDto } from "../../dtos/queues-table-dto";
import { useDefineQueueForm } from "../../hooks/useDefineQueueForm";

export const QueueCrudForm = () => {
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

  // Define optimistic mutation to crete or update the queue
  const { mutate: mutatequeue } = useListOptimisticMutation<
    QueueCreateUpdateDto,
    QueueCreateUpdateDto | boolean,
    QueuesTableDto
  >([rowId], queueOptimisticMutationFn, DATA_QUERY_KEY);

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof queueZodSchema>) => {
    // Create or update the queue
    mutatequeue({
      payload: refineFormData(formData) as unknown as QueueCreateUpdateDto,
      crudAction: crudAction,
    });

    // Reset the availability message
    setAvailabilityMessage(null);

    // Close the dialog
    setShowDialog(false);
  };

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

      <p className="text-md mb-2 border-b-2 pb-2">General Details</p>
      <div className="flex flex-col gap-3">
        {/* Name */}
        <InputField
          {...nameProps}
          onChangeCapture={(e) => handleInputChange(e.currentTarget.value)}
          nonErrorMessage={availabilityMessage}
        />

        {/* Description */}
        <TextareaField {...descriptionProps} />
      </div>

      {/* additional options */}
      <p className="text-md mb-2 border-b-2 pb-2">Additonal Details</p>
      <div className="flex flex-col gap-2">
        <div className="ml-1 flex justify-between">
          <label htmlFor="isUniqueReferencesEnforced" className="fm text-sm">
            Enforce unique references
          </label>
          <CheckboxField
            id="isUniqueReferencesEnforced"
            name="hasUniqueRef"
            label=""
          />
        </div>
        <div className="ml-1 flex justify-between">
          <label htmlFor="isStoredEncrypted" className="fm text-sm">
            Store in encrypted format
          </label>
          <CheckboxField id="isStoredEncrypted" name="isEncrypted" label="" />
        </div>
      </div>

      {/* autor etry  */}
      <p className="text-md mb-2 border-b-2 pb-2">Auto retry</p>
      <div className="flex flex-col gap-2">
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
      </div>

      {/* additional options */}
      {crudAction === "create" && (
        <>
          <p className="text-md mb-2 border-b-2 pb-2">Schema Definations</p>
          <div className="flex flex-col gap-3">
            <InputFileField
              {...inputJsonSchemaProps}
              multiple={false}
              fileTypes={[".json"]}
              isRequired={crudAction === "create"}
            />
            <InputFileField
              multiple={false}
              {...outputJsonSchemaProps}
              fileTypes={[".json"]}
              isRequired={crudAction === "create"}
            />
          </div>
        </>
      )}

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
        <div className="!mt-10 flex w-full justify-end">
          <Button
            type="submit"
            disabled={!isDirty || !isAvailable || isCheckPending}
            className="min-w-[5rem]"
          >
            {crudAction === "create" ? "Create queue" : "Save changes"}
          </Button>
        </div>
      )}
    </Form>
  );
};
