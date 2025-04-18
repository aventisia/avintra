import { InputFieldProps } from "@/react-toolkit/ui/form/fields/InputField";

// License Id
export const idProps: InputFieldProps = {
  name: "id",
  label: "License Id",
  disabled: true,
};

// New Allocated Units
export const additionalUnitsRequestedProps: InputFieldProps = {
  name: "additionalUnitsRequested",
  label: "New Allocated Units",
  isRequired: true,
  placeholder: "8",
};
