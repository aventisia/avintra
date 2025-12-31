import { InputFieldProps } from "@aventisia/ui/form";

export const nameProps: InputFieldProps = {
  name: "name",
  label: "Name",
  isRequired: true,
  className: "text-sm",
};

export const baseUrlProps: InputFieldProps = {
  name: "baseUrl",
  label: "Base URL",
  isRequired: true,
  className: "text-sm",
};

export const apiKeyProps: InputFieldProps = {
  name: "apiKey",
  label: "API Key",
  isRequired: true,
  className: "text-sm",
};

export const orgIdProps: InputFieldProps = {
  name: "organizationId",
  label: "Organization ID",
  isRequired: false,
  className: "text-sm",
};
