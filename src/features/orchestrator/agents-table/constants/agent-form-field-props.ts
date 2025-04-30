import { AsyncSelectFieldProps } from "@/react-toolkit/ui/form/fields/AsyncSelectField";
import { InputFieldProps } from "@/react-toolkit/ui/form/fields/InputField";
import { SwitchFieldProps } from "@/react-toolkit/ui/form/fields/SwitchField";

import { getLicensesToSelect } from "../../licenses-table/apis/licenses-table-apis";

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
  disabled: true,
};

// Machines Using the agent
export const machineCountProps: InputFieldProps = {
  name: "machineCount",
  label: "Machines",
  defaultValue: 0,
  disabled: true,
};

// version number
export const versionNumberProps: InputFieldProps = {
  name: "versionNumber",
  label: "Version Number",
  disabled: true,
};

export const licenseSelectProps: AsyncSelectFieldProps = {
  name: "licenseId",
  selectOptions: () => getLicensesToSelect().then((data) => data.data),
  label: "License Type",
  placeholder: "Select License",
  className: "!w-[38rem]",
  triggerClassName: "!w-full",
  size: "base",
  isRequired: true,
};

// Is Disabled
export const isDisabledProps: SwitchFieldProps = {
  name: "isDisabled",
  label: "Disable Agent",
  description:
    "Disable this agent if it's been not in use, or not required anymore",
};
