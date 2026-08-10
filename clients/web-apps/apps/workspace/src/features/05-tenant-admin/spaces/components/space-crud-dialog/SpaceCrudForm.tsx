import { Button } from "@avplatform/ui/buttons";
import { useCrudDialogDirty } from "@avplatform/ui/data-table";
import { AutherCard, Form, InputField, TextareaField } from "@avplatform/ui/form";
import { useListOptimisticMutation } from "@avplatform/ui/hooks";
import { type CrudActionType } from "@avplatform/ui/types";
import { z } from "zod";

import { spaceOptimisticMutationFn } from "../../apis/spaces-apis";
import { DATA_QUERY_KEY } from "../../constants";
import {
  descriptionProps,
  idProps,
  isDisabledProps,
  nameProps,
} from "../../constants/space-form-field-props";
import { spaceZodSchema } from "../../constants/space-zod-schema";
import { SpacesTableDto } from "../../dtos/spaces-table-dto";
import { useDefineSpaceForm } from "../../hooks/useDefineSpaceForm";

interface SpaceCrudFormProps {
  rowId: string;
  crudAction: CrudActionType;
}

export const SpaceCrudForm = ({ rowId, crudAction }: SpaceCrudFormProps) => {
  const { onCloseConfirmed } = useCrudDialogDirty();

  // Define space form
  const { form, isDirty, refineFormData } = useDefineSpaceForm({ rowId, crudAction });

  // Define optimistic mutation to create or update the space
  const { mutate: mutateSpace } = useListOptimisticMutation<
    SpacesTableDto,
    SpacesTableDto | boolean,
    SpacesTableDto
  >([rowId], spaceOptimisticMutationFn, DATA_QUERY_KEY);

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof spaceZodSchema>) => {
    // Create or update the space
    mutateSpace({
      payload: refineFormData(formData) as unknown as SpacesTableDto,
      crudAction: crudAction,
    });

    // Close the dialog
    onCloseConfirmed();
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
      {/* Space Id (Read-only) */}
      {isReadMode && <InputField {...idProps} />}

      {/* Space Name */}
      <InputField {...nameProps} />

      {/* Brief Description */}
      <TextareaField {...descriptionProps} />

      {/* Is Disabled (Read-only) */}
      {isReadMode && <InputField {...isDisabledProps} />}

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
          <Button type="submit" disabled={!isDirty} className="min-w-[5rem]">
            {crudAction === "create" ? "Create space" : "Save changes"}
          </Button>
        </div>
      )}
    </Form>
  );
};
