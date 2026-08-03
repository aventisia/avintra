import { NodeTypeAndCategory } from "@/types/node-data-type";
import { NodeDataType } from "@/types/node-data-type";

const commonProps: NodeTypeAndCategory = {
  type: "triggerNode",
  category: "Triggers",
};

export const triggersList: NodeDataType[] = [
  {
    name: "manualTrigger",
    label: "Manual trigger",
    description: "Start your flow clicking the execute button",
    icon: "ManualTriggerIcon",
    ...commonProps,
  },
  {
    name: "scheduleTrigger",
    label: "Scheduled Time",
    description:
      "Trigger the flow at specific times or on a recurring schedule (e.g., daily, weekly)",
    icon: "ScheduleTriggerIcon",
    ...commonProps,
  },
  {
    name: "intervalTrigger",
    label: "Interval-Based",
    description: "Trigger at fixed intervals (e.g., every hour, every 15 minutes)",
    icon: "IntervalTriggerIcon",
    ...commonProps,
  },
  {
    name: "fileSystemEventTrigger",
    label: "File System Events Trigger",
    description: "Trigger when files are created, modified, or deleted in a specific directory",
    icon: "FileSystemEventTrigger",
    ...commonProps,
  },
  {
    name: "emailTrigger",
    label: "Email Trigger",
    description:
      "Trigger when a new email arrives, particularly with specific criteria (e.g., subject line, sender)",
    icon: "EmailTriggerIcon",
    ...commonProps,
  },
  {
    name: "databaseEventTrigger",
    label: "Database Event Trigger",
    description: "Trigger when changes occur in a database, such as a new record being added",
    icon: "DatabaseEventTriggerIcon",
    ...commonProps,
  },
  {
    name: "formSubmissionTrigger",
    label: "Form Submission Trigger",
    description: "Trigger when a user submits a form",
    icon: "FormSubmissionTriggerIcon",
    ...commonProps,
  },
  {
    name: "systemEventTrigger",
    label: "System Event Trigger",
    description: "Trigger when a specific system events occur, such as system startup or shutdown",
    icon: "SystemEventTriggerIcon",
    ...commonProps,
  },
  {
    name: "serviceEventTrigger",
    label: "Service Event Trigger",
    description:
      "Trigger based on changes in the state of a system service (e.g., a Windows service starts or stops)",
    icon: "ServiceEventTriggerIcon",
    ...commonProps,
  },
  {
    name: "webhookTrigger",
    label: "Webhook Trigger",
    description: "Trigger when a specific webhook notification, typically from an external service",
    icon: "WebhookTriggerIcon",
    ...commonProps,
  },
  {
    name: "httpTrigger",
    label: "HTTP (API) Trigger",
    description: "Trigger based on an HTTP (API) request",
    icon: "HttpTriggerIcon",
    ...commonProps,
  },
  {
    name: "errorDetectionTrigger",
    label: "Error Detection Trigger",
    description: "Trigger a flow in response to error detection in other automated processes",
    icon: "ErrorDetectionTriggerIcon",
    ...commonProps,
  },
  {
    name: "customTrigger",
    label: "Custom Trigger",
    description: "Trigger based on one or more conditions defined by the user",
    icon: "CustomTriggerIcon",
    ...commonProps,
  },
];
