import { z } from "zod";

import { useListOptimisticMutation } from "@/react-toolkit/hooks/useListOptimisticMutation";
import { Button } from "@/react-toolkit/ui/buttons/Button";
import { CheckboxField } from "@/react-toolkit/ui/form/fields/CheckboxField";
import { InputField } from "@/react-toolkit/ui/form/fields/InputField";
import { InputFileField } from "@/react-toolkit/ui/form/fields/InputFileField";
import { SwitchField } from "@/react-toolkit/ui/form/fields/SwitchField";
import { TextareaField } from "@/react-toolkit/ui/form/fields/TextareaField";
import { Form } from "@/react-toolkit/ui/form/Form";
import { AutherCard } from "@/react-toolkit/ui/form/non-field/AutherCard";

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
    QueuesTableDto,
    QueuesTableDto | boolean,
    QueuesTableDto
  >([rowId], queueOptimisticMutationFn, DATA_QUERY_KEY);

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof queueZodSchema>) => {
    // Create or update the queue
    mutatequeue({
      payload: refineFormData(formData) as unknown as QueuesTableDto,
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
          <label htmlFor="default-checkbox" className="fm text-sm">
            Enforce unique references
          </label>
          <CheckboxField name="enforceUniqueRef" label="" />
        </div>
        <div className="ml-1 flex justify-between">
          <label htmlFor="default-checkbox" className="fm text-sm">
            Store in encrypted format
          </label>
          <CheckboxField name="isEncrypted" label="" />
        </div>
      </div>

      {/* autor etry  */}
      <p className="text-md mb-2 border-b-2 pb-2">Auto retry</p>
      <div className="flex flex-col gap-2">
        <div className="ml-1 flex justify-between">
          <label htmlFor="default-checkbox" className="fm text-sm">
            Failed Items
          </label>
          <CheckboxField name="retryFailed" label="" />
        </div>
        <div className="ml-1 flex justify-between">
          <label htmlFor="default-checkbox" className="fm text-sm">
            Abandoned Items
          </label>
          <CheckboxField name="retryAbandoned" label="" />
        </div>

        <div className="mt-4">
          <InputField {...maxRetriesProps} />
        </div>
      </div>

      {/* additional options */}
      <p className="text-md mb-2 border-b-2 pb-2">Shema Definations</p>
      <div className="flex flex-col gap-3">
        <InputFileField
          {...inputJsonSchemaProps}
          onChange={() =>
            console.log(form.getValues("inputJsonSchema")?.length)
          }
          fileTypes={[".json"]}
        />
        <InputFileField {...outputJsonSchemaProps} fileTypes={[".json"]} />
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
