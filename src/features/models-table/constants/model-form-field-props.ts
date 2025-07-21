import {
  InputFieldProps,
  SelectFieldProps,
  SwitchFieldProps,
  TextareaFieldProps,
} from "@aventisia/ui/form";
import { enumToArray } from "@aventisia/ui/utils";

import { ModelLLMEnum } from "../enums/model-llm-enum";
import { ModelTypesEnum } from "../enums/model-type-enum";

// TODO: Temporary adding this till the time we don't want to show the AI Persona in Prod
enum ModelTypesEnumTemp {
  Extraction = "Extraction",
  Summarization = "Summarization",
  Classification = "Classification",
  SentimentAnalytics = "Sentiment Analytics",
  QuestionAnswer = "Questions & Answers",
}

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
  selectOptions:
    import.meta.env.MODE !== "production"
      ? enumToArray(ModelTypesEnum)
      : enumToArray(ModelTypesEnumTemp),
};

// LLM
const llmProps: SelectFieldProps = {
  name: "llMs",
  label: "Base LLM",
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
  typeProps,
};
