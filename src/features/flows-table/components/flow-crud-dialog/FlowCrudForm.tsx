import { useListOptimisticMutation } from "@/react-toolkit/hooks/useListOptimisticMutation";
import { Button } from "@/react-toolkit/ui/buttons/Button";
import { InputField } from "@/react-toolkit/ui/form/fields/InputField";
import { SelectField } from "@/react-toolkit/ui/form/fields/SelectField";
import { SwitchField } from "@/react-toolkit/ui/form/fields/SwitchField";
import { TextareaField } from "@/react-toolkit/ui/form/fields/TextareaField";
import { Form } from "@/react-toolkit/ui/form/Form";
import { AutherCard } from "@/react-toolkit/ui/form/non-field/AutherCard";
import { z } from "zod";
import { flowOptimisticMutationFn } from "../../apis/flows-table-apis";
import {
  descriptionProps,
  idProps,
  isDisabledProps,
  nameProps,
  projectIdProps,
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
    flowsQueryKey,
    setShowDialog,
    refineFormData,
  } = useDefineFlowForm();

  // Define optimistic mutation to crete or update the flow
  const { mutate: mutateFlow } = useListOptimisticMutation<
    FlowsTableDto,
    FlowsTableDto | boolean,
    FlowsTableDto
  >(flowOptimisticMutationFn, flowsQueryKey);

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof flowZodSchema>) => {
    // Create or update the flow
    mutateFlow({
      id: rowId,
      payload: refineFormData(formData) as unknown as FlowsTableDto,
      crudAction: crudAction,
    });

    // Close the dialog
    setShowDialog(false);
  };

  // Is form in read mode?
  const isReadMode = crudAction === "read";

  // Return the form
  return (
    <Form methods={form}>
      <form
        className="w-full space-y-3.5 px-2.5 pb-5"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        {/* Project Id */}
        {isReadMode && <InputField {...projectIdProps} />}

        {/* Flow Id */}
        {isReadMode && <InputField {...idProps} />}

        {/* Type */}
        {form.getValues("type") !== undefined && (
          <SelectField {...typeProps} disabled={isReadMode} />
        )}

        {/* Name */}
        <InputField {...nameProps} disabled={isReadMode} />

        {/* Description */}
        <TextareaField {...descriptionProps} disabled={isReadMode} />

        {/* Is Disabled */}
        {crudAction !== "create" && (
          <SwitchField {...isDisabledProps} disabled={isReadMode} />
        )}

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
        {crudAction !== "read" && (
          <div className="!mt-5 flex w-full justify-end">
            <Button type="submit" disabled={!isDirty} className="min-w-[5rem]">
              {crudAction === "create" ? "Create flow" : "Save changes"}
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
};
