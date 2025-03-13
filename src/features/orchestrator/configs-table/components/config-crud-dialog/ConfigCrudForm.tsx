import { useListOptimisticMutation } from "@/react-toolkit/hooks/useListOptimisticMutation";
import { Button } from "@/react-toolkit/ui/buttons/Button";
import { InputField } from "@/react-toolkit/ui/form/fields/InputField";
import { SelectField } from "@/react-toolkit/ui/form/fields/SelectField";
import { SwitchField } from "@/react-toolkit/ui/form/fields/SwitchField";
import { Form } from "@/react-toolkit/ui/form/Form";
import { AutherCard } from "@/react-toolkit/ui/form/non-field/AutherCard";
import { z } from "zod";
import { configOptimisticMutationFn } from "../../apis/configs-table-apis";
import { DATA_QUERY_KEY } from "../../constants";
import {
  accessLevelProps,
  idProps,
  isDisabledProps,
  isEncrypterProps,
  nameProps,
  typeProps,
  valueOptionProps,
} from "../../constants/config-form-field-props";
import { configZodSchema } from "../../constants/config-zod-schema";
import { ConfigsTableDto } from "../../dtos/configs-table-dto";
import { useDefineConfigForm } from "../../hooks/useDefineConfigForm";
import { TextareaField } from "@/react-toolkit/ui/form/fields/TextareaField";

export const ConfigCrudForm = () => {
  // Define config form
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
  } = useDefineConfigForm();

  // Define optimistic mutation to crete or update the config
  const { mutate: mutateConfig } = useListOptimisticMutation<
    ConfigsTableDto,
    ConfigsTableDto | boolean,
    ConfigsTableDto
  >([rowId], configOptimisticMutationFn, DATA_QUERY_KEY);

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof configZodSchema>) => {
    // Create or update the config
    mutateConfig({
      payload: refineFormData(formData) as unknown as ConfigsTableDto,
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
      {/* Config Id */}
      {isReadMode && <InputField {...idProps} />}

      {/* Name */}
      <InputField
        {...nameProps}
        onChangeCapture={(e) => handleInputChange(e.currentTarget.value)}
        nonErrorMessage={availabilityMessage}
      />

      {crudAction === "create" ? (
        <SelectField {...typeProps} />
      ) : (
        form.getValues("type") !== "" && <SelectField {...typeProps} />
      )}

      {crudAction === "create" ? (
        <SelectField {...accessLevelProps} />
      ) : (
        form.getValues("accessLevel") !== "" && (
          <SelectField {...accessLevelProps} />
        )
      )}

      {/* value  */}
      <TextareaField {...valueOptionProps} />

      {/* Is encrtypted */}
      <SwitchField {...isEncrypterProps} />

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
            {crudAction === "create" ? "Create config" : "Save changes"}
          </Button>
        </div>
      )}
    </Form>
  );
};
