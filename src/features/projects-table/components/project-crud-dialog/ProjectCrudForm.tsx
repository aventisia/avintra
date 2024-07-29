import { useListOptimisticMutation } from "@/react-toolkit/hooks/useListOptimisticMutation";
import { Button } from "@/react-toolkit/ui/buttons/Button";
import { InputField } from "@/react-toolkit/ui/form/fields/InputField";
import { SelectField } from "@/react-toolkit/ui/form/fields/SelectField";
import { SwitchField } from "@/react-toolkit/ui/form/fields/SwitchField";
import { TextareaField } from "@/react-toolkit/ui/form/fields/TextareaField";
import { Form } from "@/react-toolkit/ui/form/Form";
import { AutherCard } from "@/react-toolkit/ui/form/non-field/AutherCard";
import { z } from "zod";
import { projectOptimisticMutationFn } from "../../apis/projects-table-apis";
import { DATA_QUERY_KEY } from "../../constants/constants";
import {
  descriptionProps,
  idProps,
  isDisabledProps,
  nameProps,
  typeProps,
} from "../../constants/project-form-field-props";
import { projectZodSchema } from "../../constants/project-zod-schema";
import { ProjectsTableDto } from "../../dtos/projects-table-dto";
import { useDefineProjectForm } from "../../hooks/useDefineProjectForm";

export const ProjectCrudForm = () => {
  // Define project form
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
  } = useDefineProjectForm();

  // Define optimistic mutation to crete or update the project
  const { mutate: mutateProject } = useListOptimisticMutation<
    ProjectsTableDto,
    ProjectsTableDto | boolean,
    ProjectsTableDto
  >(projectOptimisticMutationFn, DATA_QUERY_KEY);

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof projectZodSchema>) => {
    // Create or update the project
    mutateProject({
      id: rowId,
      payload: refineFormData(formData) as unknown as ProjectsTableDto,
      crudAction: crudAction,
    });

    // Reset form
    form.reset(formData);

    // Reset the availability message
    setAvailabilityMessage(null);

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
        {isReadMode && <InputField {...idProps} />}

        {/* Type */}
        {form.getValues("type") !== undefined && (
          <SelectField {...typeProps} disabled={isReadMode} />
        )}

        {/* Name */}
        <InputField
          {...nameProps}
          disabled={isReadMode}
          onChangeCapture={(e) => handleInputChange(e.currentTarget.value)}
          nonErrorMessage={availabilityMessage}
        />

        {/* Description */}
        <TextareaField {...descriptionProps} disabled={isReadMode} />

        {/* Is Disabled */}
        {crudAction !== "create" && (
          <SwitchField {...isDisabledProps} disabled={isReadMode} />
        )}

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
        {crudAction !== "read" && (
          <div className="!mt-5 flex w-full justify-end">
            <Button
              type="submit"
              disabled={!isDirty || !isAvailable || isCheckPending}
              className="min-w-[5rem]"
            >
              {crudAction === "create" ? "Create project" : "Save changes"}
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
};
