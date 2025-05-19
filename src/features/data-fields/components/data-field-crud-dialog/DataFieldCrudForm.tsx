import { useListOptimisticMutation } from "@aventisia/ui/hooks";
import { Button } from "@aventisia/ui/buttons";
import { InputField } from "@aventisia/ui/form";
import { SelectField } from "@aventisia/ui/form";
import { TextareaField } from "@aventisia/ui/form";
import { Form } from "@aventisia/ui/form";
// import { AutherCard } from "@/react-toolkit/ui/form/non-field/AutherCard";
import { z } from "zod";
import { DATA_QUERY_KEY } from "../../constants";
import {
  descriptionProps,
  idProps,
  colorProps,
  nameProps,
  typeProps,
} from "../../constants/data-field-props";
import { dataFieldSchema } from "../../constants/data-field-zod-schema";
import { DataFieldsDto } from "../../dtos/data-fields-dtos";
import { dataFieldOptimisticMutationFn } from "../../apis/add-fields-apis";
import { useDefineDataFieldForm } from "../../hooks/useDefineDataFieldForm";
import { ColorPickerField } from "../color-picker/ColorPickerSelect";

export const DataFieldCrudForm = () => {
  // Define model form
  const {
    form,
    isDirty,
    rowId,
    crudAction,
    setShowDialog,
    refineFormData,
    isAvailable,
    availabilityMessage,
    setAvailabilityMessage,
    isCheckPending,
    handleInputChange,
  } = useDefineDataFieldForm();

  // Define optimistic mutation to crete or update the model
  const { mutate: mutateModel } = useListOptimisticMutation<
    DataFieldsDto,
    DataFieldsDto | boolean,
    DataFieldsDto
  >([rowId], dataFieldOptimisticMutationFn, DATA_QUERY_KEY);

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof dataFieldSchema>) => {
    // Create or update the model
    mutateModel({
      payload: refineFormData(formData) as unknown as DataFieldsDto,
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
      {/* Model Id */}
      {isReadMode && <InputField {...idProps} />}

      {/* Name */}
      <InputField
        {...nameProps}
        onChangeCapture={(e) => handleInputChange(e.currentTarget.value)}
        nonErrorMessage={availabilityMessage}
      />

      {/* Type. TODO: Select field doesn't update. Applied workaround for now */}
      {crudAction === "create" ? (
        <SelectField {...typeProps} />
      ) : (
        form.getValues("type") !== "" && <SelectField {...typeProps} />
      )}

      {/* Type. TODO: Select field doesn't update. Applied workaround for now */}
      {crudAction === "create" ? (
        <ColorPickerField {...colorProps} />
      ) : (
        form.getValues("color") !== "" && <ColorPickerField {...colorProps} />
      )}

      {/* Description */}
      <TextareaField {...descriptionProps} />

      {/* Submit button */}
      {!isReadMode && (
        <div className="!mt-5 flex w-full justify-end">
          <Button
            type="submit"
            disabled={!isDirty || !isAvailable || isCheckPending}
            className="min-w-[5rem]"
          >
            {crudAction === "create" ? "Save" : "Save changes"}
          </Button>
        </div>
      )}
    </Form>
  );
};
