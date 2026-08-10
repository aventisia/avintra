import { InputFieldProps, TextareaFieldProps } from "@avplatform/ui/form";

// Space Id
const idProps: InputFieldProps = {
  name: "id",
  label: "Space Id",
  disabled: true,
};

// Space Name
const nameProps: InputFieldProps = {
  name: "name",
  label: "Space Name",
  isRequired: true,
  maxLength: 20,
};

// Description
const descriptionProps: TextareaFieldProps = {
  name: "description",
  label: "Brief Description",
  maxLength: 500,
};

// Is Disabled
const isDisabledProps: InputFieldProps = {
  name: "isDisabled",
  label: "Disable Record",
  disabled: true,
};

export { idProps, nameProps, descriptionProps, isDisabledProps };
