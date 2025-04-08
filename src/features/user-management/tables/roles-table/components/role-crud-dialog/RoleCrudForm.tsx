import { z } from 'zod';

import { useListOptimisticMutation } from '@/react-toolkit/hooks/useListOptimisticMutation';
import { Button } from '@/react-toolkit/ui/buttons/Button';
import { InputField } from '@/react-toolkit/ui/form/fields/InputField';
import { TextareaField } from '@/react-toolkit/ui/form/fields/TextareaField';
import { Form } from '@/react-toolkit/ui/form/Form';
import { AutherCard } from '@/react-toolkit/ui/form/non-field/AutherCard';

import { roleOptimisticMutationFn } from '../../apis/roles-table-apis';
import { DATA_QUERY_KEY } from '../../constants';
import { descriptionProps, idProps, nameProps } from '../../constants/role-form-field-props';
import { roleZodSchema } from '../../constants/role-zod-schema';
import { RolesTableDto } from '../../dtos/roles-table-dto';
import { useDefineRoleForm } from '../../hooks/useDefineRoleForm';

export const RoleCrudForm = () => {
  // Define role form
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
  } = useDefineRoleForm();

  // Define optimistic mutation to crete or update the role
  const { mutate: mutateRole } = useListOptimisticMutation<
    RolesTableDto,
    RolesTableDto | boolean,
    RolesTableDto
  >([rowId], roleOptimisticMutationFn, DATA_QUERY_KEY);

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof roleZodSchema>) => {
    // Create or update the role
    mutateRole({
      payload: refineFormData(formData) as unknown as RolesTableDto,
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
      {/* Role Id (Read-only) */}
      {isReadMode && <InputField {...idProps} />}

      {/* Name */}
      <InputField
        {...nameProps}
        onChangeCapture={(e) => handleInputChange(e.currentTarget.value)}
        nonErrorMessage={availabilityMessage}
      />

      {/* Description */}
      <TextareaField {...descriptionProps} />

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
            {crudAction === "create" ? "Create role" : "Save changes"}
          </Button>
        </div>
      )}
    </Form>
  );
};
