import { InputFieldProps } from "@avplatform/ui/form";

const hostProps: InputFieldProps = {
  name: "host",
  label: "Host",
  isRequired: true,
  className: "text-sm resize-none",
};

const apiKeyProps: InputFieldProps = {
  name: "apiKey",
  label: "API Key",
  className: "text-sm resize-none",
  type: "password",
  isRequired: true,
};

export { apiKeyProps, hostProps };
