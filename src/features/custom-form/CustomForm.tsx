/* eslint-disable @typescript-eslint/no-explicit-any */
import { IFormValuesToFill } from "../dynamic-form/types/dynamic-form-types";
import { customActionMapper } from "./utils/utils";

interface CustomFormProps {
  /** Name of the action */
  name: string;
  /** A function to close the dialog. */
  closeDialog: () => void;
  /** Form fields values mainly getting as response from an api and to fill the form to view or update data */
  formFieldValuesToFill?: any;
  /** Id of the node which we are working on currently */
  nodeId: string | undefined;
}

const CustomForm = ({
  name,
  closeDialog,
  formFieldValuesToFill,
  nodeId,
}: CustomFormProps) => {
  const ComponentToRender = customActionMapper[name];

  const finalFormFieldValuesToFill = formFieldValuesToFill
    ? formFieldValuesToFill.reduce(
        (
          acc: Record<string, string | number | any>,
          { key, value }: IFormValuesToFill,
        ) => {
          acc[key] = value;
          return acc;
        },
        {} as Record<string, string | number | any>,
      )
    : formFieldValuesToFill;

  if (!ComponentToRender || !nodeId) return null;

  return (
    <ComponentToRender
      closeDialog={closeDialog}
      formFieldValuesToFill={finalFormFieldValuesToFill}
      nodeId={nodeId}
    />
  );
};

export default CustomForm;
