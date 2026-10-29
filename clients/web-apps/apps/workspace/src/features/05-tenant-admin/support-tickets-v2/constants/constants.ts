import { BadgeProps } from "@avplatform/ui/badge";

export const TICKET_TABLE_KEY = "support-tickets-v2";
export const TICKET_TABLE_HEADING = "Support Tickets";

export const REQUEST_TYPES = [
  { value: "ServiceRequest", label: "Service request" },
  { value: "ChangeRequest", label: "Change request" },
] as const;

export const TICKET_STATUSES = [
  { value: "New", label: "New" },
  { value: "InProgress", label: "In progress" },
  { value: "Closed", label: "Closed" },
] as const;

export const COMPLEXITY_OPTIONS = [
  { value: "Low", label: "Low" },
  { value: "Medium", label: "Medium" },
  { value: "High", label: "High" },
] as const;

export const RISK_OPTIONS = [
  { value: "Low", label: "Low" },
  { value: "Medium", label: "Medium" },
  { value: "High", label: "High" },
] as const;

export type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

export const TICKET_STATUS_VARIANT: Record<string, BadgeProps["variant"]> = {
  New: "queued",
  InProgress: "running",
  Closed: "completed",
};
