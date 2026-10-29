import { InputFieldProps, SelectFieldProps, SwitchFieldProps } from "@avplatform/ui/form";

const connectUsingProps: SelectFieldProps = {
  name: "connectUsing",
  label: "Connect using",
  isRequired: true,
  className: "text-sm resize-none",
  selectOptions: [
    {
      label: "OAuth2 (recommended)",
      value: "OAuth2",
    },
    {
      label: "Service account",
      value: "service_account",
    },
  ],
};

// OAuth Props
const oAuthRedirectURLProps: InputFieldProps = {
  name: "oAuthRedirectURL",
  label: "OAuth redirect URL",
  disabled: true,
  readOnly: true,
  className: "text-sm resize-none",
};

const clientIdProps: InputFieldProps = {
  name: "clientId",
  label: "Client ID",
  isRequired: true,
  className: "text-sm resize-none",
};

const clientSecretProps: InputFieldProps = {
  name: "clientSecret",
  label: "Client secret",
  type: "password",
  isRequired: true,
  className: "text-sm resize-none",
};

// Service account props
const regionProps: InputFieldProps = {
  name: "region",
  label: "Region",
  isRequired: true,
  className: "text-sm resize-none",
};

const serviceAccountEmailProps: InputFieldProps = {
  name: "serviceAccountEmail",
  label: "Service account email",
  isRequired: true,
  className: "text-sm resize-none",
};

const privateKeyProps: InputFieldProps = {
  name: "privateKey",
  label: "Private key",
  type: "password",
  isRequired: true,
  className: "text-sm resize-none",
};

const impersonateUserProps: SwitchFieldProps = {
  name: "impersonateUser",
  label: "Impersonate a user",
  description: "",
  className: "text-sm resize-none",
};

const emailProps: InputFieldProps = {
  name: "email",
  label: "Email",
  className: "text-sm resize-none",
  isRequired: true,
};

const httpRequestNodeProps: SwitchFieldProps = {
  name: "httpRequestNode",
  label: "HTTP request node",
  description: "",
  className: "text-sm resize-none",
};

const scopesProps: InputFieldProps = {
  name: "scopes",
  label: "Scope(s)",
  isRequired: true,
  className: "text-sm resize-none",
};

export {
  connectUsingProps,
  oAuthRedirectURLProps,
  clientIdProps,
  clientSecretProps,
  regionProps,
  serviceAccountEmailProps,
  privateKeyProps,
  impersonateUserProps,
  emailProps,
  httpRequestNodeProps,
  scopesProps,
};
