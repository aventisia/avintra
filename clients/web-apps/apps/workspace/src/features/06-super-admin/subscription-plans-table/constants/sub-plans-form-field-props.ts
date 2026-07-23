import { InputFieldProps, SelectFieldProps, SwitchFieldProps } from "@avplatform/ui/form";
import { enumToArray } from "@avplatform/ui/utils";

import { PlanStatusEnum } from "../enums/plan-status-enum";
import { PlanTypeEnum } from "../enums/plan-type-enum";

// ID (read-only)
const idProps: InputFieldProps = {
  name: "id",
  label: "Plan ID",
  disabled: true,
};

// Name
const nameProps: InputFieldProps = {
  autoFocus: true,
  name: "name",
  label: "Plan Name",
  isRequired: true,
};

// Type
const typeProps: SelectFieldProps = {
  name: "type",
  label: "Type",
  selectOptions: enumToArray(PlanTypeEnum),
  defaultValue: "Pro",
  isRequired: true,
};
// Max Credits
const maxCreditsProps: InputFieldProps = {
  name: "maxCredits",
  label: "No of credits",
  isRequired: true,
};

// Max Published Items
const maxPublishedItemsProps: InputFieldProps = {
  name: "maxPublishedItems",
  label: "Published Agents",
  isRequired: true,
};

// History Retention Days
const historyRetentionDaysProps: InputFieldProps = {
  name: "historyRetentionDays",
  label: "Insights & Workflow History (in Days)",
  isRequired: true,
};

// Max Spaces
const maxSpacesProps: InputFieldProps = {
  name: "maxSpaces",
  label: "Spaces",
  isRequired: true,
};

// Storage Limit MB
const storageLimitMBProps: InputFieldProps = {
  name: "storageLimitMB",
  label: "Storage Limit(in MB)",
  isRequired: true,
};

// Max Users
const maxUsersProps: InputFieldProps = {
  name: "maxUsers",
  label: "No of Users",
  isRequired: true,
};

// Yearly Charge
const yearlyPriceProps: InputFieldProps = {
  name: "yearlyPrice",
  label: "Yearly Charge (per Month)",
  isRequired: true,
};
// Monthly Charge
const monthlyPriceProps: InputFieldProps = {
  name: "monthlyPrice",
  label: "Monthly Charge",
  isRequired: true,
};
// Is Disabled
const isDisabledProps: SwitchFieldProps = {
  name: "isDisabled",
  label: "Disable Plan",
  description: "Disable this plan if it's no longer available.",
};

// Price
const priceProps: InputFieldProps = {
  name: "price",
  label: "Price",
  isRequired: true,
};

// Currency
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

// Frequency
const frequencyProps: SelectFieldProps = {
  name: "frequency",
  label: "Billing Frequency",
  selectOptions: [
    { label: "Monthly", value: "Monthly" },
    { label: "Yearly", value: "Yearly" },
  ],
  defaultValue: "Monthly",
  isRequired: true,
};

// Status
const statusProps: SelectFieldProps = {
  name: "status",
  label: "Plan Status",
  selectOptions: enumToArray(PlanStatusEnum),
  defaultValue: "Current",
  isRequired: true,
};

export {
  idProps,
  nameProps,
  maxCreditsProps,
  maxPublishedItemsProps,
  historyRetentionDaysProps,
  maxSpacesProps,
  storageLimitMBProps,
  maxUsersProps,
  isDisabledProps,
  yearlyPriceProps,
  monthlyPriceProps,
  typeProps,
  frequencyProps,
  currencyProps,
  priceProps,
  statusProps,
};
