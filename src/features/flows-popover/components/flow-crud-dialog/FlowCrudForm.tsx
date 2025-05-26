import { useListOptimisticMutation } from "@aventisia/ui/hooks";
import { Button } from "@aventisia/ui/buttons";
import { InputField } from "@aventisia/ui/form";
import { SelectField } from "@aventisia/ui/form";
import { SwitchField } from "@aventisia/ui/form";
import { TextareaField } from "@aventisia/ui/form";
import { Form } from "@aventisia/ui/form";
import { AutherCard } from "@aventisia/ui/form";
import { z } from "zod";
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
import { FLOWS_QUERY_KEY } from "../../constants/constants";

/* Note: Its a copy of flows-table feature of workspace app. 
  Any change to the this file is going to affect both the files/features. 
  So, we just need to replace the file's content in future.
*/

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
      {/* Agent Id */}
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
