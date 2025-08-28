import { LLMsEnum } from "@/enums/llms-enum";
import { SelectFieldProps } from "@/shared/select-field/SelectField";

import { AutosizeTextareaFieldProps } from "@aventisia/ui/form";
import { enumToArray } from "@aventisia/ui/utils";

const nodePromptProps: AutosizeTextareaFieldProps = {
  name: "",
  label: "Prompt",
  minHeight: 10,
  isRequired: true,
  className: "text-sm",
};

const baseLlmProps: SelectFieldProps = {
  name: "",
  label: "Base LLM",
  selectOptions: enumToArray(LLMsEnum),
  placeholder: "Select",
  isRequired: true,
  className: "text-sm resize-none",
};

export { nodePromptProps, baseLlmProps };
