import { SubmitButton } from "@aventisia/ui/buttons";
import {
  Form,
  InputField,
  SelectField,
  TextareaField,
} from "@aventisia/ui/form";
import { useListOptimisticMutation } from "@aventisia/ui/hooks";
import { useEffect } from "react";
import { z } from "zod";

import { JsonEditorField } from "@/components/json-editor/JsonEditorField";

import { jobOptimisticMutationFn } from "../../apis/jobs-table-apis";
import {
  executionLocationProps,
  flowVersionIdProps,
  idProps,
  priorityProps,
  remarksProps,
  retryCountProps,
  statusProps,
  triggerTypeProps,
} from "../../constants/job-form-field-props";
import { jobInsertZodSchema } from "../../constants/job-update-zod-schema";
import { DATA_QUERY_KEY } from "../../constants/variables";
import { JobInsertDto } from "../../dtos/job-insert-dto";
import { JobUpdateDto } from "../../dtos/job-update-dto";
import { JobsTableRowDto } from "../../dtos/jobs-table-row-dto";
import { useDefineJobForm } from "../../hooks/useDefineJobForm";

export const JobCrudForm = () => {
  const { form, rowId, crudAction, isDirty, setShowDialog, refineFormData } =
    useDefineJobForm();

  const {
    mutate: mutateJob,
    isPending,
    isSuccess,
  } = useListOptimisticMutation<
    JobInsertDto | JobUpdateDto,
    JobsTableRowDto | boolean,
    JobsTableRowDto
  >([rowId], jobOptimisticMutationFn, DATA_QUERY_KEY);

  const isReadMode = crudAction === "read";
  const isCreateMode = crudAction === "create";

  const onSubmit = (formData: z.infer<typeof jobInsertZodSchema>) => {
    mutateJob({
      payload: refineFormData(formData),
      crudAction,
    });

    if (!isCreateMode) setShowDialog(false);
  };

  useEffect(() => {
    if (isCreateMode && isSuccess) setShowDialog(false);
  }, [isCreateMode, isSuccess, setShowDialog]);

  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(onSubmit)}
      className="px-2.5 pb-5"
      disabled={isReadMode}
    >
      {!isCreateMode && <InputField {...idProps} />}

      {isCreateMode && (
        <>
          <InputField {...flowVersionIdProps} autoFocus />
          <SelectField {...triggerTypeProps} />
          <InputField {...retryCountProps} />
          <InputField {...executionLocationProps} />
        </>
      )}

      <SelectField {...priorityProps} />

      {!isCreateMode && <SelectField {...statusProps} />}

      {!isCreateMode && <TextareaField {...remarksProps} />}

      {(isCreateMode || isReadMode) && (
        <JsonEditorField
          name="jobInputData"
          label="Input Data"
          isRequired={false}
          disabled={isReadMode}
        />
      )}

      {isReadMode && (
        <>
          <JsonEditorField
            name="jobOutputData"
            label="Output Data"
            isRequired={false}
            disabled
          />
          <JsonEditorField
            name="lastNodeLog"
            label="Last Node Log"
            isRequired={false}
            disabled
          />
        </>
      )}

      {!isReadMode && (
        <div className="!mt-5 flex w-full justify-end">
          <SubmitButton
            className="min-w-[5rem]"
            primaryText={isCreateMode ? "Create" : "Save changes"}
            secondaryText={isCreateMode ? "Creating..." : "Saving..."}
            isPending={isPending}
            disabled={!isDirty}
          />
        </div>
      )}
    </Form>
  );
};
