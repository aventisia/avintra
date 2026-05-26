import { SubmitButton } from "@aventisia/ui/buttons";
import { Form, InputField, SelectField, SwitchField } from "@aventisia/ui/form";
import { useListOptimisticMutation } from "@aventisia/ui/hooks";
import { useEffect } from "react";
import { z } from "zod";

import { machineOptimisticMutationFn } from "../../apis/machines-table-apis";
import { DATA_QUERY_KEY } from "../../constants";
import {
  environmentTypeProps,
  hostnameProps,
  idProps,
  isDisabledProps,
  nameProps,
  os_unique_idProps,
} from "../../constants/machine-form-field-props";
import { machineZodSchema } from "../../constants/machine-zod-schema";
import { MachinesTableDto } from "../../dtos/machines-table-dto";
import { useDefineMachineForm } from "../../hooks/useDefineMachineForm";

import { AddedByAutherCard } from "./AddedByAutherCard";

export const MachineCrudForm = () => {
  // Define machine form
  const { form, rowId, crudAction, isDirty, setShowDialog, refineFormData } =
    useDefineMachineForm();

  // Define optimistic mutation to crete or update the machine
  const {
    mutate: mutateMachine,
    isPending,
    isSuccess,
  } = useListOptimisticMutation<
    MachinesTableDto,
    MachinesTableDto | boolean,
    MachinesTableDto
  >([rowId], machineOptimisticMutationFn, DATA_QUERY_KEY);

  // Is form in read mode?
  const isReadMode = crudAction === "read";

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof machineZodSchema>) => {
    const payload = {
      ...(refineFormData(formData) as unknown as MachinesTableDto),
    };

    // Create or update the machine
    mutateMachine({
      payload: payload,
      crudAction: crudAction,
    });

    // Reset the availability message
    // setAvailabilityMessage(null);

    // Close the dialog if not creating the record
    if (crudAction !== "create") setShowDialog(false);
  };

  // Close dialog and reset form when mutation is successful
  useEffect(() => {
    if (crudAction === "create" && isSuccess) setShowDialog(false);
  }, [isSuccess, crudAction, setShowDialog]);

  // Return the form
  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(onSubmit)}
      className="px-2.5 pb-5"
      disabled={isReadMode}
    >
      {/* Machine Id */}
      {crudAction === "update" && <InputField {...idProps} disabled />}

      {/* Name */}
      <InputField
        {...nameProps}
        // onChangeCapture={(e) => handleInputChange(e.currentTarget.value)}
        // nonErrorMessage={availabilityMessage}
        disabled={isReadMode}
      />

      {/* <div className="grid grid-cols-2 gap-2">
        {crudAction === "create" ? (
          <SelectField {...osTypeProps} disabled={isReadMode} />
        ) : (
          form.getValues("type") !== "" && (
            <SelectField {...osTypeProps} disabled={isReadMode} />
          )
        )}

        <InputField {...ipAddressProps} disabled={isReadMode} />
      </div> */}

      {/* Host Name */}
      <InputField {...hostnameProps} disabled={isReadMode} />

      {/* OS Id */}
      <InputField {...os_unique_idProps} disabled={isReadMode} />

      {/* environment */}
      {form.getValues("environment") !== "" && (
        <SelectField {...environmentTypeProps} disabled={isReadMode} />
      )}

      {/* Is Disabled */}
      {crudAction !== "create" && (
        <SwitchField {...isDisabledProps} disabled={isReadMode} />
      )}

      {/* AutherCard */}
      {isReadMode && (
        <AddedByAutherCard
          addedBy={form.getValues("createdBy")}
          addedOn={form.getValues("createdOn")}
          lastModifiedBy={form.getValues("lastModifiedBy")}
          lastModifiedOn={form.getValues("lastModifiedOn")}
        />
      )}

      {/* Submit button */}
      {!isReadMode && (
        <div className="!mt-5 flex w-full justify-end">
          <SubmitButton
            className="min-w-[5rem]"
            primaryText={crudAction === "create" ? "Add" : "Save changes"}
            secondaryText="Adding..."
            isPending={isPending}
            disabled={!isDirty}
          />
        </div>
      )}
    </Form>
  );
};
