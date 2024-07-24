import {
  ProjectsTableDto,
  projectZodSchema,
  useDefineProjectForm,
  DATA_QUERY_KEY,
  getDialogHeadingDescription,
  projectOptimisticMutationFn,
  idProps,
  typeProps,
  descriptionProps,
  isDisabledProps,
  nameProps,
  useIsProjectNameAvailable
} from "@/features/projects-table";
import {
  DialogContent,
  DialogDefaultHeader,
  Form,
  ScrollArea,
  Button,
} from "@/react-toolkit/components/ui";
import { useListOptimisticMutation } from "@/react-toolkit/hooks";
import { z } from "zod";
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
  // Define project form
  const {
    form,
    isDirty,
    rowId,
    crudAction,
    projectName,
    setShowDialog,
    refineFormData,
  } = useDefineProjectForm();

  // Get state and methods for availability check
  const {
    isAvailable,
    availabilityMessage,
    setAvailabilityMessage,
    isCheckPending,
    handleInputChange,
  } = useIsProjectNameAvailable(form, projectName);

  // Define optimistic mutation to crete or update the project
  const { mutate: mutateProject } = useListOptimisticMutation<
    ProjectsTableDto,
    ProjectsTableDto | boolean,
    ProjectsTableDto
  >(projectOptimisticMutationFn, DATA_QUERY_KEY);

  // Get dialog heading and description
  const dialogHeaderOptions = getDialogHeadingDescription(crudAction);

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
    <DialogContent side={"right"} className="!max-w-[32rem]">
      <DialogDefaultHeader
        className="px-3.5 py-3 text-lg tracking-wide"
        heading={dialogHeaderOptions.heading}
        description={dialogHeaderOptions.description}
      />
      <ScrollArea className="h-[calc(100vh-3.8rem)] px-2.5 pb-0 pt-4">
        <Form {...form}>
          <form
            className="w-full space-y-3.5 px-2.5 pb-5"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            {/* Project Id */}
            {isReadMode && <InputField {...idProps} />}

            {/* Type */}
            <SelectField {...typeProps} disabled={isReadMode} />

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
      </ScrollArea>
    </DialogContent>
  );
};
