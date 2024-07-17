import {
  DialogContent,
  DialogDefaultHeader,
  Form,
  FormField,
  ScrollArea,
  Button,
} from "@/react-toolkit/components/ui";
import { useDefineProjectForm } from "../hooks/useDefineProjectForm";
import { useListOptimisticMutation } from "@/react-toolkit/hooks";
import {
  DATA_QUERY_KEY,
  getDialogHeadingDescription,
} from "../constants/constants";
import { projectOptimisticMutationFn } from "../apis/projects-table-apis";
import { ProjectsTableDto } from "../dtos/projects-table-dto";
import { z } from "zod";
import { projectZodSchema } from "../constants/project-zod-schema";
import { ProjectTypesEnum } from "@/react-toolkit/enums";
import { enumToArray } from "@/react-toolkit/utils";
import {
  InputField,
  TextareaField,
  SelectField,
  AutherCard,
  SwitchField,
} from "@/react-toolkit/components/form";

/**
 * Renders the dialog content for creating or updating a project.
 *
 * @returns The JSX element representing the dialog content.
 */
export const ProjectCrudDialogContent = () => {
  // 1. Define project form
  const { form, rowId, crudAction, setShowDialog, refineFormData } =
    useDefineProjectForm();

  // 2. Define optimistic mutation to crete or update the project
  const { mutate: mutateProject } = useListOptimisticMutation<
    ProjectsTableDto,
    ProjectsTableDto | boolean,
    ProjectsTableDto
  >(projectOptimisticMutationFn, DATA_QUERY_KEY);

  // 3. Get dialog heading and description
  const dialogHeaderOptions = getDialogHeadingDescription(crudAction);

  // 4. Define submit handler
  const onSubmit = (formData: z.infer<typeof projectZodSchema>) => {
    // Create or update the project
    mutateProject({
      id: rowId,
      payload: refineFormData(formData) as unknown as ProjectsTableDto,
      crudAction: crudAction,
    });

    // Close the dialog
    setShowDialog(false);
  };

  // 5. Return the component
  return (
    // prettier-ignore
    <DialogContent side={"right"} className="!max-w-[32rem]">
      <DialogDefaultHeader
        className="px-3.5 py-3 text-lg tracking-wide"
        heading={dialogHeaderOptions.heading}
        description={dialogHeaderOptions.description}
      />
      <ScrollArea className="h-[calc(100vh-3.8rem)] px-2.5 pb-0 pt-4">
        <Form {...form}>
          <form className="w-full space-y-3.5 px-2.5 pb-5" onSubmit={form.handleSubmit(onSubmit)}>
            
            {/* Project Id */}
            {crudAction === "read" && (
              <FormField name="id" control={form.control} render={({ field }) => (
                  <InputField field={field} fieldData={{
                    label: "Project Id",
                    disabled: true,
                  }} />
                )}
              />
            )}
            
            {/* Type */}
            <FormField name="type" control={form.control} render={({ field }) => (
                <SelectField field={field} fieldData={{
                  label: "Type",
                  disabled: crudAction === "read",
                  isRequired: true,
                  selectOptions: enumToArray(ProjectTypesEnum),
                }} />
              )}
            />

            {/* Name */}
            <FormField name="name" control={form.control} render={({ field }) => (
                <InputField field={field} fieldData={{
                  label: "Name",
                  disabled: crudAction === "read",
                  isRequired: true,
                }} />
              )}
            />

            {/* Description */}
            <FormField name="description" control={form.control} render={({ field }) => (
                <TextareaField field={field} fieldData={{
                  label: "Description",
                  disabled: crudAction === "read",
                  className: "min-h-[6rem]"
                }} />
              )}
            />
            
            {/* Is Disabled */}
            {crudAction !== "create" && (
              <FormField name="isDisabled" control={form.control} render={({ field }) => (
                  <SwitchField field={field} fieldData={{
                    label: "Disable Record",
                    description: "Disable this record if it's been outdated, or not required anymore",
                    disabled: crudAction === "read",
                  }} />
                )}
              />
            )}

            {/* AutherCard */}
            {crudAction === "read" && (
              <AutherCard
                createdBy={form.getValues("createdBy")} createdOn={form.getValues("createdOn")}
                lastModifiedBy={form.getValues("lastModifiedBy")} lastModifiedOn={form.getValues("lastModifiedOn")}/>
            )}

            {/* Submit button */}
            {crudAction !== "read" && (
              <div className="!mt-5 flex w-full justify-end">
                <Button type="submit" className="min-w-[5rem]">
                  {crudAction === "create" ? "Create project" : "Save changes"}
                </Button>
              </div>
            )}
          </form>
        </Form>
      </ScrollArea>
    </DialogContent>
  );
};
