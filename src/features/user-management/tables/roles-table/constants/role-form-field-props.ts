import { InputFieldProps } from "@/react-toolkit/ui/form/fields/InputField";
import { TextareaFieldProps } from "@/react-toolkit/ui/form/fields/TextareaField";

// Role Id
export const idProps: InputFieldProps = {
  name: "id",
  label: "Role Id",
  disabled: true,
};

// First Name
export const nameProps: InputFieldProps = {
  name: "name",
  label: "Role",
  isRequired: true,
};

// Description
export const descriptionProps: TextareaFieldProps = {
  name: "description",
  label: "Description",
  className: "min-h-[6rem]",
};
