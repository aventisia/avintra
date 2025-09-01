import {
  AutosizeTextareaFieldProps,
  InputFieldProps,
} from "@aventisia/ui/form";

// OnPrem LLM Id
const idProps: InputFieldProps = {
  name: "id",
  label: "On Prem LLM Id",
  disabled: true,
};

const llmPops: InputFieldProps = {
  name: "llm",
  label: "LLM Name",
  isRequired: true
};

const displayNamePops: InputFieldProps = {
  name: "displayName",
  label: "Display Name",
  isRequired: true
};

const descriptionProps: AutosizeTextareaFieldProps = {
  name: "description",
  label: "Description",
  isRequired: false,
  minHeight: 10
}



export {
  idProps,
  llmPops,
  displayNamePops,
  descriptionProps,
};
