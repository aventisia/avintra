import { InputFieldProps, SelectFieldProps, SwitchFieldProps } from "@avplatform/ui/form";
import { enumToArray } from "@avplatform/ui/utils";

import { PlanStatusEnum } from "../enums/plan-status-enum.ee";
import { PlanTypeEnum } from "../enums/plan-type-enum.ee";

const nameProps: InputFieldProps = {
  autoFocus: true,
  name: "name",
  label: "Name",
  isRequired: true,
  placeholder: "e.g. Pro monthly",
  description:
    "A **unique** name for the plan.\n\n- **Max length:** 255 characters.\n- **Allowed characters:** letters (a-z, A-Z), numbers (0-9), space, parentheses `()`, underscore (`_`) and hyphen (`-`).\n- **Can be changed** after creation.",
};

const typeProps: SelectFieldProps = {
  name: "type",
  label: "Type",
  selectOptions: enumToArray(PlanTypeEnum),
  defaultValue: "Pro",
  isRequired: true,
};

const statusProps: SelectFieldProps = {
  name: "status",
  label: "Status",
  selectOptions: enumToArray(PlanStatusEnum),
  defaultValue: "Current",
  isRequired: true,
};

const priceProps: InputFieldProps = {
  name: "price",
  label: "Price",
  placeholder: "e.g. 49",
  isRequired: true,
};

const currencyProps: SelectFieldProps = {
  name: "currency",
  label: "Currency",
  selectOptions: [
    { label: "INR", value: "INR" },
    { label: "USD", value: "USD" },
    { label: "EUR", value: "EUR" },
    { label: "GBP", value: "GBP" },
  ],
  defaultValue: "USD",
  isRequired: true,
};

const frequencyProps: SelectFieldProps = {
  name: "frequency",
  label: "Billing",
  selectOptions: [
    { label: "Monthly", value: "Monthly" },
    { label: "Yearly", value: "Yearly" },
  ],
  defaultValue: "Monthly",
  isRequired: true,
};

const maxCreditsProps: InputFieldProps = {
  name: "maxCredits",
  label: "Credits",
  placeholder: "e.g. 1000",
  isRequired: true,
  description: "Credits included in the plan. Use -1 for unlimited.",
};

const maxPublishedItemsProps: InputFieldProps = {
  name: "maxPublishedItems",
  label: "Published agents",
  placeholder: "e.g. 10",
  isRequired: true,
  description: "Maximum number of published agents.",
};

const maxUsersProps: InputFieldProps = {
  name: "maxUsers",
  label: "Users",
  placeholder: "e.g. 25",
  isRequired: true,
  description: "Maximum number of users. Use -1 for unlimited.",
};

const maxSpacesProps: InputFieldProps = {
  name: "maxSpaces",
  label: "Spaces",
  placeholder: "e.g. 5",
  isRequired: true,
  description: "Maximum number of spaces. Use -1 for unlimited.",
};

const storageLimitMBProps: InputFieldProps = {
  name: "storageLimitMB",
  label: "Storage (MB)",
  placeholder: "e.g. 10240",
  isRequired: true,
  description: "Storage limit in megabytes. Use -1 for unlimited.",
};

const historyRetentionDaysProps: InputFieldProps = {
  name: "historyRetentionDays",
  label: "History retention (days)",
  placeholder: "e.g. 90",
  isRequired: true,
  description: "Days of insights and agent run history to keep.",
};

const isDisabledProps: SwitchFieldProps = {
  name: "isDisabled",
  label: "Disable plan",
  description: "Disable this plan when it is no longer offered.",
};

export {
  nameProps,
  typeProps,
  statusProps,
  priceProps,
  currencyProps,
  frequencyProps,
  maxCreditsProps,
  maxPublishedItemsProps,
  maxUsersProps,
  maxSpacesProps,
  storageLimitMBProps,
  historyRetentionDaysProps,
  isDisabledProps,
};
