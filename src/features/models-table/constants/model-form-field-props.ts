import { InputFieldProps } from "@/react-toolkit/ui/form/fields/InputField";
import { SelectFieldProps } from "@/react-toolkit/ui/form/fields/SelectField";
import { SwitchFieldProps } from "@/react-toolkit/ui/form/fields/SwitchField";
import { TextareaFieldProps } from "@/react-toolkit/ui/form/fields/TextareaField";
import { enumToArray } from "@/react-toolkit/utils/enum-to-array";
import { ModelLLMEnum } from "../enums/model-llm-enum";
import { ModelTypesEnum } from "../enums/model-type-enum";

// Project Id
const projectIdProps: InputFieldProps = {
  name: "projectId",
  label: "Project Id",
  disabled: true,
};

// Model Id
const idProps: InputFieldProps = {
  name: "id",
  label: "Model Id",
  disabled: true,
};

// Type
const typeProps: SelectFieldProps = {
  name: "type",
  label: "Model Type",
  isRequired: true,
  selectOptions: enumToArray(ModelTypesEnum),
};

// LLM
const llmProps: SelectFieldProps = {
  name: "llm",
  label: "LLM",
  isRequired: true,
  selectOptions: enumToArray(ModelLLMEnum),
};

// Name
const nameProps: InputFieldProps = {
  name: "name",
  label: "Model Name",
  isRequired: true,
};

// Description
const descriptionProps: TextareaFieldProps = {
  name: "description",
  label: "Description",
  // className: "min-h-[6rem]",
};

// Is Disabled
const isDisabledProps: SwitchFieldProps = {
  name: "isDisabled",
  label: "Disable Record",
  description:
    "Disable this record if it's been outdated, or not required anymore",
};

export {
  descriptionProps,
  idProps,
  isDisabledProps,
  llmProps,
  nameProps,
  projectIdProps,
  typeProps,
};
