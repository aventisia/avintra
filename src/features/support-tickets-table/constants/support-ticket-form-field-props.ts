import { InputFieldProps, SwitchFieldProps } from "@aventisia/ui/form";

import { RichTextAreaFieldProps } from "../components/richtextarea/RichTextAreaField";

// Ticket Id
const idProps: InputFieldProps = {
  name: "id",
  label: "Ticket Id",
  disabled: true,
};

// Ticket Number
const ticketNumberProps: InputFieldProps = {
  name: "ticketNumber",
  label: "Ticket Number",
};

// Subject
const subjectProps: InputFieldProps = {
  name: "subject",
  label: "Subject",
  isRequired: true,
  placeholder: "Enter the subject",
};

// Description
const descriptionProps: RichTextAreaFieldProps = {
  name: "description",
  label: "Description",
  isRequired: true,
  placeholder: "Add your description here...",
  output: "html",
};

// Priority
const priorityProps: InputFieldProps = {
  name: "priority",
  label: "Priority",
};

// Status
const statusProps: InputFieldProps = {
  name: "status",
  label: "Status",
};

// Remarks Count
const remarksCountProps: InputFieldProps = {
  name: "remarkCount",
  label: "Remarks Count",
  disabled: true,
};

// Is Disabled
const isDisabledProps: SwitchFieldProps = {
  name: "isDisabled",
  label: "Disable Record",
  description:
    "Disable this record if it's been outdated, or not required anymore",
};

export {
  idProps,
  ticketNumberProps,
  subjectProps,
  priorityProps,
  statusProps,
  descriptionProps,
  remarksCountProps,
  isDisabledProps,
};
