import { useListOptimisticMutation } from "@/react-toolkit/hooks/useListOptimisticMutation";
import { InputField } from "@/react-toolkit/ui/form/fields/InputField";
import { SelectField } from "@/react-toolkit/ui/form/fields/SelectField";
import { SwitchField } from "@/react-toolkit/ui/form/fields/SwitchField";
import { Form } from "@/react-toolkit/ui/form/Form";
import { AutherCard } from "@/react-toolkit/ui/form/non-field/AutherCard";
import { z } from "zod";
import { DATA_QUERY_KEY } from "../../constants";
import {
  hostnameProps as hosthnameProps,
  idProps,
  ipAddressProps,
  isDisabledProps,
  nameProps,
  typeEnvironmentProps,
  typeProps,
} from "../../constants/machine-form-field-props";
import { machineZodSchema } from "../../constants/machine-zod-schema";
import { useDefineMachineForm } from "../../hooks/useDefineMachineForm";
import { MachineDto } from "../../dtos/machine-dto";
import { machineOptimisticMutationFn } from "../../apis/machine-apis";
import { Button } from "@/react-toolkit/ui/buttons/Button";

export const MachineCrudForm = () => {
  // Define machine form
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
  } = useDefineMachineForm();

  // Define optimistic mutation to crete or update the machine
  const { mutate: mutateMachine } = useListOptimisticMutation<
    MachineDto,
    MachineDto | boolean,
    MachineDto
  >([rowId], machineOptimisticMutationFn, DATA_QUERY_KEY);

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof machineZodSchema>) => {
    // Create or update the machine
    mutateMachine({
      payload: refineFormData(formData) as unknown as MachineDto,
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
      {/* Machine Id */}
      {isReadMode && <InputField {...idProps} />}

      {crudAction === "create" ? (
        <SelectField {...typeProps} />
      ) : (
        <SelectField disabled={!form.getValues("type")} {...typeProps} />
      )}

      {/* environment */}
      <SelectField {...typeEnvironmentProps} />

      {/* Name */}
      <InputField
        {...nameProps}
        onChangeCapture={(e) => handleInputChange(e.currentTarget.value)}
        nonErrorMessage={availabilityMessage}
      />

      {/* Host Name */}
      <InputField {...hosthnameProps} />

      {/* Host Name */}
      <InputField {...ipAddressProps} />

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
          <Button
            type="submit"
            disabled={!isDirty || !isAvailable || isCheckPending}
            className="min-w-[5rem]"
          >
            {crudAction === "create" ? "Create Machine" : "Save changes"}
          </Button>
        </div>
      )}
    </Form>
  );
};
