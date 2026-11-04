import { SubmitButton } from "@avplatform/ui/buttons";
import { CrudDialogActions, useCrudDialogDirty } from "@avplatform/ui/crud-dialog";
import { Form, InputField, SelectField, SwitchField, TextareaField } from "@avplatform/ui/form";
import { useListOptimisticMutation } from "@avplatform/ui/hooks";
import { useEffect } from "react";
import { z } from "zod";

import { knowledgeBaseOptimisticMutationFn } from "../../apis/knowledge-base-apis";
import {
  descriptionProps,
  isDisabledProps,
  nameProps,
  vectorStoreProps,
} from "../../constants/knowledge-base-form-field-props.constant";
import { knowledgeBaseZodSchema } from "../../constants/knowledge-base-zod-schema";
import { KnowledgeBaseTableDto } from "../../dtos/knowledge-base-table-dto";
import { useDefineKnowledgeBaseForm } from "../../hooks/useDefineKnowledgeBaseForm";
import { useTableTab } from "../../hooks/useTableTab";
import { EmbeddingConfigField } from "./EmbeddingConfigField";

interface KBCrudFormProps {
  rowId: string;
  crudAction: "create" | "update";
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

  return (
    <Form methods={form} onSubmit={form.handleSubmit(onSubmit)}>
      <InputField
        {...nameProps}
        onChangeCapture={(e) => handleInputChange(e.currentTarget.value)}
        nonErrorMessage={availabilityMessage}
        disabled={crudAction !== "create"}
      />
      <TextareaField {...descriptionProps} />
      {(crudAction === "create" || form.getValues("vectorStore") !== "") && (
        <SelectField {...vectorStoreProps} />
      )}
      <EmbeddingConfigField name="embeddingConfig" />
      {crudAction !== "create" && <SwitchField {...isDisabledProps} />}
      <CrudDialogActions>
        <SubmitButton
          primaryText={crudAction === "create" ? "Create knowledge base" : "Save changes"}
          secondaryText={crudAction === "create" ? "Creating..." : "Saving..."}
          isPending={isPending}
          disabled={!isDirty || !isAvailable || isCheckPending}
        />
      </CrudDialogActions>
    </Form>
  );
};
