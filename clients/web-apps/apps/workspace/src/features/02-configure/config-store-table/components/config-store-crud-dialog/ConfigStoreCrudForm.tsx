import { Button } from "@avplatform/ui/buttons";
import { useCrudDialogDirty } from "@avplatform/ui/data-table";
import { Form, InputField, SelectField, SwitchField, TextareaField } from "@avplatform/ui/form";
import { useListOptimisticMutation } from "@avplatform/ui/hooks";
import { type CrudActionType } from "@avplatform/ui/types";
import { z } from "zod";

import { JsonEditorField } from "@/components/json-editor/JsonEditorField";

import { configStoreOptimisticMutationFn } from "../../apis/config-stores-table-apis";
import {
  descriptionProps,
  idProps,
  isDisabledProps,
  nameProps,
  // tagsProps,
  typeProps,
  valueProps,
} from "../../constants/config-store-form-field-props";
import { configStoreZodSchema } from "../../constants/config-store-zod-schema";
import { ConfigStoresTableDto } from "../../dtos/config-stores-table-dto";
import { useDefineConfigStoreForm } from "../../hooks/useDefineConfigStoreForm";
import { useTableTab } from "../../hooks/useTableTab";

interface ConfigStoreCrudFormProps {
  rowId: string;
  crudAction: CrudActionType;
}

export const ConfigStoreCrudForm = ({ rowId, crudAction }: ConfigStoreCrudFormProps) => {
  const { onCloseConfirmed } = useCrudDialogDirty();

  // Define config store form
  const {
    form,
    isDirty,
    isAvailable,
    availabilityMessage,
    setAvailabilityMessage,
    isCheckPending,
    handleInputChange,
    refineFormData,
  } = useDefineConfigStoreForm({ rowId, crudAction });

  // Use this in place DATA_QUERY_KEY to handle Personal/Shared tabs list
  const { queryKey } = useTableTab();

  // Define optimistic mutation to crete or update the config store
  const { mutate: mutateConfigStore } = useListOptimisticMutation<
    ConfigStoresTableDto,
    ConfigStoresTableDto | boolean,
    ConfigStoresTableDto
  >([rowId], configStoreOptimisticMutationFn, queryKey);

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof configStoreZodSchema>) => {
    // Create or update the config store
    mutateConfigStore({
      payload: refineFormData(formData) as unknown as ConfigStoresTableDto,
      crudAction: crudAction,
    });

    // Reset the availability message
    setAvailabilityMessage(null);

    // Close the dialog
    onCloseConfirmed();
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
      {/* Config store Id */}
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
        form.getValues("type") !== "" && <SelectField {...typeProps} disabled={isReadMode} />
      )}

      {/* value  */}
      {keyType == "JSON" && (
        <JsonEditorField name="value" label="Value" isRequired={true} disabled={isReadMode} />
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
