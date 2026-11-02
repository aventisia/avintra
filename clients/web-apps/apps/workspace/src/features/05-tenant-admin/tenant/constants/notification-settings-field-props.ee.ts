import { InputFieldProps, SelectFieldProps, SwitchFieldProps } from "@avplatform/ui/form";

// Low Credit
const lowCreditsProps: SwitchFieldProps = {
  name: "lowCredits",
  label: "Low credit",
  description: "Notify tenant admins when the credit balance falls below the configured threshold",
};

// Low Credit Threshold
const lowCreditThresholdProps: InputFieldProps = {
  name: "lowCreditThreshold",
  label: "Low credit threshold",
  description:
    "Credit balance below which the low-credit notification is sent. Must be greater than 0. Defaults to 1000.",
  type: "number",
};

// Subscription
const subscriptionProps: SwitchFieldProps = {
  name: "subscription",
  label: "Subscription",
  description: "Notify tenant admins of an upcoming subscription renewal",
};

// Subscription Reminder Days
const subscriptionRenewalReminderDaysProps: InputFieldProps = {
  name: "subscriptionRenewalReminderDays",
  label: "Subscription reminder days",
  description:
    "Days before renewal to start sending reminders. Must be greater than 0. Defaults to 7.",
  type: "number",
};

// Publish Agent
const publishAgentProps: SwitchFieldProps = {
  name: "publishAgent",
  label: "Publish agent",
  description: "Notify orchestrator managers when an agent is published and ready for use",
};

// Agent Risk Assessment Approval
const agentRiskAssessmentApprovalProps: SwitchFieldProps = {
  name: "agentRiskAssessmentApproval",
  label: "Agent risk assessment approval",
  description:
    "Notify the designated approver when an agent risk assessment is submitted for approval",
};

// Delivery Channel
const deliveryChannelProps: Omit<SelectFieldProps, "selectOptions"> = {
  name: "deliveryChannel",
  label: "Delivery channel",
  description: "How notifications are delivered. Defaults to both.",
  placeholder: "Select delivery channel",
};

export {
  lowCreditsProps,
  lowCreditThresholdProps,
  subscriptionProps,
  subscriptionRenewalReminderDaysProps,
  publishAgentProps,
  agentRiskAssessmentApprovalProps,
  deliveryChannelProps,
};
