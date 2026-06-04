import { JsonEditorField } from "@/components/json-editor/JsonEditorField";

import { Button } from "@aventisia/ui/buttons";
import {
  Form,
  InputField,
  SelectField,
  SwitchField,
  TextareaField,
} from "@aventisia/ui/form";
import { useListOptimisticMutation } from "@aventisia/ui/hooks";
import { z } from "zod";

import { keystoreOptimisticMutationFn } from "../../apis/keystores-table-apis";
import {
  descriptionProps,
  idProps,
  isDisabledProps,
  nameProps,
  // tagsProps,
  typeProps,
  valueProps,
} from "../../constants/keystore-form-field-props";
import { keystoreZodSchema } from "../../constants/keystore-zod-schema";
import { KeystoresTableDto } from "../../dtos/keystores-table-dto";
import { useDefineKeystoreForm } from "../../hooks/useDefineKeystoreForm";
import { useTableTab } from "../../hooks/useTableTab";

export const KeystoreCrudForm = () => {
  // Define keystore form
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
  } = useDefineKeystoreForm();

  // Use this in place DATA_QUERY_KEY to handle Personal/Shared tabs list
  const { queryKey } = useTableTab();

  // Define optimistic mutation to crete or update the keystore
  const { mutate: mutateKeystore } = useListOptimisticMutation<
    KeystoresTableDto,
    KeystoresTableDto | boolean,
    KeystoresTableDto
  >([rowId], keystoreOptimisticMutationFn, queryKey);

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof keystoreZodSchema>) => {
    // Create or update the keystore
    mutateKeystore({
      payload: refineFormData(formData) as unknown as KeystoresTableDto,
      crudAction: crudAction,
    });

    // Reset the availability message
    setAvailabilityMessage(null);

    // Close the dialog
    setShowDialog(false);
  };

  // Is form in read mode?
  const isReadMode = crudAction === "read";

  const keyType = form.watch("type");

  // Return the form
  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(onSubmit)}
      className="px-2.5 pb-5"
      disabled={isReadMode}
    >
      {/* Keystore Id */}
      {isReadMode && <InputField {...idProps} />}

      {/* Name */}
      <InputField
        {...nameProps}
        onChangeCapture={(e) => handleInputChange(e.currentTarget.value)}
        nonErrorMessage={availabilityMessage}
        autoFocus
        disabled={crudAction !== "create"}
      />
      {crudAction === "create" ? (
        <SelectField {...typeProps} />
      ) : (
        form.getValues("type") !== "" && (
          <SelectField {...typeProps} disabled={isReadMode} />
        )
      )}

      {/* value  */}
      {keyType == "JSON" && (
        <JsonEditorField
          name="value"
          label="Value"
          isRequired={true}
          disabled={isReadMode}
        />
      )}

      {keyType == "TEXT" && <InputField {...valueProps} />}

      {keyType == "BOOLEAN" && (
        <SelectField
          name="value"
          label="Value"
          isRequired
          selectOptions={[
            { label: "True", value: "true" },
            { label: "False", value: "false" },
          ]}
        />
      )}

      {/* description  */}
      <TextareaField {...descriptionProps} />

      {/* Tags  */}
      {/* <InputField
        {...{
          ...tagsProps,
          placeholder: crudAction !== "read" ? "inovice,billing" : "",
        }}
      /> */}

      {/* Is Disabled */}
      {crudAction !== "create" && <SwitchField {...isDisabledProps} />}

      {/* Submit button */}
      {!isReadMode && (
        <div className="!mt-5 flex w-full justify-end">
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
