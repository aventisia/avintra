import {
  AutosizeTextareaFieldProps,
  InputFieldProps,
  SelectFieldProps,
  SwitchFieldProps,
} from "@avplatform/ui/form";
import { enumToArray } from "@avplatform/ui/utils";

import { OnPremModelProviderEnum } from "../enums/on-prem-model-proivder-enum";
import { OnPremModelStatusEnum } from "../enums/on-prem-model-status-enum";

// OnPrem Model Id
const idProps: InputFieldProps = {
  name: "id",
  label: "On Prem Model Id",
  disabled: true,
};

const modelNameProps: InputFieldProps = {
  name: "modelName",
  label: "Model Name",
  isRequired: true,
};

const providerTypeProps: SelectFieldProps = {
  name: "providerType",
  label: "Provider",
  isRequired: true,
  selectOptions: enumToArray(OnPremModelProviderEnum),
};

const statusProps: SelectFieldProps = {
  name: "status",
  label: "Status",
  isRequired: false,
  selectOptions: enumToArray(OnPremModelStatusEnum),
};

const displayNameProps: InputFieldProps = {
  name: "name",
  label: "Display Name",
  isRequired: true,
};

const providerUrlProps: InputFieldProps = {
  name: "providerUrl",
  label: "Provider URL",
  isRequired: true,
};

const descriptionProps: AutosizeTextareaFieldProps = {
  name: "description",
  label: "Description",
  isRequired: false,
  minHeight: 10,
};

// Is Disabled
const isDisabledProps: SwitchFieldProps = {
  name: "isDisabled",
  label: "Disable Record",
  description: "Disable this record if it's been outdated, or not required anymore",
};

export {
  idProps,
  modelNameProps,
  displayNameProps,
  descriptionProps,
  providerTypeProps,
  providerUrlProps,
  statusProps,
  isDisabledProps,
};
