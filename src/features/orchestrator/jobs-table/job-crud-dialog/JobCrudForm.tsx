import { useListOptimisticMutation } from "@/react-toolkit/hooks/useListOptimisticMutation";
import { Button } from "@/react-toolkit/ui/buttons/Button";
import { InputField } from "@/react-toolkit/ui/form/fields/InputField";
import { SwitchField } from "@/react-toolkit/ui/form/fields/SwitchField";
import { Form } from "@/react-toolkit/ui/form/Form";
import { AutherCard } from "@/react-toolkit/ui/form/non-field/AutherCard";
import { z } from "zod";
import { DATA_QUERY_KEY } from "../constants";
import {
  idProps,
  isDisabledProps,
  nameProps,
} from "../constants/job-form-field-props";
import { jobZodSchema } from "../constants/job-zod-schema";
import { JobsTableDto } from "../dtos/jobs-table-dto";
import { useDefineJobForm } from "../hooks/useDefineJobForm";
import { JobOptimisticMutationFn } from "../apis/jobs-table-apis";

export const JobCrudForm = () => {
  // Define job form
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
  } = useDefineJobForm();

  // Define optimistic mutation to crete or update the job
  const { mutate: mutatejob } = useListOptimisticMutation<
    JobsTableDto,
    JobsTableDto | boolean,
    JobsTableDto
  >([rowId], JobOptimisticMutationFn, DATA_QUERY_KEY);

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof jobZodSchema>) => {
    // Create or update the job
    mutatejob({
      payload: refineFormData(formData) as unknown as JobsTableDto,
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
      {/* job Id */}
      {isReadMode && <InputField {...idProps} />}

      {/* Name */}
      <InputField
        {...nameProps}
        onChangeCapture={(e) => handleInputChange(e.currentTarget.value)}
        nonErrorMessage={availabilityMessage}
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
            {crudAction === "create" ? "Create job" : "Save changes"}
          </Button>
        </div>
      )}
    </Form>
  );
};
