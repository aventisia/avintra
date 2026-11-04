import { Button } from "@avplatform/ui/buttons";
import { CrudDialogActions, useCrudDialogDirty } from "@avplatform/ui/crud-dialog";
import { Form, InputField, TextareaField } from "@avplatform/ui/form";
import { useListOptimisticMutation } from "@avplatform/ui/hooks";
import { type CrudActionType } from "@avplatform/ui/types";
import { z } from "zod";

import { spaceOptimisticMutationFn } from "../../apis/spaces-apis";
import { DATA_QUERY_KEY } from "../../constants";
import { descriptionProps, nameProps } from "../../constants/space-form-field-props.constant";
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

  return (
    <Form methods={form} onSubmit={form.handleSubmit(onSubmit)}>
      <InputField {...nameProps} autoFocus />
      <TextareaField {...descriptionProps} />
      <CrudDialogActions>
        <Button type="submit" disabled={!isDirty}>
          {crudAction === "create" ? "Create space" : "Save changes"}
        </Button>
      </CrudDialogActions>
    </Form>
  );
};
