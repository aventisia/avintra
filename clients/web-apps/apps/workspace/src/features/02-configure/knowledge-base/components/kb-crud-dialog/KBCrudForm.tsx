import { SubmitButton } from "@avplatform/ui/buttons";
import { useCrudDialogDirty } from "@avplatform/ui/data-table";
import { Form, InputField, SelectField, SwitchField, TextareaField } from "@avplatform/ui/form";
import { useListOptimisticMutation } from "@avplatform/ui/hooks";
import { type CrudActionType } from "@avplatform/ui/types";
import { useEffect } from "react";
import { z } from "zod";

import { knowledgeBaseOptimisticMutationFn } from "../../apis/knowledge-base-apis";
import {
  descriptionProps,
  idProps,
  isDisabledProps,
  nameProps,
  vectorStoreProps,
} from "../../constants/knowledge-base-form-field-props";
import { knowledgeBaseZodSchema } from "../../constants/knowledge-base-zod-schema";
import { KnowledgeBaseTableDto } from "../../dtos/knowledge-base-table-dto";
import { useDefineKnowledgeBaseForm } from "../../hooks/useDefineKnowledgeBaseForm";
import { useTableTab } from "../../hooks/useTableTab";
import { EmbeddingConfigField } from "./EmbeddingConfigField";

interface KBCrudFormProps {
  rowId: string;
  crudAction: CrudActionType;
}

export const KBCrudForm = ({ rowId, crudAction }: KBCrudFormProps) => {
  const { onCloseConfirmed } = useCrudDialogDirty();

  // Define knowledge base form
  const {
    form,
    isDirty,
    isAvailable,
    availabilityMessage,
    setAvailabilityMessage,
    isCheckPending,
    handleInputChange,
    refineFormData,
  } = useDefineKnowledgeBaseForm({ rowId, crudAction });

  // Use this in place DATA_QUERY_KEY to handle Personal/Shared tabs list
  const { queryKey } = useTableTab();

  // Define optimistic mutation to create or update the knowledge base
  const {
    mutate: mutateKnowledgeBase,
    isPending,
    isSuccess,
  } = useListOptimisticMutation<
    KnowledgeBaseTableDto,
    KnowledgeBaseTableDto | boolean,
    KnowledgeBaseTableDto
  >([rowId], knowledgeBaseOptimisticMutationFn, queryKey);

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof knowledgeBaseZodSchema>) => {
    // Create or update the knowledge base
    mutateKnowledgeBase({
      payload: refineFormData(formData) as unknown as KnowledgeBaseTableDto,
      crudAction: crudAction,
    });

    // Reset the availability message
    setAvailabilityMessage(null);

    // Close the dialog if not creating the record
    if (crudAction !== "create") onCloseConfirmed();
  };

  // Close dialog and reset form when mutation is successful
  useEffect(() => {
    if (crudAction === "create" && isSuccess) onCloseConfirmed();
  }, [isSuccess, crudAction, onCloseConfirmed]);

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
      {/* Knowledge Base Id */}
      {isReadMode && <InputField {...idProps} />}

      {/* Name */}
      <InputField
        {...nameProps}
        onChangeCapture={(e) => handleInputChange(e.currentTarget.value)}
        nonErrorMessage={availabilityMessage}
      />

      {/* Description */}
      <TextareaField {...descriptionProps} />

      {crudAction === "create" ? (
        <SelectField {...vectorStoreProps} />
      ) : (
        form.getValues("vectorStore") !== "" && (
          <SelectField {...vectorStoreProps} disabled={isReadMode} />
        )
      )}

      {/* Embedding Config */}
      <EmbeddingConfigField name="embeddingConfig" />

      {/* Is Disabled */}
      {crudAction !== "create" && <SwitchField {...isDisabledProps} />}

      {/* Submit button */}
      {!isReadMode && (
        <div className="!mt-5 flex w-full justify-end">
          <SubmitButton
            className="min-w-[5rem]"
            primaryText={crudAction === "create" ? "Create" : "Save changes"}
            secondaryText="Creating..."
            isPending={isPending}
            disabled={!isDirty || !isAvailable || isCheckPending}
          />
        </div>
      )}
    </Form>
  );
};
