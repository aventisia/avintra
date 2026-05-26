import { InputFieldProps } from "@aventisia/ui/form";

const oAuthRedirectURLProps: InputFieldProps = {
  name: "oAuthRedirectURL",
  label: "OAuth Redirect URL",
  className: "text-sm resize-none",
  disabled: true,
};

const authorizationURLProps: InputFieldProps = {
  name: "authorizationURL",
  label: "Authorization URL",
  className: "text-sm resize-none",
};

const accessTokenURLProps: InputFieldProps = {
  name: "accessTokenURL",
  label: "Access Token URL",
  className: "text-sm resize-none",
};

const clientIdURLProps: InputFieldProps = {
  name: "clientId",
  label: "Client ID",
  className: "text-sm resize-none",
  isRequired: true,
};

const clientSecretProps: InputFieldProps = {
  name: "clientSecret",
  label: "Client Secret",
  type: "password",
  isRequired: true,
  className: "text-sm resize-none",
};

export {
  clientSecretProps,
  authorizationURLProps,
  accessTokenURLProps,
  clientIdURLProps,
  oAuthRedirectURLProps,
};
