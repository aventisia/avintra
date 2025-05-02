import { InputFieldProps } from "@aventisia/ui/form";
import { SelectFieldProps } from "@aventisia/ui/form";
import { SwitchFieldProps } from "@aventisia/ui/form";
import { TextareaFieldProps } from "@aventisia/ui/form";
import { enumToArray } from "@aventisia/ui/utils";
import { ModelTypesEnum } from "../enums/model-type-enum";
import { ModelLLMEnum } from "../enums/model-llm-enum";

// Model Id
const idProps: InputFieldProps = {
  name: "id",
  label: "Model Id",
  disabled: true,
};

// Type
const typeProps: SelectFieldProps = {
  name: "type",
  label: "Model type",
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
  label: "Model name",
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
  nameProps,
  typeProps,
  llmProps,
};
