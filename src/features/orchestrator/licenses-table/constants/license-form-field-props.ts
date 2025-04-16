import { InputFieldProps } from "@/react-toolkit/ui/form/fields/InputField";
import { LicenseSelectFieldProps } from "@/react-toolkit/ui/form/fields/LicenseSelectField";

// License Id
export const idProps: InputFieldProps = {
  name: "id",
  label: "License Id",
  disabled: true,
};

// Plan name
export const licenseTypesProps: LicenseSelectFieldProps = {
  name: "planId",
  label: "License Type",
  isRequired: true,
};

// New Allocated Units
export const additionalUnitsRequestedProps: InputFieldProps = {
  name: "additionalUnitsRequested",
  label: "New Allocated Units",
  isRequired: true,
  placeholder: "8",
};
