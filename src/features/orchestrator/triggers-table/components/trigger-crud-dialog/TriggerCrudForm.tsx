import { Button } from "@aventisia/ui/buttons";
import {
  AutherCard,
  Form,
  InputField,
  SelectField,
  SwitchField,
} from "@aventisia/ui/form";
import { useListOptimisticMutation } from "@aventisia/ui/hooks";
import { z } from "zod";

import { triggerOptimisticMutationFn } from "../../apis/triggers-table-apis";
import { DATA_QUERY_KEY } from "../../constants";
import {
  generateFailedAlert,
  generateStuckAlert,
  idProps,
  isDisabledProps,
  nameProps,
  scheduleAutoDisabling,
  scheduleEnding,
  selectFrequencyProps,
  selectJobPriorityProps,
  selectProcessProps,
  selectRepetationProps,
  selectRuntimeTypeProps,
  selectTimeZoneProps,
} from "../../constants/trigger-form-field-props";
import { triggerZodSchema } from "../../constants/trigger-zod-schema";
import { TriggersTableDto } from "../../dtos/triggers-table-dto";
import { useDefineTriggerForm } from "../../hooks/useDefineTriggerForm";

export const TriggerCrudForm = () => {
  // Define trigger form
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
  } = useDefineTriggerForm();

  // Define optimistic mutation to crete or update the trigger
  const { mutate: mutatetrigger } = useListOptimisticMutation<
    TriggersTableDto,
    TriggersTableDto | boolean,
    TriggersTableDto
  >([rowId], triggerOptimisticMutationFn, DATA_QUERY_KEY);

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof triggerZodSchema>) => {
    // Create or update the trigger
    mutatetrigger({
      payload: refineFormData(formData) as unknown as TriggersTableDto,
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
      {/* trigger Id */}
      {isReadMode && <InputField {...idProps} />}

      {/* Name */}
      <InputField
        {...nameProps}
        onChangeCapture={(e) => handleInputChange(e.currentTarget.value)}
        nonErrorMessage={availabilityMessage}
      />

      <SelectField {...selectProcessProps} />

      <div className="grid grid-cols-2 gap-2">
        <SelectField {...selectJobPriorityProps} />
        <SelectField {...selectRuntimeTypeProps} />
      </div>

      <SelectField {...selectTimeZoneProps} />
      <SelectField {...selectFrequencyProps} />

      <div className="flex flex-col rounded-md border p-4">
        <SelectField {...selectRepetationProps} />

        <SwitchField {...scheduleEnding} />
        <SwitchField {...scheduleAutoDisabling} />
        <SwitchField {...generateStuckAlert} />
        <SwitchField {...generateFailedAlert} />
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
            {crudAction === "create" ? "Create" : "Save changes"}
          </Button>
        </div>
      )}
    </Form>
  );
};
