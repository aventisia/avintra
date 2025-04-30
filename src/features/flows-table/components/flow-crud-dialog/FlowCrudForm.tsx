import { useListOptimisticMutation } from "@/react-toolkit/hooks/useListOptimisticMutation";
import { Button } from "@/react-toolkit/ui/buttons/Button";
import { Form } from "@/react-toolkit/ui/form/Form";
import { InputField } from "@/react-toolkit/ui/form/fields/InputField";
import { SelectField } from "@/react-toolkit/ui/form/fields/SelectField";
import { SwitchField } from "@/react-toolkit/ui/form/fields/SwitchField";
import { TextareaField } from "@/react-toolkit/ui/form/fields/TextareaField";
import { AutherCard } from "@/react-toolkit/ui/form/non-field/AutherCard";

import { z } from "zod";

import { flowOptimisticMutationFn } from "../../apis/flows-table-apis";
import { FLOWS_QUERY_KEY } from "../../constants";
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

export const FlowCrudForm = () => {
  // Define flow form
  const {
    form,
    rowId,
    isDirty,
    crudAction,
    isAvailable,
    availabilityMessage,
    setAvailabilityMessage,
    isCheckPending,
    handleInputChange,
    setShowDialog,
    refineFormData,
  } = useDefineFlowForm();

  // Define optimistic mutation to crete or update the flow
  const { mutate: mutateFlow } = useListOptimisticMutation<
    FlowsTableDto,
    FlowsTableDto | boolean,
    FlowsTableDto
  >([rowId], flowOptimisticMutationFn, FLOWS_QUERY_KEY);

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof flowZodSchema>) => {
    // Create or update the flow
    mutateFlow({
      payload: refineFormData(formData) as unknown as FlowsTableDto,
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
      {/* Flow Id */}
      {isReadMode && <InputField {...idProps} />}

      {/* Type. TODO: Select field doesn't update. Applied workaround for now */}
      {crudAction === "create" ? (
        <SelectField {...typeProps} />
      ) : (
        form.getValues("type") !== "" && <SelectField {...typeProps} />
      )}

      {/* Name */}
      <InputField
        {...nameProps}
        onChangeCapture={(e) => handleInputChange(e.currentTarget.value)}
        nonErrorMessage={availabilityMessage}
      />

      {/* Description */}
      <TextareaField {...descriptionProps} />

      {/* Is Disabled */}
      {crudAction !== "create" && <SwitchField {...isDisabledProps} />}

      {/* AutherCard */}
      {crudAction === "read" && (
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
            {crudAction === "create" ? "Create flow" : "Save changes"}
          </Button>
        </div>
      )}
    </Form>
  );
};
