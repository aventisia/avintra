import { InputFieldProps } from "@/react-toolkit/ui/form/fields/InputField";
import { SwitchFieldProps } from "@/react-toolkit/ui/form/fields/SwitchField";

// Project Id
export const projectIdProps: InputFieldProps = {
  name: "flowId",
  label: "Flow Id",
  disabled: true,
};

// Agent Id
export const idProps: InputFieldProps = {
  name: "id",
  label: "Agent Id",
  disabled: true,
};

// Name
export const nameProps: InputFieldProps = {
  name: "name",
  label: "Name",
  isRequired: true,
};

// Machines Using the agent
export const machineCountProps: InputFieldProps = {
  name: "machineCount",
  label: "Machines Using",
  defaultValue: 0,
  isRequired: true,
};

// version number 
export const versionNumberProps: InputFieldProps = {
  name: "versionNumber",
  label: "Version Number",
  isRequired: true,
};

// Is Disabled
export const isDisabledProps: SwitchFieldProps = {
  name: "isDisabled",
  label: "Disable Record",
  description:
    "Disable this record if it's been outdated, or not required anymore",
};

