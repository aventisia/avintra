import { SelectFieldProps, SwitchFieldProps } from "@aventisia/ui/form";

const llmProviderProps: SelectFieldProps = {
  name: "llmProvider",
  label: "LLM Provider",
  selectOptions: [],
  isRequired: true,
};

const modelProps: SelectFieldProps = {
  name: "model",
  label: "Model",
  selectOptions: [],
  isRequired: true,
};

const hasApiKeyProps: SwitchFieldProps = {
  name: "hasOwnApiKey",
  label: "Bring your own API key",
  description:
    "Enable this if you want to use your own LLM provider API key instead of the platform-hosted models.",
};

export { llmProviderProps, modelProps, hasApiKeyProps };
