import { InputFieldProps, TextareaFieldProps } from "@avplatform/ui/form";

// Space Id
const idProps: InputFieldProps = {
  name: "id",
  label: "Space ID",
  disabled: true,
};

// Space Name
const nameProps: InputFieldProps = {
  name: "name",
  label: "Space name",
  isRequired: true,
  maxLength: 20,
  description:
    "A **unique** name for the space.\n\n- **Max length:** 20 characters.\n- **Can be changed** after creation.",
};

// Description
const descriptionProps: TextareaFieldProps = {
  name: "description",
  label: "Brief description",
  maxLength: 500,
  description: "A short description of the space (max 500 characters).",
};

// Is Disabled
const isDisabledProps: InputFieldProps = {
  name: "isDisabled",
  label: "Disable record",
  disabled: true,
};

export { idProps, nameProps, descriptionProps, isDisabledProps };
