import { CurrenciesEnum } from "@avplatform/ui/enums";
import { DatabaseOptionsEnum } from "@avplatform/ui/enums/database-options-enum";
import { DeploymentTypeEnum } from "@avplatform/ui/enums/deployment-types-enum";
import {
  DatePickerFieldProps,
  InputFieldProps,
  RadioGroupFieldProps,
  SelectFieldProps,
  SwitchFieldProps,
  TextareaFieldProps,
} from "@avplatform/ui/form";
import { enumToArray } from "@avplatform/ui/utils";

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
  isRequired: true,
};

export const currencyProps: SelectFieldProps = {
  name: "currency",
  label: "Currency",
  placeholder: "Currency",
  isRequired: true,
  selectOptions: enumToArray(CurrenciesEnum),
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
  description: "If enabled, users can log in using an external authentication provider",
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
  description: "If enabled, user sessions will automatically time out after a period of inactivity",
};

// Idle Session Timeout Minutes
export const idleSessionTimeoutMinutesProps: InputFieldProps = {
  name: "idleSessionTimeoutMinutes",
  label: "Idle Session Timeout (in Minutes)",
  type: "number",
};

// Database Option
export const dbOptionProps: RadioGroupFieldProps = {
  name: "dbOption",
  label: "Database Options:",
  selectOptions: [
    {
      value: DatabaseOptionsEnum.Shared,
      label: "Shared",
      description:
        "Tenants share a common database infrastructure. Suitable for low-resource tenants or those not requiring high isolation",
    },
    {
      value: DatabaseOptionsEnum.Isolated,
      label: "Isolated",
      description:
        "Tenants have their own database schema within a shared infrastructure. Offers a balance between cost and isolation.",
    },
    {
      value: DatabaseOptionsEnum.DedicatedServer,
      label: "Dedicated Server (Premium)",
      description:
        "Tenants have their own dedicated database server. Provides the highest performance and complete isolation, but comes at a higher cost.",
    },
  ],
};

// Database Name Prefix
export const dbNamePrefixProps: InputFieldProps = {
  name: "dbNamePrefix",
  label: "Database Name Prefix",
  description:
    "Add a specific prefix for your database. This option allows you to customize the schema name for better organization and identification",
};

// Database User Id
export const dbUserIdProps: InputFieldProps = {
  name: "dbUserId",
  label: "User Id",
  description: "Enter a username of the dedicated account to access the database.",
};

// Database Password
export const dbPwdProps: InputFieldProps = {
  name: "dbPwd",
  label: "Password",
  type: "password",
  description: "Enter a password of the dedicated account to access the database.",
};

// Database Host
export const dbHostProps: InputFieldProps = {
  name: "dbHost",
  label: "Host",
  description:
    "Enter the hostname or IP address of the dedicated database server. This is where the application will connect to the database",
};

// Database Port
export const dbPortProps: InputFieldProps = {
  name: "dbPort",
  label: "Port",
  type: "number",
  description:
    "Enter the port number on which the dedicated database server listens for connections. This is typically the default port for your chosen database management system (e.g., 5432 for PostgreSQL)",
};

// Is Disabled
export const isDisabledProps: SwitchFieldProps = {
  name: "isDisabled",
  label: "Disable Record",
  description: "Disable this record if it's been outdated, or not required anymore",
};
