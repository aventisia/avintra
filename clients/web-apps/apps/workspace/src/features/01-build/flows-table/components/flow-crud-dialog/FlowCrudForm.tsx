//Refactored Select to show description in options
import { SubmitButton } from "@avplatform/ui/buttons";
import { useCrudDialogDirty } from "@avplatform/ui/data-table";
import { AutherCard, Form, InputField, SwitchField, TextareaField } from "@avplatform/ui/form";
import { useListOptimisticMutation } from "@avplatform/ui/hooks";
import { type CrudActionType } from "@avplatform/ui/types";
import { useEffect } from "react";
import { z } from "zod";

import { SelectField } from "@/components/select-field/SelectField";

import { flowOptimisticMutationFn } from "../../apis/flows-table-apis";
import {
  descriptionProps,
  idProps,
  isDisabledProps,
  nameProps,
  typeProps,
} from "../../constants/flow-form-field-props";
import { flowZodSchema } from "../../constants/flow-zod-schema";
import { FlowsTableDto } from "../../dtos/flows-table-dto";
import { useDefineFlowForm } from "../../hooks/useDefineFlowForm";
import { useTableTab } from "../../hooks/useTableTab";

interface FlowCrudFormProps {
  rowId: string;
  crudAction: CrudActionType;
}

export const FlowCrudForm = ({ rowId, crudAction }: FlowCrudFormProps) => {
  const { onCloseConfirmed } = useCrudDialogDirty();

  // Define flow form
  const {
    form,
    isDirty,
    isAvailable,
    availabilityMessage,
    isCheckPending,
    handleInputChange,
    refineFormData,
  } = useDefineFlowForm({ rowId, crudAction });

  // Use this in place FLOWS_QUERY_KEY to handle Personal/Shared tabs list
  const { queryKey } = useTableTab();

  // Define optimistic mutation to crete or update the flow
  const {
    mutate: mutateFlow,
    isPending,
    isSuccess,
  } = useListOptimisticMutation<FlowsTableDto, FlowsTableDto | boolean, FlowsTableDto>(
    [rowId],
    flowOptimisticMutationFn,
    queryKey,
  );

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof flowZodSchema>) => {
    // Create or update the flow
    mutateFlow({
      payload: refineFormData(formData) as unknown as FlowsTableDto,
      crudAction: crudAction,
    });

    // Close the dialog if not creating the record
    if (crudAction !== "create") onCloseConfirmed();
  };

  // Close dialog and reset form when mutation is successful
  useEffect(() => {
    if (crudAction === "create" && isSuccess) onCloseConfirmed();
  }, [isSuccess, crudAction, onCloseConfirmed]);

  // Is form in read mode?
  const isReadMode = crudAction === "read";

  // Flow type is selected once at creation and frozen on update.
  const isTypeFrozen = crudAction === "update";

  // Return the form
  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(onSubmit)}
      className="px-2.5 pb-5"
      disabled={isReadMode}
    >
      {/* Flow Id */}
      {isReadMode && <InputField {...idProps} />}

      {/* Name */}
      <InputField
        {...nameProps}
        onChangeCapture={(e) => handleInputChange(e.currentTarget.value)}
        nonErrorMessage={availabilityMessage}
      />

      {/* Type: frozen after creation, editable only on create */}
      {crudAction === "create" ? (
        <SelectField {...typeProps} />
      ) : (
        form.getValues("type") !== "" && (
          <SelectField
            {...typeProps}
            disabled={isTypeFrozen}
            description="Type cannot be changed after creation."
          />
        )
      )}

      {/* Description */}
      <TextareaField {...descriptionProps} />

      {/* Is Disabled */}
      {crudAction !== "create" && <SwitchField {...isDisabledProps} />}

      {/* AutherCard: TODO: Hiding till the time we don't have a good design for this */}
      <div className="hidden">
        {crudAction === "read" && (
          <AutherCard
            createdBy={form.getValues("createdBy")}
            createdOn={form.getValues("createdOn")}
            lastModifiedBy={form.getValues("lastModifiedBy")}
            lastModifiedOn={form.getValues("lastModifiedOn")}
          />
        )}
      </div>

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
