import { InputFieldProps, SwitchFieldProps } from "@aventisia/ui/form";

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

// Max Credits
const maxCreditsProps: InputFieldProps = {
  name: "maxCredits",
  label: "No of credits",
  isRequired: true,
};

// Max Published Items
const maxPublishedItemsProps: InputFieldProps = {
  name: "maxPublishedItems",
  label: "Published Agents or AI Models",
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
  label: "Yearly Charge",
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
  description: "Disable this plan if it’s no longer available.",
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
};
