import { InputFieldProps } from "@aventisia/ui/form";

const apiKeyProps: InputFieldProps = {
  name: "apiKey",
  label: "API Key",
  type: "password",
  isRequired: true,
  className: "text-sm resize-none",
};

const organizationIdProps: InputFieldProps = {
  name: "organizationId",
  label: "Organization ID (optional)",
  className: "text-sm resize-none",
};

const baseURLProps: InputFieldProps = {
  name: "baseURL",
  label: "Base URL",
  className: "text-sm resize-none",
};

export { apiKeyProps, organizationIdProps, baseURLProps };
