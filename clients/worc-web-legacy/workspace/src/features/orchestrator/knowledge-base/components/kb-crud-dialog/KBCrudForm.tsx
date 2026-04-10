import { Button } from "@aventisia/ui/buttons";
import {
  Form,
  InputField,
  SelectField,
  SwitchField,
  TextareaField,
} from "@aventisia/ui/form";
import { useListOptimisticMutation } from "@aventisia/ui/hooks";
import { useEffect } from "react";
import { z } from "zod";

import { keystoreOptimisticMutationFn } from "../../apis/keystores-table-apis";
import { DATA_QUERY_KEY } from "../../constants";
import {
  descriptionProps,
  // embeddingModelProps,
  idProps,
  isDisabledProps,
  nameProps,
  vectorStoreProps,
} from "../../constants/knowledge-base-form-field-props";
import { knowledgeBaseZodSchema } from "../../constants/knowledge-base-zod-schema";
import { KnowledgeBaseTableDto } from "../../dtos/knowledge-base-table-dto";
import { useDefineKnowledgeBaseForm } from "../../hooks/useDefineKnowledgeBaseForm";
import { ModelConfigField } from "./ModelConfigField";

export const KBCrudForm = () => {
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
  } = useDefineKnowledgeBaseForm();

  // Define optimistic mutation to crete or update the keystore
  const { mutate: mutateKeystore, isSuccess } = useListOptimisticMutation<
    KnowledgeBaseTableDto,
    KnowledgeBaseTableDto | boolean,
    KnowledgeBaseTableDto
  >([rowId], keystoreOptimisticMutationFn, DATA_QUERY_KEY);

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof knowledgeBaseZodSchema>) => {
    console.log("KB CRUD", formData);
    // Create or update the keystore
    mutateKeystore({
      payload: refineFormData(formData) as unknown as KnowledgeBaseTableDto,
      crudAction: crudAction,
    });

    // Reset the availability message
    setAvailabilityMessage(null); // Close the dialog if not creating the record
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

      {/* description  */}
      <TextareaField {...descriptionProps} />

      {crudAction === "create" ? (
        <SelectField {...vectorStoreProps} />
      ) : (
        form.getValues("vectorStore") !== "" && (
          <SelectField {...vectorStoreProps} disabled={isReadMode} />
        )
      )}

      <ModelConfigField name="kb" />

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
