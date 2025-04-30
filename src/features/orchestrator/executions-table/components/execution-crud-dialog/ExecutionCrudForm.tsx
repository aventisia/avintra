import { Button } from "@aventisia/ui/buttons";
import { Form } from "@aventisia/ui/form";
import { InputField } from "@aventisia/ui/form";
import { SwitchField } from "@aventisia/ui/form";
import { AutherCard } from "@aventisia/ui/form";
import { useListOptimisticMutation } from "@aventisia/ui/hooks";
import { z } from "zod";

import { ExecutionOptimisticMutationFn } from "../../apis/executions-table-apis";
import { DATA_QUERY_KEY } from "../../constants";
import {
  idProps,
  isDisabledProps,
  nameProps,
} from "../../constants/execution-form-field-props";
import { executionZodSchema } from "../../constants/execution-zod-schema";
import { ExecutionsTableDto } from "../../dtos/executions-table-dto";
import { useDefineExecutionForm } from "../../hooks/useDefineExecutionForm";

export const ExecutionCrudForm = () => {
  // Define execution form
  const {
    form,
    isDirty,
    rowId,
    crudAction,
    isAvailable,
    // availabilityMessage,
    // setAvailabilityMessage,
    isCheckPending,
    // handleInputChange,
    setShowDialog,
    refineFormData,
  } = useDefineExecutionForm();

  // Define optimistic mutation to crete or update the execution
  const { mutate: mutateexecution } = useListOptimisticMutation<
    ExecutionsTableDto,
    ExecutionsTableDto | boolean,
    ExecutionsTableDto
  >([rowId], ExecutionOptimisticMutationFn, DATA_QUERY_KEY);

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof executionZodSchema>) => {
    // Create or update the execution
    mutateexecution({
      payload: refineFormData(formData) as unknown as ExecutionsTableDto,
      crudAction: crudAction,
    });

    // Reset the availability message
    // setAvailabilityMessage(null);

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
      {/* execution Id */}
      {isReadMode && <InputField {...idProps} />}

      {/* Name */}
      <InputField
        {...nameProps}
        // onChangeCapture={(e) => handleInputChange(e.currentTarget.value)}
        // nonErrorMessage={availabilityMessage}
      />

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
            {crudAction === "create" ? "Create execution" : "Save changes"}
          </Button>
        </div>
      )}
    </Form>
  );
};
