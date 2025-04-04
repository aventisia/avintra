import { DeploymentTypeEnum } from "@/react-toolkit/enums/deployment-types-enum";
import { DatePickerFieldProps } from "@/react-toolkit/ui/form/fields/DatePickerField";
import { InputFieldProps } from "@/react-toolkit/ui/form/fields/InputField";
import { SelectFieldProps } from "@/react-toolkit/ui/form/fields/SelectField";
import { SwitchFieldProps } from "@/react-toolkit/ui/form/fields/SwitchField";
import { TextareaFieldProps } from "@/react-toolkit/ui/form/fields/TextareaField";
import { enumToArray } from "@/react-toolkit/utils/enum-to-array";

// Tenant Id
export const idProps: InputFieldProps = {
  name: "id",
  label: "Tenant Id",
  disabled: true,
};

// Name
export const nameProps: InputFieldProps = {
  name: "name",
  label: "Name",
  isRequired: true,
};

export const typeProps: SelectFieldProps = {
  name: "type",
  label: "Type",
  selectOptions: enumToArray(DeploymentTypeEnum),
};

export const effectiveOnProps: DatePickerFieldProps = {
  name: "effectiveDate",
  label: "Contract Effective Date",
  isRequired: true,
};

// Expires On
export const renewsOnProps: DatePickerFieldProps = {
  name: "renewalDate",
  label: "Contract Renewal Date",
  isRequired: true,
};

// Is TwoFA Enabled
export const isTwoFAEnabledProps: SwitchFieldProps = {
  name: "isTwoFAEnabled",
  label: "Require Two-Factor Authentication (2FA)",
  description:
    "If enabled, all users will need an additional verification step (e.g., one time password via email or code from an authenticator app) to log in, enhancing security",
};

// Is Password Enabled
export const isPwdEnabledProps: SwitchFieldProps = {
  name: "isPwdEnabled",
  label: "Enable Password Login",
  description: "If disabled, users cannot log in using their password",
};

// Is SSO Enabled
export const isSSOEnabledProps: SwitchFieldProps = {
  name: "isSSOEnabled",
  label: "Enable Single Sign-On (SSO)",
  description:
    "If enabled, users can log in using an external authentication provider",
};

// SSO Config JSON
export const ssoConfigJsonProps: TextareaFieldProps = {
  name: "ssoConfigJson",
  label: "Single Sign-On (SSO) Configuration",
  description: "The JSON configuration for the Single Sign-On (SSO) provider",
  className: "min-h-[12.5rem]",
};

// Is Password Never Expires Enabled
export const isPwdNeverExpiresEnabledProps: SwitchFieldProps = {
  name: "isPwdNeverExpiresEnabled",
  label: "Passwords Never Expire",
  description: "Enabling this removes password expiration",
};

// Days Before Password Expires
export const daysBeforePwdExpiresProps: InputFieldProps = {
  name: "daysBeforePwdExpires",
  label: "Days Before Password Expires",
  type: "number",
};

// Is Idle Session Timeout Enabled
export const isIdleSessionTimeoutEnabledProps: SwitchFieldProps = {
  name: "isIdleSessionTimeoutEnabled",
  label: "Enable Idle Session Timeout",
  description:
    "If enabled, user sessions will automatically time out after a period of inactivity",
};

// Idle Session Timeout Minutes
export const idleSessionTimeoutMinutesProps: InputFieldProps = {
  name: "idleSessionTimeoutMinutes",
  label: "Idle Session Timeout (in Minutes)",
  type: "number",
};
