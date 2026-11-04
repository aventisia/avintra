import { CurrenciesEnum } from "@avplatform/ui/enums";
import { DatabaseOptionsEnum } from "@avplatform/ui/enums/database-options-enum";
import { DeploymentTypeEnum } from "@avplatform/ui/enums/deployment-types-enum";
import {
  type DateTimePickerFieldProps,
  InputFieldProps,
  SelectFieldProps,
  SwitchFieldProps,
} from "@avplatform/ui/form";
import { enumToArray } from "@avplatform/ui/utils";

export const nameProps: InputFieldProps = {
  name: "name",
  label: "Name",
  isRequired: true,
  placeholder: "e.g. Acme Corp",
  description:
    "The tenant's name.\n\n- **Max length:** 100 characters.\n- **Allowed characters:** letters and numbers, with a single space between words.\n- **Can be changed** after creation.",
};

export const domainProps: InputFieldProps = {
  name: "domain",
  label: "Domain",
  placeholder: "e.g. acme.com",
  description:
    "The tenant's email domain, matched against the signed-in admin's email domain for single sign-on.\n\n- **Max length:** 100 characters.",
};

export const typeProps: SelectFieldProps = {
  name: "type",
  label: "Type",
  description: "The deployment type of the tenant.",
  selectOptions: enumToArray(DeploymentTypeEnum),
  isRequired: true,
};

export const currencyProps: SelectFieldProps = {
  name: "currency",
  label: "Currency",
  placeholder: "e.g. USD",
  isRequired: true,
  description: "The tenant's currency.",
  selectOptions: enumToArray(CurrenciesEnum),
};

export const effectiveOnProps: DateTimePickerFieldProps = {
  name: "effectiveDate",
  label: "Contract starts",
  isRequired: true,
  description: "When the contract takes effect.",
  granularity: "minute",
  hourCycle: 12,
};

export const renewsOnProps: DateTimePickerFieldProps = {
  name: "renewalDate",
  label: "Contract renews",
  isRequired: true,
  description: "When the contract renews.",
  granularity: "minute",
  hourCycle: 12,
};

export const isTwoFAEnabledProps: SwitchFieldProps = {
  name: "isTwoFAEnabled",
  label: "Require two-factor authentication (2FA)",
  description:
    "Users confirm each sign-in with a one-time code from email or an authenticator app.",
};

export const isChangeRequestEnabledProps: SwitchFieldProps = {
  name: "isChangeRequestEnabled",
  label: "Enable change requests",
  description: "Tenant admins can raise change request tickets.",
};

export const isPwdEnabledProps: SwitchFieldProps = {
  name: "isPwdEnabled",
  label: "Enable password login",
  description: "Users can sign in with their email and password.",
};

export const isSSOEnabledProps: SwitchFieldProps = {
  name: "isSSOEnabled",
  label: "Enable single sign-on (SSO)",
  description: "Users can sign in through the tenant's identity provider",
};

export const isPwdNeverExpiresEnabledProps: SwitchFieldProps = {
  name: "isPwdNeverExpiresEnabled",
  label: "Passwords never expire",
  description: "Users are never asked to change their password.",
};

export const daysBeforePwdExpiresProps: InputFieldProps = {
  name: "daysBeforePwdExpires",
  label: "Password expires after (days)",
  type: "number",
  placeholder: "e.g. 90",
};

export const isIdleSessionTimeoutEnabledProps: SwitchFieldProps = {
  name: "isIdleSessionTimeoutEnabled",
  label: "Enable idle session timeout",
  description: "Signs users out after a period of inactivity.",
};

export const idleSessionTimeoutMinutesProps: InputFieldProps = {
  name: "idleSessionTimeoutMinutes",
  label: "Sign out after (minutes)",
  type: "number",
  placeholder: "e.g. 10",
};

export const dbOptionProps: SelectFieldProps = {
  name: "dbOption",
  label: "Database",
  isRequired: true,
  selectOptions: [
    {
      value: DatabaseOptionsEnum.Shared,
      label: "Shared",
      description: "Common database infrastructure, for tenants that need little isolation.",
    },
    {
      value: DatabaseOptionsEnum.Isolated,
      label: "Isolated",
      description: "Own schema on shared infrastructure, balancing cost and isolation.",
    },
    {
      value: DatabaseOptionsEnum.DedicatedServer,
      label: "Dedicated server",
      description: "Own database server, for full isolation and performance at a premium.",
    },
  ],
};

export const dbNamePrefixProps: InputFieldProps = {
  name: "dbNamePrefix",
  label: "Database name prefix",
  description: "Prefix for the tenant's database or schema name.",
  placeholder: "e.g. acme",
};

export const dbUserIdProps: InputFieldProps = {
  name: "dbUserId",
  label: "Database user",
  description: "Account the platform uses to access the database.",
};

export const dbPwdProps: InputFieldProps = {
  name: "dbPwd",
  label: "Database password",
  type: "password",
};

export const dbHostProps: InputFieldProps = {
  name: "dbHost",
  label: "Host",
  description: "Hostname or IP address of the dedicated database server.",
  placeholder: "e.g. db.acme.com",
};

export const dbPortProps: InputFieldProps = {
  name: "dbPort",
  label: "Port",
  type: "number",
  description: "Port the database server listens on.",
  placeholder: "e.g. 5432",
};

export const isDisabledProps: SwitchFieldProps = {
  name: "isDisabled",
  label: "Disable tenant",
  description: "Disable this tenant when it is no longer active.",
};
